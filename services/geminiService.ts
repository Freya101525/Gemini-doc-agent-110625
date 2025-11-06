import { GoogleGenAI } from "@google/genai";
import type { GeminiModel } from '../types';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const performOcr = async (file: File, language: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Image = await fileToBase64(file);
  
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: file.type,
    },
  };
  
  const languageHint = language === 'traditional-chinese' 
    ? "The language in the image is primarily Traditional Chinese. Please provide the output in Traditional Chinese." 
    : "The language in the image is primarily English.";

  const textPart = {
    text: `Extract all text content from this image. Preserve formatting like paragraphs and lists where possible. ${languageHint}`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Using pro for better OCR quality
    contents: { parts: [imagePart, textPart] },
  });

  return response.text;
};

export const executeAgentPrompt = async (
  prompt: string,
  input: string,
  model: GeminiModel,
  temperature: number,
  topP: number
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const fullPrompt = `You are an expert assistant. Follow the user's instruction precisely. Here is the instruction:\n\n[INSTRUCTION]: ${prompt}\n\nHere is the document/text to work on:\n\n[DOCUMENT]:\n${input}`;
  
  const response = await ai.models.generateContent({
    model: model,
    contents: fullPrompt,
    config: {
      temperature,
      topP,
    }
  });

  return response.text;
};
