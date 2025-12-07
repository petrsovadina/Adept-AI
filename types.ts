
export enum Horizon {
  NOW = 'NOW (Nyní)',
  NEXT = 'NEXT (Dále)',
  LATER = 'LATER (Později)'
}

export enum Swimlane {
  RETENTION = 'Zlepšení Retence',
  EXPANSION = 'Tržní Expanze',
  EFFICIENCY = 'Provozní Efektivita',
  INNOVATION = 'Inovace a AI'
}

export interface DICE {
  duration: number; // 1-5
  integrity: number; // 1-5
  commitment: number; // 1-5
  effort: number; // 1-5
  score: number; // Calculated
}

export interface RICE {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  score: number;
}

export interface ProjectSpec {
  title: string;
  problem: string;
  vision: string;
  userStories: string[];
  acceptanceCriteria: string[];
  techStackRecommendation: string;
  riskAnalysis: string;
}

export interface Project {
  id: string;
  title: string;
  rawInput: string;
  spec: ProjectSpec;
  dice: DICE;
  rice: RICE;
  horizon: Horizon;
  swimlane: Swimlane;
  status: 'Draft' | 'Backlog' | 'In Progress' | 'Done';
  createdAt: number;
}

export interface RefinerState {
  step: number;
  rawInput: string;
  isAnalyzing: boolean;
  questions: {
    problemVision: string[];
    valueRisk: string[];
    dataReadiness: string[];
  };
  answers: {
    problemVision: Record<string, string>;
    valueRisk: Record<string, string>;
    dataReadiness: Record<string, string>;
  };
  generatedSpec: ProjectSpec | null;
}