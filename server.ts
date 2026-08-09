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

      const systemPrompt = `Bạn là hệ thống AI nhận diện phiếu / bảng trả lời trắc nghiệm chuẩn xác dùng trong giáo dục Việt Nam.

Nhiệm vụ của bạn:
1. Phân tích thật kỹ ảnh phiếu trả lời / bảng đáp án được cung cấp.
   - LƯU Ý ĐẶC BIỆT VỀ HƯỚNG ẢNH VÀ MẪU BẢNG KẺ Ô CHỮ VIẾT TAY:
     + Bảng có thể bị xoay dọc 90 độ, nghiêng hoặc xoay ngược (do chụp bằng điện thoại). Bạn hãy nhận diện và đọc đúng nội dung dù ảnh bị xoay chiều nào.
     + Mẫu bảng viết tay thường có 2 hàng (hoặc nhiều ô): Hàng/Cột số thứ tự "Câu" (1, 2, 3, 4..., 12) và Hàng/Cột "Đáp án" chứa CHỮ VIẾT TAY (A, B, C, D, E) do học sinh điền vào ô.
     + Nhận diện chính xác chữ cái viết tay trong từng ô tương ứng với số câu. Học sinh có thể viết chữ hoa hoặc chữ thường (A/a, B/b, C/c, D/d, E/e). Chuyển tất cả về chữ HOA (A, B, C, D, E).
   - ĐỐI VỚI MẪU PHIẾU TÔ TRÒN (OMR): Nhận diện ô hình tròn được tô đen hoặc khoanh tròn.

2. Tìm và nhận diện Họ tên học sinh (studentName) và Lớp (className) nếu có ghi trên phiếu. Nếu không có hoặc mờ không đọc được, hãy trả về chuỗi rỗng "".
3. Nhận diện đầy đủ các câu trả lời từ câu 1 đến câu ${totalQuestions}.
   - Các phương án hợp lệ: "A", "B", "C", "D", "E".
   - Nếu ô đáp án bị bỏ trống, tẩy xóa mờ không rõ hoặc không ghi đáp án: trả về null cho answer.
   - Gán mức độ tin tưởng (confidence) từ 0.00 đến 1.00 cho mỗi câu hỏi dựa trên độ rõ nét của chữ viết tay hoặc vết tô.

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

Chỉ trả về đối tượng JSON hợp lệ, không bọc trong markdown block.`;

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

      let responseText = response.text || "";
      
      // Clean potential markdown wrap
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsedData;

      try {
        parsedData = JSON.parse(responseText);
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
