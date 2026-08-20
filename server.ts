import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Helper function to call OpenAI-compatible API using native fetch
async function callOpenAI(system: string, user: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const modelName = process.env.OPENAI_MODEL_NAME || 'gpt-4o';

  if (!apiKey) {
    throw new Error('OpenAI API Key is not configured. Please define OPENAI_API_KEY in your .env file.');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// API route to proxy Gemini calls and keep API Key hidden on Server-Side
app.post('/api/gemini/run', async (req, res) => {
  const { exerciseId, prompt, systemInstruction, badPrompt, craftPrompt, context } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  const hasGemini = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0;
  const openaiKey = process.env.OPENAI_API_KEY;
  const hasOpenai = openaiKey && openaiKey.trim().length > 0;

  if (!hasGemini && !hasOpenai) {
    return res.status(400).json({ 
      success: false, 
      error: 'API 密钥未配置。请在 .env 文件中配置 GEMINI_API_KEY 或 兼容 OpenAI 的 OPENAI_API_KEY 以激活实时 AI 引擎。' 
    });
  }

  try {
    if (hasGemini) {
      const ai = new GoogleGenAI({ apiKey });

      // Handle exercise 2 (CRAFT) double side-by-side prompt comparison
      if (exerciseId === 'ex-2') {
        const badRes = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: badPrompt || '帮我评估这份偏差报告。'
        });
        
        const craftRes = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: craftPrompt,
          config: {
            systemInstruction: '你是一名专业的GMP审计和合规专家。请根据输入的CRAFT五维结构化要求进行答复，语言需极其严谨学术、逻辑闭环且格式分明。'
          }
        });

        return res.json({
          success: true,
          badOutput: badRes.text,
          craftOutput: craftRes.text
        });
      }

      // Handle exercise 5 (SOP QA pre-processing formatting)
      if (exerciseId === 'ex-5') {
        const promptText = `请对输入的原始脱敏SOP进行分析 and 结构化重组，将其改写为标准的[Q&A 问答对]格式，以供未来的语义向量库进行检索。去掉含糊不清的词语，使答案确定、明确。

输入SOP如下：
${prompt}

请返回一个符合以下 JSON 格式的数组，不要添加任何 markdown 代码块标记，只返回 JSON 数组本身：
[
  { "q": "提问内容1", "a": "精准合规答复1" },
  { "q": "提问内容2", "a": "精准合规答复2" }
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: promptText
        });

        const responseText = response.text || '';
        // Clean possible markdown backticks JSON wrapped blocks
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
          const qaPairs = JSON.parse(cleanJson);
          return res.json({
            success: true,
            qaPairs
          });
        } catch (e) {
          console.warn('Failed parsing JSON, returning fallback raw parsing');
          // Let client handle beautiful mock fallback if JSON parsing fails
        }
      }

      // Handle deviation expert QA specialist
      if (exerciseId === 'ex-12-qa') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: '你是一名制药行业QA偏差调查与风险评估专家。你的职责是根据输入的原始偏差事件：1. 进行全面的风险程度划定（微小偏差 Minor / 主要偏差 Major / 严重偏差 Critical）并给出充分理据；2. 深度评估其对关键质量属性(CQA)、关键工艺参数(CPP)及患者安全的可能潜在危害；3. 给出至少3个具体的现场临时纠正与隔离措施。请用严谨、专业的cGMP学术语调输出。'
          }
        });
        return res.json({ success: true, output: response.text });
      }

      // Handle deviation expert Regulatory specialist
      if (exerciseId === 'ex-12-reg') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: '你是一名熟稔全球制药法规与cGMP标准的合规检察专家。你的职责是根据偏差背景和QA专家做出的风险评估：1. 检索并精准映射相对应的国内外主要法规条款依据（如FDA 21 CFR Part 211, 欧盟GMP附录 Annex 1, 中国2010版GMP无菌/无菌原料药附录等）；2. 进行合规差距比对，指出该缺陷的具体法规危害与严重性偏离度。请用权威、严谨的法条审查风格输出。'
          }
        });
        return res.json({ success: true, output: response.text });
      }

      // Handle deviation expert Technical Writer
      if (exerciseId === 'ex-12-doc') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: '你是一名制药质量保证部的技术撰稿及技术写作（Technical Writing）专家。你的职责是汇总原始偏差信息、QA专家评估意见以及合规法规对照分析，编写出一篇极其标准、逻辑高度严密、可供中欧美监管局审核的正式书面【初始偏差调查与CAPA纠正预防计划报告】。你的输出格式必须使用清晰专业的Markdown标题（包括：基本信息、QA评估、法规差距、根本原因调查路径、和人/机/料/法/环CAPA方案）。语调需务实、严谨、绝无废话。'
          }
        });
        return res.json({ success: true, output: response.text });
      }

      // General GxP system instructions
      const config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      } else {
        config.systemInstruction = '你是一个医药及GMP合规专业专家智能体。请基于中国药典、GMP规范(2010版)以及FDA cGMP、EMA等法规法则进行严密且理性的分析，返回非常详细且条理清晰的Markdown格式回答。内容应聚焦在具体的合规操作、温度/压力/水分/电导率等参数控制、以及具体的验证(Validation)思路。';
      }

      let finalPrompt = prompt;
      if (context) {
        finalPrompt = `【挂载本地参考知识库内容如下】:\n${context}\n\n【用户提问内容】:\n${prompt}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: finalPrompt,
        config
      });

      res.json({
        success: true,
        output: response.text
      });

    } else {
      // Use OpenAI compatibility mode
      if (exerciseId === 'ex-2') {
        const badOutput = await callOpenAI(
          '你是一个普通的、不够专业的药厂员工。',
          badPrompt || '帮我评估这份偏差报告。'
        );
        const craftOutput = await callOpenAI(
          '你是一名专业的GMP审计和合规专家。请根据输入的CRAFT五维结构化要求进行答复，语言需极其严谨学术、逻辑闭环且格式分明。',
          craftPrompt
        );
        return res.json({
          success: true,
          badOutput,
          craftOutput
        });
      }

      if (exerciseId === 'ex-5') {
        const promptText = `请对输入的原始脱敏SOP进行分析 and 结构化重组，将其改写为标准的[Q&A 问答对]格式，以供未来的语义向量库进行检索。去掉含糊不清的词语，使答案确定、明确。

输入SOP如下：
${prompt}

请返回一个符合以下 JSON 格式的数组，不要添加任何 markdown 代码块标记，只返回 JSON 数组本身：
[
  { "q": "提问内容1", "a": "精准合规答复1" },
  { "q": "提问内容2", "a": "精准合规答复2" }
]`;

        const responseText = await callOpenAI(
          '你是一个高质量的JSON转化提取器。只返回JSON格式数组，不能含有任何Markdown格式代码块（```json），不能包含非JSON格式字符。',
          promptText
        );
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
          const qaPairs = JSON.parse(cleanJson);
          return res.json({
            success: true,
            qaPairs
          });
        } catch (e) {
          console.warn('Failed parsing JSON, returning fallback raw parsing');
        }
      }

      if (exerciseId === 'ex-12-qa') {
        const output = await callOpenAI(
          '你是一名制药行业QA偏差调查与风险评估专家。你的职责是根据输入的原始偏差事件：1. 进行全面的风险程度划定（微小偏差 Minor / 主要偏差 Major / 严重偏差 Critical）并给出充分理据；2. 深度评估其对关键质量属性(CQA)、关键工艺参数(CPP)及患者安全的可能潜在危害；3. 给出至少3个具体的现场临时纠正与隔离措施。请用严谨、专业的cGMP学术语调输出。',
          prompt
        );
        return res.json({ success: true, output });
      }

      if (exerciseId === 'ex-12-reg') {
        const output = await callOpenAI(
          '你是一名熟稔全球制药法规与cGMP标准的合规检察专家。你的职责是根据偏差背景和QA专家做出的风险评估：1. 检索并精准映射相对应的国内外主要法规条款依据（如FDA 21 CFR Part 211, 欧盟GMP附录 Annex 1, 中国2010版GMP无菌/无菌原料药附录等）；2. 进行合规差距比对，指出该缺陷的具体法规危害与严重性偏离度。请用权威、严谨的法条审查风格输出。',
          prompt
        );
        return res.json({ success: true, output });
      }

      if (exerciseId === 'ex-12-doc') {
        const output = await callOpenAI(
          '你是一名制药质量保证部的技术撰稿及技术写作（Technical Writing）专家。你的职责是汇总原始偏差信息、QA专家评估意见以及合规法规对照分析，编写出一篇极其标准、逻辑高度严密、可供中欧美监管局审核的正式书面【初始偏差调查与CAPA纠正预防计划报告】。你的输出格式必须使用清晰专业的Markdown标题（包括：基本信息、QA评估、法规差距、根本原因调查路径、和人/机/料/法/环CAPA方案）。语调需务实、严谨、绝无废话。',
          prompt
        );
        return res.json({ success: true, output });
      }

      // General query with OpenAI
      const defaultSystem = '你是一个医药及GMP合规专业专家智能体。请基于中国药典、GMP规范(2010版)以及FDA cGMP、EMA等法规法则进行严密且理性的分析，返回非常详细且条理清晰的Markdown格式回答。内容应聚焦在具体的合规操作、温度/压力/水分/电导率等参数控制、以及具体的验证(Validation)思路。';
      const system = systemInstruction || defaultSystem;
      let finalPrompt = prompt;
      if (context) {
        finalPrompt = `【挂载本地参考知识库内容如下】:\n${context}\n\n【用户提问内容】:\n${prompt}`;
      }

      const output = await callOpenAI(system, finalPrompt);
      res.json({
        success: true,
        output
      });
    }
  } catch (err: any) {
    console.error('API Server Proxy Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Developer environment mounting Vite
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[GxP Workbench Engine] Server running on port ${PORT}`);
});
