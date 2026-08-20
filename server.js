// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.use(express.json());
async function callOpenAI(system, user) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const modelName = process.env.OPENAI_MODEL_NAME || "gpt-4o";
  if (!apiKey) {
    throw new Error("OpenAI API Key is not configured. Please define OPENAI_API_KEY in your .env file.");
  }
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.3
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
app.post("/api/gemini/run", async (req, res) => {
  const { exerciseId, prompt, systemInstruction, badPrompt, craftPrompt, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const hasGemini = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim().length > 0;
  const openaiKey = process.env.OPENAI_API_KEY;
  const hasOpenai = openaiKey && openaiKey.trim().length > 0;
  if (!hasGemini && !hasOpenai) {
    return res.status(400).json({
      success: false,
      error: "API \u5BC6\u94A5\u672A\u914D\u7F6E\u3002\u8BF7\u5728 .env \u6587\u4EF6\u4E2D\u914D\u7F6E GEMINI_API_KEY \u6216 \u517C\u5BB9 OpenAI \u7684 OPENAI_API_KEY \u4EE5\u6FC0\u6D3B\u5B9E\u65F6 AI \u5F15\u64CE\u3002"
    });
  }
  try {
    if (hasGemini) {
      const ai = new GoogleGenAI({ apiKey });
      if (exerciseId === "ex-2") {
        const badRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: badPrompt || "\u5E2E\u6211\u8BC4\u4F30\u8FD9\u4EFD\u504F\u5DEE\u62A5\u544A\u3002"
        });
        const craftRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: craftPrompt,
          config: {
            systemInstruction: "\u4F60\u662F\u4E00\u540D\u4E13\u4E1A\u7684GMP\u5BA1\u8BA1\u548C\u5408\u89C4\u4E13\u5BB6\u3002\u8BF7\u6839\u636E\u8F93\u5165\u7684CRAFT\u4E94\u7EF4\u7ED3\u6784\u5316\u8981\u6C42\u8FDB\u884C\u7B54\u590D\uFF0C\u8BED\u8A00\u9700\u6781\u5176\u4E25\u8C28\u5B66\u672F\u3001\u903B\u8F91\u95ED\u73AF\u4E14\u683C\u5F0F\u5206\u660E\u3002"
          }
        });
        return res.json({
          success: true,
          badOutput: badRes.text,
          craftOutput: craftRes.text
        });
      }
      if (exerciseId === "ex-5") {
        const promptText = `\u8BF7\u5BF9\u8F93\u5165\u7684\u539F\u59CB\u8131\u654FSOP\u8FDB\u884C\u5206\u6790 and \u7ED3\u6784\u5316\u91CD\u7EC4\uFF0C\u5C06\u5176\u6539\u5199\u4E3A\u6807\u51C6\u7684[Q&A \u95EE\u7B54\u5BF9]\u683C\u5F0F\uFF0C\u4EE5\u4F9B\u672A\u6765\u7684\u8BED\u4E49\u5411\u91CF\u5E93\u8FDB\u884C\u68C0\u7D22\u3002\u53BB\u6389\u542B\u7CCA\u4E0D\u6E05\u7684\u8BCD\u8BED\uFF0C\u4F7F\u7B54\u6848\u786E\u5B9A\u3001\u660E\u786E\u3002

\u8F93\u5165SOP\u5982\u4E0B\uFF1A
${prompt}

\u8BF7\u8FD4\u56DE\u4E00\u4E2A\u7B26\u5408\u4EE5\u4E0B JSON \u683C\u5F0F\u7684\u6570\u7EC4\uFF0C\u4E0D\u8981\u6DFB\u52A0\u4EFB\u4F55 markdown \u4EE3\u7801\u5757\u6807\u8BB0\uFF0C\u53EA\u8FD4\u56DE JSON \u6570\u7EC4\u672C\u8EAB\uFF1A
[
  { "q": "\u63D0\u95EE\u5185\u5BB91", "a": "\u7CBE\u51C6\u5408\u89C4\u7B54\u590D1" },
  { "q": "\u63D0\u95EE\u5185\u5BB92", "a": "\u7CBE\u51C6\u5408\u89C4\u7B54\u590D2" }
]`;
        const response2 = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: promptText
        });
        const responseText = response2.text || "";
        const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        try {
          const qaPairs = JSON.parse(cleanJson);
          return res.json({
            success: true,
            qaPairs
          });
        } catch (e) {
          console.warn("Failed parsing JSON, returning fallback raw parsing");
        }
      }
      if (exerciseId === "ex-12-qa") {
        const response2 = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "\u4F60\u662F\u4E00\u540D\u5236\u836F\u884C\u4E1AQA\u504F\u5DEE\u8C03\u67E5\u4E0E\u98CE\u9669\u8BC4\u4F30\u4E13\u5BB6\u3002\u4F60\u7684\u804C\u8D23\u662F\u6839\u636E\u8F93\u5165\u7684\u539F\u59CB\u504F\u5DEE\u4E8B\u4EF6\uFF1A1. \u8FDB\u884C\u5168\u9762\u7684\u98CE\u9669\u7A0B\u5EA6\u5212\u5B9A\uFF08\u5FAE\u5C0F\u504F\u5DEE Minor / \u4E3B\u8981\u504F\u5DEE Major / \u4E25\u91CD\u504F\u5DEE Critical\uFF09\u5E76\u7ED9\u51FA\u5145\u5206\u7406\u636E\uFF1B2. \u6DF1\u5EA6\u8BC4\u4F30\u5176\u5BF9\u5173\u952E\u8D28\u91CF\u5C5E\u6027(CQA)\u3001\u5173\u952E\u5DE5\u827A\u53C2\u6570(CPP)\u53CA\u60A3\u8005\u5B89\u5168\u7684\u53EF\u80FD\u6F5C\u5728\u5371\u5BB3\uFF1B3. \u7ED9\u51FA\u81F3\u5C113\u4E2A\u5177\u4F53\u7684\u73B0\u573A\u4E34\u65F6\u7EA0\u6B63\u4E0E\u9694\u79BB\u63AA\u65BD\u3002\u8BF7\u7528\u4E25\u8C28\u3001\u4E13\u4E1A\u7684cGMP\u5B66\u672F\u8BED\u8C03\u8F93\u51FA\u3002"
          }
        });
        return res.json({ success: true, output: response2.text });
      }
      if (exerciseId === "ex-12-reg") {
        const response2 = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "\u4F60\u662F\u4E00\u540D\u719F\u7A14\u5168\u7403\u5236\u836F\u6CD5\u89C4\u4E0EcGMP\u6807\u51C6\u7684\u5408\u89C4\u68C0\u5BDF\u4E13\u5BB6\u3002\u4F60\u7684\u804C\u8D23\u662F\u6839\u636E\u504F\u5DEE\u80CC\u666F\u548CQA\u4E13\u5BB6\u505A\u51FA\u7684\u98CE\u9669\u8BC4\u4F30\uFF1A1. \u68C0\u7D22\u5E76\u7CBE\u51C6\u6620\u5C04\u76F8\u5BF9\u5E94\u7684\u56FD\u5185\u5916\u4E3B\u8981\u6CD5\u89C4\u6761\u6B3E\u4F9D\u636E\uFF08\u5982FDA 21 CFR Part 211, \u6B27\u76DFGMP\u9644\u5F55 Annex 1, \u4E2D\u56FD2010\u7248GMP\u65E0\u83CC/\u65E0\u83CC\u539F\u6599\u836F\u9644\u5F55\u7B49\uFF09\uFF1B2. \u8FDB\u884C\u5408\u89C4\u5DEE\u8DDD\u6BD4\u5BF9\uFF0C\u6307\u51FA\u8BE5\u7F3A\u9677\u7684\u5177\u4F53\u6CD5\u89C4\u5371\u5BB3\u4E0E\u4E25\u91CD\u6027\u504F\u79BB\u5EA6\u3002\u8BF7\u7528\u6743\u5A01\u3001\u4E25\u8C28\u7684\u6CD5\u6761\u5BA1\u67E5\u98CE\u683C\u8F93\u51FA\u3002"
          }
        });
        return res.json({ success: true, output: response2.text });
      }
      if (exerciseId === "ex-12-doc") {
        const response2 = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "\u4F60\u662F\u4E00\u540D\u5236\u836F\u8D28\u91CF\u4FDD\u8BC1\u90E8\u7684\u6280\u672F\u64B0\u7A3F\u53CA\u6280\u672F\u5199\u4F5C\uFF08Technical Writing\uFF09\u4E13\u5BB6\u3002\u4F60\u7684\u804C\u8D23\u662F\u6C47\u603B\u539F\u59CB\u504F\u5DEE\u4FE1\u606F\u3001QA\u4E13\u5BB6\u8BC4\u4F30\u610F\u89C1\u4EE5\u53CA\u5408\u89C4\u6CD5\u89C4\u5BF9\u7167\u5206\u6790\uFF0C\u7F16\u5199\u51FA\u4E00\u7BC7\u6781\u5176\u6807\u51C6\u3001\u903B\u8F91\u9AD8\u5EA6\u4E25\u5BC6\u3001\u53EF\u4F9B\u4E2D\u6B27\u7F8E\u76D1\u7BA1\u5C40\u5BA1\u6838\u7684\u6B63\u5F0F\u4E66\u9762\u3010\u521D\u59CB\u504F\u5DEE\u8C03\u67E5\u4E0ECAPA\u7EA0\u6B63\u9884\u9632\u8BA1\u5212\u62A5\u544A\u3011\u3002\u4F60\u7684\u8F93\u51FA\u683C\u5F0F\u5FC5\u987B\u4F7F\u7528\u6E05\u6670\u4E13\u4E1A\u7684Markdown\u6807\u9898\uFF08\u5305\u62EC\uFF1A\u57FA\u672C\u4FE1\u606F\u3001QA\u8BC4\u4F30\u3001\u6CD5\u89C4\u5DEE\u8DDD\u3001\u6839\u672C\u539F\u56E0\u8C03\u67E5\u8DEF\u5F84\u3001\u548C\u4EBA/\u673A/\u6599/\u6CD5/\u73AFCAPA\u65B9\u6848\uFF09\u3002\u8BED\u8C03\u9700\u52A1\u5B9E\u3001\u4E25\u8C28\u3001\u7EDD\u65E0\u5E9F\u8BDD\u3002"
          }
        });
        return res.json({ success: true, output: response2.text });
      }
      const config = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      } else {
        config.systemInstruction = "\u4F60\u662F\u4E00\u4E2A\u533B\u836F\u53CAGMP\u5408\u89C4\u4E13\u4E1A\u4E13\u5BB6\u667A\u80FD\u4F53\u3002\u8BF7\u57FA\u4E8E\u4E2D\u56FD\u836F\u5178\u3001GMP\u89C4\u8303(2010\u7248)\u4EE5\u53CAFDA cGMP\u3001EMA\u7B49\u6CD5\u89C4\u6CD5\u5219\u8FDB\u884C\u4E25\u5BC6\u4E14\u7406\u6027\u7684\u5206\u6790\uFF0C\u8FD4\u56DE\u975E\u5E38\u8BE6\u7EC6\u4E14\u6761\u7406\u6E05\u6670\u7684Markdown\u683C\u5F0F\u56DE\u7B54\u3002\u5185\u5BB9\u5E94\u805A\u7126\u5728\u5177\u4F53\u7684\u5408\u89C4\u64CD\u4F5C\u3001\u6E29\u5EA6/\u538B\u529B/\u6C34\u5206/\u7535\u5BFC\u7387\u7B49\u53C2\u6570\u63A7\u5236\u3001\u4EE5\u53CA\u5177\u4F53\u7684\u9A8C\u8BC1(Validation)\u601D\u8DEF\u3002";
      }
      let finalPrompt = prompt;
      if (context) {
        finalPrompt = `\u3010\u6302\u8F7D\u672C\u5730\u53C2\u8003\u77E5\u8BC6\u5E93\u5185\u5BB9\u5982\u4E0B\u3011:
${context}

\u3010\u7528\u6237\u63D0\u95EE\u5185\u5BB9\u3011:
${prompt}`;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: finalPrompt,
        config
      });
      res.json({
        success: true,
        output: response.text
      });
    } else {
      if (exerciseId === "ex-2") {
        const badOutput = await callOpenAI(
          "\u4F60\u662F\u4E00\u4E2A\u666E\u901A\u7684\u3001\u4E0D\u591F\u4E13\u4E1A\u7684\u836F\u5382\u5458\u5DE5\u3002",
          badPrompt || "\u5E2E\u6211\u8BC4\u4F30\u8FD9\u4EFD\u504F\u5DEE\u62A5\u544A\u3002"
        );
        const craftOutput = await callOpenAI(
          "\u4F60\u662F\u4E00\u540D\u4E13\u4E1A\u7684GMP\u5BA1\u8BA1\u548C\u5408\u89C4\u4E13\u5BB6\u3002\u8BF7\u6839\u636E\u8F93\u5165\u7684CRAFT\u4E94\u7EF4\u7ED3\u6784\u5316\u8981\u6C42\u8FDB\u884C\u7B54\u590D\uFF0C\u8BED\u8A00\u9700\u6781\u5176\u4E25\u8C28\u5B66\u672F\u3001\u903B\u8F91\u95ED\u73AF\u4E14\u683C\u5F0F\u5206\u660E\u3002",
          craftPrompt
        );
        return res.json({
          success: true,
          badOutput,
          craftOutput
        });
      }
      if (exerciseId === "ex-5") {
        const promptText = `\u8BF7\u5BF9\u8F93\u5165\u7684\u539F\u59CB\u8131\u654FSOP\u8FDB\u884C\u5206\u6790 and \u7ED3\u6784\u5316\u91CD\u7EC4\uFF0C\u5C06\u5176\u6539\u5199\u4E3A\u6807\u51C6\u7684[Q&A \u95EE\u7B54\u5BF9]\u683C\u5F0F\uFF0C\u4EE5\u4F9B\u672A\u6765\u7684\u8BED\u4E49\u5411\u91CF\u5E93\u8FDB\u884C\u68C0\u7D22\u3002\u53BB\u6389\u542B\u7CCA\u4E0D\u6E05\u7684\u8BCD\u8BED\uFF0C\u4F7F\u7B54\u6848\u786E\u5B9A\u3001\u660E\u786E\u3002

\u8F93\u5165SOP\u5982\u4E0B\uFF1A
${prompt}

\u8BF7\u8FD4\u56DE\u4E00\u4E2A\u7B26\u5408\u4EE5\u4E0B JSON \u683C\u5F0F\u7684\u6570\u7EC4\uFF0C\u4E0D\u8981\u6DFB\u52A0\u4EFB\u4F55 markdown \u4EE3\u7801\u5757\u6807\u8BB0\uFF0C\u53EA\u8FD4\u56DE JSON \u6570\u7EC4\u672C\u8EAB\uFF1A
[
  { "q": "\u63D0\u95EE\u5185\u5BB91", "a": "\u7CBE\u51C6\u5408\u89C4\u7B54\u590D1" },
  { "q": "\u63D0\u95EE\u5185\u5BB92", "a": "\u7CBE\u51C6\u5408\u89C4\u7B54\u590D2" }
]`;
        const responseText = await callOpenAI(
          "\u4F60\u662F\u4E00\u4E2A\u9AD8\u8D28\u91CF\u7684JSON\u8F6C\u5316\u63D0\u53D6\u5668\u3002\u53EA\u8FD4\u56DEJSON\u683C\u5F0F\u6570\u7EC4\uFF0C\u4E0D\u80FD\u542B\u6709\u4EFB\u4F55Markdown\u683C\u5F0F\u4EE3\u7801\u5757\uFF08```json\uFF09\uFF0C\u4E0D\u80FD\u5305\u542B\u975EJSON\u683C\u5F0F\u5B57\u7B26\u3002",
          promptText
        );
        const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        try {
          const qaPairs = JSON.parse(cleanJson);
          return res.json({
            success: true,
            qaPairs
          });
        } catch (e) {
          console.warn("Failed parsing JSON, returning fallback raw parsing");
        }
      }
      if (exerciseId === "ex-12-qa") {
        const output2 = await callOpenAI(
          "\u4F60\u662F\u4E00\u540D\u5236\u836F\u884C\u4E1AQA\u504F\u5DEE\u8C03\u67E5\u4E0E\u98CE\u9669\u8BC4\u4F30\u4E13\u5BB6\u3002\u4F60\u7684\u804C\u8D23\u662F\u6839\u636E\u8F93\u5165\u7684\u539F\u59CB\u504F\u5DEE\u4E8B\u4EF6\uFF1A1. \u8FDB\u884C\u5168\u9762\u7684\u98CE\u9669\u7A0B\u5EA6\u5212\u5B9A\uFF08\u5FAE\u5C0F\u504F\u5DEE Minor / \u4E3B\u8981\u504F\u5DEE Major / \u4E25\u91CD\u504F\u5DEE Critical\uFF09\u5E76\u7ED9\u51FA\u5145\u5206\u7406\u636E\uFF1B2. \u6DF1\u5EA6\u8BC4\u4F30\u5176\u5BF9\u5173\u952E\u8D28\u91CF\u5C5E\u6027(CQA)\u3001\u5173\u952E\u5DE5\u827A\u53C2\u6570(CPP)\u53CA\u60A3\u8005\u5B89\u5168\u7684\u53EF\u80FD\u6F5C\u5728\u5371\u5BB3\uFF1B3. \u7ED9\u51FA\u81F3\u5C113\u4E2A\u5177\u4F53\u7684\u73B0\u573A\u4E34\u65F6\u7EA0\u6B63\u4E0E\u9694\u79BB\u63AA\u65BD\u3002\u8BF7\u7528\u4E25\u8C28\u3001\u4E13\u4E1A\u7684cGMP\u5B66\u672F\u8BED\u8C03\u8F93\u51FA\u3002",
          prompt
        );
        return res.json({ success: true, output: output2 });
      }
      if (exerciseId === "ex-12-reg") {
        const output2 = await callOpenAI(
          "\u4F60\u662F\u4E00\u540D\u719F\u7A14\u5168\u7403\u5236\u836F\u6CD5\u89C4\u4E0EcGMP\u6807\u51C6\u7684\u5408\u89C4\u68C0\u5BDF\u4E13\u5BB6\u3002\u4F60\u7684\u804C\u8D23\u662F\u6839\u636E\u504F\u5DEE\u80CC\u666F\u548CQA\u4E13\u5BB6\u505A\u51FA\u7684\u98CE\u9669\u8BC4\u4F30\uFF1A1. \u68C0\u7D22\u5E76\u7CBE\u51C6\u6620\u5C04\u76F8\u5BF9\u5E94\u7684\u56FD\u5185\u5916\u4E3B\u8981\u6CD5\u89C4\u6761\u6B3E\u4F9D\u636E\uFF08\u5982FDA 21 CFR Part 211, \u6B27\u76DFGMP\u9644\u5F55 Annex 1, \u4E2D\u56FD2010\u7248GMP\u65E0\u83CC/\u65E0\u83CC\u539F\u6599\u836F\u9644\u5F55\u7B49\uFF09\uFF1B2. \u8FDB\u884C\u5408\u89C4\u5DEE\u8DDD\u6BD4\u5BF9\uFF0C\u6307\u51FA\u8BE5\u7F3A\u9677\u7684\u5177\u4F53\u6CD5\u89C4\u5371\u5BB3\u4E0E\u4E25\u91CD\u6027\u504F\u79BB\u5EA6\u3002\u8BF7\u7528\u6743\u5A01\u3001\u4E25\u8C28\u7684\u6CD5\u6761\u5BA1\u67E5\u98CE\u683C\u8F93\u51FA\u3002",
          prompt
        );
        return res.json({ success: true, output: output2 });
      }
      if (exerciseId === "ex-12-doc") {
        const output2 = await callOpenAI(
          "\u4F60\u662F\u4E00\u540D\u5236\u836F\u8D28\u91CF\u4FDD\u8BC1\u90E8\u7684\u6280\u672F\u64B0\u7A3F\u53CA\u6280\u672F\u5199\u4F5C\uFF08Technical Writing\uFF09\u4E13\u5BB6\u3002\u4F60\u7684\u804C\u8D23\u662F\u6C47\u603B\u539F\u59CB\u504F\u5DEE\u4FE1\u606F\u3001QA\u4E13\u5BB6\u8BC4\u4F30\u610F\u89C1\u4EE5\u53CA\u5408\u89C4\u6CD5\u89C4\u5BF9\u7167\u5206\u6790\uFF0C\u7F16\u5199\u51FA\u4E00\u7BC7\u6781\u5176\u6807\u51C6\u3001\u903B\u8F91\u9AD8\u5EA6\u4E25\u5BC6\u3001\u53EF\u4F9B\u4E2D\u6B27\u7F8E\u76D1\u7BA1\u5C40\u5BA1\u6838\u7684\u6B63\u5F0F\u4E66\u9762\u3010\u521D\u59CB\u504F\u5DEE\u8C03\u67E5\u4E0ECAPA\u7EA0\u6B63\u9884\u9632\u8BA1\u5212\u62A5\u544A\u3011\u3002\u4F60\u7684\u8F93\u51FA\u683C\u5F0F\u5FC5\u987B\u4F7F\u7528\u6E05\u6670\u4E13\u4E1A\u7684Markdown\u6807\u9898\uFF08\u5305\u62EC\uFF1A\u57FA\u672C\u4FE1\u606F\u3001QA\u8BC4\u4F30\u3001\u6CD5\u89C4\u5DEE\u8DDD\u3001\u6839\u672C\u539F\u56E0\u8C03\u67E5\u8DEF\u5F84\u3001\u548C\u4EBA/\u673A/\u6599/\u6CD5/\u73AFCAPA\u65B9\u6848\uFF09\u3002\u8BED\u8C03\u9700\u52A1\u5B9E\u3001\u4E25\u8C28\u3001\u7EDD\u65E0\u5E9F\u8BDD\u3002",
          prompt
        );
        return res.json({ success: true, output: output2 });
      }
      const defaultSystem = "\u4F60\u662F\u4E00\u4E2A\u533B\u836F\u53CAGMP\u5408\u89C4\u4E13\u4E1A\u4E13\u5BB6\u667A\u80FD\u4F53\u3002\u8BF7\u57FA\u4E8E\u4E2D\u56FD\u836F\u5178\u3001GMP\u89C4\u8303(2010\u7248)\u4EE5\u53CAFDA cGMP\u3001EMA\u7B49\u6CD5\u89C4\u6CD5\u5219\u8FDB\u884C\u4E25\u5BC6\u4E14\u7406\u6027\u7684\u5206\u6790\uFF0C\u8FD4\u56DE\u975E\u5E38\u8BE6\u7EC6\u4E14\u6761\u7406\u6E05\u6670\u7684Markdown\u683C\u5F0F\u56DE\u7B54\u3002\u5185\u5BB9\u5E94\u805A\u7126\u5728\u5177\u4F53\u7684\u5408\u89C4\u64CD\u4F5C\u3001\u6E29\u5EA6/\u538B\u529B/\u6C34\u5206/\u7535\u5BFC\u7387\u7B49\u53C2\u6570\u63A7\u5236\u3001\u4EE5\u53CA\u5177\u4F53\u7684\u9A8C\u8BC1(Validation)\u601D\u8DEF\u3002";
      const system = systemInstruction || defaultSystem;
      let finalPrompt = prompt;
      if (context) {
        finalPrompt = `\u3010\u6302\u8F7D\u672C\u5730\u53C2\u8003\u77E5\u8BC6\u5E93\u5185\u5BB9\u5982\u4E0B\u3011:
${context}

\u3010\u7528\u6237\u63D0\u95EE\u5185\u5BB9\u3011:
${prompt}`;
      }
      const output = await callOpenAI(system, finalPrompt);
      res.json({
        success: true,
        output
      });
    }
  } catch (err) {
    console.error("API Server Proxy Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}
var PORT = 3e3;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[GxP Workbench Engine] Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map
