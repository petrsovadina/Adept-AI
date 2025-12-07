
import React, { useState } from 'react';
import { Project, Horizon, Swimlane } from '../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RechartsTooltip, Cell, ReferenceLine } from 'recharts';
import { LayoutGrid, Kanban, Info, Edit2, Presentation, Trash2, Save } from 'lucide-react';
import { RoadmapCard, RoadmapItem } from './ui/roadmap-card';
import { Timeline, TimelineItem } from './ui/timeline';

interface PlannerProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const Planner: React.FC<PlannerProps> = ({ projects, onUpdateProject, onDeleteProject }) => {
  const [viewMode, setViewMode] = useState<'roadmap' | 'matrix' | 'templates'>('roadmap');
  const [editingProject, setEditingProject] = useState<string | null>(null);

  // Helper to calculate Score
  const calculateScores = (p: Project): Project => {
    // RICE Score calculation
    const riceScore = (p.rice.reach * p.rice.impact * p.rice.confidence) / p.rice.effort;
    return { ...p, rice: { ...p.rice, score: riceScore } };
  };

  const handleScoreChange = (id: string, field: 'dice' | 'rice', metric: string, value: number) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const updated = {
      ...project,
      [field]: {
        ...project[field],
        [metric]: value
      }
    };
    // Recalculate generic score
    onUpdateProject(calculateScores(updated));
  };
  
  const handleTitleChange = (id: string, newTitle: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    onUpdateProject({ ...project, title: newTitle });
  };

  const getRiskColor = (diceScore: number) => {
    // Arbitrary thresholds based on prompt PDF info (Zones)
    if (diceScore > 20) return 'bg-red-500'; // High Risk
    if (diceScore > 14) return 'bg-yellow-500'; // Medium
    return 'bg-green-500'; // Low Risk / Win Zone (7-14 ideally)
  };

  const renderRoadmap = () => {
    const horizons = [Horizon.NOW, Horizon.NEXT, Horizon.LATER];
    const swimlanes = Object.values(Swimlane);

    return (
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[1000px] grid grid-cols-4 gap-4">
          {/* Header Row */}
          <div className="col-span-1"></div>
          {horizons.map(h => (
            <div key={h} className="font-bold text-center text-slate-500 uppercase tracking-wider py-2 bg-slate-100 rounded">
              {h}
            </div>
          ))}

          {/* Swimlanes */}
          {swimlanes.map(lane => (
            <React.Fragment key={lane}>
              <div className="col-span-1 font-semibold text-slate-700 flex items-center pl-4 border-l-4 border-blue-500 bg-white py-4 rounded shadow-sm my-2 text-sm">
                {lane}
              </div>
              {horizons.map(h => {
                const laneProjects = projects.filter(p => p.swimlane === lane && p.horizon === h);
                return (
                  <div key={`${lane}-${h}`} className="bg-slate-50 rounded p-2 min-h-[150px] border border-slate-200 border-dashed my-2">
                    {laneProjects.map(p => (
                      <div key={p.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 mb-2 cursor-pointer hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-semibold text-sm text-slate-800 line-clamp-2">{p.title}</span>
                           <button onClick={() => setEditingProject(p.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity">
                             <Edit2 size={14} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded" title="RICE Score">RICE: {p.rice.score.toFixed(0)}</span>
                           </div>
                           <div 
                            className={`w-3 h-3 rounded-full ${getRiskColor(p.dice.score)}`} 
                            title={`DICE Risk Score: ${p.dice.score}`}
                           />
                        </div>
                        {editingProject === p.id && (
                          <div className="absolute top-0 left-0 z-50 bg-white p-4 shadow-xl rounded-lg border border-slate-200 w-72">
                            <h5 className="text-xs font-bold text-slate-500 mb-3 flex justify-between items-center">
                              Upravit Projekt
                              <button onClick={() => onDeleteProject(p.id)} className="text-red-500 hover:text-red-700" title="Smazat projekt">
                                <Trash2 size={14} />
                              </button>
                            </h5>
                            
                            <div className="space-y-3">
                              <label className="text-xs block">
                                Název
                                <input 
                                  type="text" 
                                  className="w-full border rounded px-2 py-1 mt-1 text-sm" 
                                  value={p.title} 
                                  onChange={e => handleTitleChange(p.id, e.target.value)}
                                />
                              </label>

                              <div className="h-px bg-slate-100"></div>

                              <label className="text-xs flex justify-between items-center">Dosah (Reach) <input type="number" className="w-16 border rounded px-1" value={p.rice.reach} onChange={e => handleScoreChange(p.id, 'rice', 'reach', +e.target.value)}/></label>
                              <label className="text-xs flex justify-between items-center">Dopad (Impact) <input type="number" className="w-16 border rounded px-1" value={p.rice.impact} onChange={e => handleScoreChange(p.id, 'rice', 'impact', +e.target.value)}/></label>
                              <label className="text-xs flex justify-between items-center">Úsilí (Effort) <input type="number" className="w-16 border rounded px-1" value={p.rice.effort} onChange={e => handleScoreChange(p.id, 'rice', 'effort', +e.target.value)}/></label>
                              
                              <div className="h-px bg-slate-100"></div>
                              
                              <label className="text-xs block">
                                Horizont
                                <select className="w-full border rounded px-1 py-1 mt-1 text-sm" value={p.horizon} onChange={e => onUpdateProject({...p, horizon: e.target.value as Horizon})}>
                                  {Object.values(Horizon).map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </label>
                            </div>
                            <button onClick={() => setEditingProject(null)} className="w-full mt-4 bg-slate-100 text-xs py-2 rounded hover:bg-slate-200 font-medium">Hotovo</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderTemplates = () => {
    // Transform projects to RoadmapItems
    const roadmapItems: RoadmapItem[] = projects.map(p => ({
      quarter: p.horizon === Horizon.NOW ? 'Q1 2024 (Now)' : p.horizon === Horizon.NEXT ? 'Q2 2024 (Next)' : 'Q3+ (Later)',
      title: p.title,
      description: p.spec.vision,
      status: p.horizon === Horizon.NOW ? 'in-progress' : 'upcoming'
    }));

    // Example Timeline Items based on a single project (mocked for demo)
    const activeProject = projects[0];
    const timelineItems: TimelineItem[] = activeProject ? [
        {
          id: "1",
          title: "Refinace Zadání (The Refiner)",
          description: "Dokončení specifikace a schválení stakeholderem",
          timestamp: new Date(activeProject.createdAt),
          status: "completed",
        },
        {
          id: "2",
          title: "Prioritizace (DICE/RICE)",
          description: `Skórování dokončeno. RICE: ${activeProject.rice.score.toFixed(0)}`,
          timestamp: new Date(),
          status: "active",
        },
        {
          id: "3",
          title: "Zahájení Vývoje",
          description: "Plánováno pro sprint Q1",
          status: "pending",
        }
    ] : [];

    return (
      <div className="space-y-12 pb-10">
        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Šablona 1: Strategická Roadmapa (Roadmap Card)</h3>
          <p className="text-sm text-slate-500 mb-6">Tento formát se používá pro prezentaci strategického výhledu exekutivě.</p>
          <div className="flex justify-center">
            <RoadmapCard items={roadmapItems} title="Strategická Roadmapa 2024" description="Přehled klíčových iniciativ z Planneru" />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Šablona 2: Detailní Časová Osa (Timeline)</h3>
          <p className="text-sm text-slate-500 mb-6">Tento formát se používá pro detailní sledování milníků konkrétního projektu.</p>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
            {activeProject ? <h4 className="font-bold mb-4">{activeProject.title}</h4> : <p className="text-slate-400">Žádný projekt k zobrazení.</p>}
            {activeProject && <Timeline items={timelineItems} variant="spacious" />}
          </div>
        </section>
      </div>
    );
  };

  const renderMatrix = () => {
    // Calculate I/E Ratio for the tooltip and positioning
    // Note: Axis X is Effort, Axis Y is Impact
    const data = projects.map(p => ({
      ...p,
      x: p.rice.effort, // Effort (Úsilí)
      y: p.rice.impact, // Impact (Dopad)
      z: p.rice.score, // Size based on RICE score
      ieRatio: p.rice.impact / (p.rice.effort || 1) // I/E Ratio Calculation (Prioritní skóre)
    }));

    return (
      <div className="h-[600px] w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Prioritizační Matice: Dopad vs. Úsilí (2x2)</h3>
        <p className="text-xs text-slate-500 mb-4">
          Body představují projekty. Osa X: Úsilí, Osa Y: Dopad. Velikost bodu odpovídá celkovému RICE skóre.
        </p>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" name="Effort" unit="" domain={[0, 'auto']} label={{ value: 'Úsilí (Effort)', position: 'insideBottom', offset: -10 }} />
              <YAxis type="number" dataKey="y" name="Impact" unit="" domain={[0, 'auto']} label={{ value: 'Dopad (Impact)', angle: -90, position: 'insideLeft' }} />
              <ZAxis type="number" dataKey="z" range={[50, 600]} name="Score" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                 if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-slate-200 shadow-lg rounded z-50">
                      <p className="font-bold text-sm text-slate-800">{d.title}</p>
                      <div className="h-px bg-slate-100 my-2"/>
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        Prioritní Skóre (I/E Ratio): {d.ieRatio.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">RICE Score: <span className="font-mono">{d.rice.score.toFixed(0)}</span></p>
                      <p className="text-xs text-slate-500">DICE Risk: {d.dice.score}</p>
                    </div>
                  );
                }
                return null;
              }} />
              {/* Reference lines to create the 2x2 quadrants visual effect */}
              <ReferenceLine y={3} stroke="#cbd5e1" strokeDasharray="3 3" label={{ value: "Vysoký Dopad", position: 'insideTopLeft', fontSize: 10, fill: '#94a3b8' }} />
              <ReferenceLine x={3} stroke="#cbd5e1" strokeDasharray="3 3" label={{ value: "Vysoké Úsilí", position: 'insideBottomRight', fontSize: 10, fill: '#94a3b8' }} />
              
              <Scatter name="Projects" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.dice.score > 20 ? '#ef4444' : entry.dice.score > 14 ? '#eab308' : '#22c55e'} className="cursor-pointer hover:opacity-80" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4 text-sm text-slate-600 border-t pt-4">
           <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"/> Nízké Riziko (Win Zone)</div>
           <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"/> Střední Riziko</div>
           <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"/> Vysoké Riziko</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">The Planner</h2>
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode('roadmap')}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors ${viewMode === 'roadmap' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Kanban size={16} className="mr-2" /> Roadmapa
          </button>
          <button 
            onClick={() => setViewMode('matrix')}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors ${viewMode === 'matrix' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutGrid size={16} className="mr-2" /> Matice
          </button>
          <button 
            onClick={() => setViewMode('templates')}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors ${viewMode === 'templates' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Presentation size={16} className="mr-2" /> Šablony Vizualizace
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <Info size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">Váš backlog je prázdný.</p>
            <p className="text-slate-400">Použijte "The Refiner" pro vytvoření nové specifikace.</p>
          </div>
        ) : (
          viewMode === 'roadmap' ? renderRoadmap() : viewMode === 'matrix' ? renderMatrix() : renderTemplates()
        )}
      </div>
    </div>
  );
};