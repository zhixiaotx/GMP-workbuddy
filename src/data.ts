import { GxpSkill, Exercise, KBFile, KBFolder } from './types';

export const SKILLS_LIST: GxpSkill[] = [
  {
    id: 'pharma-iq-oq-pq-framework',
    name: '设备验证框架生成器 (pharma-iq-oq-pq-framework)',
    code: 'pharma-iq-oq-pq-framework',
    description: '协助制药企业进行设备与设施的3Q（安装验证IQ、运行验证OQ、性能验证PQ）方案框架设计，支持核心参数和判定准则推荐。',
    category: '设备管理',
    icon: 'Cpu',
    systemInstruction: '你是一个专业的制药设备验证专家，遵循GMP/FDA指南。请协助用户根据设备基本情况，输出高水准的3Q方案框架。输出内容需包含：验证目的、验证职责、设备概述、安装确认项(IQ)、运行确认项(OQ)、性能确认项(PQ)、可接受标准。',
    defaultPrompt: '为【真空冷冻干燥机】生成设备验证3Q方案框架。主要配置包括：干燥腔容积3m³，冷凝器捕水能力50kg，配置自动进出料系统。'
  },
  {
    id: 'pharma-sop-compliance-check',
    name: 'SOP合规性审查员 (pharma-sop-compliance-check)',
    code: 'pharma-sop-compliance-check',
    description: '对制药企业SOP（标准操作规程）进行专业审查，确保其符合中国GMP、欧盟GMP及FDA的通用合规和格式规范。',
    category: '质量管理',
    icon: 'FileCheck2',
    systemInstruction: '你是一个资深的GMP合规检查官。请对输入的SOP文件进行合规性对比审查，识别出缺失的合规要素，指出表述不严谨的地方。检查点包括：目的、范围、职责、流程正文、记录、起草人审核人批准人、版本控制和版本历史、参考依据。',
    defaultPrompt: '请帮我检查【物料称量标准操作规程】。它的基本内容是：称量员需要对称量室进行清场，然后开始称量，称量完成后打扫卫生，做好记录。'
  },
  {
    id: 'pharma-gmp-gap-scan',
    name: 'GMP差距扫描仪 (pharma-gmp-gap-scan)',
    code: 'pharma-gmp-gap-scan',
    description: '通过对比现行GMP法规（如2010版中国GMP、FDA cGMP），扫描输入文本或工作流程中的潜在合规缺陷和空白。',
    category: '法规事务',
    icon: 'ShieldAlert',
    systemInstruction: '你是一名GMP合规审计师。请扫描输入的业务流程或现场描述，与现行GMP规范进行横向比对，指出流程中的“差距（Gap）”，并标注对应条款（中国GMP或FDA cGMP），提出补齐方案。',
    defaultPrompt: '描述：我们的洁净区更换工作服时，更衣室只有一间，男女共用，但有隔断。工作服每周洗涤一次，没有单独的气流控制。'
  },
  {
    id: 'pharma-internal-audit-checklist',
    name: '内审自查清单生成器 (pharma-internal-audit-checklist)',
    code: 'pharma-internal-audit-checklist',
    description: '根据企业特定的工艺流程、SOP以及以往缺陷历史，自动生成高度契合且具备实操性的内部审计/自查清单。',
    category: '质量管理',
    icon: 'ClipboardList',
    systemInstruction: '你是一名GMP内审主任。请结合用户的SOP和车间要求，输出一份详细的内审自查清单。清单需采用表格形式，包含：序号、检查项、合规依据（SOP章节）、现场检查/提问指南、判定标准（严重/主要/微小缺陷）。',
    defaultPrompt: '请结合【洁净室人员更衣SOP】及无菌操作要求，为我们无菌分装车间的内审生成一份自查清单。'
  },
  {
    id: 'pharma-fda483-checklist',
    name: 'FDA 483缺陷应对自查清单 (pharma-fda483-checklist)',
    code: 'pharma-fda483-checklist',
    description: '分析FDA近年483缺陷信和警告信，针对企业的特定产品线/设备，自动构建防范相同缺陷的防御性自查清单。',
    category: '法规事务',
    icon: 'AlertTriangle',
    systemInstruction: '你是一名熟悉美联邦法规CFR 211的FDA合规咨询专家。根据输入的历史审计案例（警告信）和用户生产线，生成针对性防御自查清单，帮助企业在FDA审计前排除隐患。重点在于验证、偏差、计算机化系统及防污染。',
    defaultPrompt: '针对我们的【无菌注射剂灌装线】，挂载FDA 483警告信案例，输出重点自查清单。关注设备清洗验证和无菌培养。'
  },
  {
    id: 'pharma-gmp-audit',
    name: 'GMP审计协同助手 (pharma-gmp-audit)',
    code: 'pharma-gmp-audit',
    description: '配置5种专业审计协同工作模式，深度协助现场审计、模拟审计、缺陷整改计划、法规条文速查、整改报告生成等环节。',
    category: '法规事务',
    icon: 'Users',
    systemInstruction: '你是一个由五种模式组成的GMP审计协同助手：\n1. 官方检察官（Regulatory Inspector）：犀利、深究、直切痛点；\n2. 企业内审员（QA Auditor）：务实、系统、寻找隐患；\n3. 合规顾问（Compliance Advisor）：建设性、给出具体解题方案；\n4. 现场审计陪同演练（Audit Defendor）：模拟被审计人员应对提问，提供话术；\n5. 整改项规划专家（CAPA Planner）：指导编制CAPA，生成CAPA报告格式。\n请根据用户的指示或选定的工作模式，提供极为专业的GMP审计对话支持。',
    defaultPrompt: '【以合规顾问模式】请帮我分析洁净区尘埃粒子检测超标后的第一步行动和CAPA制定思路。'
  },
  {
    id: 'pharma-batch-record-review',
    name: '批记录合规审核专家 (pharma-batch-record-review)',
    code: 'pharma-batch-record-review',
    description: '模拟对产品生产批记录、检验记录进行全面审核，发现潜在的漏签、越权签字、偏差漏报、物料平衡超标等关键问题。',
    category: '生产管理',
    icon: 'BookmarkCheck',
    systemInstruction: '你是一个GMP批生产和批检验记录审核员。请对输入的批记录数据和签字情况进行严格检查。核心审查点：1. 称量记录、投料记录一致性；2. 操作人与复核人签字完整度；3. 各工序收率及总物料平衡计算；4. 关键工艺参数（温湿度、灭菌温度时间等）是否偏离工艺限度；5. 是否存在潜在未申报的偏差。',
    defaultPrompt: '审核批记录概况：批号20260712A，注射用无菌头孢。称量岗位总投料量98.5kg，标示规格0.5g/支，实际灌装195,000支，废品1,200支。烘干温度工艺规程要求70±5℃，但在15点至16点间有三次记录显示温度为76.5℃。操作人员直接划线修改为72.0℃，旁边盖了个人名章，无偏差记录。'
  },
  {
    id: 'pharma-sop-generator',
    name: '结构化SOP生成器 (pharma-sop-generator)',
    code: 'pharma-sop-generator',
    description: '根据企业工艺、设备说明书、法规指引，高标准自动输出结构完整、语言严谨、符合GMP要求的SOP初稿。',
    category: '生产管理',
    icon: 'FileSpreadsheet',
    systemInstruction: '你是一个专业的GMP制药技术写作顾问。请根据用户提供的核心要点或流程描述，撰写符合国际GMP标准的结构化SOP。必须包含：目的、范围、职责、标准操作正文、清洁与维护、偏差处理、相关记录。内容需条理清晰、使用无歧义的指令性动词。',
    defaultPrompt: '编写【高效湿法混合制粒机清洁SOP】。要点：1. 冲洗锅内壁，用无纺布擦洗；2. 用注射用水最后淋洗，用电导率测试判断是否洗净；3. 每批生产完必须做中度清洁，品种更换必须做彻底清洁。'
  }
];

