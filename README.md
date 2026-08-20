# 💊 GxP AI 数字化药厂合规审计与协作工作区
### (GxP Collaborative Audit Workspace & AI Sandbox)

这是一个专为制药、生物医疗、医疗器械等高合规（GxP）行业设计的**数字化合规工作坊与协作审计系统**。它完美融合了 **AI 大模型智能体**（支持原生谷歌 Gemini 或 任意兼容 OpenAI 接口的大模型，如 DeepSeek、Ollama 等）、**RAG 检索增强规程**、**协作任务 Kanban 看板**和 **GAMP 5 数据完整性自动校验链**。

本项目旨在向制药质量保证（QA）、生产、工程及验证人员展示如何利用结构化提示词（CRAFT 模型）与 AI 协同，实现偏差分析、SOP 知识库解构、临时纠正隔离措施以及 CAPA（纠正与预防措施）闭环报告的智能化输出。

---

## 🚀 极简配置：两步激活真实大模型（双芯适配，兼容 OpenAI / DeepSeek）

本项目支持**免 API Key 本地仿真**（内置完整业务规则和仿真回复），若要接入真实大模型进行深度自由问答，只需两步配置：

### 第一步：创建或配置 `.env` 文件
在项目根目录下，将 `.env.example` 文件复制一份并重命名为 `.env`。

### 第二步：选择任一 API 密钥填入：
根据您手中的 API 资源，选择以下 **其中一种** 方案配置即可：

#### 方案 A：使用官方谷歌 Gemini API（推荐）
```env
GEMINI_API_KEY="您的真实_GEMINI_API_KEY"
```

#### 方案 B：使用兼容 OpenAI 协议的第三方 API（如 DeepSeek / 国内大模型代理）
本项目后端已实现通用协议适配，支持直接使用 OpenAI、DeepSeek、LM Studio、甚至本地的 Ollama：
```env
OPENAI_API_KEY="您的真实_API_KEY"
OPENAI_BASE_URL="https://api.deepseek.com/v1"   # 或是其他大模型代理地址
OPENAI_MODEL_NAME="deepseek-chat"               # 模型名称，例如 gpt-4o、deepseek-chat 等
```

*注：后端会自动检测您的密钥，优先检测 `GEMINI_API_KEY`，若无则自动无缝降级采用标准的 `OPENAI_API_KEY` 接口。*

---

## 📂 小白看得懂：全项目目录与文件功能全解析

为了让刚接触全栈开发的同学能够迅速上手，以下是本项目中**每一个文件**的具体功能与核心逻辑解释：

### 📁 根目录配置与工程文件

1. **`.env.example`**
   * **作用**：环境变量模板文件。存放了项目所需的环境变量占位符，**禁止在其中填写您的真实密钥**，仅供复制为 `.env`。
2. **`metadata.json`**
   * **作用**：AI Studio 平台的配置文件。定义了 Applet 的名称、描述以及平台权限（例如开启服务端 API 大模型权限 `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`）。
3. **`package.json`**
   * **作用**：项目的“身份证”与依赖总览表。
     * `scripts`：配置了开发指令。`npm run dev` 启动后端开发代理，`npm run build` 打包前端，并通过 `esbuild` 编译后端代码，`npm run start` 启动生产环境。
     * `dependencies`：包含了 `@google/genai`、`express`（后端服务器）、`react`（前端框架）、`motion`（丝滑过渡动画库）、`lucide-react`（精美医学与合规图标库）。
4. **`server.ts`**
   * **作用**：**整个项目的全栈后端引擎**。
     * 隐藏 API 密钥：在服务器端安全代发 AI 请求，防止前端泄露 Key。
     * 业务定制路由：处理 CRAFT 比对、SOP 分块、多专家会诊以及标准问答。
     * 双芯适配器：自适应调用 Gemini SDK 或是通过标准的 `fetch` 协议请求 OpenAI / DeepSeek 兼容网关。
     * Vite 开发服务器托管：在开发环境下直接将前端 Vite 中间件挂载到 Express 上，实现单端口（3000）全栈联调。
