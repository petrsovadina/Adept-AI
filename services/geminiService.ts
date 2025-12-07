
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec } from "../types";

// Helper helper to initialize AI with a dynamic key
const getAiClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

const modelNameFlash = 'gemini-2.5-flash';
const modelNameThinking = 'gemini-3-pro-preview';

// Helper function to clean Markdown code blocks from JSON string
const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  // Remove ```json ... ``` or just ``` ... ``` wrapping
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  
  let start = -1;
  let end = -1;

  // Determine if we are looking for an Object or an Array based on which comes first
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    end = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    start = firstBracket;
    end = cleaned.lastIndexOf(']');
  }

  if (start !== -1 && end !== -1 && end >= start) {
    return cleaned.substring(start, end + 1).trim();
  }
  
  return cleaned.trim();
};

export const analyzeIdeaAndGenerateQuestions = async (apiKey: string, rawInput: string) => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAiClient(apiKey);

  const prompt = `
    Jsi expert na produktový management a AI architekturu využívající metodiku "Adept AI".
    Tvým úkolem je analyzovat vágní produktový nápad a vygenerovat cílené, kritické otázky pro jeho upřesnění do robustní specifikace.
    
    Nápad: "${rawInput}"

    Vygeneruj 3 specifické otázky v ČEŠTINĚ pro KAŽDOU z následujících kategorií. Otázky musí být v českém jazyce:
    1. Problém a Vize (Objasnění hlavního problému uživatele a dlouhodobého cíle)
    2. Hodnota a Riziko (Obchodní hodnota, potenciální úskalí, tržní rizika)
    3. Datová a AI připravenost (Dostupnost dat, kvalita dat, etické zkreslení/bias, technická proveditelnost)

    Vrať odpověď jako JSON objekt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelNameFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemVision: { type: Type.ARRAY, items: { type: Type.STRING } },
            valueRisk: { type: Type.ARRAY, items: { type: Type.STRING } },
            dataReadiness: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["problemVision", "valueRisk", "dataReadiness"]
        }
      }
    });

    if (response.text) {
      const cleanedText = cleanJsonString(response.text);
      return JSON.parse(cleanedText);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Nepodařilo se vygenerovat otázky. Zkontrolujte API klíč a připojení.");
  }
};

export const generateProjectSpec = async (
  apiKey: string,
  rawInput: string,
  answers: any,
  useThinking: boolean = false
): Promise<ProjectSpec> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAiClient(apiKey);

  const prompt = `
    Jsi modul "The Refiner" aplikace Adept AI.
    
    Původní nápad: "${rawInput}"
    
    Data z refinace (Odpovědi uživatele):
    ${JSON.stringify(answers, null, 2)}

    Na základě těchto dat vygeneruj strukturovanou Technickou Produktovou Specifikaci kompletně v ČEŠTINĚ.
    
    Struktura výstupu:
    - Název (title): Profesionální a stručný název projektu.
    - Problém (problem): Jasná definice problému.
    - Vize (vision): Dlouhodobý cíl a dopad.
    - User Stories: Seznam ve formátu "Jako <role> chci <cíl>, abych <přínos>".
    - Akceptační kritéria (acceptanceCriteria): Měřitelné podmínky pro splnění (např. přesnost modelu, odezva).
    - Tech Stack (techStackRecommendation): Konkrétní Python/AI knihovny (FastAPI, LangChain, Pydantic, ChromaDB/Pinecone) a modely.
    - Analýza rizik (riskAnalysis): Kritická analýza včetně Data Bias a implementačních rizik.
  `;

  const model = useThinking ? modelNameThinking : modelNameFlash;
  
  // Construct config dynamically
  const config: any = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        problem: { type: Type.STRING },
        vision: { type: Type.STRING },
        userStories: { type: Type.ARRAY, items: { type: Type.STRING } },
        acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
        techStackRecommendation: { type: Type.STRING },
        riskAnalysis: { type: Type.STRING },
      },
      required: ["title", "problem", "vision", "userStories", "acceptanceCriteria", "techStackRecommendation", "riskAnalysis"]
    }
  };

  // Add Thinking Config if enabled
  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
    // IMPORTANT: maxOutputTokens must NOT be set when using thinkingConfig with high budget to avoid truncating thoughts
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config
    });

    if (response.text) {
       const cleanedText = cleanJsonString(response.text);
      return JSON.parse(cleanedText) as ProjectSpec;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Nepodařilo se vygenerovat specifikaci.");
  }
};