export const EXERCISES: Exercise[] = [
  // Day 1
  {
    id: 'ex-1',
    day: 1,
    lecture: '第一讲：平台认知与三种搭建方式',
    title: '实操1：发起第一个任务Skill',
    description: '介绍已有医药场景Skill列表和能力说明，选择一个Skill并初始化第一个智能体任务。',
    taskNo: 1,
    completed: false
  },
  {
    id: 'ex-2',
    day: 1,
    lecture: '第二讲：提示词工程——CRAFT结构',
    title: '实操2：差提示词改写与CRAFT质量对比',
    description: '将一个差的任务描述「帮我评估这份偏差报告」用CRAFT五要素框架改写，并运行双侧输出质量对比。',
    taskNo: 2,
    completed: false
  },
  {
    id: 'ex-3',
    day: 1,
    lecture: '第三讲：纯提示词类任务实配',
    title: '实操3：OOS/OOT描述助手',
    description: '在任务中嵌入计算核验逻辑，智能读取检验数据，判定是否属于超标（OOS）或超趋势（OOT），输出合规描述。',
    taskNo: 3,
    completed: false
  },
  {
    id: 'ex-4',
    day: 1,
    lecture: '第三讲：纯提示词类任务实配',
    title: '实操4：CAPA有效性评估器',
    description: '采用五维框架任务描述设计（针对人/机/料/法/环），输入偏差背景，一键评估CAPA深度并输出评估报告初稿。',
    taskNo: 4,
    completed: false
  },
  {
    id: 'ex-5',
    day: 1,
    lecture: '第四讲：知识库搭建',
    title: '实操5：脱敏SOP格式化转换为问答对',
    description: '将一篇脱敏后的SOP说明文本自动转换为标准QA问答对格式，模拟将其存入本地指定文件夹以供知识库调用。',
    taskNo: 5,
    completed: false
  },
  {
    id: 'ex-6',
    day: 1,
    lecture: '第四讲：知识库搭建',
    title: '实操6：知识库文件夹挂载前后质量对比',
    description: '运行同一个查询（如：特殊化学品泄漏如何清场？），观察并对比在有无挂载本地知识库文件夹两种状态下的回答质量差异。',
    taskNo: 6,
    completed: false
  },
  {
    id: 'ex-7',
    day: 1,
    lecture: '第五讲：Skill导入类任务实配',
    title: '实操7：设备验证方案生成器（3Q框架）',
    description: '导入并调用`pharma-iq-oq-pq-framework` Skill，输入设备信息并自动输出一套规范的3Q验证方案基本架构。',
    taskNo: 7,
    completed: false
  },
  {
    id: 'ex-8',
    day: 1,
    lecture: '第五讲：Skill导入类任务实配',
    title: '实操8：SOP合规检查助手（双Skill协同）',
    description: '同时加载`pharma-sop-compliance-check`与`pharma-gmp-gap-scan`双Skill组合，自动比对并指出一份起草中的SOP存在的缺陷清单。',
    taskNo: 8,
    completed: false
  },
  {
    id: 'ex-9',
    day: 1,
    lecture: '第五讲：Skill导入类任务实配',
    title: '实操9：内审自查清单（Skill + 知识库）',
    description: '导入`pharma-internal-audit-checklist` Skill，配合挂载本地SOP文件，自动生成高实操性的内审现场提问与查核清单。',
    taskNo: 9,
    completed: false
  },
  {
    id: 'ex-10',
    day: 1,
    lecture: '第五讲：Skill导入类任务实配',
    title: '实操10：FDA 483防范自查清单',
    description: '导入`pharma-fda483-checklist` Skill，挂载警告信缺陷库文件夹，输入车间产品线，输出防范性483应对检查点。',
    taskNo: 10,
    completed: false
  },
  {
    id: 'ex-11',
    day: 1,
    lecture: '第五讲：Skill导入类任务实配',
    title: '实操11：GMP多模审计助手交互',
    description: '加载`pharma-gmp-audit` Skill，体验包含官方检察官、合规顾问等5种不同工作模式下的现场情景对话模拟。',
    taskNo: 11,
    completed: false
  },

  // Day 2
  {
    id: 'ex-12',
    day: 2,
    lecture: '第六讲：专家与专家团——多Agent协作',
    title: '实操12：偏差评估多专家协同流程模拟',
    description: '配置并运行"偏差管理专家团"（QA评估专家、法规检索专家、报告编写专家），展现多角色接力协作、逐步深化业务流的过程。',
    taskNo: 12,
    completed: false
  },
  {
    id: 'ex-13',
    day: 2,
    lecture: '第七讲：专家团实配——医药全流程协作',
    title: '实操13：批记录审核专家团深度探错',
    description: '导入批记录数据，挂载`pharma-batch-record-review` Skill，QA审核专家和工艺监督员携手审核，揭露不合规行为。',
    taskNo: 13,
    completed: false
  },
  {
    id: 'ex-14',
    day: 2,
    lecture: '第七讲：专家团实配——医药全流程协作',
    title: '实操14：SOP自动撰写专家团',
    description: '结合`pharma-sop-generator`与高级技术写作专家，输入简单的设备或操作核心要点，产出规范化标准规程。',
    taskNo: 14,
    completed: false
  },
  {
    id: 'ex-15',
    day: 2,
    lecture: '第八讲：自动化任务——让重复工作自动跑起来',
    title: '实操15：COA检验报告自动监听与解析汇总',
    description: '配置文件夹监听。模拟新放行COA检验报告进入后，触发自动化Agent，快速抓取批号、含量及结果追加汇入主台账。',
    taskNo: 15,
    completed: false
  },
  {
    id: 'ex-16',
    day: 2,
    lecture: '第八讲：自动化任务——让重复工作自动跑起来',
    title: '实操16：结构化偏差文件自动报批流程',
    description: '检测到偏差事件记录，自动化调用偏差格式化组件，生成标准书面偏差报告草案并输出。',
    taskNo: 16,
    completed: false
  },
  {
    id: 'ex-17',
    day: 2,
    lecture: '第九讲：自主实战',
    title: '实操17：自主业务痛点场景组配与展示',
    description: '结合两天所学，自由组配技能与知识库，攻克如变更评估、环境监测、年度产品质量回顾（APR）等特定药企核心痛点。',
    taskNo: 17,
    completed: false
  }
];

