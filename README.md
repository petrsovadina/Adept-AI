
# Adept AI - Strategic Refiner & Planner

**Adept AI** je pokročilý nástroj pro produktový management, který využívá umělou inteligenci (Google Gemini 2.5) k transformaci vágních nápadů do strukturovaných technických specifikací a následné strategické prioritizaci.

Aplikace je navržena pro produktové manažery, technické leadery a stratégy, kteří potřebují efektivně řídit inovační backlog.

---

## 🚀 Klíčové Funkce

### 1. The Refiner (AI Refinace Zadání)
Interaktivní průvodce, který pomáhá vyjasnit zadání projektu před zahájením vývoje.
*   **AI Analýza:** Vstupní nápad je analyzován modelem Gemini 2.5 Flash.
*   **Kritické Dotazování:** Systém generuje specifické otázky ve třech oblastech:
    *   *Problém a Vize*
    *   *Hodnota a Riziko*
    *   *Datová a AI připravenost*
*   **Generování Specifikace:** Na základě odpovědí vytvoří strukturovaný dokument obsahující User Stories, Akceptační kritéria, Doporučený Tech Stack a Analýzu rizik.

### 2. The Planner (Strategické Plánování)
Nástroj pro vizualizaci a prioritizaci portfolia projektů.
*   **Metodiky RICE & DICE:** Integrované kalkulačky pro prioritizaci (Reach, Impact, Confidence, Effort) a řízení rizik (Duration, Integrity, Commitment, Effort).
*   **Interaktivní Roadmapa:** Kanban pohled rozdělený do horizontů (NOW, NEXT, LATER) a swimlanes (Retence, Expanze, Efektivita, Inovace).
*   **Prioritizační Matice:** Scatter plot graf zobrazující vztah mezi Úsilím (Effort) a Dopadem (Impact), s vizualizací velikosti projektu a rizika.
*   **Šablony Vizualizace:** Generování přehledných karet a časových os pro prezentaci stakeholderům.

---

## 🛠️ Technický Stack

*   **Frontend:** React 18, TypeScript
*   **Styling:** Tailwind CSS
*   **AI Integrace:** Google GenAI SDK (`@google/genai`), model `gemini-2.5-flash`
*   **Vizualizace dat:** Recharts
*   **Komponenty:** Lucide React, Radix UI primitives
*   **Animace:** Framer Motion

---

## ⚙️ Instalace a Spuštění

### Prerekvizity
Pro fungování aplikace je nutné mít platný API klíč pro Google Gemini API.

### Postup

1.  **Instalace závislostí:**
    ```bash
    npm install
    ```

2.  **Konfigurace API klíče:**
    Aplikace očekává API klíč v proměnné prostředí `API_KEY`.
    
    *V lokálním prostředí:* Vytvořte soubor `.env` v kořenovém adresáři:
    ```env
    API_KEY=vás_google_genai_api_key
    ```
    *(Poznámka: V kódu je klíč čten přes `process.env.API_KEY`)*

3.  **Spuštění vývojového serveru:**
    ```bash
    npm start
    # nebo
    npm run dev
    ```

---

## 📂 Struktura Projektu

*   `src/components/Refiner.tsx` - Logika pro AI chat a generování specifikací.
*   `src/components/Planner.tsx` - Vizualizace roadmapy, matice a prioritizace.
*   `src/services/geminiService.ts` - Komunikace s Google Gemini API.
*   `src/types.ts` - TypeScript definice pro Projekty, RICE/DICE metriky a Specifikace.

---

## 📝 Licence
Tento projekt je vytvořen pro demonstrační a vzdělávací účely využití Gemini API v produktovém managementu.