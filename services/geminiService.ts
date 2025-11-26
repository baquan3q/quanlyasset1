import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  if (!transactions || transactions.length === 0) {
    return {
      summary: "Chưa có dữ liệu giao dịch để phân tích.",
      tips: ["Hãy thêm giao dịch đầu tiên của bạn để nhận lời khuyên."],
      sentiment: "neutral"
    };
  }

  // Optimize payload size by mapping only necessary fields
  const dataSummary = transactions.map(t => `${t.date}: ${t.type} - ${t.amount} VND (${t.category}) - ${t.description}`).join('\n');
  
  const prompt = `
    Bạn là một chuyên gia tài chính cá nhân. Hãy phân tích dữ liệu giao dịch dưới đây và đưa ra nhận xét bằng tiếng Việt.
    Dữ liệu:
    ${dataSummary}

    Hãy trả về JSON theo cấu trúc sau:
    {
      "summary": "Tóm tắt ngắn gọn về tình hình tài chính (dưới 50 từ)",
      "tips": ["Lời khuyên 1", "Lời khuyên 2", "Lời khuyên 3"],
      "sentiment": "positive" | "neutral" | "negative" (dựa trên sức khỏe tài chính)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "Không thể kết nối với chuyên gia AI lúc này.",
      tips: ["Vui lòng thử lại sau."],
      sentiment: "neutral"
    };
  }
};

export const suggestCategory = async (description: string): Promise<string> => {
  if (!description) return "";

  const prompt = `
    Dựa trên mô tả giao dịch: "${description}", hãy gợi ý một danh mục chi tiêu/thu nhập phù hợp nhất từ danh sách sau:
    [Ăn uống, Di chuyển, Nhà cửa, Mua sắm, Giải trí, Sức khỏe, Giáo dục, Hóa đơn & Tiện ích, Lương, Thưởng, Đầu tư, Khác].
    Chỉ trả về tên danh mục duy nhất, không có thêm văn bản nào khác.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    return response.text?.trim() || "Khác";
  } catch (error) {
    console.error("Gemini Category Suggestion Error:", error);
    return "Khác";
  }
};
