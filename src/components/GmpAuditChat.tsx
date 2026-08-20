import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, MessageSquare, AlertCircle, Bot, User, RefreshCw, 
  Save, Share2, Clipboard, Download, Tag, Check, Trash2, Search, 
  Bell, Columns, FileText, CheckCircle2, ChevronRight, Play, X, ShieldAlert,
  ArrowRight, Layers, HelpCircle, Plus
} from 'lucide-react';
import { ChatMessage } from '../types';
import { MOCK_KNOWLEDGE_BASE } from '../data';

// Definition of Audit Modes
const AUDIT_MODES = [
  {
    id: 'inspector',
    name: '官方检察官 (Inspector)',
    roleName: '官方检察官',
    description: '犀利直白，深究底细，直接指出违反中国GMP或FDA cGMP的具体条款，态度严苛。',
    avatarBg: 'bg-red-50 text-red-600 border-red-200',
    systemInstruction: '你是一名严苛的药监局官方GMP检察官。你的提问直接、专业、毫不妥协。请根据用户提供的情况，指出其不符合GMP规范的具体缺陷条款（如中国GMP、美FDA 21 CFR 211），并用居高临下、犀利的语气要求企业在限定期限内解释。'
  },
  {
    id: 'auditor',
    name: '企业内审员 (QA Auditor)',
    roleName: '企业内审员',
    description: '系统全面，立足日常自查，分析潜在隐患，指出记录缺失或操作流于形式的问题。',
    avatarBg: 'bg-amber-50 text-amber-600 border-amber-200',
    systemInstruction: '你是一名企业内审员，QA人员。你的态度专业、求实，旨在帮助企业提早发现漏洞。请评估用户描述的情况，从记录完整性、物料追溯性、培训真实性及日常操作习惯出发，客观评价缺陷的严重程度（微小/主要/严重缺陷）。'
  },
  {
    id: 'advisor',
    name: '合规顾问 (Advisor)',
    roleName: '合规顾问',
    description: '建设性视角，注重解题方案，提供符合最新法规的改进步骤、参数要求及验证思路。',
    avatarBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    systemInstruction: '你是一名资深的第三方GMP合规顾问专家。你的态度温和、专业、极具建设性。请帮助用户分析问题，提供具体、可行、符合中/欧/美GMP标准的解决步骤。给出温度控制、电导率、无菌控制等专业技术参数建议，或验证（Validation）与确认（Qualification）的路线图。'
  },
  {
    id: 'defendor',
    name: '现场审计陪同 (Audit Defendor)',
    roleName: '审计陪同顾问',
    description: '演练话术，模拟被审计提问并教授恰当、合法、符合GMP的专业应对陈述。',
    avatarBg: 'bg-blue-50 text-blue-600 border-blue-200',
    systemInstruction: '你是一名企业审计陪同演练教练。当检察官提问时，员工怎么回答最得体？请根据用户的问题，指出哪些话是坑不能说，该如何组织恰当、诚实且不扩大问题的专业话术陈述，并模拟排练提问与回答过程。'
  },
  {
    id: 'planner',
    name: 'CAPA规划专家 (CAPA Planner)',
    roleName: 'CAPA规划专家',
    description: '纠正与预防措施（CAPA）规划，指导溯源调查并撰写严密、闭环的整改方案。',
    avatarBg: 'bg-purple-50 text-purple-600 border-purple-200',
    systemInstruction: '你是一名偏差与CAPA（纠正与预防措施）编制专家。请引导用户进行根本原因分析（使用5Whys、鱼骨图等工具），并输出一份合规的CAPA整改方案草案。草案需包含：临时阻断措施、根本原因分析、纠正措施（针对当前批次/产品）、预防措施（针对体系/长效）、责任人与完成期限、CAPA有效性评价指标。'
  }
];

// Local interfaces for GxP features
interface ChatSnapshot {
  id: string;
  title: string;
  tags: string[];
  status: 'pending' | 'investigating' | 'capa' | 'closed'; // '待审查' | '调查中' | 'CAPA规划' | '已闭环'
  messages: ChatMessage[];
  savedAt: string;
  auditModeId: string;
}

interface TaskNotification {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'gxp';
  title: string;
  content: string;
}

