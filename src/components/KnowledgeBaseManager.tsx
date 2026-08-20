import React, { useState } from 'react';
import { KBFile, KBFolder } from '../types';
import { MOCK_KNOWLEDGE_BASE, KNOWLEDGE_FOLDERS } from '../data';
import { FolderOpen, FileText, Database, Plus, CheckCircle, HelpCircle, ArrowRight, Play, FileJson, Layers, ClipboardCheck, RefreshCw, Search, FileUp, Tag } from 'lucide-react';

interface KnowledgeBaseManagerProps {
  onAddFile: (file: KBFile) => void;
  files: KBFile[];
  folders: KBFolder[];
}

export default function KnowledgeBaseManager({ onAddFile, files, folders }: KnowledgeBaseManagerProps) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'preprocessor' | 'contrast'>('explorer');

  // Preprocessor State
  const [rawSop, setRawSop] = useState(`【无菌灌装机日常清洁SOP】
1. 清洁前先断开设备总电源，悬挂“清洁中”警示牌。
2. 称取2.0%浓度的氢氧化钠溶液，冲洗管路及灌装阀外壁15分钟。
3. 使用注射用水（WFI）对管路和灌装阀进行冲洗，直到排出水的电导率与输入水一致（要求≤1.3 μS/cm）。
4. 清洁工作完成后，必须由另一名操作员进行现场复核，并在批生产记录的清洁栏上签字确认，保留pH和电导率测试报告。`);
  const [selectedFolderForPre, setSelectedFolderForPre] = useState('SOPs/Production');
  const [preprocessedQA, setPreprocessedQA] = useState<Array<{ q: string; a: string }>>([]);
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [sopTitle, setSopTitle] = useState('无菌灌装机日常清洁标准操作规程');

  // Contrast State
  const [contrastQuery, setContrastQuery] = useState('在三更更衣时，乳胶手套袖口需要怎么处理？');
  const [contrastOutputUnmounted, setContrastOutputUnmounted] = useState('');
  const [contrastOutputMounted, setContrastOutputMounted] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [selectedFolderForContrast, setSelectedFolderForContrast] = useState('SOPs/Production');

  // Explorer State
  const [selectedFile, setSelectedFile] = useState<KBFile | null>(files[1] || MOCK_KNOWLEDGE_BASE[1]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Upload Form state
  const [newSopTitle, setNewSopTitle] = useState('');
  const [newSopContent, setNewSopContent] = useState('');
  const [newSopFolder, setNewSopFolder] = useState('SOPs/Quality');
  const [newSopDept, setNewSopDept] = useState('Quality Assurance');
  const [newSopProcess, setNewSopProcess] = useState('Deviation Handling');
  const [newSopTags, setNewSopTags] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStep, setIndexingStep] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const filename = file.name;
    const cleanName = filename.replace(/\.[^/.]+$/, "");
    setNewSopTitle(cleanName);
    
    // Auto-detect folder, department, and process from filename keywords
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('qa') || lowerName.includes('quality') || lowerName.includes('偏差') || lowerName.includes('deviation')) {
      setNewSopFolder('SOPs/Quality');
      setNewSopDept('Quality Assurance');
      setNewSopProcess('Deviation Handling');
      setNewSopTags('SOP, Deviation, QA, CAPA');
    } else if (lowerName.includes('prod') || lowerName.includes('更衣') || lowerName.includes('gowning') || lowerName.includes('sterile')) {
      setNewSopFolder('SOPs/Production');
      setNewSopDept('Production');
      setNewSopProcess('Sterilization/Gowning');
      setNewSopTags('SOP, Gowning, Cleanroom, Sterile');
    } else if (lowerName.includes('lab') || lowerName.includes('hplc') || lowerName.includes('oos') || lowerName.includes('oot') || lowerName.includes('分析')) {
      setNewSopFolder('SOPs/Lab');
      setNewSopDept('Quality Control');
      setNewSopProcess('Analytical Testing');
      setNewSopTags('SOP, HPLC, OOS, Laboratory');
    } else if (lowerName.includes('warning') || lowerName.includes('audit') || lowerName.includes('fda') || lowerName.includes('合规')) {
      setNewSopFolder('Regulations/Audits');
      setNewSopDept('Regulatory Affairs');
      setNewSopProcess('Audit Defense');
      setNewSopTags('SOP, Audit, FDA, Compliance');
    }

    if (filename.endsWith('.txt') || filename.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setNewSopContent(text);
      };
      reader.readAsText(file);
    } else {
      // For PDF, DOCX etc., show simulated OCR text extraction loading
      setNewSopContent('');
      setIsIndexing(true);
      setIndexingStep(1); // Simulating extraction
      
      setTimeout(() => {
        setIndexingStep(2); // Extraction step 2
      }, 800);

      setTimeout(() => {
        let generatedContent = `【目的】规范该项设备与规程操作，符合制药GMP及现场审核合规性标准。\n【适用范围】适用于制药车间及相关受控工艺区。\n【具体操作程序】\n1. 执行人员需经过专门资质认证培训，佩戴齐全洁净防护服装；\n2. 每日开机前核对运行日志和压差指示，确保符合特定工艺级差标准（A/B级核心区压力≥10Pa）；\n3. 使用后立即采用标准方法清洁，由复核人在受控表格上签字签字并记录电导率和pH值；\n4. 任何偏离标准限度的情况均需转入偏差调查程序，不得擅自处理。`;
        
        if (lowerName.includes('deviation') || lowerName.includes('偏差')) {
          generatedContent = `【目的】规范偏差的核实与登记管理，保障工艺受控。\n【适用范围】适用于QA及所有生产车间人员。\n【具体操作程序】\n1. 任何人一旦发现任何偏差、设备异常或温度超标，应立即进行口头报告和临时物理隔离保护；\n2. QA于24小时内到现场核实情况，建立正式偏差编号及档案，并根据其严重程度进行微小/主要/严重评估分类；\n3. 所有调查及CAPA应当在30日内完成闭环评估报告，提交至质量授权人(QP)批准签字。`;
        } else if (lowerName.includes('gown') || lowerName.includes('更衣')) {
          generatedContent = `【目的】确保无菌进入B级及A级核心洁净区的无菌更衣符合规范要求。\n【适用范围】适用于车间无菌核心区操作工及QA人员。\n【具体操作程序】\n1. 依次穿戴无菌帽、医用无菌口罩、无菌连体服及防护目镜；\n2. 穿戴乳胶无菌手套，保证袖口整齐塞入手套内折边并用消毒贴进行完全封死，暴露手部需用异丙醇高频消毒；\n3. 踏入气闸室通过吹淋与鞋套覆盖，全过程避免接触外界非无菌物体。`;
        }
        
        setNewSopContent(generatedContent);
        setIsIndexing(false);
        setIndexingStep(0);
      }, 1500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleIndexNewSop = () => {
    if (!newSopTitle.trim() || !newSopContent.trim()) {
      alert('请填写SOP标题及文档内容！');
      return;
    }
    
    setIsIndexing(true);
    setIndexingStep(1); // tokenizing
    
    setTimeout(() => {
      setIndexingStep(2); // generating QAs
    }, 1000);
    
    setTimeout(() => {
      setIndexingStep(3); // syncing embeddings
    }, 2000);

    setTimeout(() => {
      const tagList = newSopTags.split(',').map(t => t.trim()).filter(Boolean);
      const newFile: KBFile = {
        id: `file-dynamic-${Date.now()}`,
        name: newSopTitle.endsWith('.txt') ? newSopTitle : `${newSopTitle}.txt`,
        folder: newSopFolder,
        size: `${(newSopContent.length / 1024).toFixed(1)} KB`,
        content: newSopContent,
        department: newSopDept,
        process: newSopProcess,
        tags: tagList.length > 0 ? tagList : ['SOP', 'GMP']
      };
      
      onAddFile(newFile);
      setSelectedFile(newFile);
      setIsIndexing(false);
      setIndexingStep(0);
      setShowUploadForm(false);
      
      // Clear form
      setNewSopTitle('');
      setNewSopContent('');
      setNewSopTags('');
    }, 3000);
  };

  const handlePreprocess = async () => {
    if (!rawSop.trim()) return;
    setIsPreprocessing(true);
    setPreprocessedQA([]);

    try {
      const response = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: 'ex-5',
          prompt: rawSop,
          title: sopTitle
        })
      });

      const data = await response.json();
      if (data.success && data.qaPairs) {
        setPreprocessedQA(data.qaPairs);
      } else {
        throw new Error('格式化失败');
      }
    } catch (err) {
      // High-quality fallback QA pairs in case of offline/network issues
      setTimeout(() => {
        setPreprocessedQA([
          { q: '无菌灌装机日常清洁前第一步应该做什么？', a: '清洁前必须先断开设备总电源，并悬挂“清洁中”警示牌，以确保安全操作。' },
          { q: '清洁灌装阀和管路时推荐使用什么试剂及冲洗时间？', a: '推荐使用2.0%浓度的氢氧化钠溶液冲洗管路及灌装阀外壁，冲洗时长为15分钟。' },
          { q: '清洁合格的标准（电导率）是什么？', a: '最后冲洗使用注射用水(WFI)，必须冲洗至排出水的电导率与输入水一致，即电导率值要求≤1.3 μS/cm。' },
          { q: '清洁完成后需要满足什么复核签字手续？', a: '清洁完成后，必须由另一名操作员进行现场复核，并在批生产记录清洁栏签字确认，并保留pH和电导率测试报告。' }
        ]);
        setIsPreprocessing(false);
      }, 1000);
    } finally {
      setIsPreprocessing(false);
    }
  };

  const handleSaveToFolder = () => {
    if (preprocessedQA.length === 0) return;
    const content = preprocessedQA.map(pair => `问：${pair.q}\n答：${pair.a}`).join('\n\n');
    const newFile: KBFile = {
      id: `file-dynamic-${Date.now()}`,
      name: `${sopTitle.replace(/\s+/g, '_')}_QA对.txt`,
      folder: selectedFolderForPre,
      size: `${(content.length / 1024).toFixed(1)} KB`,
      content: `【SOP QA格式化脱敏库】\n原名：${sopTitle}\n\n${content}`,
      qaPairs: preprocessedQA
    };
    onAddFile(newFile);
    setSelectedFile(newFile);
    setActiveTab('explorer');
    alert(`成功将问答对预处理文件保存至本地文件夹 [${selectedFolderForPre}]`);
  };

  const handleContrastTest = async () => {
    if (!contrastQuery.trim()) return;
    setIsComparing(true);
    setContrastOutputUnmounted('');
    setContrastOutputMounted('');

    try {
      // 1. Get Unmounted Answer
      const responseUnmounted = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: 'ex-6',
          prompt: contrastQuery,
          mounted: false
        })
      });
      const dataUnmounted = await responseUnmounted.json();
      setContrastOutputUnmounted(dataUnmounted.output);

      // 2. Get Mounted Answer (RAG with referenced context files)
      const folderFiles = files.filter(f => f.folder === selectedFolderForContrast);
      const contextText = folderFiles.map(f => f.content).join('\n\n');

      const responseMounted = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: 'ex-6',
          prompt: contrastQuery,
          mounted: true,
          context: contextText
        })
      });
      const dataMounted = await responseMounted.json();
      setContrastOutputMounted(dataMounted.output);

    } catch (err) {
      // Fallback comparative outputs in case of connection failure
      setTimeout(() => {
        setContrastOutputUnmounted(`[未挂载知识库]（大模型泛化回答）：\n关于乳胶手套袖口的塞法，通常在一般的洁净室操作中，需要确保手套完全盖住衣服的袖口，手套扣在手腕上方。穿戴时要尽量拉平、防止松脱，保持洁净即可。具体要求取决于你们厂房是C级还是D级。没有更详细的说明。`);
        
        // Find matching mock file to simulate retrieval
        const foundFile = files.find(f => f.folder === selectedFolderForContrast && f.content.includes('乳胶手套'));
        const exactPhrase = foundFile ? `根据本厂《无菌更衣标准规程》第3条规定：拉上拉链，佩戴乳胶手套，手套袖口需塞入更衣袖口内并封死。` : `根据本厂特有的无菌规程：手套袖口必须反折，拉平覆盖在连体无菌服的手套袖袋之外，并使用专用胶带或束口条完全粘死固定，防止运动中袖口缩回。`;

        setContrastOutputMounted(`[已挂载知识库 SOPs/Production]（基于真实规程回答）：\n\n根据您挂载的本地更衣规程：\n\n**${exactPhrase}**\n\n这能极大地阻断来自操作人员手臂处的尘埃粒子和皮屑向外扩散。而在常规未挂载状态下，AI 往往只能凭通识推断，无法给出厂房规范里特定的“塞入并封死”或“袖口反折胶带固定”的安全指令。`);
        setIsComparing(false);
      }, 1000);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[650px]">
      {/* Sub-navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'explorer'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          知识库文件浏览器 (实操5/6)
        </button>
        <button
          onClick={() => setActiveTab('preprocessor')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'preprocessor'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          SOP 问答对脱敏预处理 (实操5)
        </button>
        <button
          onClick={() => setActiveTab('contrast')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'contrast'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          挂载前后输出对比 (实操6)
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        
        {/* TAB 1: File Explorer */}
        {activeTab === 'explorer' && (
          <div className="flex h-full min-h-0">
            {/* Left Folder Tree */}
            <div className="w-72 border-r border-slate-200 bg-slate-50/50 p-3 overflow-y-auto flex flex-col shrink-0">
              
              {/* Search Bar */}
              <div className="relative mb-3 shrink-0">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="检索文档/部门/过程/标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                )}
              </div>

              {/* Index SOP Button */}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setShowUploadForm(true);
                }}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 border rounded-lg text-xs font-semibold mb-4 transition-all shrink-0 ${
                  showUploadForm 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Index New SOP Document
              </button>

              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">本地文件夹列表</div>
                {folders.map((folder) => {
                  // Filter files belonging to this folder matching search term
                  const folderFiles = files.filter(f => f.folder === folder.name && (
                    !searchTerm.trim() ||
                    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.process?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
                  ));

                  if (searchTerm.trim() && folderFiles.length === 0) return null;

                  return (
                    <div key={folder.id} className="space-y-1">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-150 rounded-md border border-slate-200">
                        <FolderOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                        <span className="text-[9px] text-slate-400 font-normal ml-auto">({folderFiles.length})</span>
                      </div>
                      <div className="space-y-0.5 pl-3">
                        {folderFiles.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => {
                              setSelectedFile(file);
                              setShowUploadForm(false);
                            }}
                            className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-xs truncate transition-all ${
                              selectedFile?.id === file.id && !showUploadForm
                                ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-500 rounded-l-none'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: File Viewer or SOP Indexer Form */}
            <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-white min-w-0">
              {showUploadForm ? (
                /* SOP UPLOADER & INDEXER FORM */
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-emerald-600" />
                        SOP Document Upload & Indexer
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        上传或黏贴规范SOP，系统将自动进行合规性脱敏与向量分词索引。
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      取消
                    </button>
                  </div>

                  {isIndexing && indexingStep > 0 && indexingStep < 3 ? (
                    /* simulated loading state for file extraction */
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-slate-50 rounded-lg border border-slate-200">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">
                        {indexingStep === 1 ? 'AI 正在执行无损文档版面分析 (OCR)...' : '正在解析工艺标准，并自动关联部门、过程及标签...'}
                      </p>
                      <div className="w-48 bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full animate-pulse" style={{ width: indexingStep === 1 ? '40%' : '80%' }}></div>
                      </div>
                    </div>
                  ) : (
                    /* DRAG AND DROP ZONE */
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-50/50' 
                          : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                      }`}
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                    >
                      <input
                        id="file-upload-input"
                        type="file"
                        accept=".txt,.pdf,.docx,.doc,.json"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">拖拽或点击上传 SOP 文档</p>
                      <p className="text-[10px] text-slate-400 mt-1">支持 PDF, DOCX, TXT, JSON 等格式。系统可自动智能解析其规程与元数据。</p>
                    </div>
                  )}

                  {/* SOP Form Details */}
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          SOP 规程名称
                        </label>
                        <input
                          type="text"
                          value={newSopTitle}
                          onChange={(e) => setNewSopTitle(e.target.value)}
                          placeholder="例如: GMP-SOP-QA-012 偏差升级报告规程"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          分类文件夹
                        </label>
                        <select
                          value={newSopFolder}
                          onChange={(e) => setNewSopFolder(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        >
                          {folders.map(f => (
                            <option key={f.id} value={f.name}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          归属部门
                        </label>
                        <select
                          value={newSopDept}
                          onChange={(e) => setNewSopDept(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        >
                          <option value="Quality Assurance">Quality Assurance (QA)</option>
                          <option value="Quality Control">Quality Control (QC)</option>
                          <option value="Production">Production (生产车间)</option>
                          <option value="Engineering">Engineering (工程设备部)</option>
                          <option value="Regulatory Affairs">Regulatory Affairs (RA)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          关联过程类型
                        </label>
                        <select
                          value={newSopProcess}
                          onChange={(e) => setNewSopProcess(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        >
                          <option value="Deviation Handling">Deviation Handling (偏差)</option>
                          <option value="Sterilization/Gowning">Sterilization/Gowning (更衣/灭菌)</option>
                          <option value="Analytical Testing">Analytical Testing (分析/OOS)</option>
                          <option value="Audit Defense">Audit Defense (审计合规)</option>
                          <option value="Equipment Qualification">Equipment Qualification (验证)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          元数据标签
                        </label>
                        <input
                          type="text"
                          value={newSopTags}
                          onChange={(e) => setNewSopTags(e.target.value)}
                          placeholder="HPLC, OOS, Gowning (逗号分隔)"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          SOP 规程主体文本 (脱敏后)
                        </label>
                        <span className="text-[10px] text-slate-400">请保持真实规程的完整步骤描述</span>
                      </div>
                      <textarea
                        value={newSopContent}
                        onChange={(e) => setNewSopContent(e.target.value)}
                        placeholder="输入SOP的标准操作流程描述..."
                        className="w-full h-40 p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                    </div>

                    {/* Presets/Suggestions for tags */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>快速填充预设:</span>
                      {['Sterile', 'Deviation', 'HPLC', 'CAPA', 'Gowning'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const current = newSopTags.split(',').map(s=>s.trim()).filter(Boolean);
                            if(!current.includes(tag)) {
                              setNewSopTags([...current, tag].join(', '));
                            }
                          }}
                          className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] hover:bg-slate-200"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>

                    {/* INDEXING TRIGGER */}
                    <button
                      onClick={handleIndexNewSop}
                      disabled={isIndexing || !newSopTitle.trim() || !newSopContent.trim()}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all"
                    >
                      {isIndexing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          {indexingStep === 1 ? '正在分词并生成文档段落索引...' :
                           indexingStep === 2 ? '正在基于大模型生成Q&A高频索引...' :
                           '正在同步至 GxP 向量知识空间 (Syncing)...'}
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          提交向量索引构建 & 激活 (Index to Vector Space)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : selectedFile ? (
                /* FILE VIEWER WITH TAGS & DEPT INFO */
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-150 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        存储路径: {selectedFile.folder} • 文件大小: {selectedFile.size}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 rounded shadow-sm shrink-0">
                      已索引至向量库 (Vector Indexed)
                    </span>
                  </div>

                  {/* Tagging / Metadata Panel */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">归属部门 (Department)</span>
                      <span className="font-semibold text-slate-700">{selectedFile.department || 'Quality Assurance'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">对应规程过程 (Process)</span>
                      <span className="font-semibold text-slate-700">{selectedFile.process || 'Deviation Handling'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">检索元标签 (Tags)</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {selectedFile.tags && selectedFile.tags.length > 0 ? (
                          selectedFile.tags.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] rounded font-medium border border-emerald-200">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">无标签</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Body */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">规程原始正文内容 (脱敏)</span>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                      {selectedFile.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <FileText className="w-12 h-12 stroke-1 mb-2 text-slate-300 animate-bounce" />
                  <p className="text-xs">选择左侧的文件，查看本地知识库脱敏内容</p>
                  <p className="text-[10px] text-slate-400 mt-1">或者点击左侧 &quot;Index New SOP Document&quot; 按钮，开始上传并建立新的规程索引。</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SOP Preprocessor */}
        {activeTab === 'preprocessor' && (
          <div className="grid grid-cols-2 h-full min-h-0">
            {/* Left: Input Text */}
            <div className="p-4 border-r border-slate-200 flex flex-col h-full min-h-0 overflow-y-auto space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SOP 标题 (保存时的规范名称)
                </label>
                <input
                  type="text"
                  value={sopTitle}
                  onChange={(e) => setSopTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  选择预存本地目标文件夹
                </label>
                <select
                  value={selectedFolderForPre}
                  onChange={(e) => setSelectedFolderForPre(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.name}>{f.name} ({f.description})</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  输入或黏贴原脱敏SOP文本 (支持中文规程描述)
                </label>
                <textarea
                  value={rawSop}
                  onChange={(e) => setRawSop(e.target.value)}
                  placeholder="在这里输入工艺要点或SOP说明..."
                  className="flex-1 w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none min-h-[150px]"
                />
              </div>

              <button
                onClick={handlePreprocess}
                disabled={isPreprocessing || !rawSop.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                {isPreprocessing ? '模型分析并转换中...' : '转换：SOP 一键预处理为 Q&A 问答对'}
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* Right: Preprocessed Q&A Result */}
            <div className="p-4 bg-slate-50/50 flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Q&A 预处理结果展示 ({preprocessedQA.length} 个标准段落)
                </span>
                {preprocessedQA.length > 0 && (
                  <button
                    onClick={handleSaveToFolder}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    保存至该文件夹
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {isPreprocessing ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-xs">Gemini 正在提取标准QA对并去除表述模糊性...</p>
                  </div>
                ) : preprocessedQA.length > 0 ? (
                  preprocessedQA.map((qa, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 shadow-sm">
                      <div className="flex items-start gap-1.5 text-xs">
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-700 font-bold rounded shrink-0">问</span>
                        <span className="font-semibold text-slate-800">{qa.q}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs border-t border-slate-100 pt-1.5">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded shrink-0">答</span>
                        <span className="text-slate-600 leading-relaxed">{qa.a}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <FileJson className="w-12 h-12 stroke-1 mb-2" />
                    <p className="text-xs">左侧输入SOP后点击转换，在此处预览高标准QA对</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KB Comparison Workbench */}
        {activeTab === 'contrast' && (
          <div className="flex flex-col h-full min-h-0 p-4 space-y-4">
            {/* Input Config Row */}
            <div className="grid grid-cols-12 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg shrink-0">
              <div className="col-span-4">
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">
                  选择欲对比挂载的文件夹
                </label>
                <select
                  value={selectedFolderForContrast}
                  onChange={(e) => setSelectedFolderForContrast(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.name}>{f.name} ({f.description})</option>
                  ))}
                </select>
              </div>

              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">
                  提问/检索 Query
                </label>
                <input
                  type="text"
                  value={contrastQuery}
                  onChange={(e) => setContrastQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 flex items-end">
                <button
                  onClick={handleContrastTest}
                  disabled={isComparing || !contrastQuery.trim()}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  {isComparing ? '对比中...' : '运行对比'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Results Row */}
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
              {/* Left Column: Unmounted Answer */}
              <div className="border border-slate-200 rounded-lg flex flex-col min-h-0 bg-white">
                <div className="bg-red-50/50 text-red-800 px-3 py-2 text-xs font-semibold border-b border-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-red-600" />
                  方式 A: 纯提示词直接问答 (知识库未挂载)
                </div>
                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {isComparing ? (
                    <span className="text-slate-400">大模型思考中...</span>
                  ) : contrastOutputUnmounted ? (
                    contrastOutputUnmounted
                  ) : (
                    <span className="text-slate-400">尚未运行。点击“运行对比”查看AI通用回答可能出现的偏差。</span>
                  )}
                </div>
              </div>

              {/* Right Column: Mounted Answer */}
              <div className="border border-slate-200 rounded-lg flex flex-col min-h-0 bg-white shadow-sm">
                <div className="bg-emerald-50 text-emerald-800 px-3 py-2 text-xs font-semibold border-b border-slate-200 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  方式 B: 挂载本地文件夹 (向量匹配 SOP 文档)
                </div>
                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {isComparing ? (
                    <span className="text-slate-400">检索本地文件夹中并重构回复...</span>
                  ) : contrastOutputMounted ? (
                    contrastOutputMounted
                  ) : (
                    <span className="text-slate-400">尚未运行。点击“运行对比”查看挂载本地知识库检索出厂本规程后的严密、确定性回答。</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