5. **`vite.config.ts`**
   * **作用**：前端打包工具 Vite 的配置文件。配置了 React 插件与 Tailwind CSS (v4) 编译器插件，确保高效率和高性能。
6. **`tsconfig.json`**
   * **作用**：TypeScript 编译规则配置文件。规定了强类型检查的严厉程度，保证代码的生产环境安全。
7. **`index.html`**
   * **作用**：单页应用（SPA）的前端主 HTML 骨架，挂载 React 组件的根节点。

---

### 📁 前端核心源文件目录 (`/src`)

#### 📌 前端运行入口
* **`src/main.tsx`**：React 框架的初始化启动文件。将 `App.tsx` 渲染并绑定到 `index.html` 的 `root` 节点。
* **`src/index.css`**：全局样式表。通过 `@import "tailwindcss";` 引入新一代 Tailwind CSS 进行全响应式、精致的界面样式布局。

#### 📌 前端根组件
* **`src/App.tsx`**
   * **作用**：**前端应用的核心骨架与路由控制中心**。
   * **功能**：
     * 管理应用的主视图状态（导航在场景沙盘、提示词工作台、智能审计、SOP 结构化、校验核查清单等 5 大模块间平滑切换）。
     * 提供典雅、专业、富有制药工业质感的高对比度亮色界面，采用非对称网格结构。
     * 使用 `motion` 实现了各卡片间具有弹性物理质感的无缝进入动画。

#### 📌 数据与类型定义
* **`src/types.ts`**
   * **作用**：**数据模型与强类型声明中心**。
   * **功能**：定义了所有通用业务对象的 TypeScript 类型，包括聊天消息 (`ChatMessage`)、会话存档快照 (`SessionSnapshot`)、实时通知 (`NoticeItem`)、专家角色和 GAMP 核查项。这极大地减少了数据传递时的代码 Bug。
* **`src/data.ts`**
   * **作用**：**高质量的 GxP 预置知识库**。
   * **内容**：
     * 内置了真实的脱敏 SOP（如：偏差管理、设备 HPLC 清洁验证、无菌更衣规程、异常高压灭菌案例）。
     * 预置了 10 套工业标准的提示词（CRAFT 模型）。
     * 内置了制药生产 10 大最严苛的合规红线与痛点场景。

---

### 📁 精英前端功能组件目录 (`/src/components`)

这些组件相互独立又数据协同，彻底告别“单文件杂乱无章”，实现了规范的模块化架构：

1. **`Header.tsx`**
   * **功能**：顶层品牌合规导航。展示数字化药厂的身份、动态时钟、大模型激活状态指示灯以及模块切换栏。
2. **`GmpScenarios.tsx`** (GxP 场景价值地图)
   * **功能**：以制药工程“人、机、料、法、环”五大维度展开，可视化分析车间痛点，点击任何场景一键生成仿真偏差事件并传送至 AI 审计组件。
3. **`CraftPrompts.tsx`** (CRAFT 结构提示词对比工作台)
   * **功能**：提供五维结构化（**C**ontext 背景、**R**ole 角色、**A**ction 任务、**F**ormat 格式、**T**arget 目标）的深度演练。支持“普通野路子”提示词与“专业 CRAFT 提示词”的效果同屏左右对比，帮助小白感受提示词工程（Prompt Engineering）的巨大合规红利。
4. **`SopChunker.tsx`** (SOP 分块与向量库预处理)
   * **功能**：模拟真实大模型 RAG（检索增强生成）流程。可一键将几千字的原始 SOP 规则，打碎并抽取成可以直接供向量检索数据库使用的结构化 Q&A 键值对，支持一键保存与下载。
5. **`GampChecklist.tsx`** (GAMP 5 自动化验证与放行核查)
   * **功能**：提供覆盖软件、硬件、数据完整性、生命周期的自动化打勾核查。动态计算总完成度，在达成 100% 校验后触发炫酷的合规电子签名锁（e-Signature Chain）与区块哈希存证，展示制药行业 21 CFR Part 11 的严谨规范。
