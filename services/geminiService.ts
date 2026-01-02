
import { GoogleGenAI, Type } from "@google/genai";
import { SensitivitySettings } from "../types";

export const getSensitivityForDevice = async (deviceModel: string): Promise<SensitivitySettings> => {
  // Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance
  const apiKey = AIzaSyCpFjzD1l8sSnApDSNH8AzNStrRQG6ptaM;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide the best Free Fire sensitivity settings and DPI for the mobile device: "${deviceModel}". 
    IMPORTANT: Free Fire now supports sensitivity up to 200. Please provide settings in the 0-200 range.
    The settings should aim for perfect headshots (Auto-headshot style). Provide the response in Bengali where applicable (like tips).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          general: { type: Type.INTEGER, description: "Sensitivity value for General (0-200)" },
          redDot: { type: Type.INTEGER, description: "Sensitivity value for Red Dot (0-200)" },
          scope2x: { type: Type.INTEGER, description: "Sensitivity value for 2x Scope (0-200)" },
          scope4x: { type: Type.INTEGER, description: "Sensitivity value for 4x Scope (0-200)" },
          sniperScope: { type: Type.INTEGER, description: "Sensitivity value for Sniper Scope (0-200)" },
          freeLook: { type: Type.INTEGER, description: "Sensitivity value for Free Look (0-200)" },
          dpi: { type: Type.STRING, description: "Recommended DPI setting" },
          fireButtonSize: { type: Type.STRING, description: "Recommended Fire Button size percentage" },
          tips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Gameplay tips in Bengali for this specific device to improve headshots"
          },
          deviceName: { type: Type.STRING, description: "The confirmed device name" }
        },
        required: ["general", "redDot", "scope2x", "scope4x", "sniperScope", "freeLook", "dpi", "fireButtonSize", "tips", "deviceName"]
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI engine থেকে কোনো উত্তর পাওয়া যায়নি।");
  }

  try {
    const data = JSON.parse(text.trim());
    return data as SensitivitySettings;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("সঠিক তথ্য পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
};
