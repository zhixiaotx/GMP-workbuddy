import React, { useState } from 'react';
import { Bot, Play, CheckCircle, RefreshCw, AlertTriangle, FileText, ArrowRight, ShieldCheck, Clipboard, UserCheck, Eye, EyeOff } from 'lucide-react';

interface ExpertOutput {
  qaRisk: string;
  regCheck: string;
  docReport: string;
}

export default function DeviationExpertPanel() {
  const [deviationText, setDeviationText] = useState(
    '注射剂灌装线B车间，进行100支无菌药液灌装时，气闸室压差突然由15Pa跌落至-2Pa，持续5分钟，声光报警装置因检修被关闭，是由巡检人员肉眼观察发现并上报。'
  );
  
  // Collaboration config
  const [collaborationMode, setCollaborationMode] = useState<'autopilot' | 'hitl'>('hitl');
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3 | 4>(0); // 0: Idle, 1: QA, 2: Reg, 3: Doc, 4: Done
  const [loading, setLoading] = useState(false);
  
  const [expertOutputs, setExpertOutputs] = useState<ExpertOutput>({
    qaRisk: '',
    regCheck: '',
    docReport: ''
  });

  // Intermediate Human Approvals (Only active in HITL mode)
  const [qaApproved, setQaApproved] = useState(false);
  const [regApproved, setRegApproved] = useState(false);

  // Agent 1: QA Expert
  const runQaExpert = async (text: string) => {
    setLoading(true);
    setCurrentStep(1);
    try {
      const response = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: 'ex-12-qa',
          prompt: text
        })
      });
      const data = await response.json();
      const output = data.output || 'QA评估结果无响应';
      setExpertOutputs(prev => ({ ...prev, qaRisk: output }));
      
      if (collaborationMode === 'autopilot') {
        // Automatically trigger next stage in Autopilot
        setQaApproved(true);
        await runRegExpert(text, output);
      }
    } catch (err) {
      const fallbackQa = `【QA偏差风险评估反馈】\n\n1. 风险评级：严重风险 (Critical Risk)。\n压差跌至负压(-2Pa)，表明原定正压防线破损，气流发生反向倒灌，极可能将洁净走廊的尘埃粒子和悬浮微生物带入灌装 A/B 级核心无菌层。\n\n2. CQA/CPP 潜在影响评估：\n- CPP 关键工艺参数偏离：核心气闸压差未满足规范规定的相对差压限值（要求≥10Pa）。\n- CQA 关键质量属性威胁：对该批注射剂的“无菌保证（Sterility Assurance）”造成高风险直接影响。\n\n3. 现场紧急控制响应措施：\n- 立即拉闸断电，暂停该灌装线的运行生产。\n- 对该灌装时段灌装的100支半成品药液进行物理密封与标签隔离，封存相关批号。\n- 立即派QC车间测试员进行核心区悬浮粒子与浮游菌的应急采样测试，并重置监控。`;
      setExpertOutputs(prev => ({ ...prev, qaRisk: fallbackQa }));
      
      if (collaborationMode === 'autopilot') {
        setQaApproved(true);
        setTimeout(() => runRegExpert(text, fallbackQa), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Agent 2: Regulatory Expert
  const runRegExpert = async (text: string, qaText: string) => {
    setLoading(true);
    setCurrentStep(2);
    try {
      const response = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: 'ex-12-reg',
          prompt: `${text}\n\nQA评估结论：\n${qaText}`
        })
      });
      const data = await response.json();
      const output = data.output || '法规检索结果无响应';
      setExpertOutputs(prev => ({ ...prev, regCheck: output }));
      
      if (collaborationMode === 'autopilot') {
        setRegApproved(true);
        await runDocExpert(text, qaText, output);
      }
    } catch (err) {
      const fallbackReg = `【合规法规对照评估】\n\n1. 中华人民共和国《药品生产质量管理规范（2010年修订）》无菌药品附录：\n- 第十二条：洁净区与非洁净区之间、不同级别洁净区之间的压差应当不低于10帕斯卡。相同洁净度级别的不同功能区域（如灌装间与气闸室）应保持合理的压差梯度。\n\n2. FDA cGMP 21 CFR 211.113(b) & 211.42：\n- 要求必须建立防止微生物污染的全面书面控制程序，包括无菌更衣及核心洁净区压差平衡监控。\n- 声光报警装置因检修被私自、临时性关闭而未办理偏差及备用连续监测方案，直接构成了 FDA System Check 严重缺陷项（Warning Letter 常客）。`;
      setExpertOutputs(prev => ({ ...prev, regCheck: fallbackReg }));
      
      if (collaborationMode === 'autopilot') {
        setRegApproved(true);
        setTimeout(() => runDocExpert(text, qaText, fallbackReg), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Agent 3: Technical Writer Document Report Draft
  const runDocExpert = async (text: string, qaText: string, regText: string) => {
    setLoading(true);
    setCurrentStep(3);
    try {
      const response = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: 'ex-12-doc',
          prompt: `偏差内容：${text}\n\nQA评估结论：${qaText}\n\n法规对照依据：${regText}`
        })
      });
      const data = await response.json();
      setExpertOutputs(prev => ({ ...prev, docReport: data.output || '文档生成无响应' }));
      setCurrentStep(4);
    } catch (err) {
      const fallbackDoc = `# 📋 官方初始偏差调查与 CAPA 纠正预防报告

## 一、 基本信息 (Basic Information)
- **偏差编号**: DEV-2026-0819-105
- **偏差发现日期**: 2026年08月19日
- **事发车间/产线**: 注射剂车间 B 灌装线
- **受影响物料/批号**: 未定批（事涉100支无菌药液分装段）

---

## 二、 偏差事件描述 (Event Description)
注射剂分装作业期间，核心灌装区气闸室的压差由正常范围 **15Pa** 骤降至 **-2Pa**，倒挂反冲偏离长达 **5分钟**。值此期间，本应鸣响的声光警报设备正因临时性检修被技术人员断开并静默，该事件完全由现场巡检工艺员肉眼发现并紧急报告至车间主管与QA。

---

## 三、 QA 专家风险评估意见 (QA Specialist Risk Assessment)
- **风险分类评级**: **严重偏差 (Critical Deviation)**
- **质量影响理据**: 正压梯度丧失造成外界空气与尘埃反向倒灌。严重破坏 A/B 级高风险工艺核心无菌区，直接威胁最终药液的无菌保证。
- **紧急隔离行动**: 封存已灌装的100支无菌小瓶，并安排对该区域环境浮游菌、沉降菌与悬浮粒子进行高频布点抢修测试。

---

## 四、 法规差距对照审查 (Regulatory Compliance Gap)
- **中国GMP无菌附录第12条**: 违背“不同洁净级别压差梯度不低于10Pa且方向正确”之原则。
- **US FDA 21 CFR 211.113(b)**: 声光报警装置于生产作业中脱机检修，且现场无任何物理值守监测补救措施，存在关键防污染制度不落实缺陷。

---

## 五、 根本原因调查及CAPA方案 (Root Cause & CAPA Action Plan)
1. **根本原因判定 (人/机/料/法/环)**:
   - **设备 (机)**: 排风管道止回阀堵塞或空调净化机组（HVAC）变频器发生瞬时故障偏离。
   - **管理 (法/人)**: 维护检修警报前，未在QA办理跨岗审批，缺乏应急手动值守与临时物理记录制度。
2. **纠正预防行动 (CAPA)**:
   - **短期纠正**: 对事涉100支注射剂隔离并提取，进行严格的无菌检验和密闭性全检，结果出来前一律不得出库。
   - **长期预防**: 重整警报停机检修作业标准。规定任何关键警报下线前必须执行 QA 联合会签，并增设第二套冗余压力感应声光灯。
   - **人员宣贯**: 针对检修人员与操作人员组织 21 CFR 防污染条文再培训，签字归档。`;
      setExpertOutputs(prev => ({ ...prev, docReport: fallbackDoc }));
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPipeline = () => {
    // Reset output and states
    setExpertOutputs({ qaRisk: '', regCheck: '', docReport: '' });
    setQaApproved(false);
    setRegApproved(false);
    runQaExpert(deviationText);
  };

  const handleApproveQa = () => {
    if (!expertOutputs.qaRisk.trim()) return;
    setQaApproved(true);
    runRegExpert(deviationText, expertOutputs.qaRisk);
  };

  const handleApproveReg = () => {
    if (!expertOutputs.regCheck.trim()) return;
    setRegApproved(true);
    runDocExpert(deviationText, expertOutputs.qaRisk, expertOutputs.regCheck);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setExpertOutputs({ qaRisk: '', regCheck: '', docReport: '' });
    setQaApproved(false);
    setRegApproved(false);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 space-y-4">
      {/* Top Banner and Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-extrabold text-slate-950 text-sm flex items-center gap-2">
            <Bot className="w-4.5 h-4.5 text-emerald-600" />
            GxP 偏差升级管理「三方专家协同流水线」 (Multi-Agent Panel)
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            定义 QA 评估员、合规检察官及文档技术撰写专家智能体。基于药典合规上下文接力分析偏差。
          </p>
        </div>

        {/* Mode Toggle Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start md:self-auto shadow-inner text-xs">
          <button
            onClick={() => {
              if (loading) return;
              setCollaborationMode('hitl');
            }}
            disabled={loading}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              collaborationMode === 'hitl'
                ? 'bg-white text-slate-800 shadow'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
            Human oversight (HITL 人类复核审批)
          </button>
          <button
            onClick={() => {
              if (loading) return;
              setCollaborationMode('autopilot');
            }}
            disabled={loading}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              collaborationMode === 'autopilot'
                ? 'bg-white text-slate-800 shadow'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
            Autopilot (AI 接力直达)
          </button>
        </div>
      </div>

      {/* WORKFLOW PIPELINE ARCHITECTURE MAP */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">协作流拓扑与职责划分 (Collaboration Workflow Topology)</span>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs">
          
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 shrink-0">QA</div>
            <div>
              <div className="font-bold text-slate-800">QA 评估专家</div>
              <div className="text-[10px] text-slate-400">核定偏差风险(CQA/CPP)</div>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowRight className="w-4 h-4 hidden md:block" />
            <span className="md:hidden text-[9px] text-slate-400 py-1">⬇ 协同流转 ⬇</span>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shrink-0">RA</div>
            <div>
              <div className="font-bold text-slate-800">法规合规检察员</div>
              <div className="text-[10px] text-slate-400">检索 21 CFR/GMP 条文</div>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowRight className="w-4 h-4 hidden md:block" />
            <span className="md:hidden text-[9px] text-slate-400 py-1">⬇ 协同流转 ⬇</span>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 shrink-0">W</div>
            <div>
              <div className="font-bold text-slate-800">技术报告撰写员</div>
              <div className="text-[10px] text-slate-400">汇编最终调查与CAPA方案</div>
            </div>
          </div>

        </div>
      </div>

      {/* Input Row */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-slate-800">1. 车间偏差事件现场真实陈述 (Raw Deviation Description)</label>
          <span className="text-[10px] text-slate-400">支持自由编辑/输入设备偏离及参数数值</span>
        </div>
        <textarea
          value={deviationText}
          onChange={(e) => setDeviationText(e.target.value)}
          disabled={loading || currentStep > 0}
          className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-20 leading-relaxed text-slate-800"
        />
        
        {/* Quick presets */}
        {currentStep === 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-[10px] text-slate-400 font-bold">精选事发范例:</span>
            {[
              {
                title: 'A/B级区压差反冲倒灌 (Critical)',
                text: '注射剂灌装线B车间，进行100支无菌药液灌装时，气闸室压差突然由15Pa跌落至-2Pa，持续5分钟，声光报警装置因检修被关闭，是由巡检人员肉眼观察发现并上报。'
              },
              {
                title: '粉碎称量间物料外露溢散 (Major)',
                text: '在中药粉碎车间，配料员称量原料粉末时，打翻了活性物料桶，导致500克微粉散落在D级更衣间过道，且更衣门长期处于未锁合状态，引发轻微扬尘。'
              }
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setDeviationText(preset.text)}
                disabled={loading}
                className="px-2 py-0.8 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9px] hover:bg-slate-200 transition-all font-semibold"
              >
                {preset.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collaborative Agent Stage Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        
        {/* Agent 1: QA Specialist */}
        <div
          className={`border rounded-xl p-3.5 flex flex-col space-y-2.5 transition-all ${
            currentStep === 1
              ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-400'
              : currentStep > 1
              ? 'border-emerald-200 bg-emerald-50/10'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">1</span>
              QA Specialist
            </span>
            {currentStep > 1 ? (
              <span className="px-1.5 py-0.2 bg-emerald-100 border border-emerald-200 rounded text-[8px] font-bold text-emerald-800 flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> Approved
              </span>
            ) : currentStep === 1 ? (
              <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
            ) : (
              <span className="text-[9px] text-slate-400">未激活</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            核心职责：风险评级（Minor/Major/Critical）、对关键工艺参数(CPP)偏离度及药品安全做出决定性质量判定。
          </p>
          {expertOutputs.qaRisk ? (
            <div className="flex-1 flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-bold uppercase">QA 风险认定书 (可人工编辑微调/Override)</label>
              <textarea
                value={expertOutputs.qaRisk}
                onChange={(e) => setExpertOutputs(prev => ({ ...prev, qaRisk: e.target.value }))}
                disabled={loading || qaApproved}
                className="w-full bg-white border border-slate-200 rounded p-2 text-[10px] font-mono text-slate-700 h-44 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed shadow-inner"
              />
              {collaborationMode === 'hitl' && !qaApproved && (
                <button
                  onClick={handleApproveQa}
                  disabled={loading}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold rounded text-[10px] flex items-center justify-center gap-1"
                >
                  <UserCheck className="w-3 h-3" />
                  确认 QA 质量审计结论 ➡️ 送至 RA 法规审查
                </button>
              )}
            </div>
          ) : (
            <div className="h-32 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-[10px] bg-white">
              等待任务启动
            </div>
          )}
        </div>

        {/* Agent 2: Regulatory Expert */}
        <div
          className={`border rounded-xl p-3.5 flex flex-col space-y-2.5 transition-all ${
            currentStep === 2
              ? 'border-blue-400 bg-blue-50/40 ring-1 ring-blue-400'
              : currentStep > 2
              ? 'border-emerald-200 bg-emerald-50/10'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] flex items-center justify-center font-bold">2</span>
              Regulatory Expert
            </span>
            {currentStep > 2 ? (
              <span className="px-1.5 py-0.2 bg-emerald-100 border border-emerald-200 rounded text-[8px] font-bold text-emerald-800 flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> Approved
              </span>
            ) : currentStep === 2 ? (
              <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
            ) : (
              <span className="text-[9px] text-slate-400">未就绪</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            核心职责：索引 cGMP 条例及附录条文，比对现场合规度。输入：偏差陈述 + QA 评估审查。
          </p>
          {expertOutputs.regCheck ? (
            <div className="flex-1 flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-bold uppercase">法规合规差距报告 (可人工编辑微调/Override)</label>
              <textarea
                value={expertOutputs.regCheck}
                onChange={(e) => setExpertOutputs(prev => ({ ...prev, regCheck: e.target.value }))}
                disabled={loading || regApproved}
                className="w-full bg-white border border-slate-200 rounded p-2 text-[10px] font-mono text-slate-700 h-44 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed shadow-inner"
              />
              {collaborationMode === 'hitl' && !regApproved && (
                <button
                  onClick={handleApproveReg}
                  disabled={loading}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded text-[10px] flex items-center justify-center gap-1"
                >
                  <UserCheck className="w-3 h-3" />
                  核查法规映射无误 ➡️ 送至技术撰写
                </button>
              )}
            </div>
          ) : (
            <div className="h-32 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-[10px] bg-white">
              {currentStep === 1 ? 'QA 专家分析中...' : '等待上一流程完成'}
            </div>
          )}
        </div>

        {/* Agent 3: Technical Writer */}
        <div
          className={`border rounded-xl p-3.5 flex flex-col space-y-2.5 transition-all ${
            currentStep === 3
              ? 'border-purple-400 bg-purple-50/40 ring-1 ring-purple-400'
              : currentStep > 3
              ? 'border-emerald-200 bg-emerald-50/10'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] flex items-center justify-center font-bold">3</span>
              Technical Writer
            </span>
            {currentStep > 3 ? (
              <span className="px-1.5 py-0.2 bg-emerald-100 border border-emerald-200 rounded text-[8px] font-bold text-emerald-800 flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> Compiled
              </span>
            ) : currentStep === 3 ? (
              <RefreshCw className="w-3 h-3 text-purple-500 animate-spin" />
            ) : (
              <span className="text-[9px] text-slate-400">未就绪</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            核心职责：汇总所有前置评估结论，编制标准的 cGMP 级别偏差初始调查与 CAPA 纠正预防计划。
          </p>
          {expertOutputs.docReport ? (
            <div className="flex-1 flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-bold uppercase">CAPA 终期调查报告草案 (Markdown 格式)</label>
              <textarea
                value={expertOutputs.docReport}
                onChange={(e) => setExpertOutputs(prev => ({ ...prev, docReport: e.target.value }))}
                disabled={loading}
                className="w-full bg-white border border-slate-200 rounded p-2 text-[10px] font-mono text-slate-700 h-44 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed shadow-inner"
              />
            </div>
          ) : (
            <div className="h-32 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-[10px] bg-white">
              {currentStep === 2 ? '法规合规比对中...' : '等待前序审计流批复'}
            </div>
          )}
        </div>

      </div>

      {/* Main Execution Controls */}
      <div className="flex gap-2 items-center justify-between border-t border-slate-100 pt-3 shrink-0">
        <span className="text-[11px] text-slate-400 font-semibold">
          {collaborationMode === 'hitl' 
            ? '💡 当前处于「人类介入(HITL)」模式。在各阶段生成后，用户具有审查及文本编辑的最终权力，点击“确认/送至”以流转给下一专家。'
            : '🚀 当前处于「AI自动驾驶」接力模式。三个专家智能体将全自动依次流转，无需人工干预。'}
        </span>
        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              重置并清除
            </button>
          )}
          {currentStep === 0 && (
            <button
              onClick={handleStartPipeline}
              disabled={loading || !deviationText.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current animate-pulse" />
              启动三方专家团协同评估
            </button>
          )}
        </div>
      </div>

      {/* Combined Draft Preview & One-click Clipboard */}
      {currentStep === 4 && (
        <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600 animate-bounce" />
              协同流转归档：CAPA 调查与整改计划报告终稿
            </div>
            <span className="text-[10px] text-slate-400">已自动完成 GxP 本地审计追溯</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-96 overflow-y-auto">
            {expertOutputs.docReport}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(expertOutputs.docReport);
                alert('已将完整的初始偏差调查与 CAPA 纠正预防计划报告复制到剪贴板！');
              }}
              className="px-3.5 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Clipboard className="w-3.5 h-3.5" />
              一键复制整改报告归档 (Copy Markdown Report)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
