
import React, { useState } from 'react';
import { Project, ProjectSpec, Horizon, Swimlane } from './types';
import { Refiner } from './components/Refiner';
import { Planner } from './components/Planner';
import { Layers, FilePlus, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'refiner' | 'planner'>('refiner');
  const [projects, setProjects] = useState<Project[]>([
    // Seed Data for Demo
    {
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
    }
  ]);

  const handleSaveSpec = (spec: ProjectSpec) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: spec.title,
      rawInput: '', // Not strictly needed in list
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

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
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
          <p>&copy; 2024 Adept AI</p>
          <p>Powered by Gemini 2.5 Flash</p>
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

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'refiner' ? (
            <Refiner onSave={handleSaveSpec} />
          ) : (
            <Planner projects={projects} onUpdateProject={handleUpdateProject} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
