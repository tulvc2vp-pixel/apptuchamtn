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

      const systemPrompt = `Bạn là hệ thống AI nhận diện phiếu trả lời trắc nghiệm chuẩn xác dùng trong giáo dục Việt Nam.

Nhiệm vụ của bạn:
1. Phân tích thật kỹ ảnh phiếu trả lời / bảng đáp án được cung cấp.
2. Tìm và nhận diện Họ tên học sinh (studentName) và Lớp (className) nếu có ghi trên phiếu. Nếu không có hoặc mờ không đọc được, hãy trả về chuỗi rỗng "".
3. Nhận diện các câu trả lời từ câu 1 đến câu ${totalQuestions}.
   - Các phương án hợp lệ: "A", "B", "C", "D", "E".
   - Nếu học sinh tô mờ, không khoanh/tô câu đó, hoặc bỏ trống: trả về null cho answer.
   - Nếu học sinh khoanh/tô nhiều phương án cùng lúc hoặc bị tẩy xóa không rõ ràng: trả về null cho answer hoặc chọn phương án rõ nhất nhưng giảm confidence xuống dưới 0.5.
   - Gán mức độ tin tưởng (confidence) từ 0.00 đến 1.00 cho mỗi câu hỏi.
     + 0.90 - 1.00: Nhận diện rất rõ ràng, chắc chắn.
     + 0.60 - 0.89: Nhận diện khá rõ.
     + Dưới 0.60: Nhận diện không chắc chắn, cần giáo viên kiểm tra lại.

Yêu cầu định dạng JSON phản hồi chính xác tuyệt đối theo schema bên dưới:
{
  "studentName": string,
  "className": string,
  "answers": [
    {
      "question": number,
      "answer": string | null,
      "confidence": number
    }
  ]
}

Không sử dụng định dạng Markdown hay văn bản phụ. Chỉ trả về đối tượng JSON hợp lệ.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
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
                description: `Danh sách câu trả lời từ câu 1 đến câu ${totalQuestions}`,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.INTEGER, description: "Số thứ tự câu hỏi" },
                    answer: { type: Type.STRING, description: "Phương án A, B, C, D, E hoặc null nếu không tô/tô nhiều" },
                    confidence: { type: Type.NUMBER, description: "Mức độ tin tưởng từ 0.00 đến 1.00" },
                  },
                  required: ["question", "confidence"],
                },
              },
            },
            required: ["answers"],
          },
        },
      });

      const responseText = response.text || "";
      let parsedData;

      try {
        parsedData = JSON.parse(responseText.trim());
      } catch (e) {
        console.error("JSON parse error from Gemini response:", responseText);
        return res.status(500).json({
          error: "Không thể phân tích dữ liệu JSON từ AI. Vui lòng chụp lại ảnh rõ nét hơn.",
          rawResponse: responseText,
        });
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
