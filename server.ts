import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", appName: "Chấm Trắc Nghiệm AI" });
  });

  // AI Gemini Vision Grading endpoint
  app.post("/api/gemini/grade", async (req, res) => {
    try {
      const { imageBase64, totalQuestions = 10, customApiKey } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Thiếu dữ liệu ảnh base64." });
      }

      // Use client-provided API key from settings or system process.env.GEMINI_API_KEY
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "Chưa cấu hình Gemini API Key. Vui lòng nhập API Key trong mục Cài Đặt hoặc sử dụng chế độ Demo."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Format clean base64 data without data:image/png;base64 prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const systemPrompt = `Bạn là hệ thống AI Chấm Trắc Nghiệm Thông Minh chuyên nhận diện bảng/phiếu trả lời bài làm của học sinh tại Việt Nam.

Nhiệm vụ chính: Phân tích ảnh và đọc chính xác tất cả phương án học sinh điền/chọn cho từng câu hỏi.

ĐẶC BIỆT CHÚ Ý VỀ MẪU BẢNG KẺ Ô CHỮ VIẾT TAY (MẪU BẢNG PHỔ BIẾN NHẤT):
- Bảng trả lời gồm các ô kẻ bảng hình chữ nhật:
  + Hàng/Cột 1 (Tiêu đề "Câu"): Chứa số thứ tự các câu hỏi (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, ...).
  + Hàng/Cột 2 (Tiêu đề "Đáp án"): Chứa chữ cái VIẾT TAY do học sinh tự điền vào ô bên dưới số câu tương ứng (A, B, C, D, E, a, b, c, d, e).
  Ví dụ cụ thể: Dưới số 1 là "A", dưới số 2 là "B", dưới số 3 là "C", dưới số 4 là "B", ...
- Xử lý hướng ảnh: Bảng có thể bị xoay dọc 90 độ, xoay ngang, nghiêng hoặc ngược. Hãy xoay ảnh trong tư duy để đọc chính xác hàng "Câu" và hàng "Đáp án".
- Nhận diện đầy đủ tất cả các ô câu hỏi có trong bảng (dù là 10, 12, 20 hay 50 câu).

ĐỐI VỚI PHIẾU TÔ TRÒN (OMR):
- Nhận diện ô hình tròn được tô đen hoặc khoanh tròn cho từng câu hỏi.

QUY TẮC PHÂN TÍCH VÀ ĐẦU RA:
1. Nhận diện các chữ cái viết tay và chuẩn hóa thành chữ IN HOA: "A", "B", "C", "D", "E".
2. Nếu ô đáp án bên dưới số câu bị bỏ trống, không viết hoặc gạch xóa không rõ: trả về chuỗi rỗng "".
3. Nhận diện Họ và tên học sinh (studentName) và Lớp (className) nếu có trên phiếu, nếu không có trả về "".
4. Đánh giá mức độ tin tưởng (confidence) từ 0.00 đến 1.00 cho mỗi câu.

Trả về phản hồi đúng định dạng JSON thuần túy (không dùng markdown codeblock):
{
  "studentName": string,
  "className": string,
  "answers": [
    {
      "question": number,
      "answer": string,
      "confidence": number
    }
  ]
}`;

      let response: any;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64,
                },
              },
              {
                text: systemPrompt,
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                studentName: { type: Type.STRING, description: "Họ và tên học sinh nếu nhận diện được" },
                className: { type: Type.STRING, description: "Lớp học nếu nhận diện được" },
                answers: {
                  type: Type.ARRAY,
                  description: `Danh sách câu trả lời nhận diện được trong bảng`,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.INTEGER, description: "Số thứ tự câu hỏi" },
                      answer: { type: Type.STRING, description: "Phương án A, B, C, D, E hoặc chuỗi rỗng nếu bỏ trống" },
                      confidence: { type: Type.NUMBER, description: "Mức độ tin tưởng từ 0.00 đến 1.00" },
                    },
                    required: ["question", "answer", "confidence"],
                  },
                },
              },
              required: ["answers"],
            },
          },
        });
      } catch (geminiErr: any) {
        console.warn("Primary gemini-2.5-flash failed, attempting fallback to gemini-2.0-flash...", geminiErr);
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64,
                },
              },
              {
                text: systemPrompt,
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
          },
        });
      }

      let responseText = response.text || "";
      
      // Clean potential markdown wrap or weird leading text
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsedData: any;

      try {
        parsedData = JSON.parse(responseText);
      } catch (e: any) {
        console.error("JSON parse error from Gemini response:", responseText);
        return res.status(500).json({
          error: "Không thể phân tích dữ liệu từ AI. Vui lòng chụp lại ảnh rõ nét hoặc kiểm tra lại góc chụp.",
          rawResponse: responseText,
        });
      }

      // Normalize answers map to guarantee complete answer array
      if (parsedData && Array.isArray(parsedData.answers)) {
        const answerMap = new Map<number, { answer: string | null; confidence: number }>();
        
        parsedData.answers.forEach((item: any) => {
          const qNum = Number(item.question);
          let ans = item.answer;
          if (typeof ans === 'string') {
            ans = ans.trim().toUpperCase();
            if (ans === '' || ans === 'NULL' || ans === 'NONE' || ans === 'TRỐNG') {
              ans = null;
            }
          } else {
            ans = null;
          }
          if (!isNaN(qNum) && qNum > 0) {
            answerMap.set(qNum, {
              answer: ans,
              confidence: typeof item.confidence === 'number' ? item.confidence : 0.95,
            });
          }
        });

        const detectedMaxQ = Math.max(...Array.from(answerMap.keys()), 0);
        const finalMaxQ = Math.max(detectedMaxQ, Number(totalQuestions) || 12);

        const normalizedAnswers = [];
        for (let i = 1; i <= finalMaxQ; i++) {
          if (answerMap.has(i)) {
            const entry = answerMap.get(i)!;
            normalizedAnswers.push({
              question: i,
              answer: entry.answer,
              confidence: entry.confidence,
            });
          } else {
            normalizedAnswers.push({
              question: i,
              answer: null,
              confidence: 0.50,
            });
          }
        }

        parsedData.answers = normalizedAnswers;
      }

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error("Gemini Vision API error:", error);
      res.status(500).json({
        error: error?.message || "Không thể kết nối với dịch vụ Gemini AI. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.",
      });
    }
  });

  // Vite development middleware vs Static Production serving
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Chấm Trắc Nghiệm AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
