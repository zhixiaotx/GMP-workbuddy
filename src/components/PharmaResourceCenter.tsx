import React, { useState } from 'react';
import { 
  PHARMA_SCENARIO_MAP, 
  PHARMA_CRAFT_TEMPLATES, 
  PHARMA_SKILLS_TEMPLATES, 
  PHARMA_EXPERT_TEAMS,
  PHARMA_QA_CONVERSION_GUIDE, 
  PHARMA_WORKBUDDY_MANUAL, 
  PHARMA_SKILL_IMPORT_MANUAL, 
  PHARMA_AGENT_PRELAUNCH_CHECKLIST, 
  PHARMA_30_DAYS_ACTION_PLAN 
} from '../data_resources';
import { 
  Map, FileCode, Hammer, BookOpen, ClipboardCheck, Calendar, 
  Copy, Check, FileText, ChevronRight, AlertCircle, Award, CheckSquare, Sparkles 
} from 'lucide-react';

export default function PharmaResourceCenter() {
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'craft' | 'skills' | 'expert' | 'manuals' | 'checklist' | 'timeline'>('map');
  const [selectedCraftIdx, setSelectedCraftIdx] = useState(0);
  const [selectedSkillIdx, setSelectedSkillIdx] = useState(0);
  const [selectedTeamIdx, setSelectedTeamIdx] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Interactive Checklist State
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({
    'chk-1': true, 'chk-2': false, 'chk-3': false, 'chk-4': true, 'chk-5': false,
    'chk-6': false, 'chk-7': true, 'chk-8': false, 'chk-9': false, 'chk-10': false
  });

  const handleToggleCheck = (key: string) => {
    setChecklistState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const checkedCount = Object.values(checklistState).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / 10) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[750px] min-h-0">
      
      {/* Tab Navigation Header */}
      <div className="bg-slate-900 px-4 py-3 flex flex-wrap gap-2 shrink-0 items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="text-white text-xs font-bold uppercase tracking-wider">医药企业 AI 赋能落地资源库 (GxP Enterprise Toolkit)</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'map', label: '落地场景地图', icon: Map },
            { id: 'craft', label: '10大CRAFT提示词库', icon: FileCode },
            { id: 'skills', label: '10大Skill模板库', icon: Hammer },
            { id: 'expert', label: '专家团配置模板', icon: Sparkles },
            { id: 'manuals', label: '实战指南与手册', icon: BookOpen },
            { id: 'checklist', label: '上线合规核查表', icon: ClipboardCheck },
            { id: 'timeline', label: '30天行动计划', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-slate-50/50">
        
        {/* TAB 1: SCENARIO MAP */}
        {activeSubTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                <Map className="w-4.5 h-4.5 text-emerald-600" />
                医药企业 cGMP / GxP AI 落地场景价值地图
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                覆盖制药企业研发、质量、生产、公用工程、物料及注册申报六大核心职能部门。定义痛点难点，匹配受控大模型应用解决方案并划分核心药政合规阻断边界。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {PHARMA_SCENARIO_MAP.map((item, idx) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    #{idx + 1}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200">
                        {item.department}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs truncate max-w-[180px]">{item.title}</h4>
                    </div>
                    
                    <div className="text-xs space-y-2">
                      <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                        <span className="font-bold text-rose-800 text-[10px] block mb-0.5">⚠️ 业务痛点 (Pain Point):</span>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{item.painPoint}</p>
                      </div>
                      <div className="bg-emerald-50/30 p-2 rounded-lg border border-emerald-100">
                        <span className="font-bold text-emerald-800 text-[10px] block mb-0.5">🚀 AI 解决方案 (Solution):</span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">{item.solution}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 bg-slate-50 -mx-3.5 -mb-3.5 p-2 px-3.5 mt-2 flex items-start gap-1 text-[10px] text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-normal">
                      <strong className="text-amber-800">GxP 监管底线: </strong>{item.gxpRisk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CRAFT PROMPT TEMPLATES */}
        {activeSubTab === 'craft' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-0 items-stretch">
            
            {/* Left selector */}
            <div className="md:col-span-1 border border-slate-200 bg-white rounded-xl p-3 overflow-y-auto space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">10大医药场景精选提示词</span>
              {PHARMA_CRAFT_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedCraftIdx(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                    selectedCraftIdx === idx
                      ? 'bg-emerald-600 text-white font-semibold shadow'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-1">
                    {idx + 1}. {tmpl.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>

            {/* Right template details */}
            <div className="md:col-span-2 flex flex-col space-y-3.5 overflow-y-auto bg-white border border-slate-200 rounded-xl p-4">
              {(() => {
                const current = PHARMA_CRAFT_TEMPLATES[selectedCraftIdx];
                return (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {current.scenario}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm mt-1">{current.title}</h3>
                      </div>
                      <button
                        onClick={() => handleCopy(current.fullPrompt, `craft-${current.id}`)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        {copiedText === `craft-${current.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> 已复制提示词
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> 复制 cGMP 提示词
                          </>
                        )}
                      </button>
                    </div>

                    {/* CRAFT structural breakdown */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
                      <span className="text-[9px] font-bold text-slate-400 tracking-widest block uppercase border-b border-slate-200 pb-1.5">
                        💡 CRAFT 结构化原理解析 (Structural Breakdown)
                      </span>
                      <div className="space-y-2">
                        <div>
                          <strong className="text-emerald-700 text-[11px] block">【C】Context 背景:</strong>
                          <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 border border-slate-150 rounded">{current.craftStructure.context}</p>
                        </div>
                        <div>
                          <strong className="text-emerald-700 text-[11px] block">【R】Role 角色:</strong>
                          <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 border border-slate-150 rounded">{current.craftStructure.role}</p>
                        </div>
                        <div>
                          <strong className="text-emerald-700 text-[11px] block">【A】Action 行动:</strong>
                          <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 border border-slate-150 rounded">{current.craftStructure.action}</p>
                        </div>
                        <div>
                          <strong className="text-emerald-700 text-[11px] block">【F】Format 格式:</strong>
                          <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 border border-slate-150 rounded">{current.craftStructure.format}</p>
                        </div>
                        <div>
                          <strong className="text-emerald-700 text-[11px] block">【T】Task 任务:</strong>
                          <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 border border-slate-150 rounded">{current.craftStructure.task}</p>
                        </div>
                      </div>
                    </div>

                    {/* Combined Copyable Prompt Preview */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">整合提示词预览 (Copy-ready Text)</span>
                      <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                        {current.fullPrompt}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS TEMPLATE LIBRARY */}
        {activeSubTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-0 items-stretch">
            
            {/* Left list selector */}
            <div className="md:col-span-1 border border-slate-200 bg-white rounded-xl p-3 overflow-y-auto space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">10大医药场景 Skill 模板</span>
              {PHARMA_SKILLS_TEMPLATES.map((sk, idx) => (
                <button
                  key={sk.id}
                  onClick={() => setSelectedSkillIdx(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                    selectedSkillIdx === idx
                      ? 'bg-emerald-600 text-white font-semibold shadow'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-1">
                    {idx + 1}. {sk.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>

            {/* Right details */}
            <div className="md:col-span-2 flex flex-col space-y-3.5 overflow-y-auto bg-white border border-slate-200 rounded-xl p-4">
              {(() => {
                const current = PHARMA_SKILLS_TEMPLATES[selectedSkillIdx];
                return (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {current.scenario}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm mt-1">{current.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{current.description}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(JSON.stringify(current, null, 2), `skill-${current.id}`)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        {copiedText === `skill-${current.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> 已复制 JSON
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> 复制 Skill 格式
                          </>
                        )}
                      </button>
                    </div>

                    {/* Specific GxP constraints / rules */}
                    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                      <span className="text-[10px] font-bold text-amber-800 tracking-wider block uppercase">
                        🛑 药政硬性规则围栏 (GxP Quality Gates / Rules)
                      </span>
                      <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-700 font-medium">
                        {current.rules.map((rule, idx) => (
                          <li key={idx} className="leading-relaxed">{rule}</li>
                        ))}
                      </ul>
                    </div>

                    {/* System Prompt / Core DNA Instructions */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">注入大模型系统指令 (System Instruction DNA)</span>
                      <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap">
                        {current.systemInstruction}
                      </div>
                    </div>

                    {/* Simulated JSON Manifest payload */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">导入配置文件 Payload (JSON)</span>
                      <pre className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-[10px] font-mono text-slate-600 overflow-x-auto leading-relaxed">
                        {JSON.stringify(current, null, 2)}
                      </pre>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 4: EXPERT TEAMS CONFIG TEMPLATE */}
        {activeSubTab === 'expert' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-0 items-stretch">
            {/* Left team select */}
            <div className="md:col-span-1 border border-slate-200 bg-white rounded-xl p-3 overflow-y-auto space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">多智能体专家配置模板</span>
              {PHARMA_EXPERT_TEAMS.map((team, idx) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamIdx(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                    selectedTeamIdx === idx
                      ? 'bg-emerald-600 text-white font-semibold shadow'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-1">
                    {team.teamName}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>

            {/* Right team content */}
            <div className="md:col-span-2 flex flex-col space-y-4 overflow-y-auto bg-white border border-slate-200 rounded-xl p-4">
              {(() => {
                const current = PHARMA_EXPERT_TEAMS[selectedTeamIdx];
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">{current.teamName}</h3>
                      <button
                        onClick={() => handleCopy(JSON.stringify(current, null, 2), `team-${current.id}`)}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all"
                      >
                        {copiedText === `team-${current.id}` ? '已复制' : '复制架构配置'}
                      </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                      <span className="font-bold text-emerald-800 text-[10px] block mb-1">🔄 多级协同工作流逻辑 (Workflow Logic):</span>
                      <p className="text-slate-600 leading-relaxed font-medium">{current.workflow}</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">协同专家角色构成及配置 DNA</span>
                      {current.agents.map((agent, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <span className="w-4 h-4 bg-emerald-100 text-emerald-800 text-[9px] rounded-full flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              {agent.role}
                            </span>
                            <span className="text-[9px] text-slate-400">{agent.description}</span>
                          </div>
                          <div className="bg-slate-950 text-slate-100 p-2.5 rounded font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                            {agent.prompt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 5: MANUALS AND HANDBOOKS */}
        {activeSubTab === 'manuals' && (
          <div className="space-y-4">
            
            {/* Quick buttons */}
            <div className="flex gap-2 flex-wrap bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 px-2">
                📂 阅览实战指南与手册:
              </span>
              {[
                { label: 'SOP 问答对转化指引', key: 'sop-qa' },
                { label: 'WorkBuddy 使用手册', key: 'workbuddy' },
                { label: 'Skill 导入使用手册', key: 'skill-import' }
              ].map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const el = document.getElementById(m.key);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all"
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* SOP QA GUIDE */}
            <div id="sop-qa" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(PHARMA_QA_CONVERSION_GUIDE, 'guide-qa')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  {copiedText === 'guide-qa' ? '已复制' : '复制全文'}
                </button>
              </div>
              <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700">
                {PHARMA_QA_CONVERSION_GUIDE.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) return <h2 key={idx} className="text-base font-extrabold text-slate-900 border-b border-slate-150 pb-2 mt-4">{line.replace('# ', '')}</h2>;
                  if (line.startsWith('## ')) return <h3 key={idx} className="text-sm font-bold text-emerald-800 mt-4">{line.replace('## ', '')}</h3>;
                  if (line.startsWith('### ')) return <h4 key={idx} className="text-xs font-bold text-slate-900 mt-3">{line.replace('### ', '')}</h4>;
                  if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc">{line.substring(2)}</li>;
                  if (line.startsWith('> ')) return <blockquote key={idx} className="p-3 bg-slate-50 border-l-4 border-emerald-500 rounded my-2 italic font-medium">{line.replace('> ', '')}</blockquote>;
                  return <p key={idx} className="my-1.5 leading-relaxed">{line}</p>;
                })}
              </div>
            </div>

            {/* WORKBUDDY MANUAL */}
            <div id="workbuddy" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(PHARMA_WORKBUDDY_MANUAL, 'guide-wb')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  {copiedText === 'guide-wb' ? '已复制' : '复制全文'}
                </button>
              </div>
              <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700">
                {PHARMA_WORKBUDDY_MANUAL.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) return <h2 key={idx} className="text-base font-extrabold text-slate-900 border-b border-slate-150 pb-2 mt-4">{line.replace('# ', '')}</h2>;
                  if (line.startsWith('## ')) return <h3 key={idx} className="text-sm font-bold text-emerald-800 mt-4">{line.replace('## ', '')}</h3>;
                  if (line.startsWith('### ')) return <h4 key={idx} className="text-xs font-bold text-slate-900 mt-3">{line.replace('### ', '')}</h4>;
                  if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc">{line.substring(2)}</li>;
                  if (line.startsWith('> ')) return <blockquote key={idx} className="p-3 bg-slate-50 border-l-4 border-emerald-500 rounded my-2 italic font-medium">{line.replace('> ', '')}</blockquote>;
                  return <p key={idx} className="my-1.5 leading-relaxed">{line}</p>;
                })}
              </div>
            </div>

            {/* SKILL IMPORT MANUAL */}
            <div id="skill-import" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(PHARMA_SKILL_IMPORT_MANUAL, 'guide-si')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  {copiedText === 'guide-si' ? '已复制' : '复制全文'}
                </button>
              </div>
              <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700">
                {PHARMA_SKILL_IMPORT_MANUAL.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) return <h2 key={idx} className="text-base font-extrabold text-slate-900 border-b border-slate-150 pb-2 mt-4">{line.replace('# ', '')}</h2>;
                  if (line.startsWith('## ')) return <h3 key={idx} className="text-sm font-bold text-emerald-800 mt-4">{line.replace('## ', '')}</h3>;
                  if (line.startsWith('### ')) return <h4 key={idx} className="text-xs font-bold text-slate-900 mt-3">{line.replace('### ', '')}</h4>;
                  if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc">{line.substring(2)}</li>;
                  if (line.startsWith('> ')) return <blockquote key={idx} className="p-3 bg-slate-50 border-l-4 border-emerald-500 rounded my-2 italic font-medium">{line.replace('> ', '')}</blockquote>;
                  return <p key={idx} className="my-1.5 leading-relaxed">{line}</p>;
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: PRE-LAUNCH 合规核查表 */}
        {activeSubTab === 'checklist' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                <ClipboardCheck className="w-4.5 h-4.5 text-emerald-600" />
                cGMP / FDA 验证标准：Pharma Agent 上线前合规性核查表 (Pre-launch Gates)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                根据计算机系统验证 (CSV) 与 GAMP 5 的验证思路，在生产网络交付前，对大模型做如下合规锁定审计。
              </p>

              {/* Progress Bar */}
              <div className="mt-4 bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center gap-4 text-xs">
                <div className="flex-1">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>核查进度 (Audit Verified)</span>
                    <span>{progressPercent}% ({checkedCount}/10 项)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
                {progressPercent === 100 ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg animate-bounce">
                    ✓ GxP 合规放行
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg">
                    测试中 (Validating)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
              {[
                { key: 'chk-1', tag: '数据脱敏', text: '物理脱敏核查：校验所有 SOP 及批数据，剔除真实人名、未受控配方等机密 (已抹除机密)' },
                { key: 'chk-2', tag: '数据脱敏', text: '传输加密：确保 API 请求、RAG 数据流、向量空间端对端在传输层（HTTPS/TLS）强加密' },
                { key: 'chk-3', tag: '规则围栏', text: '强行锁死限度：确保注入的 Skill 中含有不可违背的核心阀值（如：差压必须在10Pa以上）' },
                { key: 'chk-4', tag: '规则围栏', text: '幻觉压力测试：采用故意捏造、诱导超标的提问，测试 AI 能够顶住压力坚持药典不妥协' },
                { key: 'chk-5', tag: '人机协同', text: '单向制度限制：AI 仅输出建议，绝不允许未经人工核准自动写入 ERP / MES / LIMS 生产链' },
                { key: 'chk-6', tag: '人机协同', text: '人工编辑(HITL)：在偏差升级、批放行等关键红线流中，在 UI 层显式提供人类修改、审核确认签字按钮' },
                { key: 'chk-7', tag: '审计追踪', text: 'Audit Trail：保证所有会话、修改记录，一律由底层进行防删除防篡改的审计追踪，且支持导出' },
                { key: 'chk-8', tag: '审计追踪', text: '21 CFR Part 11：对交互记录具有电子签名验证、唯一操作人绑定、精确时间戳记录' },
                { key: 'chk-9', tag: '版本控制', text: '换版阻断：SOP 进行变更控制或销毁时，向量知识库中的旧 Index 必须一键连带物理删除' },
                { key: 'chk-10', tag: '版本控制', text: '模型灾备机制：设立底层基座大模型 API 升级或退役时的应急灾备提示词测试包' }
              ].map((item, idx) => (
                <div 
                  key={item.key} 
                  onClick={() => handleToggleCheck(item.key)}
                  className={`flex items-start gap-3 p-2.5 border rounded-lg cursor-pointer transition-all ${
                    checklistState[item.key]
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {checklistState[item.key] ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 border border-slate-300 rounded bg-white"></div>
                    )}
                  </div>
                  <div className="text-xs">
                    <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold rounded border mr-2 uppercase ${
                      item.tag === '数据脱敏' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                      item.tag === '规则围栏' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      item.tag === '人机协同' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                      item.tag === '审计追踪' ? 'bg-cyan-50 border-cyan-200 text-cyan-700' :
                      'bg-purple-50 border-purple-200 text-purple-700'
                    }`}>
                      {item.tag}
                    </span>
                    <span className={checklistState[item.key] ? 'font-medium' : 'text-slate-400 font-normal line-through'}>
                      {idx + 1}. {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: 30天滚动行动计划 */}
        {activeSubTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-emerald-600" />
                医药企业 AI 落地实践「30天滚动行动计划路线图」 (Gantt Deployment Chart)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                规划由浅入深、合规先行、业务紧密配合的四周滚动路线。实现第一个合规生产场景的全面灰度上线运行。
              </p>
            </div>

            <div className="space-y-4 relative pl-4 border-l border-slate-300 ml-2">
              {[
                {
                  phase: '第一阶段 (第 1 - 7 天)',
                  title: '知识原子解构与核心试点场景锁定',
                  bullet: '整理高频偏差SOP，完成约80个“原子级、高场景化、上下文完备”的问答对拆分，并标记元标签。',
                  style: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
                  dot: 'bg-emerald-600'
                },
                {
                  phase: '第二阶段 (第 8 - 15 天)',
                  title: '专职 Skill 训练与协同多专家团搭建',
                  bullet: '在工作台导入特定 Skill。设置不允许大模型自我妥协捏造的合规硬规则。完成测试区内 30 组偏差案例的自动化（Autopilot）接力和人机审查（HITL）全协同流程跑通。',
                  style: 'border-blue-500 bg-blue-50/50 text-blue-900',
                  dot: 'bg-blue-600'
                },
                {
                  phase: '第三阶段 (第 16 - 22 天)',
                  title: '计算机系统合规验证（CSV）与压力注入测试',
                  bullet: '彻底对照《上线前合规核查清单》进行安全验证。设计20组诱导超标、恶意篡改检测数值的恶意提问，校验 AI 能否坚守法规拦截。形成审计日志和电子签名跟踪。',
                  style: 'border-amber-500 bg-amber-50/50 text-amber-900',
                  dot: 'bg-amber-500'
                },
                {
                  phase: '第四阶段 (第 23 - 30 天)',
                  title: '现场灰度合署、效率转化量化与勋章归档',
                  bullet: '在车间对 5-10 名工艺员部署 WorkBuddy 交互浮窗，人机合署起草偏差。最终评估起草周期是否从原先的平均 3 天下降至 1.5 小时，结业首个合规1.0版本场景！',
                  style: 'border-purple-500 bg-purple-50/50 text-purple-900',
                  dot: 'bg-purple-600'
                }
              ].map((phase, idx) => (
                <div key={idx} className="relative space-y-1.5 pb-2">
                  {/* Timeline bullet dot */}
                  <div className={`absolute -left-[20.5px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${phase.dot}`} />
                  
                  <div className={`border rounded-xl p-4 shadow-sm ${phase.style}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">{phase.phase}</span>
                    <h4 className="font-bold text-xs mt-0.5">{phase.title}</h4>
                    <p className="text-[11px] leading-relaxed mt-1.5">{phase.bullet}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
