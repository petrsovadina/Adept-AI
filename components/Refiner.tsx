
import React, { useState } from 'react';
import { ProjectSpec, RefinerState } from '../types';
import { analyzeIdeaAndGenerateQuestions, generateProjectSpec } from '../services/geminiService';
import { Loader2, ArrowRight, CheckCircle, AlertCircle, FileText, Cpu, Target, Database } from 'lucide-react';

interface RefinerProps {
  onSave: (spec: ProjectSpec) => void;
}

const initialRefinerState: RefinerState = {
  step: 0,
  rawInput: '',
  isAnalyzing: false,
  questions: { problemVision: [], valueRisk: [], dataReadiness: [] },
  answers: { problemVision: {}, valueRisk: {}, dataReadiness: {} },
  generatedSpec: null,
};

export const Refiner: React.FC<RefinerProps> = ({ onSave }) => {
  const [state, setState] = useState<RefinerState>(initialRefinerState);
  const [error, setError] = useState<string | null>(null);

  const handleInitialSubmit = async () => {
    if (!state.rawInput.trim()) return;
    setState(prev => ({ ...prev, isAnalyzing: true }));
    setError(null);
    try {
      const questions = await analyzeIdeaAndGenerateQuestions(state.rawInput);
      setState(prev => ({
        ...prev,
        questions,
        step: 1,
        isAnalyzing: false
      }));
    } catch (err) {
      setError("Chyba při analýze nápadu. Zkontrolujte API klíč a zkuste to znovu.");
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleAnswerChange = (category: keyof RefinerState['answers'], question: string, value: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [category]: {
          ...prev.answers[category],
          [question]: value
        }
      }
    }));
  };

  const handleGenerateSpec = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    setError(null);
    try {
      const spec = await generateProjectSpec(state.rawInput, state.answers);
      setState(prev => ({
        ...prev,
        generatedSpec: spec,
        step: 4, // Final Review Step
        isAnalyzing: false
      }));
    } catch (err) {
      setError("Nepodařilo se vygenerovat specifikaci.");
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center space-x-4 mb-8 text-sm font-medium text-slate-500 overflow-x-auto pb-2">
      {['Start', 'Problém & Vize', 'Hodnota & Riziko', 'Data & AI', 'Náhled'].map((label, idx) => (
        <div key={label} className={`flex items-center shrink-0 ${state.step >= idx ? 'text-blue-600' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 
            ${state.step > idx ? 'bg-blue-600 border-blue-600 text-white' : 
              state.step === idx ? 'border-blue-600 text-blue-600' : 'border-slate-300'}`}>
            {state.step > idx ? <CheckCircle size={16} /> : idx + 1}
          </div>
          <span className="hidden sm:inline whitespace-nowrap">{label}</span>
          {idx < 4 && <div className="w-8 h-px bg-slate-300 mx-2 hidden sm:block" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-100px)]">
      {/* Main Form Area */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">The Refiner</h2>
        {renderStepIndicator()}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {state.step === 0 && (
          <div className="space-y-4">
            <p className="text-slate-600">Zadejte svůj vágní produktový nápad nebo problém pro zahájení procesu refinace.</p>
            <textarea
              className="w-full h-64 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              placeholder="např. Chci AI nástroj, který pomůže obchodníkům prioritizovat leady..."
              value={state.rawInput}
              onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
            />
            <button
              onClick={handleInitialSubmit}
              disabled={state.isAnalyzing || !state.rawInput.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {state.isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Target className="mr-2" />}
              Spustit Refinaci
            </button>
          </div>
        )}

        {state.step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center"><Target className="mr-2 text-blue-500"/> Problém & Vize</h3>
            {state.questions.problemVision.map((q, i) => (
              <div key={i} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{q}</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleAnswerChange('problemVision', q, e.target.value)}
                />
              </div>
            ))}
            <div className="flex justify-end pt-4">
               <button onClick={() => setState(prev => ({ ...prev, step: 2 }))} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                Další <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {state.step === 2 && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center"><Target className="mr-2 text-yellow-500"/> Hodnota & Riziko</h3>
            {state.questions.valueRisk.map((q, i) => (
              <div key={i} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{q}</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleAnswerChange('valueRisk', q, e.target.value)}
                />
              </div>
            ))}
             <div className="flex justify-between pt-4">
               <button onClick={() => setState(prev => ({ ...prev, step: 1 }))} className="px-6 py-2 text-slate-600 hover:text-slate-900">Zpět</button>
               <button onClick={() => setState(prev => ({ ...prev, step: 3 }))} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                Další <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {state.step === 3 && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center"><Database className="mr-2 text-green-500"/> Datová & AI Připravenost</h3>
            {state.questions.dataReadiness.map((q, i) => (
              <div key={i} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{q}</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleAnswerChange('dataReadiness', q, e.target.value)}
                />
              </div>
            ))}
            <div className="flex justify-between pt-4">
               <button onClick={() => setState(prev => ({ ...prev, step: 2 }))} className="px-6 py-2 text-slate-600 hover:text-slate-900">Zpět</button>
               <button 
                onClick={handleGenerateSpec} 
                disabled={state.isAnalyzing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200"
               >
                {state.isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Cpu className="mr-2" />}
                Generovat Specifikaci
              </button>
            </div>
          </div>
        )}

        {state.step === 4 && state.generatedSpec && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-900 mb-2">Refinace Dokončena!</h3>
              <p className="text-green-800 mb-4">Váš nápad byl transformován do strukturované specifikace.</p>
              <button 
                onClick={() => onSave(state.generatedSpec!)}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-sm"
              >
                Uložit do Backlogu & Otevřít Planner
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Sidebar */}
      <div className="lg:w-1/3 space-y-4">
        <div className="sticky top-6">
          <div className="bg-slate-900 text-white p-4 rounded-t-xl flex items-center justify-between">
            <h3 className="font-semibold flex items-center"><FileText className="mr-2" size={18}/> Živá Specifikace</h3>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">
              {state.step === 0 ? 'Prázdné' : state.step === 4 ? 'Finální' : 'Rozpracováno...'}
            </span>
          </div>
          <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl p-6 min-h-[400px] max-h-[calc(100vh-150px)] overflow-y-auto shadow-sm">
            {state.generatedSpec ? (
              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{state.generatedSpec.title}</h4>
                  <p className="text-slate-600">{state.generatedSpec.problem}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-800 mb-1">Vize</h5>
                  <p className="text-slate-600 italic">{state.generatedSpec.vision}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-800 mb-1">User Stories</h5>
                  <ul className="list-disc pl-5 text-slate-600 space-y-1">
                    {state.generatedSpec.userStories.map((us, i) => <li key={i}>{us}</li>)}
                  </ul>
                </div>
                 <div>
                  <h5 className="font-semibold text-slate-800 mb-1">Akceptační Kritéria</h5>
                  <ul className="list-disc pl-5 text-slate-600 space-y-1">
                    {state.generatedSpec.acceptanceCriteria.map((ac, i) => <li key={i}>{ac}</li>)}
                  </ul>
                </div>
                 <div>
                  <h5 className="font-semibold text-slate-800 mb-1">Tech Stack</h5>
                  <p className="text-slate-600 font-mono text-xs bg-slate-100 p-2 rounded">{state.generatedSpec.techStackRecommendation}</p>
                </div>
                 <div>
                  <h5 className="font-semibold text-slate-800 mb-1">Analýza Rizik</h5>
                  <p className="text-slate-600 text-xs bg-red-50 p-2 rounded border border-red-100">{state.generatedSpec.riskAnalysis}</p>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 space-y-4">
                <p>Odpovídejte na otázky a AI postupně vybuduje specifikaci.</p>
                {state.step > 0 && (
                   <div className="space-y-2">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aktuální Kontext</p>
                     <div className="p-3 bg-slate-50 rounded border border-slate-100 text-xs text-slate-600 italic">
                        "{state.rawInput.substring(0, 150)}{state.rawInput.length > 150 ? '...' : ''}"
                     </div>
                     {Object.entries(state.answers).flatMap(([cat, answers]) => 
                        Object.entries(answers).map(([q, a]) => (
                          a ? (
                            <div key={q} className="p-2 bg-blue-50 border-l-2 border-blue-400 text-xs">
                              <span className="font-semibold text-blue-900 block mb-1">{q}</span>
                              <span className="text-blue-800">{String(a)}</span>
                            </div>
                          ) : null
                        ))
                     )}
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