export const MOCK_KNOWLEDGE_BASE: KBFile[] = [
  {
    id: 'file-1',
    name: 'GMP-SOP-QA-011 偏差管理标准操作程序.txt',
    folder: 'SOPs/Quality',
    size: '12.4 KB',
    department: 'Quality Assurance',
    process: 'Deviation Handling',
    tags: ['Deviation', 'Risk Assessment', 'CAPA'],
    content: '【目的】规范偏差的调查、评估、分类与处理程序，保障产品质量。\n【范围】适用于制药车间全部偏差事件的处理。\n【程序】1. 任何人发现偏差事件，应立即向车间主管和QA报告并进行临时紧急处置；\n2. QA于24小时内到现场核实，登记偏差编号，并进行初步风险评估分类；\n3. 偏差分类：\n   - 微小偏差（Minor）：对关键质量属性(CQA)没有明显危害，经口头批准和记录即可闭环；\n   - 主要偏差（Major）：对物料、设施、参数产生可度量影响，由QA组长负责展开正式多功能小组调查；\n   - 严重偏差（Critical）：直接危及产品安全与合规。必须立即停止生产，启动全面偏差纠正行动。\n4. 调查报告：主要和严重偏差应在30天内完成调查评估、确定根本原因并制定CAPA。'
  },
  {
    id: 'file-2',
    name: 'GMP-SOP-PROD-004 无菌更衣标准规程.txt',
    folder: 'SOPs/Production',
    size: '8.2 KB',
    department: 'Production',
    process: 'Sterilization/Gowning',
    tags: ['Gowning', 'Sterile Room', 'Personnel Control'],
    content: '【目的】确保操作人员无菌更衣过程符合D级和B级洁净区控制要求，防止尘粒子与微生物污染。\n【职责】进入B级/D级洁净区的人员、车间更衣复核人员、质量监控QA。\n【更衣程序】\n1. 一更（非洁净区至D级过渡层）：脱去外衣，更换洁净室拖鞋。洗手烘干。\n2. 二更（进入C级/D级区前）：穿戴洁净帽（头发不可外露），佩戴口罩，穿戴无菌洁净服、洁净裤与洁净鞋套。进行手消毒。\n3. 三更（进入A/B级核心区）：使用消毒剂洗手。在气闸更衣室内脱卸普通工作帽、防护口罩，更换高效过滤器面罩、无菌护目镜。穿戴无菌一体式防寒/防尘服。再次手部消毒。拉上拉链，佩戴乳胶手套，手套袖口需塞入更衣袖口内并封死。'
  },
  {
    id: 'file-3',
    name: 'FDA-Warning-Letter-Case-Sterile-Leakage.txt',
    folder: 'Regulations/Audits',
    size: '15.1 KB',
    department: 'Regulatory Affairs',
    process: 'Audit Defense',
    tags: ['FDA Warning Letter', 'Sterile Leakage', 'Audit Defenses'],
    content: '【FDA 483/警告信案例研究】\n【缺陷条文】21 CFR 211.113(b) - 生产企业未能建立并执行适当的防止微生物污染的标准书面操作程序。\n【典型案例】在2025年某国际药企现场检查中，FDA检察官发现该企业无菌注射剂在灌装期间，密封垫圈发生细微液体渗漏，导致不锈钢支架表面形成潮湿区域。操作人员虽然使用酒精擦拭，但未能停机，也未对该事件进行偏差登记，更未对无菌屏障的物理完整性进行二次评估。无菌灌装继续运行，结果发现有5个批次的培养产品在长达14天后长菌。\n【应对防范要点】必须制订紧急停机和物理泄漏检查SOP。一旦发生任何洁净工作台物理渗漏，无论大小均须作为偏差处理，对无菌屏障破损进行环境监测和培养基灌装验证。'
  },
  {
    id: 'file-4',
    name: 'GMP-SOP-LAB-023 高效液相色谱仪(HPLC)超标超趋势处理.txt',
    folder: 'SOPs/Lab',
    size: '10.5 KB',
    department: 'Quality Control',
    process: 'Analytical Testing',
    tags: ['HPLC', 'OOS', 'OOT', 'Laboratory Investigation'],
    content: '【目的】规范QC实验室的高效液相色谱仪(HPLC)分析中出现的检测结果超标(OOS)及超趋势(OOT)的核验和纠正流程。\n【定义】\n- OOS (Out of Specification)：检验结果超出了法定质量标准或批准的企业注册标准。\n- OOT (Out of Trend)：检验结果仍在合格标准范围内，但偏离了该产品的历史统计期望值，如连续几批呈异常上升趋势或偏离历史均值3倍标准差(3SD)以外。\n【核验逻辑】\n1. 第一阶段实验室调查：立即封存原始样品与试剂，分析是否有计算错误、仪器故障、气泡、标样过期等情况。\n2. 确认没有明显的实验室人为失误后，转入第二阶段企业调查，深入评估生产工艺是否发生异常。'
  }
];

