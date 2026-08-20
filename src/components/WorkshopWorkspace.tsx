import React, { useState } from 'react';
import { Exercise, GxpSkill, KBFile, KBFolder } from '../types';
import { SKILLS_LIST, CHEMICAL_OOS_METRICS } from '../data';
import { 
  Play, Sparkles, CheckCircle, FileText, Cpu, AlertCircle, HelpCircle, 
  ArrowRight, ShieldCheck, Clipboard, Compass, Info, BadgeAlert, FileSpreadsheet,
  Layers, Database, FileUp, Award, Presentation, RefreshCw
} from 'lucide-react';
import GmpAuditChat from './GmpAuditChat';
import KnowledgeBaseManager from './KnowledgeBaseManager';
import DeviationExpertPanel from './DeviationExpertPanel';
import FolderWatcher from './FolderWatcher';

const searchKnowledgeBase = (query: string, allFiles: KBFile[]): { files: KBFile[], contextText: string } => {
  if (!query) return { files: [], contextText: '' };
  
  const lowercaseQuery = query.toLowerCase();
  const matched = allFiles.filter(file => {
    if (file.name.toLowerCase().includes(lowercaseQuery)) return true;
    if (file.content.toLowerCase().includes(lowercaseQuery)) return true;
    if (file.department?.toLowerCase().includes(lowercaseQuery)) return true;
    if (file.process?.toLowerCase().includes(lowercaseQuery)) return true;
    if (file.tags?.some(tag => lowercaseQuery.includes(tag.toLowerCase()) || tag.toLowerCase().includes(lowercaseQuery))) return true;
    
    // Keyword intersections
    const keywords = ['更衣', 'gowning', 'hplc', 'oos', 'oot', '偏差', 'deviation', 'leak', '渗漏', '压差', '压力', 'sterile', '无菌', '清洁', 'cleaning', 'hvac', '批记录', 'batch', '警告信', 'warning'];
    for (const kw of keywords) {
      if (lowercaseQuery.includes(kw) && (file.name.toLowerCase().includes(kw) || file.content.toLowerCase().includes(kw) || file.tags?.some(t => t.toLowerCase().includes(kw)))) {
        return true;
      }
    }
    return false;
  });

  const contextText = matched.map(f => `【SOP文档：${f.name} (部门: ${f.department || '未分类'}, 过程: ${f.process || '未分类'})】\n${f.content}`).join('\n\n');
  return { files: matched, contextText };
};

interface WorkshopWorkspaceProps {
  activeExercise: Exercise;
  onComplete: (id: string) => void;
  files: KBFile[];
  folders: KBFolder[];
  onAddFile: (file: KBFile) => void;
}

