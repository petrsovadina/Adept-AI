
import React, { useState, useEffect } from 'react';
import { Project, ProjectSpec, Horizon, Swimlane } from './types';
import { Refiner } from './components/Refiner';
import { Planner } from './components/Planner';
import { Layers, FilePlus, Sparkles, Key, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'adept_ai_projects_v1';
const API_KEY_STORAGE = 'adept_ai_api_key';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'refiner' | 'planner'>('refiner');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  
  // Initialize state from LocalStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved projects", e);
      }
    }
    // Seed Data if storage is empty
    return [{
      id: '1',
      title: 'AI Agent zákaznické podpory',
      rawInput: 'Potřebujeme chatbota.',
      spec: {
        title: 'AI Agent zákaznické podpory',
        problem: 'Náklady na podporu jsou vysoké.',
        vision: 'Automatizovat 50 % ticketů pomocí AI.',
        userStories: ['Jako uživatel chci okamžité odpovědi.'],
        acceptanceCriteria: ['Odpověď < 2s'],
        techStackRecommendation: 'LangChain, OpenAI, Pinecone',
        riskAnalysis: 'Možné halucinace modelu.'
      },
      dice: { duration: 3, integrity: 4, commitment: 5, effort: 3, score: 12 },
      rice: { reach: 1000, impact: 3, confidence: 0.8, effort: 4, score: 600 },
      horizon: Horizon.NOW,
      swimlane: Swimlane.EFFICIENCY,
      status: 'Backlog',
      createdAt: Date.now()
    }];
  });

  // Load API Key on mount
  useEffect(() => {
    // Check process.env first (for deployments), then localStorage (for local/demo)
    const envKey = process.env.API_KEY;
    const localKey = localStorage.getItem(API_KEY_STORAGE);
    
    if (envKey) {
      setApiKey(envKey);
    } else if (localKey) {
      setApiKey(localKey);
    } else {
      setShowKeyModal(true);
    }
  }, []);

  // Save projects to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleSaveApiKey = (key: string) => {
    if (!key.trim()) return;
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
    setShowKeyModal(false);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem(API_KEY_STORAGE);
    setShowKeyModal(true);
  };

  const handleSaveSpec = (spec: ProjectSpec) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: spec.title,
      rawInput: '', 
      spec: spec,
      dice: { duration: 3, integrity: 3, commitment: 3, effort: 3, score: 9 }, // Defaults
      rice: { reach: 500, impact: 2, confidence: 0.5, effort: 3, score: 166 }, // Defaults
      horizon: Horizon.NEXT,
      swimlane: Swimlane.INNOVATION,
      status: 'Backlog',
      createdAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveTab('planner');
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("Opravdu chcete smazat tento projekt? Tato akce je nevratná.")) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-4 text-amber-600">
               <AlertTriangle />
               <h3 className="text-lg font-bold">Vyžadován API Klíč</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Pro využití AI funkcí (Refiner) je potřeba Google Gemini API klíč. 
              Klíč je uložen pouze ve vašem prohlížeči (LocalStorage).
            </p>
            <form onSubmit={(e) => { e.preventDefault(); const form = e.target as HTMLFormElement; handleSaveApiKey(form.apikey.value); }}>
              <input 
                name="apikey"
                type="password" 
                placeholder="Vložte Gemini API Key..." 
                className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm text-blue-600 hover:underline flex items-center"
                >
                  Získat klíč
                </a>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Uložit Klíč
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center tracking-tight">
            <Sparkles className="mr-2 text-blue-400" /> Adept AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">Strategický Refiner & Planner</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('refiner')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'refiner' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FilePlus size={20} className="mr-3" />
            The Refiner
          </button>
          
          <button
            onClick={() => setActiveTab('planner')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'planner' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers size={20} className="mr-3" />
            The Planner
          </button>
        </nav>

        <div className="p-6 border-t border-slate-700 text-xs text-slate-500">
          <div className="flex items-center justify-between mb-2">
             <span>API Status:</span>
             <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          {apiKey && (
            <button onClick={handleClearApiKey} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-2">
              <Key size={10} /> Změnit klíč
            </button>
          )}
          <p>&copy; 2024 Adept AI</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">
            {activeTab === 'refiner' ? 'Transformace nápadů do zadání' : 'Prioritizace & Strategické Plánování'}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="text-sm text-slate-500">Workspace: <span className="font-medium text-slate-900">Produktový Tým A</span></div>
             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">A</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
          {activeTab === 'refiner' ? (
            <Refiner onSave={handleSaveSpec} apiKey={apiKey} />
          ) : (
            <Planner 
              projects={projects} 
              onUpdateProject={handleUpdateProject} 
              onDeleteProject={handleDeleteProject}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;