
import { GoogleGenAI } from "@google/genai";

export const generateImageCaption = async (base64Image: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Remove data:image/jpeg;base64, prefix
    const pureBase64 = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: pureBase64,
            },
          },
          {
            text: "Crie uma legenda curta, criativa e inspiradora em português para esta foto. Apenas a legenda, sem aspas."
          }
        ]
      },
    });

    return response.text || "Momento inesquecível ✨";
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Um momento capturado.";
  }
};