6. **`GmpAuditChat.tsx`** (💊 **重磅：5 模协同审计与任务工作区**)
   * **功能**：整个系统技术密度最高、功能最丰富的主交互面板：
     * **5种角色智能切换**：合规顾问、QA偏差专家、FDA法规审查员、技术报告撰写人、AI全能体。
     * **实时 SOP 知识库注入 (RAG)**：在右侧快速搜索 SOP 知识，点击「引用至提问」自动将 SOP 合规条款拼装到输入框，极大提升 AI 回答精度。
     * **会话快照归档**：可给当前会话添加标题、标签和看板状态，并一键本地保存。
     * **专家协同 Kanban 看板**：已保存的会话作为任务卡片在“待审查、调查中、CAPA规划、已闭环”四个节点流转，支持拖拽和一键流转。
     * **任务自动派单通知网**：任何看板流转、快照保存、报告导出，都会即时触发合规自动分发通知（模拟给设备主管、QA、验证组长派发 CAPA 工单），并滚动显示包含 SHA-256 完整性校验哈希的合规日志。
     * **导出结构化报告**：一键将快照和会话记录编译成包含审计哈希、对答纪要、风险级别划定、GAMP数据完整性分析、闭环 CAPA 决策与三级会签（制单、审核、批准）的精美 Markdown 合规报告，支持一键复制和本地 `.md` 文件下载。

---

## 💻 快速上手：小白本地运行指南

跟着以下步骤，在您自己的电脑上启动并深入学习此项目：

