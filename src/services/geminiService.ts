import { QuestionAnswer } from '../types';

export interface GeminiGradeResponse {
  success: boolean;
  studentName?: string;
  className?: string;
  answers: QuestionAnswer[];
  rawError?: string;
}

export async function gradeAnswerSheetWithGemini(
  imageBase64: string,
  totalQuestions: number = 10,
  customApiKey?: string
): Promise<GeminiGradeResponse> {
  try {
    const res = await fetch('/api/gemini/grade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        totalQuestions,
        customApiKey,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    let result: any;

    if (contentType.includes('application/json')) {
      result = await res.json();
    } else {
      const rawText = await res.text();
      console.error('Server returned non-JSON response:', rawText);
      
      if (res.status === 413) {
        throw new Error('Dung lượng ảnh quá lớn. Vui lòng chụp lại hoặc giảm kích thước ảnh.');
      } else if (res.status === 504 || res.status === 502) {
        throw new Error('Máy chủ phản hồi chậm hoặc hết thời gian chờ (Timeout). Vui lòng thử lại.');
      }

      throw new Error('Không thể nhận diện bảng phương án. Máy chủ phản hồi không phải JSON. Vui lòng kiểm tra lại API Key hoặc chụp lại ảnh.');
    }

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Lỗi khi kết nối với máy chủ AI Gemini.');
    }

    const data = result.data;

    // Standardize answers
    const answers: QuestionAnswer[] = (data.answers || []).map((ans: any, idx: number) => {
      const qNum = ans.question || idx + 1;
      const rawAns = ans.answer ? String(ans.answer).trim().toUpperCase() : null;
      const validAns = ['A', 'B', 'C', 'D', 'E'].includes(rawAns || '') ? (rawAns as any) : null;
      const conf = typeof ans.confidence === 'number' ? Math.max(0, Math.min(1, ans.confidence)) : 0.85;

      return {
        question: qNum,
        answer: validAns,
        confidence: conf,
        isUncertain: conf < 0.80 || validAns === null,
      };
    });

    // Fill missing questions up to totalQuestions if AI missed any index
    for (let i = 1; i <= totalQuestions; i++) {
      if (!answers.some((a) => a.question === i)) {
        answers.push({
          question: i,
          answer: null,
          confidence: 0.3,
          isUncertain: true,
        });
      }
    }

    answers.sort((a, b) => a.question - b.question);

    return {
      success: true,
      studentName: data.studentName || '',
      className: data.className || '',
      answers,
    };
  } catch (error: any) {
    console.error('Gemini Service Error:', error);

    // Fallback simulated recognition for DEMO mode or offline testing
    return {
      success: false,
      answers: [],
      rawError: error?.message || 'Không thể kết nối dịch vụ Gemini AI.',
    };
  }
}
