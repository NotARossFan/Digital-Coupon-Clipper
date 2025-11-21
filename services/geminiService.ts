import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateScriptFromImage = async (base64Image: string, mimeType: string, autoScroll: boolean): Promise<ScriptResponse> => {
  const scrollInstruction = autoScroll
    ? `
    IMPORTANT: The user has requested that the script MUST first scroll to the bottom of the page to load all lazy-loaded content.
    Generate code that:
    1. Scrolls to the bottom of the document.
    2. Waits a short moment (e.g., 2 seconds) for new content.
    3. Repeats this until the scroll height stops increasing or a reasonable limit is reached.
    4. ONLY THEN performs the identifying and clicking of the coupon buttons.
    `
    : '';

  const prompt = `
    You are an expert JavaScript Automation Engineer. 
    Analyze this screenshot of a grocery store coupon webpage.
    Identify the "Clip", "Add", or "Load to Card" buttons.
    
    CRITICAL: The user reports being rate-limited/blocked by the site (must stay under 19 requests/minute).
    Generate a robust, vanilla JavaScript snippet that:
    1. Identifies ALL unclipped coupon buttons first.
    2. Iterates through them sequentially using a 'for...of' loop with async/await.
    3. Clicks one button.
    4. WAITS for a delay between 3500ms and 4500ms (approx 4 seconds) to ensure the rate stays safely below 19 requests/minute.
    5. Logs clear progress to the console (e.g., "Clipping 1 of 50... Do not close tab").
    
    ${scrollInstruction}
    
    Prioritize selectors that seem stable (e.g., specific classes, aria-labels, or text content matching).
    Avoid clicking buttons that are already clipped (often labeled "Clipped" or styled differently).
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING, description: "The JavaScript code to run in the console." },
            explanation: { type: Type.STRING, description: "A brief explanation of how the script targets the elements and handles rate limiting." },
            confidence: { type: Type.STRING, description: "High, Medium, or Low confidence." },
            targetSelectors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of CSS selectors used." },
          },
          required: ["script", "explanation", "confidence", "targetSelectors"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ScriptResponse;
    }
    throw new Error("No response text received from Gemini.");
  } catch (error) {
    console.error("Error generating script from image:", error);
    throw error;
  }
};

export const generateScriptFromHtml = async (htmlContent: string, autoScroll: boolean): Promise<ScriptResponse> => {
  const scrollInstruction = autoScroll
    ? `
    IMPORTANT: The user has requested that the script MUST first scroll to the bottom of the page to load all lazy-loaded content.
    Generate code that:
    1. Scrolls to the bottom of the document.
    2. Waits a short moment (e.g., 2 seconds) for new content.
    3. Repeats this until the scroll height stops increasing or a reasonable limit is reached.
    4. ONLY THEN performs the identifying and clicking of the coupon buttons.
    `
    : '';

  const prompt = `
    You are an expert JavaScript Automation Engineer.
    Analyze this HTML snippet from a grocery store coupon webpage.
    Identify the structural pattern for "Clip" buttons.
    
    CRITICAL: The user reports being rate-limited/blocked by the site (must stay under 19 requests/minute).
    Generate a robust, vanilla JavaScript snippet that:
    1. Identifies ALL unclipped coupon buttons first.
    2. Iterates through them sequentially using a 'for...of' loop with async/await.
    3. Clicks one button.
    4. WAITS for a delay between 3500ms and 4500ms (approx 4 seconds) to ensure the rate stays safely below 19 requests/minute.
    5. Logs clear progress to the console (e.g., "Clipping 1 of 50... Do not close tab").
    
    ${scrollInstruction}
    
    If classes look obfuscated (e.g., "css-12345"), prefer using text content matching (e.g., containing "Clip") or aria-labels to ensure longevity.
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { text: prompt },
            { text: `HTML Content: \n${htmlContent.substring(0, 30000)}` } // Truncate to avoid token limits if massive
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING, description: "The JavaScript code to run in the console." },
            explanation: { type: Type.STRING, description: "A brief explanation of how the script targets the elements and handles rate limiting." },
            confidence: { type: Type.STRING, description: "High, Medium, or Low confidence." },
            targetSelectors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of CSS selectors used." },
          },
          required: ["script", "explanation", "confidence", "targetSelectors"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ScriptResponse;
    }
    throw new Error("No response text received from Gemini.");
  } catch (error) {
    console.error("Error generating script from HTML:", error);
    throw error;
  }
};