### 前置准备
确保您的电脑上已安装了 [Node.js](https://nodejs.org/) (建议版本 v18 或更高)。

### 1. 安装项目依赖
打开终端（Terminal）或命令行窗口，进入项目根目录，运行：
```bash
npm install
```

### 2. 复制并配置环境变量
在项目根目录复制 `.env.example` 文件并重命名为 `.env`：
```bash
cp .env.example .env
```
用编辑器打开 `.env` 并按前文说明填入您的 `GEMINI_API_KEY` 或者是 `OPENAI_API_KEY`（和 `OPENAI_BASE_URL` 等）。

### 3. 启动开发服务器
运行以下指令：
```bash
npm run dev
```
此时，终端会打印如下信息：
`[GxP Workbench Engine] Server running on port 3000`
打开浏览器访问：`http://localhost:3000` 即可看到精美的药厂合规工作区！

### 4. 生产打包构建 (部署前检测)
要打包出生产环境极度优化的静态资源和编译后端：
```bash
npm run build
```
打包完成后，您可以使用以下指令在本地测试生产环境启动：
```bash
npm run start
```

---

## ☁️ 部署上线指南

### 1. 部署到 Cloudflare Pages (零成本、超高性能 Serverless 边缘运行) ★★★★★ 强力推荐！
本项目已完美集成了 **Cloudflare Pages + Pages Functions** 架构。这意味着您无需准备和维护任何传统 Express 容器服务器，即可直接将本项目以**全栈 Serverless** 形式完全托管在 Cloudflare 全球边缘网络中，速度极快，且额度完全免费！

#### ⚙️ Cloudflare 部署步骤：
1. **关联 GitHub 仓库**：登录 Cloudflare Dashboard，选择 **Workers & Pages** -> **Pages** -> **Connect to Git**。
2. **选择构建配置**：
   * **Framework preset (框架预设)**: `Vite` 或 `None`
   * **Build command (构建命令)**: `npm run build`
   * **Build output directory (输出目录)**: `dist`
3. **配置环境变量 (核心 API 配置)**：
   在 Pages 创建完成后，进入 **Settings** -> **Environment variables** (环境变量)，在 **Production** 和 **Preview** 中添加您所需的真实 API Key 即可：
   * `GEMINI_API_KEY`: 您的谷歌 Gemini 密钥 (如方案 A)
   * `OPENAI_API_KEY`: 您的兼容 OpenAI / DeepSeek 密钥 (如方案 B)
   * `OPENAI_BASE_URL`: 第三方中转地址，例如 `https://api.deepseek.com/v1`
   * `OPENAI_MODEL_NAME`: 大模型名称，例如 `deepseek-chat`
4. **一键构建**：点击 **Save and Deploy**。

*💡 为什么这能完美工作？*
*我们特别在 `/functions/api/gemini/run.ts` 下创建了原生的 **Cloudflare Workers Edge Adaptor**。当您的 Vite 前端部署到 CF Pages 时，Cloudflare 会全自动识别该目录，将 API 请求网关挂载在边缘 Serverless V8 虚拟机中运行，实现零冷启动的高效安全代发！*

### 2. 部署到 Vercel (零配置、一键极速 Serverless 部署) ★★★★★ 强力推荐！
本项目同样完美集成了 **Vercel Serverless Functions** 架构。Vercel 能够极其敏捷地自动侦测项目并将其托管在全球高性能无服务器（Serverless）网络中，支持高并发并提供极速冷启动。

#### ⚙️ Vercel 部署步骤：
1. **一键导入**：登录 Vercel 仪表盘，点击 **Add New** -> **Project**，导入您的 GitHub 仓库。
2. **选择构建配置**：
   Vercel 会自动侦测到 Vite。
   * **Framework Preset (框架预设)**: `Vite`
   * **Build Command (构建命令)**: `npm run build`
   * **Output Directory (输出目录)**: `dist`
3. **配置环境变量 (Environment Variables)**：
   在 Vercel 项目设置页面的 **Environment Variables** 部分添加所需的 API 密钥：
   * `GEMINI_API_KEY`: 您的谷歌 Gemini 密钥 (方案 A)
   * `OPENAI_API_KEY`: 您的兼容 OpenAI / DeepSeek 密钥 (方案 B)
   * `OPENAI_BASE_URL`: 第三方中转地址，例如 `https://api.deepseek.com/v1`
   * `OPENAI_MODEL_NAME`: 大模型名称，例如 `deepseek-chat`
4. **点击 Deploy**：完成构建。

*💡 为什么这能完美工作？*
*我们特别在 `/api/gemini/run.ts` 目录下为 Vercel 编写了原生的 **Node.js Serverless Function Handler**，并配以 `vercel.json` 规则重写，这使得 Vercel 部署能够在后端无缝执行 API 转发，完全隐藏真实 API 密钥，保障药厂核心数据绝对安全！*

---

### 3. 部署到 Cloud Run (一键部署)
如果您使用的是 Google AI Studio 平台，直接点击右上角的 **Share** 或 **Deploy to Cloud Run**，系统会自动读取项目的 `package.json` 中的 `build` 与 `start` 指令，实现全自动的、无服务器（Serverless）云端弹性部署。

### 3. 使用 Docker 部署 (私有化部署)
由于本项目自带轻量高效的 Node 服务端 (`server.ts`)，因此可以极简 Docker 化。只需在根目录下创建 `Dockerfile`：
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```
构建并运行镜像：
```bash
docker build -t gxp-ai-workbench .
docker run -p 3000:3000 --env-file .env gxp-ai-workbench
```

---

## 💡 给开发者的 GxP AI 最佳实践建议

1. **输入即防御**：在 `GmpAuditChat.tsx` 中，您可以观察如何把法规约束作为 `systemInstruction`（系统围栏）注入大模型。在制药行业中，约束 AI 不胡说八道（防止幻觉）比激发 AI 创意更重要。
2. **结合 RAG 消除幻觉**：在向大模型提问偏差事件时，务必利用侧边栏的 **知识库检索**。将厂规 SOP 中具体的清洁限度、温度上下限、设备 ID 等先检索出来，再作为上下文（Context）投喂给大模型，这才是生产一线落地大模型的正确姿势。
3. **数据完整性（Data Integrity）第一**：观察 `GampChecklist.tsx` 中如何自动生成不可篡改的验证哈希。在数字合规的世界里，每一个人工决策和 AI 辅助决策都应当拥有完整的电子追踪审计踪迹（Audit Trail）。

祝你在数字化药厂的 AI 合规探索之旅中收获满满！如有问题，可查阅源码中优雅的逻辑实现。 🚀