export default function WorkshopWorkspace({ 
  activeExercise, 
  onComplete,
  files,
  folders,
  onAddFile
}: WorkshopWorkspaceProps) {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [secondaryOutput, setSecondaryOutput] = useState(''); // Used for comparison trials
  const [error, setError] = useState<string | null>(null);

  // Dynamic state values tailored to specific exercises:
  // Exercise 1 (Initiate task)
  const [ex1Skill, setEx1Skill] = useState(SKILLS_LIST[0]);
  const [ex1Prompt, setEx1Prompt] = useState(SKILLS_LIST[0].defaultPrompt);

  // Exercise 2 (CRAFT)
  const [badPrompt, setBadPrompt] = useState('帮我评估这份偏差报告。');
  const [craftPrompt, setCraftPrompt] = useState(`【CRAFT 医药高标准提示词】
- Context (背景): 我们是注射剂灌装B车间的工艺工程师，正在处理一起核心洁净室压差突然由15Pa跌落至-2Pa持续5分钟的异常。
- Role (角色): 资深GMP偏差调查组长及QA高级审核员。
- Action (行动): 请对该压差事件进行风险等级判定，检索对CQA/CPP的潜在影响，并提供3个现场紧急控制方案。
- Format (格式): 严格分为【基本信息、风险评级与理据、现场紧急响应措施、后续CAPA方向】四个段落输出。
- Tone (语气): 严谨、理性、符合FDA警告信回应术语。`);

  // Exercise 3 (OOS/OOT helper)
  const [oosMetricKey, setOosMetricKey] = useState<'activeIngredientAssay' | 'lossOnDrying' | 'pHValue'>('activeIngredientAssay');
  const [oosValue, setOosValue] = useState('97.4'); // Under spec threshold for active ingredient

  // Exercise 4 (CAPA Assessment)
  const [capaBackground, setCapaBackground] = useState(`【偏差背景描述】: D级配料间操作工在称量无菌头孢原粉时，意外使药粉外溢约200克。该员工未通知QA，直接使用湿布对过道进行了清洗，导致少量药水渗入到洁净走廊防静电地板接缝。
【当前CAPA措施】: 责令称量员在晨会上做口头检查，并使用干净拖把将走廊地板拖干。`);

  // Exercise 7 (3Q Verification Framework)
  const [ex7Equipment, setEx7Equipment] = useState('立式高压蒸汽灭菌器 (Autoclave)');
  const [ex7Params, setEx7Params] = useState('工作容积350L，工作温度121-134℃，配有双门联锁、PLC控制系统、温度和压力传感器。用于无菌车间器具及工作服灭菌。');

  // Exercise 8 (SOP Compliance Review)
  const [ex8SopText, setEx8SopText] = useState(`【高效湿法混合制粒机操作SOP】
起草：张工（技术员）
1. 启动设备前，将物料直接倒入搅拌釜。
2. 设定搅拌速度和切碎速度。
3. 加入粘合剂并启动制粒过程。
4. 结束后拉闸断电，用清水将设备内外冲洗干净即可。`);

  // Exercise 9 (Internal Audit)
  const [ex9SopContext, setEx9SopContext] = useState(`【洁净区人员更衣SOP】
一、进入一更：脱便鞋，洗手，烘干。
二、进入二更：戴圆帽，换洁净鞋，穿洁净服（拉链拉满，头发不外露），佩戴一次性口罩。
三、进入三更（A/B级区）：使用消毒剂进行手消毒，佩戴无菌乳胶手套。`);

  // Exercise 10 (FDA 483 Checklist)
  const [ex10LineType, setEx10LineType] = useState('全自动中药提取及浓缩生产线');
  const [ex10Focus, setEx10Focus] = useState('多效蒸发器清洗验证、大罐自动清洗系统(CIP)盲角残留、多品种共线交叉污染防范。');

  // Exercise 13 (Batch record review)
  const [ex13BatchData, setEx13BatchData] = useState(`【批生产记录摘要】
产品名称：盐酸头孢他美钠（无菌分装）  批号：20260815B
一、称量岗位：
- 规定投料量：100.0 kg。实际称量并投料量：100.2 kg（复核人处空白，操作人：小刘）。
二、分装岗位：
- 标示规格：0.5g/支。实际共灌装出 199,400 支。废品收集：1.2 kg。
- 物料平衡率计算公式：【(实际成品支数×0.5g + 废品重量) / 投料量】 × 100%。
- 岗位记录：未记录物料平衡，也无车间主管签字确认。
三、关键工艺参数：
- 洁净室环境：15:00 悬浮粒子连续计数器显示0.5μm粒子暴增至850,000个/m³（限度标准≤3520个/m³），长达8分钟。岗位操作工未报告，也未做偏差记录。`);

  // Exercise 14 (SOP Auto Generation)
  const [ex14SopName, setEx14SopName] = useState('不锈钢多功能配液罐CIP（原位清洗）标准规程');
  const [ex14KeyPoints, setEx14KeyPoints] = useState('1. 清洗流速不低于1.5m/s；2. 预冲洗2分钟，循环冲洗10分钟，纯化水淋洗3分钟，注射用水终淋1分钟；3. 最终淋洗水电导率需≤1.3 μS/cm，pH在5.0-7.0之间。');

  // Exercise 17 (Custom Pain-point slide Generator)
  const [ex17Title, setEx17Title] = useState('APR (年度产品质量回顾) 分析效率慢');
  const [ex17Department, setEx17Department] = useState('质量保证部 (QA)');
  const [ex17SelectedSkill, setEx17SelectedSkill] = useState('SOP合规检查助手 + 智能数据解析组件');
  const [ex17Methodology, setEx17Methodology] = useState('1. 挂载本地历年生产趋势数据文件夹；2. 加载数据趋势扫描组件一键识别出3SD波动异常；3. 自动匹配生成图表与回顾报告初稿。');

  const handleEx1SkillChange = (id: string) => {
    const s = SKILLS_LIST.find(item => item.id === id);
    if (s) {
      setEx1Skill(s);
      setEx1Prompt(s.defaultPrompt);
    }
  };

  const executeTask = async () => {
    setLoading(true);
    setError(null);
    setOutput('');
    setSecondaryOutput('');

    let prompt = '';
    let systemInstruction = '';
    let bodyPayload: any = { exerciseId: activeExercise.id };

    // Package appropriate payload based on current exercise
    switch (activeExercise.taskNo) {
      case 1:
        prompt = ex1Prompt;
        systemInstruction = ex1Skill.systemInstruction;
        bodyPayload = { ...bodyPayload, prompt, systemInstruction, skillCode: ex1Skill.id };
        break;
      case 2:
        // Double run: One for Bad, One for Good (CRAFT)
        bodyPayload = { ...bodyPayload, badPrompt, craftPrompt };
        break;
      case 3:
        const metric = CHEMICAL_OOS_METRICS[oosMetricKey];
        prompt = `当前检测值: ${oosValue}。标准最低值: ${metric.specMin}，最高值: ${metric.specMax}。历史生产数据均值(Mean): ${metric.historicalMean}，标准差(SD): ${metric.historicalSd}。根据这些数据，请按照中国GMP实验室偏差管理规程评估是否超标(OOS)或超趋势(OOT)，并输出专业的实验室调查格式描述。`;
        bodyPayload = { ...bodyPayload, prompt, metricKey: oosMetricKey, value: oosValue };
        break;
      case 4:
        prompt = capaBackground;
        bodyPayload = { ...bodyPayload, prompt };
        break;
      case 7:
        prompt = `设备名称: ${ex7Equipment}。详细配置参数: ${ex7Params}。请使用IQ/OQ/PQ验证框架，为其输出专业的设备3Q验证方案基本纲要。`;
        bodyPayload = { ...bodyPayload, prompt, equipment: ex7Equipment };
        break;
      case 8:
        prompt = ex8SopText;
        bodyPayload = { ...bodyPayload, prompt };
        break;
      case 9:
        prompt = ex9SopContext;
        bodyPayload = { ...bodyPayload, prompt };
        break;
      case 10:
        prompt = `生产线/设备：${ex10LineType}。审计防范重点：${ex10Focus}。请对照FDA warning letters与21 CFR 211条文，输出防御性检查点自查清单。`;
        bodyPayload = { ...bodyPayload, prompt, lineType: ex10LineType };
        break;
      case 13:
        prompt = ex13BatchData;
        bodyPayload = { ...bodyPayload, prompt };
        break;
      case 14:
        prompt = `规程名称：${ex14SopName}。核心操作及参数：${ex14KeyPoints}。请使用 pharam-sop-generator，生成并输出一篇专业规范的结构化GMP标准操作程序(SOP)草稿文本。`;
        bodyPayload = { ...bodyPayload, prompt, sopName: ex14SopName };
        break;
      case 17:
        // Custom Slide generator
        prompt = `痛点：${ex17Title}。所属部门：${ex17Department}。所用智能体/Skill：${ex17SelectedSkill}。实施方案：${ex17Methodology}。请根据这些要素，生成一套完整的实操演练答辩汇报幻灯片提纲，包括：痛点剖析、配置要点、工作模式设计、预期业务提效收益。`;
        bodyPayload = { ...bodyPayload, prompt, painPoint: ex17Title, department: ex17Department };
        break;
      default:
        prompt = '运行模拟';
        bodyPayload = { ...bodyPayload, prompt };
    }

    // Auto SOP Search (RAG Router)
    const searchPrompt = activeExercise.taskNo === 2 ? craftPrompt : prompt;
    const matchedSops = searchKnowledgeBase(searchPrompt, files);
    if (matchedSops.contextText) {
      bodyPayload.context = matchedSops.contextText;
    }

    try {
      const response = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        throw new Error('API连接异常');
      }

      const data = await response.json();
      
      if (activeExercise.taskNo === 2) {
        setOutput(data.badOutput || '评估结果无响应');
        setSecondaryOutput(data.craftOutput || 'CRAFT高水准评估无响应');
      } else {
        setOutput(data.output || '成功执行评估，未获取到实体数据');
      }
    } catch (err: any) {
      // Setup beautifully formatted pharmaceutical fallback values in case user lacks active Gemini key
      handleFallbacks(activeExercise.taskNo);
    } finally {
      setLoading(false);
    }
  };

  const handleFallbacks = (taskNo: number) => {
    setTimeout(() => {
      switch (taskNo) {
        case 1:
          setOutput(`### 📋 【已启用 Skill】${ex1Skill.name}\n\n**[输入基本信息]**:\n${ex1Prompt}\n\n**[智能体方案产出]**:\n\n1. **确认目的 (IQ)**:\n   - 检查干燥腔 3m³ 物理尺寸与抗震锚固安装情况；\n   - 核对冷凝器捕水能力(50kg)在液压及密封条件下的气密连接；\n   - 确认自动进出料系统不锈钢轨道平面度与驱动电机合规证书。\n2. **控制方案 (OQ)**:\n   - 空载真空泄漏试验：在1小时内极限真空压力不衰减检测；\n   - 冷阱降温性能试验：要求冷阱温度在30分钟内达到设计指标（如≤-55℃）；\n   - 搁板控温均匀度及斜率：在-40℃至+40℃全段控温，多点温度传感器偏差应在 ±1.0℃ 范围内。\n3. **工艺判定 (PQ)**:\n   - 装载模拟试验：选用高浓度生理盐水进行3个批次的冷冻干燥循环，检查各冻干样品外观完整度、复溶性及水分残留度。`);
          break;
        case 2:
          setOutput(`**[差提示词输出]**\n评估报告：
- 这份偏差报告已经过时，信息不详。
- 请说明为什么气闸室压差会变成-2Pa，这是极其不合规的。
- 应该立即查明原因，防止下次再犯。`);
          setSecondaryOutput(`### 🛡️ [CRAFT 精准提示词高品质输出]：

一、 **事件基本情况评估**：
   - 注射剂灌装B车间发生气闸室压差反冲（由 15Pa 降至 -2Pa），且持续 **5 分钟**。压差反冲使外界空气发生倒灌，直接破坏了A/B级核心无菌屏障的物理屏障。
   - 声光报警在检修期间被关闭，表明存在严重的**变更控制与应急监控缺失缺陷**。

二、 **风险等级判定 (Critical - 严重缺陷)**：
   - 依据《中国GMP 2010版》及《FDA 21 CFR 211.113(b)》，该事件直接对核心无菌环境构成微生物及微粒污染，属于严重（Critical）偏差。

三、 **现场紧急响应措施**：
   1. **立即停机**：现场操作人员必须立即停止灌装作业。
   2. **物理隔离**：对压差倒灌期间，以及后续受影响的全部瓶装药品、半成品执行**物理封存隔离**并加贴红牌标签。
   3. **环境复检**：立即开启备用空气循环系统。由QA在倒流波及的核心区域进行**浮游菌、沉降菌及表面微生物应急多点采样**，进行连续3天的环境监测追踪。

四、 **后续 CAPA 闭环整改方向**：
   - 必须建立健全报警器检修的双人双签、限时审批SOP。严禁在生产时段静默核心环境报警。对暖通空调系统进行风闸完整性气密评估。`);
          break;
        case 3:
          const metric = CHEMICAL_OOS_METRICS[oosMetricKey];
          const val = parseFloat(oosValue);
          const isOos = val < metric.specMin || val > metric.specMax;
          // Determine OOT based on 3SD bounds
          const lowOotBound = metric.historicalMean - 3 * metric.historicalSd;
          const highOotBound = metric.historicalMean + 3 * metric.historicalSd;
          const isOot = val < lowOotBound || val > highOotBound;

          setOutput(`### 🔬 【OOS / OOT 实验室核查分析报告】\n\n**[检测项]**: ${metric.name}\n- 检测实测值: **${oosValue}**\n- 法定合格范围: ${metric.specMin} ~ ${metric.specMax}\n- 历史均值(Mean): ${metric.historicalMean} (标准差SD: ${metric.historicalSd})\n- 历史合理界限 (±3SD OOT区间): **${lowOotBound.toFixed(3)} ~ ${highOotBound.toFixed(3)}**\n\n**【判定结论】**:\n1. **超标分析 (OOS)**: ${isOos ? '🚨 判定为 OOS (Out of Specification)！超出质量标准限度。' : '✅ 处于质量标准合格限度内。'}\n2. **超趋势分析 (OOT)**: ${isOot ? '⚠️ 判定为 OOT (Out of Trend)！偏离历史稳定波动范围(3SD以外)。即使检验合格，该批次可能存在异常的工艺波动趋势，必须启动核验。' : '✅ 处于统计学历史趋势波动区间内。'}\n\n**【实验室调查第一阶段响应表单】**:\n- 1. **样品及标液核实**: 检查进样瓶是否漏液、气相/液相色谱柱温是否异常、流动相pH是否配错；\n- 2. **计算误差排查**: 重核数据积分、标线相关系数及稀释因子；\n- 3. **结果重演**: 封存同批双份样。在未排除实验室人为因素前，严禁直接丢弃原测试液。`);
          break;
        case 4:
          setOutput(`### ⚖️ 【CAPA 有效性五维深度剖析报告】\n\n针对「更衣间散落原粉直接擦拭，导致地下渗水」事件的CAPA有效性审核：\n\n1. **人 (Personnel - 意识与执行力) - 缺陷度：主要缺陷**\n   - *原措施评价*: 仅在早会口头检查是极低效的“形式主义”。\n   - *纠正措施*: 重新培训并进行无菌原粉溢出安全应急程序演练考核。任何溢出事件必须上报，严禁员工私自清理。\n\n2. **机 (Machine - 溢出物清理工具) - 缺陷度：微小缺陷**\n   - *原措施评价*: 抹布和走廊拖把未经过灭菌处理，可能会把微生物和化学残留带入走廊接缝，扩大物理污染。\n   - *纠正措施*: 配备洁净室专用的真空吸尘系统以及经过无菌验证的除污染洗涤溶剂。\n\n3. **料 (Material - 溢出物无菌控制) - 缺陷度：严重缺陷**\n   - *原措施评价*: 200克无菌头孢是活性极强的强敏致敏性原料，未加处理湿擦极易导致化学气溶胶污染，波及其他品种。\n   - *纠正措施*: 建立强致敏原料物理防飞溅密封包装，并设立溢出专用中和清除液。\n\n4. **法 (Method - 清洁工艺与上报机制) - 缺陷度：严重缺陷**\n   - *原措施评价*: 隐瞒上报违反了偏差首报原则；擅自湿擦水渗入地板接缝极易导致接缝内滋生微孢子和霉菌。\n   - *纠正措施*: 启动地板物理缝隙除霉菌环境熏蒸(VHP)评估；建立并细化「化学溢出防扩散隔离规程」。\n\n5. **环 (Environment - 洁净度级联屏障) - 缺陷度：主要缺陷**\n   - *原措施评价*: 走廊地板是D级，空气流通，气溶胶扩散风险极高。\n   - *纠正措施*: 检测走廊环境悬浮粒子与活性颗粒含量，直至回复标准方可重新生产。`);
          break;
        case 7:
          setOutput(`### 🏗️ 【3Q 设备验证方案纲要】\n\n**验证对象**：${ex7Equipment}\n**设备配置**：${ex7Params}\n\n#### 一、安装确认 (IQ - Installation Qualification)\n1. **文档与资质审查**：出厂合格证、材质证明（不锈钢316L接触药液）、PLC软件合规评估报告、校准证书；\n2. **公用工程连接**：确认蒸汽压力（符合0.3-0.4MPa）、冷却水流量、纯化水管路气密连接；\n3. **仪器与传感器校验**：校验腔体内部的压力表和温度传感器，校准偏差应在 ±0.2℃ 范围内。\n\n#### 二、运行确认 (OQ - Operational Qualification)\n1. **空载升温与均匀性试验**：设定121℃空载灭菌，连续运行3次，记录腔内多点热分布（温差应 ≤1.0℃）；\n2. **安全联锁试验**：模拟开门状态下启动加热、或灭菌期间强行开门，设备应能自动阻断蒸汽阀并锁定双门；\n3. **控制面板与断电恢复**：测试PLC停电保护，断电后再次上电应能完整恢复运行参数并报警。\n\n#### 三、性能确认 (PQ - Performance Qualification)\n1. **满载热穿透试验 (3个批次)**：装入最大容积的敷料或器具，多点记录灭菌冷点，计算各点F0值（要求F0值 ≥15）；\n2. **生物指示剂检测**：装载含有嗜热脂肪芽孢杆菌（培养10^6个）的测试管，灭菌后进行无菌培养，培养7天必须呈阴性，达到10^-6无菌保证水平(SAL)。`);
          break;
        case 8:
          setOutput(`### 🚨 【SOP 合规差距评估报告 (SOP Compliance Check)】\n\n根据【中国GMP2010版】和【FDA cGMP】规范，对输入的《高效湿法混合制粒机操作SOP》进行差距扫描，发现以下严重缺陷：\n\n1. **【重大缺陷】投料与清场确认缺失**：\n   - *法规条文*：生产前必须核对前次清场合格合格证，并在称量投料时进行双人复核签字。\n   - *缺陷表现*：SOP中写道“直接倒入搅拌釜”，缺失了“检查清场合格证、检查清爽防尘装置、复核配料批号”等关键步骤。\n\n2. **【重大缺陷】关键工艺参数不明确**：\n   - *法规条文*：SOP中不应使用模糊词语，所有工艺参数（如速度、时间）必须定量。\n   - *缺陷表现*：SOP中“设定搅拌速度和切碎速度”、“加入粘合剂”属于典型模糊表达。必须明确写出：“搅拌转速设定为：XXX rpm，切浆转速设定为：XXX rpm，循环投加粘合剂流速：XX L/min”。\n\n3. **【严重缺陷】清洁与维护程序流于形式**：\n   - *法规条文*：凡与药液直接接触的设备部件，必须制订经验证的清洁、冲洗、淋洗规程，并进行清洗验证、保留残留电导率或活性分析测试单。\n   - *缺陷表现*：本规程中“结束后拉闸断电，用清水冲洗干净即可”极其粗糙，没有写明洗涤剂种类、冲洗水量、最终冲洗水质量标准（电导率测试）以及清洗有效期的控制。`);
          break;
        case 9:
          setOutput(`### 📋 【洁净区人员更衣 SOP 内审自查清单】\n\n根据现场审计规范，为您定制的日常自查指南：\n\n| 序号 | 审计提问/核对点 (SOP条文依据) | 检查方法 (实地提问与查核指南) | 严重缺陷评定标准 |\n| :--- | :--- | :--- | :--- |\n| 1 | **手部消毒有效性 (第一、三步)** | 实地抽查：要求更衣室人员展示手部消毒动作。核对酒精消毒剂是否在效期内，是否双面全覆盖（含指甲缝）。 | 消毒剂失效或消毒时长小于15秒，记为 **主要缺陷 (Major)** |\n| 2 | **洁净帽与头发外露防护 (第二步)** | 镜前点检：二更和三更更衣镜前，检查是否有露出刘海、发梢的情况。帽子拉伸扣是否完好。 | 有一例头发明显外露，记为 **严重缺陷 (Critical)**，直接取消无菌区操作资质 |\n| 3 | **无菌乳胶手套佩戴规范 (第三步)** | 观察现场佩戴：手套袖口必须反折，拉平覆盖在连体无菌服的手套袖袋之外，并完全封死。 | 发现手套袖口未包住连体服袖扣，或操作时外露，记为 **主要缺陷 (Major)** |\n| 4 | **更衣区日常监测记录** | 调阅记录：检查QA人员针对二更/三更更衣室进行的动态沉降菌、手套5指表面微生物擦拭(Finger dab)检测台账。 | 记录有超标但未启动偏差调查者，记为 **主要缺陷 (Major)** |`);
          break;
        case 10:
          setOutput(`### 🛡️ 【FDA 483 针对中药提取线防御性自查清单】\n\n**生产线对象**：${ex10LineType}\n**自查重点**：${ex10Focus}\n\n1. **多效蒸发器管道 CIP 验证（防止多品种交叉污染）**：\n   - *483历史常见缺陷*：企业通常只有空载清洗测试，缺少满载、极高粘度（如中药稠膏残留）情况下的清洗科学验证。\n   - *防御措施*：建立对清洗终淋水的“总有机碳(TOC)”检测规程，TOC要求 ≤500 ppb。对不易清洗的蒸发器加热室管口和死角进行核对。\n\n2. **提取大罐盲角及管路残留排查**：\n   - *483历史常见缺陷*：由于管道过长，折弯过多，形成冲洗盲角（Dead legs，通常直管长度大于3倍管径）。\n   - *防御措施*：绘制整条管线流向图，标记全部死角。每年对死角进行拆卸检查，使用化学棉签进行表面残留取样并分析验证。\n\n3. **交叉污染防范与清场限度**：\n   - *483历史常见缺陷*：前一品种残留清除不彻底，直接换产下一品种，缺少残留限度计算判定（如万分之一(1/10000)原则或10ppm原则）。\n   - *防御措施*：对活性或毒性最大的中草药成分计算残留安全边际量，以此作为清场合格的唯一硬性控制标准。`);
          break;
        case 13:
          setOutput(`### 🚨 【批生产/检验记录 探错合规报告】\n\n经对《盐酸头孢他美钠 批号20260815B》的批记录分析，共扫查出以下 **4 处违规与缺陷**：\n\n1. **【严重违规】操作越权与复核复验缺失**：\n   - *表现*：投料称重100.2kg（工艺要求100.0kg），偏差0.2%。在此关键控制点上，复核人签字处竟然空白。只有操作工小刘单人操作签字。这违反了“称量投料必有双人独立复核”的GMP底线。\n\n2. **【物料平衡异常】物料计算明显错误/超限**：\n   - *核算数据*：实际成品支数199,400支（按0.5g/支算，折合成品 99.7 kg）。废品收集 1.2 kg。总产出重 = 99.7 + 1.2 = 100.9 kg。\n   - *矛盾分析*：投料量只有100.2kg，产出量竟然达100.9kg，**物料平衡率为 100.7%**！这违反了守恒定律（物理不可能），可能存在漏签批次、投料重量作假、水分虚高等重大造假或计算失误风险。物料平衡未算、车间主管未签即流转，是严重的QA漏审。\n\n3. **【特大生产隐患】更衣间/灌装间悬浮粒子严重超标**：\n   - *表现*：15:00 粒子暴增至 850,000个/m³，偏离标准200倍，且长达 8 分钟。\n   - *缺陷*：此为核心A/B级区的“严重偏差”，属于可能导致整批无菌产品污染的灾难性事件。操作工私自隐瞒不报、未暂停生产，QA未拦截，存在故意瞒报偏差行为。`);
          break;
        case 14:
          setOutput(`### 📝 【SOP 标准规范草稿生成】\n\n**标准操作规程名称**：${ex14SopName}\n\n#### 1. 目的\n建立不锈钢多功能配液罐原位清洗（CIP）的标准操作规程，规范清洗流程，确保配液罐表面无物料残留，防止产品交叉污染，保障生产安全。\n\n#### 2. 范围\n适用于B车间配液岗位所有配液罐（1000L/2000L）的清洗与消毒操作。\n\n#### 3. 职责\n- 配液岗位操作工：负责按照本规程执行配液罐的清洗，做好记录。\n- 岗位复核人：负责现场关键控制参数的核对复核，并在清洁记录上签字。\n- QA监控员：负责抽检并监控清洗过程，出具最终清场合格证。\n\n#### 4. 标准操作程序 (正文)\n- **4.1 预清场**：清洁前断开配液加热总阀，连接CIP供水总管。\n- **4.2 预冲洗**：开启CIP纯化水阀，以流速不低于 1.5m/s 的动力流，对配液罐进行一次预冲洗，时间为 2 分钟，排出水排至污水管。\n- **4.3 循环冲洗**：接入配方浓度为1.5%的专用碱性洗涤剂，保持罐内温度为 70-80℃。利用CIP旋转喷淋头对内壁进行循环喷淋冲洗，总循环时长为 10 分钟。\n- **4.4 纯化水淋洗**：切断洗涤剂，引入常温纯化水对管线及内壁进行淋洗，持续 3 分钟。\n- **4.5 注射用水终淋**：切换至高规格注射用水（WFI）对配液罐进行最终淋洗，淋洗时间不少于 1 分钟。\n\n#### 5. 判定合格标准\n- 5.1 最终淋洗水的电导率：出水在线测试仪显示电导率 **≤1.3 μS/cm**；\n- 5.2 最终淋洗水的pH值：使用试纸或pH计测试，pH值必须在 **5.0 - 7.0** 的合格范围内。`);
          break;
        case 17:
          setOutput(`### 🎓 【GMP 智能体实操答辩汇报幻灯片】

#### 📊 幻灯片 1：痛点剖析与业务诉求
- **答辩课题**：基于 Workbuddy 的【${ex17Title}】自动化重构实践
- **所属部门**：${ex17Department}
- **传统缺陷**：人工回顾数据链条长，报表收集零散，计算容易出错，且缺乏智能交叉对比，导致每年回顾耗时长达2周。

#### 🛡️ 幻灯片 2：系统架构与组件配置
- **引入技能 (Skills)**：${ex17SelectedSkill}
- **本地知识库挂载**：挂载历年批记录文件夹、工艺控制限度规程，确立向量数据库匹配。
- **自动化工作模式**：
  - “定时触发器”监听历年检验台账
  - “大语言模型”自动对 Assay / LOD 分布生成正态性检验、3SD 控制限扫描。

#### 🚀 幻灯片 3：核心实施步骤（方法论）
${ex17Methodology.split('\n').map(line => `- ${line}`).join('\n')}

#### 📈 幻灯片 4：业务收益与答辩总结
- **合规闭环**：完全杜绝手动编辑回顾报表的人为计算失误，做到源头数据可追溯，完美符合 GMP 数据完整性 (DI) 要求。
- **效率跃升**：年度产品质量回顾报告（APR）生成效率由传统 14 天缩短至 **15 分钟以内**。
- **专家寄语**：数字化转型赋予质量合规实时监控和辅助预防预测（CAPA）的长效能力。

---
🎉 **[恭喜！您已成功演练完成全部 17 堂 GMP 实操课程。点击完成实操并生成特训营毕业证书！]**`);
          break;
        default:
          setOutput('模拟运行成功');
      }
      onComplete(activeExercise.id);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 min-h-0">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 p-4 shrink-0 flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 rounded-full">
            第 {activeExercise.day} 天实操课 • 第 {activeExercise.taskNo} 节
          </span>
          <h2 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-emerald-600" />
            {activeExercise.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            所在章节: {activeExercise.lecture}
          </p>
        </div>

        {/* Completion status */}
        <div className="flex items-center gap-2">
          {activeExercise.completed ? (
            <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
              <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" />
              当前实操已达成
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg border border-slate-200">
              进行中 (Pending)
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Body split into Left Config Panel and Right Output Console */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Course Guide Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex gap-3.5 shadow-sm">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">本节实操教学纲要 (Gxp Training Protocol)</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {activeExercise.description}
            </p>
          </div>
        </div>

        {/* SPECIAL EMBEDDED VIEWS FOR SPECIFIC EXERCISES */}
        {activeExercise.taskNo === 5 || activeExercise.taskNo === 6 ? (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>知识库搭建课程：此课程需在本地知识库管理终端完成。请在下方交互。</span>
            </div>
            <KnowledgeBaseManager 
              files={files} 
              folders={folders} 
              onAddFile={onAddFile} 
            />
          </div>
        ) : activeExercise.taskNo === 11 ? (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>审计助手课程：加载 <strong>pharma-gmp-audit</strong> 双盲或多模式进行对话模拟，以下为实操助手：</span>
            </div>
            <GmpAuditChat />
          </div>
        ) : activeExercise.taskNo === 12 ? (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>多专家协作流程：由QA评估、法规索引、文档报告三个智能体接力处理：</span>
            </div>
            <DeviationExpertPanel />
          </div>
        ) : activeExercise.taskNo === 15 || activeExercise.taskNo === 16 ? (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>自动化重复任务流运行课：通过模拟文件夹监听动作触发业务自动化：</span>
            </div>
            <FolderWatcher />
          </div>
        ) : (
          /* STANDARD FORM COCKPIT FOR THE REMAINING LECTURES */
          <div className="grid grid-cols-12 gap-4">
            
            {/* Left Hand Controller Forms */}
            <div className="col-span-5 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                智能体任务配置面板 (Inputs)
              </span>

              {/* Form tailored to Ex 1 */}
              {activeExercise.taskNo === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      选择预置医药场景 Skill (实操 1)
                    </label>
                    <select
                      value={ex1Skill.id}
                      onChange={(e) => handleEx1SkillChange(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {SKILLS_LIST.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      输入您的任务描述 (Prompt)
                    </label>
                    <textarea
                      value={ex1Prompt}
                      onChange={(e) => setEx1Prompt(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 h-28"
                    />
                  </div>
                </div>
              )}

              {/* Form tailored to Ex 2 */}
              {activeExercise.taskNo === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      修改前（差任务提示词）
                    </label>
                    <input
                      type="text"
                      value={badPrompt}
                      onChange={(e) => setBadPrompt(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      修改后（CRAFT 五要素高标准结构）
                    </label>
                    <textarea
                      value={craftPrompt}
                      onChange={(e) => setCraftPrompt(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-44 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Form tailored to Ex 3 */}
              {activeExercise.taskNo === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      选择检验分析项目 (实验室)
                    </label>
                    <select
                      value={oosMetricKey}
                      onChange={(e) => setOosMetricKey(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="activeIngredientAssay">注射用头孢纯度分析 (Assay%) [合规标准: 98.0% - 102.0%]</option>
                      <option value="lossOnDrying">干燥失重分析 (LOD%) [合规标准: ≤1.0%]</option>
                      <option value="pHValue">注射溶液 pH 检验 [合规标准: 4.5 - 6.5]</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      输入待核验实测检验值 (可调整查看 OOS / OOT 报警)
                    </label>
                    <input
                      type="text"
                      value={oosValue}
                      onChange={(e) => setOosValue(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 leading-relaxed">
                    <span className="font-bold">核验计算原理：</span>
                    超标(OOS)为测定值溢出法定限度；超趋势(OOT)在均值3倍标准差(3SD)之外。智能体将自动读取数据、运算并生成报告。
                  </div>
                </div>
              )}

              {/* Form tailored to Ex 4 */}
              {activeExercise.taskNo === 4 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    输入偏差背景与当前应对 CAPA
                  </label>
                  <textarea
                    value={capaBackground}
                    onChange={(e) => setCapaBackground(e.target.value)}
                    className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-56 resize-none focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Form tailored to Ex 7 */}
              {activeExercise.taskNo === 7 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">设备名称 (3Q框架生成器)</label>
                    <input
                      type="text"
                      value={ex7Equipment}
                      onChange={(e) => setEx7Equipment(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">详细设备参数与配置</label>
                    <textarea
                      value={ex7Params}
                      onChange={(e) => setEx7Params(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-36"
                    />
                  </div>
                </div>
              )}

              {/* Form tailored to Ex 8 */}
              {activeExercise.taskNo === 8 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    起草中的粗糙 SOP 样本 (待合规审查)
                  </label>
                  <textarea
                    value={ex8SopText}
                    onChange={(e) => setEx8SopText(e.target.value)}
                    className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-52"
                  />
                </div>
              )}

              {/* Form tailored to Ex 9 */}
              {activeExercise.taskNo === 9 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    输入待转换内审依据 (SOP 文本)
                  </label>
                  <textarea
                    value={ex9SopContext}
                    onChange={(e) => setEx9SopContext(e.target.value)}
                    className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-52"
                  />
                </div>
              )}

              {/* Form tailored to Ex 10 */}
              {activeExercise.taskNo === 10 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">本厂特定的生产线类型</label>
                    <input
                      type="text"
                      value={ex10LineType}
                      onChange={(e) => setEx10LineType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">防范清扫防交叉污染重点</label>
                    <textarea
                      value={ex10Focus}
                      onChange={(e) => setEx10Focus(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-28"
                    />
                  </div>
                </div>
              )}

              {/* Form tailored to Ex 13 */}
              {activeExercise.taskNo === 13 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    要核查审查的批生产记录文本 (寻找隐瞒与违规)
                  </label>
                  <textarea
                    value={ex13BatchData}
                    onChange={(e) => setEx13BatchData(e.target.value)}
                    className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-60 resize-none focus:outline-none"
                  />
                </div>
              )}

              {/* Form tailored to Ex 14 */}
              {activeExercise.taskNo === 14 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">拟定标准程序 (SOP) 名称</label>
                    <input
                      type="text"
                      value={ex14SopName}
                      onChange={(e) => setEx14SopName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">操作步骤要点及参数</label>
                    <textarea
                      value={ex14KeyPoints}
                      onChange={(e) => setEx14KeyPoints(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-32"
                    />
                  </div>
                </div>
              )}

              {/* Form tailored to Ex 17 */}
              {activeExercise.taskNo === 17 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">药企真实业务痛点/瓶颈</label>
                    <input
                      type="text"
                      value={ex17Title}
                      onChange={(e) => setEx17Title(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">牵头所属部门</label>
                    <input
                      type="text"
                      value={ex17Department}
                      onChange={(e) => setEx17Department(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">双Skill或特定组件组配</label>
                    <input
                      type="text"
                      value={ex17SelectedSkill}
                      onChange={(e) => setEx17SelectedSkill(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">实施步骤与智能化重组思路</label>
                    <textarea
                      value={ex17Methodology}
                      onChange={(e) => setEx17Methodology(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg h-24"
                    />
                  </div>
                </div>
              )}

              {/* Submit Trigger Button */}
              <button
                onClick={executeTask}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                {loading ? '智能体核算解析中...' : '启动 GxP 专家智能体运行'}
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Intelligent SOP RAG Search Indicator */}
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
                    SOP 知识库自动检索器 (RAG Router)
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                    智能挂载激活
                  </span>
                </div>
                {(() => {
                  let currentPrompt = '';
                  switch (activeExercise.taskNo) {
                    case 1: currentPrompt = ex1Prompt; break;
                    case 2: currentPrompt = craftPrompt; break;
                    case 3: currentPrompt = oosValue; break;
                    case 4: currentPrompt = capaBackground; break;
                    case 7: currentPrompt = ex7Params; break;
                    case 8: currentPrompt = ex8SopText; break;
                    case 9: currentPrompt = ex9SopContext; break;
                    case 10: currentPrompt = ex10Focus; break;
                    case 13: currentPrompt = ex13BatchData; break;
                    case 14: currentPrompt = ex14KeyPoints; break;
                    case 17: currentPrompt = ex17Methodology; break;
                    default: currentPrompt = '';
                  }
                  
                  const matchedResults = searchKnowledgeBase(currentPrompt, files);
                  if (matchedResults.files.length > 0) {
                    return (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-slate-600">
                          发现与该任务强相关的制药级规程，已自动关联并挂载以下 **{matchedResults.files.length}** 篇 SOP 作为 AI 审核背景：
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {matchedResults.files.map(file => (
                            <span key={file.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] rounded-md font-medium">
                              <FileText className="w-2.5 h-2.5 text-emerald-600" />
                              {file.name.split(' ')[0]} 
                              {file.department && ` (${file.department})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <p className="text-[10px] text-slate-400 italic">
                        当输入包含 HPLC、更衣、偏差、灭菌、警告信、电导率等关键词时，系统将自动关联检索特定 SOP。
                      </p>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Right Hand Output Console */}
            <div className="col-span-7 flex flex-col space-y-4">
              
              {activeExercise.taskNo === 2 ? (
                /* Side-by-side output panel for Ex 2 (CRAFT) */
                <div className="grid grid-cols-2 gap-4 h-[500px]">
                  {/* Left Bad */}
                  <div className="border border-slate-200 rounded-xl bg-white flex flex-col min-h-0 shadow-sm overflow-hidden">
                    <span className="bg-red-50 text-red-800 px-3 py-2 text-xs font-bold border-b border-slate-200">
                      方式 A: 差任务描述「直接评估偏差」
                    </span>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {loading ? '评估中...' : output || '点击“启动”查看缺乏结构的AI通用泛化性回答。'}
                    </div>
                  </div>

                  {/* Right CRAFT */}
                  <div className="border border-slate-200 rounded-xl bg-white flex flex-col min-h-0 shadow-sm overflow-hidden">
                    <span className="bg-emerald-50 text-emerald-800 px-3 py-2 text-xs font-bold border-b border-slate-200">
                      方式 B: 运用 CRAFT 精准提示词结构
                    </span>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {loading ? '评估中...' : secondaryOutput || '点击“启动”查看高精准、完全符合药典及偏差指南的极佳回复。'}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Console Output Panel */
                <div className="border border-slate-200 rounded-xl bg-white flex flex-col h-[500px] shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      智能体评估终端 (GxP Compliance Terminal)
                    </span>
                    {output && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(output);
                          alert('评估结果已成功复制到剪贴板！');
                        }}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 flex items-center gap-1 transition-all"
                      >
                        <Clipboard className="w-3 h-3" />
                        复制结果
                      </button>
                    )}
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                        <p className="text-xs font-semibold">Gemini 药学大模型正在进行规则对照、缺陷深度扫描...</p>
                      </div>
                    ) : output ? (
                      <div className="space-y-3 prose prose-sm max-w-none text-slate-800">
                        {output.split('\n').map((line, index) => {
                          if (line.startsWith('###')) {
                            return <h3 key={index} className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mt-4 text-xs">{line.replace('###', '')}</h3>;
                          } else if (line.startsWith('####')) {
                            return <h4 key={index} className="font-semibold text-slate-800 mt-3 text-xs">{line.replace('####', '')}</h4>;
                          } else if (line.startsWith('**') || line.startsWith('- **')) {
                            return <p key={index} className="font-semibold text-slate-800 text-xs my-1">{line}</p>;
                          }
                          return <p key={index} className="my-1 text-slate-600 text-xs leading-relaxed">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center space-y-2">
                        <Cpu className="w-12 h-12 stroke-1 mb-1 text-slate-300" />
                        <p className="font-semibold">终端空闲</p>
                        <p className="text-[11px] max-w-xs text-slate-400">
                          请在左侧配置生产设备、称重配比或检验限度参数，接着点击“启动专家智能体”查看分析。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extra feedback slide for final Exercise 17 */}
              {activeExercise.taskNo === 17 && output && (
                <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-emerald-200 rounded-xl p-4 flex gap-4 items-center">
                  <Award className="w-10 h-10 text-amber-500 shrink-0 animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                      <Presentation className="w-4 h-4 text-amber-500" />
                      恭喜！完成特训营全部模拟课程
                    </h4>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      您已完成第一天、第二天全部 17 堂实操课。请保留好您的幻灯片答辩纲要，并点击右侧按键完成课程，领取 GxP 特训营电子结业证书。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      alert('🎉 恭喜您荣获【GxP 智能体特训营 - 结业合格证书】！\n获得认证: GMP Agent Construction Level-1。\n\n感谢您使用本实操工作台！');
                    }}
                    className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white text-xs font-bold rounded-lg shadow-md transition-all shrink-0"
                  >
                    申领毕业证书
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
