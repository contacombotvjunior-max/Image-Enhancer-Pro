
import { GoogleGenAI, Modality } from '@google/genai';

// Helper function to convert data URL to the format required by the Gemini API
const fileToGenerativePart = (dataUrl: string) => {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export const processImageWithGemini = async (
  imageDataUrl: string,
  prompt: string,
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error('A variável de ambiente API_KEY não está configurada.');
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = fileToGenerativePart(imageDataUrl);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error('Nenhum dado de imagem encontrado na resposta da API.');
  } catch (error) {
    console.error('Erro ao processar imagem com Gemini:', error);
    if (error instanceof Error) {
        throw new Error(`Falha ao processar a imagem: ${error.message}`);
    }
    throw new Error('Falha ao processar a imagem. Por favor, tente novamente.');
  }
};