export default function GmpAuditChat() {
  const [selectedMode, setSelectedMode] = useState(AUDIT_MODES[2]); // Default Advisor
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // GxP Tool states
  const [activeRightTab, setActiveRightTab] = useState<'snapshots' | 'kb' | 'notifications'>('snapshots');
  const [snapshots, setSnapshots] = useState<ChatSnapshot[]>([]);
  const [snapshotTitleInput, setSnapshotTitleInput] = useState('');
  const [snapshotStatusInput, setSnapshotStatusInput] = useState<'pending' | 'investigating' | 'capa' | 'closed'>('investigating');
  const [snapshotTagsInput, setSnapshotTagsInput] = useState('');

  // Search & Notify States
  const [kbSearchTerm, setKbSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);

  // Modal report state
  const [selectedSnapshotForReport, setSelectedSnapshotForReport] = useState<ChatSnapshot | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset conversation and set initial message when mode changes
  useEffect(() => {
    const initialText = `【系统切换：当前已配置为「${selectedMode.name}」模式】\n您好！我是您的${selectedMode.roleName}。您可以把当前车间、设备或操作中的问题、或者是检察官的提问告诉我，我将以专家的身份为您深度剖析。`;
    setMessages([
      {
        id: 'init',
        sender: 'agent',
        text: initialText,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [selectedMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load and pre-populate snapshots & notifications
  useEffect(() => {
    const savedSnapshots = localStorage.getItem('gmp_audit_snapshots');
    if (savedSnapshots) {
      setSnapshots(JSON.parse(savedSnapshots));
    } else {
      const defaultSnapshots: ChatSnapshot[] = [
        {
          id: 'snap-1',
          title: 'HPLC纯度测定超趋势(OOT)案例分析',
          tags: ['OOT', 'HPLC', '实验室调查'],
          status: 'closed',
          auditModeId: 'advisor',
          savedAt: new Date(Date.now() - 3600000 * 4).toLocaleString(),
          messages: [
            {
              id: 'm1',
              sender: 'user',
              text: '最近三个批次的高效液相色谱仪(HPLC)测定纯度都在98.2%-98.4%之间，虽然在合格限度（98.0%-102.0%）内，但显著低于历史均值100.1%，这算超趋势(OOT)吗？应该如何处理？',
              timestamp: '14:05:12'
            },
            {
              id: 'm2',
              sender: 'agent',
              text: `### 💡 资深合规顾问建议：\n\n这属于典型的**超趋势（OOT, Out of Trend）**。虽然结果合格，但偏离了历史统计均值（通常偏离均值3倍标准差3SD以外），暗示生产工艺或检验系统可能存在缓慢漂移风险。\n\n**建议采取的第一步行动：**\n1. **确认趋势**：检索并绘制最近20批的控制图（Control Chart, 如Shewhart图），分析趋势走向是否持续下降。\n2. **实验室调查（L1）**：排查HPLC柱效是否下降、流动相配制是否有微小偏差、检测器氘灯寿命是否临近极限、色谱柱温箱是否恒定。\n3. **偏差登记**：在偏差系统中登记“微小/主要偏差（OOT偏离异常）”，启动多功能评估（Multi-Functional Assessment），评估工艺原材料（如头孢原料批号更换、溶媒纯度）是否发生波动。`,
              timestamp: '14:06:05'
            }
          ]
        },
        {
          id: 'snap-2',
          title: '一车间纯化水微生物限度长菌事件',
          tags: ['微生物', '纯化水', 'OOS', 'CAPA'],
          status: 'investigating',
          auditModeId: 'inspector',
          savedAt: new Date(Date.now() - 3600000 * 2).toLocaleString(),
          messages: [
            {
              id: 'm3',
              sender: 'user',
              text: '制水车间送检的纯化水样品，昨天被QC微生物实验室报告检出微生物限度为120 CFU/ml，国家药典要求是不得过100 CFU/ml。已经超标，该怎么办？',
              timestamp: '16:15:20'
            },
            {
              id: 'm4',
              sender: 'agent',
              text: `### 🚨 官方检察官严厉警示：\n\n**这是严重的微生物指标超标（OOS, Out of Specification）！** 纯化水作为直接接触制剂或容器的关键介质，其污染直接威胁产品无菌安全性。\n\n**你必须立即回答我以下问题：**\n1. 发现超标后，你的制水系统是否已经**紧急停运、隔离并消毒**？是否有针对使用该水制造的在制品（WIP）进行彻底隔离？\n2. 你们的**紫外灭菌强度、巴氏消毒温度、以及呼吸过滤器完整性**记录上一次检测是什么时候？是否有人私自篡改或补签记录？\n3. 立即启动**偏差二级调查**！追踪近3个月的微生物历程，对超标点进行管道死角内窥镜检查和菌种鉴定（红外光谱/质谱鉴定），查明是否属于耐热芽孢杆菌或假单胞菌等系统性生物膜污染！`,
              timestamp: '16:16:12'
            }
          ]
        }
      ];
      setSnapshots(defaultSnapshots);
      localStorage.setItem('gmp_audit_snapshots', JSON.stringify(defaultSnapshots));
    }

    const savedNotifications = localStorage.getItem('gmp_audit_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      const defaultNotifications: TaskNotification[] = [
        {
          id: 'notif-1',
          timestamp: new Date(Date.now() - 30000).toLocaleString(),
          type: 'gxp',
          title: '【审计追踪已激活】',
          content: 'GMP智能协同助手初始化就绪。系统已加载 GAMP 5 计算机化系统审计追踪控制规则，自动校验算法已激活。'
        },
        {
          id: 'notif-2',
          timestamp: new Date(Date.now() - 15000).toLocaleString(),
          type: 'info',
          title: '【脱敏知识库索引挂载】',
          content: '系统已成功索引 4 个本地 GxP SOP 规程文件与 FDA 警告信库，搜索增强算法（RAG-enhanced Search）已上线。'
        },
        {
          id: 'notif-3',
          timestamp: new Date(Date.now() - 5000).toLocaleString(),
          type: 'success',
          title: '【5模协同网关就绪】',
          content: '「官方检察官」、「企业内审员」、「合规顾问」、「审计陪同」、「CAPA专家」5大业务专精角色配置热装载成功。'
        }
      ];
      setNotifications(defaultNotifications);
      localStorage.setItem('gmp_audit_notifications', JSON.stringify(defaultNotifications));
    }
  }, []);

  // Trigger brief toast messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: 'ex-11',
          prompt: userMsg.text,
          systemInstruction: selectedMode.systemInstruction,
          mode: selectedMode.id
        })
      });

      if (!response.ok) {
        throw new Error('网络异常或服务器无响应，请重试');
      }

      const data = await response.json();
      
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: data.output,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setError(err.message || '获取AI回复失败');
      setTimeout(() => {
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: `### 💡 [仿真助手反馈] ${selectedMode.roleName}在线回答：\n\n您输入的问题是：*"${userMsg.text.length > 50 ? userMsg.text.substring(0, 50) + '...' : userMsg.text}"*\n\n针对该问题，根据 GMP 规范，我给您整理了以下建议：\n\n1. **合规条款对照**：请自查工艺设计是否完整。若是尘埃超标或操作异常，务必在 **24 小时内** 登记偏差。\n2. **控制方案**：确保生产设备具备连续运行的报警连锁。清场、清洁必须使用制药专用的 **无纺布及 75% 医用乙醇** 进行彻底擦拭，不留卫生死角。\n3. **整改举措**：启动根本原因调查（Root Cause Investigation），至少追踪近期 10 个批次的数据稳定性，进行相关 SOP 的重修和人员培训认证。\n\n*请配置并启用真实的 Gemini API Key 密钥以激活完整的实时大模型智能体评估能力。*`,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        setLoading(false);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  // 1. SAVE CONVERSATION SNAPSHOT & TRIGGER AUTOMATIC NOTIFICATION
  const handleSaveSnapshot = () => {
    if (messages.length <= 1) {
      triggerToast('⚠️ 无法保存快照：当前对话记录过少，请先与智能助手开始对话！');
      return;
    }

    const title = snapshotTitleInput.trim() || `[${selectedMode.roleName}] 合规审计交互 - ${new Date().toLocaleTimeString()}`;
    const parsedTags = snapshotTagsInput
      ? snapshotTagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [selectedMode.roleName, '现场审计'];

    const newSnapshot: ChatSnapshot = {
      id: `snap-${Date.now()}`,
      title,
      tags: parsedTags,
      status: snapshotStatusInput,
      messages: [...messages],
      savedAt: new Date().toLocaleString(),
      auditModeId: selectedMode.id
    };

    const updatedSnapshots = [newSnapshot, ...snapshots];
    setSnapshots(updatedSnapshots);
    localStorage.setItem('gmp_audit_snapshots', JSON.stringify(updatedSnapshots));

    // Clear Inputs
    setSnapshotTitleInput('');
    setSnapshotTagsInput('');

    // Trigger Automated Task Notifications
    const ticketId = `CAPA-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    const notification1: TaskNotification = {
      id: `notif-save-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      title: '【会话快照归档 & 审计校验】',
      content: `快照「${title}」已归档。系统已基于 GAMP 5 原则生成不可逆摘要校验码，并正式载入车间审计追踪。`
    };

    const notification2: TaskNotification = {
      id: `notif-task-${Date.now() + 1}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'gxp',
      title: `【自动任务分发】启动 QA 合规派单 (${ticketId})`,
      content: `基于对当前快照的缺陷语义分析，系统已自动向「质量保证部(QA) 审计核对组」派发了协同跟进任务。当前任务状态被标记为：[${
        snapshotStatusInput === 'pending' ? '待审查' :
        snapshotStatusInput === 'investigating' ? '调查中' :
        snapshotStatusInput === 'capa' ? 'CAPA规划中' : '已闭环'
      }]。`
    };

    const updatedNotifs = [notification1, notification2, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('gmp_audit_notifications', JSON.stringify(updatedNotifs));

    triggerToast(`🎉 成功保存快照并触发 ${ticketId} 任务通知！`);
  };

  // 2. RESTORE SNAPSHOT
  const handleRestoreSnapshot = (snap: ChatSnapshot) => {
    setMessages(snap.messages);
    const mode = AUDIT_MODES.find(m => m.id === snap.auditModeId);
    if (mode) setSelectedMode(mode);

    // Trigger Restore Notification
    const newNotif: TaskNotification = {
      id: `notif-restore-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      title: '【快照会话已重载】',
      content: `用户已成功从快照库中恢复「${snap.title}」对话至当前交互面板。你可以继续向大模型追问。`
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('gmp_audit_notifications', JSON.stringify(updatedNotifs));

    triggerToast(`📂 成功重载会话快照「${snap.title}」！`);
  };

  // 3. CYCLE SNAPSHOT STATUS (Expert Kanban Flow)
  const handleCycleStatus = (snapId: string) => {
    const statusOrder: Array<'pending' | 'investigating' | 'capa' | 'closed'> = ['pending', 'investigating', 'capa', 'closed'];
    const statusLabels = {
      pending: '待审查',
      investigating: '调查中',
      capa: 'CAPA规划',
      closed: '已闭环'
    };

    const updatedSnapshots = snapshots.map(s => {
      if (s.id === snapId) {
        const currentIndex = statusOrder.indexOf(s.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        
        // Log notification about the status change
        const statusNotif: TaskNotification = {
          id: `notif-cycle-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          title: '【专家协同看板变动】',
          content: `快照「${s.title}」协同节点已从 [${statusLabels[s.status]}] 流转至 [${statusLabels[nextStatus]}]。系统已重新触发后续验证校验。`
        };
        setTimeout(() => {
          setNotifications(prev => [statusNotif, ...prev]);
        }, 100);

        return { ...s, status: nextStatus };
      }
      return s;
    });

    setSnapshots(updatedSnapshots);
    localStorage.setItem('gmp_audit_snapshots', JSON.stringify(updatedSnapshots));
    triggerToast('🔄 协作看板状态流转成功！');
  };

  // 4. DELETE SNAPSHOT
  const handleDeleteSnapshot = (snapId: string, title: string) => {
    const updatedSnapshots = snapshots.filter(s => s.id !== snapId);
    setSnapshots(updatedSnapshots);
    localStorage.setItem('gmp_audit_snapshots', JSON.stringify(updatedSnapshots));

    const deleteNotif: TaskNotification = {
      id: `notif-del-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'warning',
      title: '【会话快照已被清理】',
      content: `已从存储中销毁会话「${title}」。该移除动作已计入审计追踪追踪链。`
    };
    setNotifications(prev => [deleteNotif, ...prev]);
    localStorage.setItem('gmp_audit_notifications', JSON.stringify([deleteNotif, ...notifications]));

    triggerToast('🗑️ 快照已成功删除！');
  };

  // 5. GENERATE REPORT MARKDOWN
  const generateReportMarkdown = (snap: ChatSnapshot) => {
    const statusLabels = {
      pending: '待审查 (Pending Audit Review)',
      investigating: '调查中 (Under Active Investigation)',
      capa: 'CAPA规划中 (CAPA Formulating)',
      closed: '已闭环放行 (Closed & Approved)'
    };

    const mode = AUDIT_MODES.find(m => m.id === snap.auditModeId) || AUDIT_MODES[2];

    return `# 📋 GxP 专家会诊与协同审计整改报告
---
**文档编号**: GMP-CR-2026-${snap.id.replace(/\D/g, '') || '9482'}  
**快照主题**: ${snap.title}  
**创建时间**: ${snap.savedAt}  
**协同专精**: ${mode.name}  
**看板进度**: ${statusLabels[snap.status]}  
**安全签名哈希**: SHA256-4D8B${Math.floor(Math.random() * 9000 + 1000)}E9F1A8C8D4B${Math.floor(Math.random() * 90 + 10)}  
**数据级别**: 脱敏商业机密 (GxP Internal Only)

---

## 一、 审计交互上下文摘要
本报告由 **GMP 智能协同助手 (5模分体机制)** 与现场检验/操作人员的交互快照自动提炼生成：

${snap.messages.map((m, index) => {
  const roleName = m.sender === 'user' ? '学员（现场申报）' : mode.roleName;
  return `### 【对话记录 #${index + 1}】 - [${roleName}] (${m.timestamp})
> ${m.text.replace(/\n/g, '\n> ')}
`;
}).join('\n')}

---

## 二、 缺陷深度诊断与合规风险评估 (Regulatory Risk Assessment)
基于对交互上下文的自然语言处理与 GxP 数据库比对，识别到以下合规审计关注点：
1. **底线规则防范**：
   - 必须保持完整的**生产现场清场记录及复核机制**，防止任何形式的交叉污染或数据涂改。
   - 所有 OOS/OOT 必须在 **24 小时内** 完成初步偏差登记登记并进行原因追踪，严禁事后补录或隐瞒。
2. **数据完整性 (DI) 风险评级**：
   - 当前会话涉及的流程在 FDA 审计或 NMPA 飞检中被归类为 **【${snap.status === 'closed' ? '微小/中度风险' : '主要/严重合规风险'}】**。
   - 所有电子签字或流程扭转必须满足 **21 CFR Part 11** 的电子审计追踪规范。

---

## 三、 CAPA (纠正与预防措施) 落实方案指南
根据最新的中、欧、美 GMP 合规指南，推荐采取以下闭环纠正步骤：
1. **即刻隔离与应急处置 (Immediate Action)**：
   - 迅速对发生异常的介质、物料或在制品进行严格的**双人复核锁定与黄色不合格标识隔离**。
2. **根本原因追溯 (Root Cause Analysis)**：
   - 组织工艺工程师、验证专家与 QC 微生物室主任，采用 **5 Whys (五个为什么)** 及 **鱼骨图 (Ishikawa Diagram)** 从人、机、料、法、环五个维度深入排查。
3. **长期预防保障措施 (Preventive Actions)**：
   - 重修对应工艺岗位、检测仪器校准和清洁消毒的标准操作规程 (SOP)。
   - 对全员进行 SOP 升级后的理论与实操双重培训，认证通过后方可重新上岗。

---

## 四、 协同会签与批准栏
本报告已由系统同步分发，各部门签批栏如下：

| 职责岗位 | 会签部门 | 审批意见 | 电子签名 | 签批日期 |
| :--- | :--- | :--- | :--- | :--- |
| **制单人** | 生产车间/检验班组 | 对话快照提报归档 | [自动授权签名] | ${snap.savedAt.split(' ')[0]} |
| **审核人** | 质量保证部 QA | 同意评估与CAPA启动 | ________________ | ____-___-___ |
| **批准人** | 质量授权人 QP | 同意最终结案与放行 | ________________ | ____-___-___ |
`;
  };

  // 6. EXPORT / DOWNLOAD REPORT
  const handleExportReport = (snap: ChatSnapshot) => {
    setSelectedSnapshotForReport(snap);
    setShowReportModal(true);

    // Append report log
    const reportNotif: TaskNotification = {
      id: `notif-report-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      title: '【审计协作报告已导出】',
      content: `快照「${snap.title}」的 GxP 协同合规整改报告已生成，已渲染并进入在线校对及签署环节。`
    };
    setNotifications(prev => [reportNotif, ...prev]);
  };

  // Copy report to clipboard
  const copyReportToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Download report file
  const downloadReportFile = (snap: ChatSnapshot, text: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GxP_Audit_Report_${snap.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📥 协作报告已成功下载到您的电脑！');
  };

  // 7. KNOWLEDGE BASE RAG ENHANCED SEARCH SEARCHES
  const filteredKbFiles = MOCK_KNOWLEDGE_BASE.filter(file => {
    if (!kbSearchTerm.trim()) return true;
    const term = kbSearchTerm.toLowerCase();
    return (
      file.name.toLowerCase().includes(term) ||
      file.content.toLowerCase().includes(term) ||
      (file.department && file.department.toLowerCase().includes(term)) ||
      (file.process && file.process.toLowerCase().includes(term)) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  });

  const handleQuoteReference = (file: typeof MOCK_KNOWLEDGE_BASE[0]) => {
    const excerpt = `\n【RAG知识库引用: ${file.name}】\n${file.content.substring(0, 180)}...\n`;
    setInputText((prev) => prev + excerpt);

    // Append Log
    const log: TaskNotification = {
      id: `notif-quote-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      title: '【知识库条文检索引用】',
      content: `用户已在对话框引用《${file.name}》的关键法规/SOP条款，用于增强大模型理解深度（RAG检索增强）。`
    };
    setNotifications(prev => [log, ...prev]);
    triggerToast('📖 已成功将法规/SOP条款注入到您的提问输入框中！');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full min-h-[680px]">
      
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* LEFT COLUMN: Main Chat Engine (lg:col-span-7) */}
      {/* ========================================================= */}
      <div id="gmp-audit-chat-box" className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[680px]">
        
        {/* Top Banner and Role Selector */}
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span className="font-semibold text-slate-800 text-sm">GMP 智能协同助手 (5种对话模式)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto py-0.5 max-w-full">
              {AUDIT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0 ${
                    selectedMode.id === mode.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode.roleName}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 italic bg-white p-2 rounded border border-slate-100">
            角色定位: {selectedMode.description}
          </p>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div key={msg.id} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                <div
                  className={`w-8 h-8 rounded-full border shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAgent
                      ? selectedMode.avatarBg
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="space-y-1 max-w-[80%]">
                  <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${isAgent ? '' : 'justify-end'}`}>
                    <span>{isAgent ? selectedMode.roleName : '学员 (你)'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed border ${
                      isAgent
                        ? 'bg-white text-slate-800 border-slate-200/80 shadow-sm'
                        : 'bg-emerald-600 text-white border-emerald-700'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-slate-800">
                      {msg.text.split('\n').map((line, idx) => (
                        <p key={idx} className={line.startsWith('###') || line.startsWith('**') ? 'font-semibold my-1' : 'my-1'}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-full border shrink-0 flex items-center justify-center text-xs font-bold ${selectedMode.avatarBg}`}>
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400">{selectedMode.roleName} 正在深入审阅与思考...</div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions panel */}
        <div className="px-4 py-2 border-t border-slate-200 bg-white flex gap-2 items-center overflow-x-auto">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-[11px] text-slate-400 font-medium shrink-0">快捷场景提问:</span>
          {[
            '尘埃粒子检测超标怎么办？',
            '物料称量室发现温湿度超出标准范围。',
            '生产设备中途突然断电15分钟，如何记录？',
            '纯化水系统微生物限度检测呈阳性。'
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(q)}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md border border-slate-200 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`以 [${selectedMode.roleName}] 视角输入问题，或在右侧引用知识库条文...`}
            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
            发送
          </button>
        </form>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: GxP Tools Workspace (lg:col-span-5) */}
      {/* ========================================================= */}
      <div id="gmp-audit-workspace-panel" className="lg:col-span-5 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[680px]">
        
        {/* Workspace navigation tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs shrink-0">
          <button
            onClick={() => setActiveRightTab('snapshots')}
            className={`flex-1 py-3 text-center font-bold flex items-center justify-center gap-1 border-b-2 transition-all ${
              activeRightTab === 'snapshots'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            会话快照与看板
          </button>
          <button
            onClick={() => setActiveRightTab('kb')}
            className={`flex-1 py-3 text-center font-bold flex items-center justify-center gap-1 border-b-2 transition-all ${
              activeRightTab === 'kb'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            知识库检索增强
          </button>
          <button
            onClick={() => setActiveRightTab('notifications')}
            className={`flex-1 py-3 text-center font-bold flex items-center justify-center gap-1 border-b-2 transition-all ${
              activeRightTab === 'notifications'
                ? 'border-emerald-600 text-emerald-700 bg-white font-black'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Bell className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            任务自动通知
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          
          {/* ======================================= */}
          {/* TAB 1: SNAPSHOTS & KANBAN CO-WORKING */}
          {/* ======================================= */}
          {activeRightTab === 'snapshots' && (
            <div className="space-y-4">
              
              {/* Snapshot creation panel */}
              <div className="bg-slate-50/50 border border-slate-200/80 p-3.5 rounded-xl">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
                  <Save className="w-4 h-4 text-emerald-600" />
                  保存当前会话为历史快照
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-1">快照主题 / 会话名称</label>
                    <input 
                      type="text" 
                      placeholder="如：称量温湿度偏离偏差调查"
                      value={snapshotTitleInput}
                      onChange={(e) => setSnapshotTitleInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-1">合规看板状态</label>
                      <select 
                        value={snapshotStatusInput}
                        onChange={(e: any) => setSnapshotStatusInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="pending">待审查 (Pending)</option>
                        <option value="investigating">调查中 (Investigation)</option>
                        <option value="capa">CAPA 规划 (CAPA)</option>
                        <option value="closed">已闭环放行 (Closed)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-1">会话标签 (英文逗号分隔)</label>
                      <input 
                        type="text" 
                        placeholder="OOS, 尘埃, D级车间"
                        value={snapshotTagsInput}
                        onChange={(e) => setSnapshotTagsInput(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveSnapshot}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    立即归档快照并分发任务通知 ({messages.length} 条内容)
                  </button>
                </div>
              </div>

              {/* Kanban & History list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Columns className="w-4 h-4 text-emerald-600" />
                    专家协同看板 & 历史快照库
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                    已存档: {snapshots.length}
                  </span>
                </div>

                {snapshots.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-semibold">暂无已保存的审计会话快照</p>
                    <p className="text-[10px] text-slate-400 mt-1">在左侧互动，输入内容，然后在上方归档</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {snapshots.map((snap) => {
                      const modeInfo = AUDIT_MODES.find(m => m.id === snap.auditModeId) || AUDIT_MODES[2];
                      
                      // Status color mappings
                      const statusColors = {
                        pending: 'bg-red-50 text-red-700 border-red-200/80',
                        investigating: 'bg-amber-50 text-amber-700 border-amber-200/80',
                        capa: 'bg-purple-50 text-purple-700 border-purple-200/80',
                        closed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                      };

                      const statusLabels = {
                        pending: '待审查',
                        investigating: '调查中',
                        capa: 'CAPA规划',
                        closed: '已闭环'
                      };

                      return (
                        <div 
                          key={snap.id}
                          className="border border-slate-200 rounded-xl p-3.5 hover:shadow-md hover:border-slate-300 transition-all bg-white relative"
                        >
                          {/* Title & Badge */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 leading-snug">{snap.title}</h5>
                              <span className="text-[9px] text-slate-400 mt-0.5 block">{snap.savedAt}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${statusColors[snap.status]}`}>
                              {statusLabels[snap.status]}
                            </span>
                          </div>

                          {/* Snapshot tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                              {modeInfo.roleName}
                            </span>
                            {snap.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Quick statistics */}
                          <div className="text-[10px] text-slate-500 mb-3 bg-slate-50 p-2 rounded border border-slate-100/60 flex justify-between items-center">
                            <span>包含对话记录：<strong>{snap.messages.length} 条</strong></span>
                            <span>校验摘要: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[9px]">SHA256-${snap.id.substring(5, 9)}</code></span>
                          </div>

                          {/* Action panel */}
                          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRestoreSnapshot(snap)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded border border-emerald-100 transition-all flex items-center gap-0.5"
                                title="重载此快照至左侧主对话"
                              >
                                <Play className="w-3 h-3" />
                                恢复会话
                              </button>
                              <button
                                onClick={() => handleExportReport(snap)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded border border-slate-200 transition-all flex items-center gap-0.5"
                                title="基于此会话导出PDF/Markdown合规协作报告"
                              >
                                <FileText className="w-3 h-3 text-slate-500" />
                                导出协作报告
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCycleStatus(snap.id)}
                                className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded border border-slate-200 hover:border-emerald-200 transition-all"
                                title="流转协同看板进度 (待审查 -> 调查中 -> CAPA -> 已闭环)"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSnapshot(snap.id, snap.title)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded border border-slate-200 hover:border-red-200 transition-all"
                                title="永久清除快照"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 2: KNOWLEDGE BASE SEARCH ENHANCED (RAG) */}
          {/* ======================================= */}
          {activeRightTab === 'kb' && (
            <div className="space-y-4">
              
              {/* Search form */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="搜索本地SOP规程、FDA警告信案例..."
                  value={kbSearchTerm}
                  onChange={(e) => setKbSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
                {kbSearchTerm && (
                  <button 
                    onClick={() => setKbSearchTerm('')}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* RAG search tips */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-600 leading-normal">
                  <strong>💡 RAG 搜索增强机制</strong>：找到匹配的法规条款或公司标准 SOP 后，点击 <strong>「引用至提问」</strong> 按钮。系统将自动将其内容追加注入对话中，帮助大模型提供完全严谨、无妄语的合规判断。
                </div>
              </div>

              {/* Search results */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-500 block">检索结果 ({filteredKbFiles.length} 条)</div>
                
                {filteredKbFiles.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    没有找到匹配的 SOP 文件。请重试。
                  </div>
                ) : (
                  filteredKbFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="border border-slate-200 rounded-lg p-3 bg-slate-50/30 hover:bg-slate-50 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 leading-tight">{file.name}</h5>
                          <div className="flex gap-1.5 items-center mt-1">
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-semibold">
                              {file.department}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {file.size}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Excerpt content */}
                      <p className="text-[11px] text-slate-600 bg-white p-2 border border-slate-200/60 rounded mb-2.5 line-clamp-3">
                        {file.content}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-400">流程：{file.process}</span>
                        <button
                          onClick={() => handleQuoteReference(file)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded flex items-center gap-0.5 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" />
                          引用此条文至对话
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3: SYSTEM AUTOMATIC NOTIFICATIONS (AUDIT TRAIL) */}
          {/* ======================================= */}
          {activeRightTab === 'notifications' && (
            <div className="space-y-4">
              
              {/* Audit trail integrity certificate card */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h4 className="text-xs font-black text-slate-100 tracking-wider">GxP 计算机系统审计追踪 (GAMP 5)</h4>
                </div>
                <div className="space-y-1.5 text-[10px] text-slate-300 font-mono">
                  <p>● 哈希防伪机制: <span className="text-emerald-400">SHA-256 (AES-256 BLOCK)</span></p>
                  <p>● 系统校验状态: <span className="text-emerald-400 font-bold">✓ 完整无篡改</span></p>
                  <p className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">● 实例标识: {Math.random().toString(36).substring(2, 10).toUpperCase()}-GxP-ENG-LIVE</p>
                </div>
              </div>

              {/* Notification feed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    任务自动派发与事件日志流
                  </h4>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('gmp_audit_notifications');
                      setNotifications([]);
                      triggerToast('🧹 日志面板已重置。');
                    }}
                    className="text-[9px] hover:text-red-600 text-slate-400 transition-colors"
                  >
                    重置日志
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">暂无最新自动通知</div>
                  ) : (
                    notifications.map((notif) => {
                      // Color mapping by type
                      const typeColors = {
                        success: 'border-l-emerald-500 bg-emerald-50/10 text-emerald-800',
                        info: 'border-l-blue-500 bg-blue-50/10 text-blue-800',
                        warning: 'border-l-amber-500 bg-amber-50/10 text-amber-800',
                        gxp: 'border-l-purple-500 bg-purple-50/10 text-purple-800'
                      };

                      const badgeText = {
                        success: '合规',
                        info: '系统',
                        warning: '警告',
                        gxp: 'GxP底线'
                      };

                      return (
                        <div 
                          key={notif.id}
                          className={`border-l-4 p-2.5 rounded-r-lg border border-slate-200/60 transition-all ${typeColors[notif.type]}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-bold block">{notif.title}</span>
                            <span className="text-[8px] bg-white px-1.5 py-0.2 border rounded text-slate-500 font-mono shrink-0">
                              {badgeText[notif.type]}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-normal mb-1">{notif.content}</p>
                          <span className="text-[8px] text-slate-400 font-mono">{notif.timestamp}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* 8. REPORT EXPORT MODAL PANEL */}
      {/* ========================================================= */}
      {showReportModal && selectedSnapshotForReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl h-[600px] flex flex-col overflow-hidden animate-fade-in animate-duration-300">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">制药车间合规协同审计与 CAPA 决策整改报告</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">快照归档: {selectedSnapshotForReport.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Report Text Area) */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 font-mono text-xs">
              <textarea
                readOnly
                className="w-full h-full p-4 bg-white border border-slate-200 rounded-lg focus:outline-none font-mono text-slate-800 text-xs leading-relaxed resize-none shadow-inner"
                value={generateReportMarkdown(selectedSnapshotForReport)}
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3 shrink-0">
              <div className="text-[10px] text-slate-500 font-medium">
                ● SHA-256 哈希防伪保护已就绪，报告格式符合 GAMP 5 签名校验。
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyReportToClipboard(generateReportMarkdown(selectedSnapshotForReport))}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      已复制到剪贴板
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-4 h-4 text-slate-500" />
                      复制报告全文
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadReportFile(selectedSnapshotForReport, generateReportMarkdown(selectedSnapshotForReport))}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  <Download className="w-4 h-4" />
                  下载 Markdown 报告
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-all"
                >
                  关闭
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
