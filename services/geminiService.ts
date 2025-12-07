
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

export const analyzeIdeaAndGenerateQuestions = async (rawInput: string) => {
  if (!apiKey) throw new Error("API Key is missing");

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

  const response = await ai.models.generateContent({
    model: modelName,
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
    return JSON.parse(response.text);
  }
  throw new Error("Nepodařilo se vygenerovat otázky");
};

export const generateProjectSpec = async (
  rawInput: string,
  answers: any
): Promise<ProjectSpec> => {
  if (!apiKey) throw new Error("API Key is missing");

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

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
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
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ProjectSpec;
  }
  throw new Error("Nepodařilo se vygenerovat specifikaci");
};