export const KNOWLEDGE_FOLDERS: KBFolder[] = [
  { id: 'folder-sops', name: 'SOPs/Quality', description: '质量管理标准操作规程及通则', files: ['file-1'] },
  { id: 'folder-prod', name: 'SOPs/Production', description: '车间生产操作及更衣洁净规程', files: ['file-2'] },
  { id: 'folder-lab', name: 'SOPs/Lab', description: 'QC实验室与设备检测操作规程', files: ['file-4'] },
  { id: 'folder-audits', name: 'Regulations/Audits', description: 'FDA警告信案例及国内外药典合规指引', files: ['file-3'] }
];

export const CHEMICAL_OOS_METRICS = {
  activeIngredientAssay: {
    name: '头孢纯度含量分析 (Assay)',
    specMin: 98.0,
    specMax: 102.0,
    historicalMean: 100.12,
    historicalSd: 0.42
  },
  lossOnDrying: {
    name: '水分干燥失重分析 (LOD)',
    specMin: 0.0,
    specMax: 1.0,
    historicalMean: 0.35,
    historicalSd: 0.08
  },
  pHValue: {
    name: '注射剂溶液pH值检测',
    specMin: 4.5,
    specMax: 6.5,
    historicalMean: 5.48,
    historicalSd: 0.15
  }
};
