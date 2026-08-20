/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EXERCISES, SKILLS_LIST, MOCK_KNOWLEDGE_BASE, KNOWLEDGE_FOLDERS } from './data';
import { Exercise, KBFile, KBFolder } from './types';
import SyllabusTree from './components/SyllabusTree';
import WorkshopWorkspace from './components/WorkshopWorkspace';
import GmpAuditChat from './components/GmpAuditChat';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';
import DeviationExpertPanel from './components/DeviationExpertPanel';
import FolderWatcher from './components/FolderWatcher';
import PharmaResourceCenter from './components/PharmaResourceCenter';
import { 
  GraduationCap, Mail, Server, ExternalLink, ShieldCheck, HelpCircle, 
  Layers, Database, Compass, FileSpreadsheet, Play, CheckCircle2, Award, Menu, X
} from 'lucide-react';

export default function App() {
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES);
  const [activeId, setActiveId] = useState<string>('ex-1');
  const [activeTab, setActiveTab] = useState<'sandbox' | 'kb' | 'audit' | 'pipeline' | 'watcher' | 'resources'>('sandbox');
  const [files, setFiles] = useState<KBFile[]>(MOCK_KNOWLEDGE_BASE);
  const [folders, setFolders] = useState<KBFolder[]>(KNOWLEDGE_FOLDERS);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const activeExercise = exercises.find((e) => e.id === activeId) || exercises[0];

  const handleCompleteExercise = (id: string) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: true } : e))
    );
  };

  const handleAddFile = (newFile: KBFile) => {
    setFiles((prev) => [...prev, newFile]);
  };

  const handleSelectExercise = (id: string) => {
    setActiveId(id);
    const selected = exercises.find((e) => e.id === id);
    if (selected) {
      // Intelligently switch tab based on selected exercise for absolute convenience
      if (selected.taskNo === 5 || selected.taskNo === 6) {
        setActiveTab('kb');
      } else if (selected.taskNo === 11) {
        setActiveTab('audit');
      } else if (selected.taskNo === 12) {
        setActiveTab('pipeline');
      } else if (selected.taskNo === 15 || selected.taskNo === 16) {
        setActiveTab('watcher');
      } else {
        setActiveTab('sandbox');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden text-slate-800 antialiased font-sans">
      
      {/* Top Professional Header Bar */}
      <header className="bg-slate-900 text-white h-14 shrink-0 px-4 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Sidebar Toggle Button */}
          <button 
            id="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden focus:outline-none shrink-0"
            aria-label="Toggle Syllabus Menu"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>
          <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold tracking-wide text-white truncate">GMP 智能体高级配置工作台</h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">制药特训营: 提示词工程 + 向量知识库 + Skill 导入 + 多 Agent 专家团协作</p>
          </div>
        </div>

        {/* Info badges */}
        <div className="hidden md:flex items-center gap-4 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
            <Server className="w-3.5 h-3.5" />
            <span className="font-semibold">GxP Engine: Live</span>
          </div>
        </div>
      </header>

      {/* Main Screen Layout Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        
        {/* Mobile Sidebar overlay Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setSidebarOpen(false)} 
            />
            <div className="relative flex flex-col w-80 max-w-[85vw] h-full bg-white shadow-2xl border-r border-slate-200 animate-in slide-in-from-left duration-200">
              <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-bold text-slate-800">课程实操大纲</span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <SyllabusTree 
                  exercises={exercises} 
                  activeId={activeId} 
                  onSelect={(id) => {
                    handleSelectExercise(id);
                    setSidebarOpen(false); // Auto close menu on select for superior mobile UX
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar course menu - Desktop Only */}
        <div className="hidden lg:flex flex-col h-full w-80 shrink-0 border-r border-slate-200 bg-slate-50">
          <SyllabusTree 
            exercises={exercises} 
            activeId={activeId} 
            onSelect={handleSelectExercise} 
          />
        </div>

        {/* Central Workshop Execution Area */}
        <main className="flex-1 flex flex-col min-h-0 bg-slate-50">
          
          {/* Main workspace navigation tabs (Scrollable on Mobile, Wrap on Desktop) */}
          <div className="bg-white border-b border-slate-200 p-2 flex gap-1.5 shrink-0 shadow-sm overflow-x-auto scrollbar-thin whitespace-nowrap lg:flex-wrap select-none">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === 'sandbox'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              特训营主实操室 (Syllabus Sandbox)
            </button>
            <button
              onClick={() => setActiveTab('kb')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === 'kb'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              知识库预处理/对比 (SOP QA Base)
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              GMP 5模审计助手 (Multi-Mode Audit)
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === 'pipeline'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              多专家协同流水线 (Multi-Agent Panel)
            </button>
            <button
              onClick={() => setActiveTab('watcher')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === 'watcher'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              重复任务自动监听 (Watcher & Ledger)
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === 'resources'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
              Pharma AI 落地资源库 (GxP Toolkit)
            </button>
          </div>

          {/* Dynamic screen switching */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {activeTab === 'sandbox' && (
              <WorkshopWorkspace 
                activeExercise={activeExercise} 
                onComplete={handleCompleteExercise} 
                files={files}
                folders={folders}
                onAddFile={handleAddFile}
              />
            )}

            {activeTab === 'kb' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">第四讲：本地知识库问答对(Q&A)转换及挂载对比</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      转换脱敏 SOP 文本，并将其存储入本地仿真文件夹中。支持一键测试有无挂载知识库对 AI 回答质量产生的决定性影响。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleCompleteExercise('ex-5');
                      handleCompleteExercise('ex-6');
                      alert('已手动标记实操 5 和实操 6 为「合格结业」！');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    标记本讲已合格
                  </button>
                </div>
                <KnowledgeBaseManager 
                  files={files} 
                  folders={folders} 
                  onAddFile={handleAddFile} 
                />
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">第五讲实操11：加载 pharma-gmp-audit 5模审计助手</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      切换官方检察官、内审员、合规顾问、陪同演练话术教练或 CAPA 编制人。在真实 GxP 车间场景中展开协同交互。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleCompleteExercise('ex-11');
                      alert('已手动标记实操 11 (GMP审计助手交互) 为「合格结业」！');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    标记本讲已合格
                  </button>
                </div>
                <GmpAuditChat />
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">第六讲实操12：偏差评估“多专家智能体协作组合”</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      模拟真实的药企多功能部门协作。QA评估、法规索引和文档编制三个智能体，基于相同的偏差上下文接力分析。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleCompleteExercise('ex-12');
                      alert('已手动标记实操 12 (多专家协同) 为「合格结业」！');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    标记本讲已合格
                  </button>
                </div>
                <DeviationExpertPanel />
              </div>
            )}

            {activeTab === 'watcher' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">第八讲：自动化重复任务定时/触发监听器</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      测试实操 15 (COA 智能解析导入台账) 及 实操 16 (监测偏差自动起草文书)。彻底释放药企日常重复性文书工作。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleCompleteExercise('ex-15');
                      handleCompleteExercise('ex-16');
                      alert('已手动标记实操 15 与实操 16 为「合格结业」！');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    标记本讲已合格
                  </button>
                </div>
                <FolderWatcher />
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">💡 制药企业 AI 场景落地配套工具与实战资产集</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      包含 10 大 GxP CRAFT 提示词模板、10 大智能体 Skill 核心规则、SOP问答转化操作指引、上线验证核查表等核心资产。
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-xs">
                    ✓ 全套方案就绪
                  </span>
                </div>
                <PharmaResourceCenter />
              </div>
            )}
          </div>

        </main>
      </div>

    </div>
  );
}
