// backend/services/gemini.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

const PROMPT_TEMPLATE = `
Bạn là chuyên gia đánh giá phát âm tiếng Anh.

Dưới đây là đoạn người dùng đã đọc (chuyển từ giọng nói thành văn bản):
"""{{transcript}}"""

{{#if originalText}}
Đoạn này cần được so sánh với nội dung chuẩn sau:
"""{{originalText}}"""
{{/if}}

Hãy đánh giá phần đọc theo các tiêu chí sau (thang điểm 10):
- Phát âm
- Trọng âm và ngữ điệu
- Lưu loát
- Tốc độ
- Tổng thể

Chỉ trả về JSON đúng định dạng sau, không markdown, không giải thích:

{
  "scores": {
    "pronunciation": 8.5,
    "intonation": 7.0,
    "fluency": 8.0,
    "speed": 7.5,
    "overall": 7.8
  },
  "comment": "Bạn phát âm khá tốt nhưng cần cải thiện ngữ điệu và tốc độ ở đoạn cuối."
}
`;

function buildPrompt(transcript, originalText) {
  let prompt = PROMPT_TEMPLATE.replace("{{transcript}}", transcript);

  if (originalText) {
    prompt = prompt.replace("{{#if originalText}}", "");
    prompt = prompt.replace("{{originalText}}", originalText);
    prompt = prompt.replace("{{/if}}", "");
  } else {
    prompt = prompt.replace(/{{#if originalText}}[\s\S]*?{{\/if}}/, "");
  }

  return prompt;
}

async function scoreWithGemini(transcript, originalText = null) {
  const prompt = buildPrompt(transcript, originalText);

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🎯 Gemini response:", text);

    // 👉 Tách JSON thật từ block ```json ... ```
    let cleaned = text;
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) cleaned = match[1].trim();

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini:", err.response?.data || err.message);
    throw new Error("Không thể chấm điểm với Gemini");
  }
}

module.exports = { scoreWithGemini };
