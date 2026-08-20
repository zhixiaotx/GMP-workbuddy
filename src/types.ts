export interface GxpSkill {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  icon: string;
  systemInstruction: string;
  defaultPrompt: string;
}

export interface KBFile {
  id: string;
  name: string;
  content: string;
  folder: string;
  size: string;
  qaPairs?: Array<{ q: string; a: string }>;
  department?: string;
  process?: string;
  tags?: string[];
}

export interface KBFolder {
  id: string;
  name: string;
  description: string;
  files: string[];
}

export interface Exercise {
  id: string;
  day: 1 | 2;
  lecture: string;
  title: string;
  description: string;
  taskNo: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'expert_qa' | 'expert_regulatory' | 'expert_doc';
  text: string;
  timestamp: string;
}

export interface OosOotData {
  batchNo: string;
  parameter: string;
  specMin: number;
  specMax: number;
  value: number;
  historicalMean: number;
  historicalSd: number;
}

export interface OosOotResult {
  isOos: boolean;
  isOot: boolean;
  oosReason?: string;
  ootReason?: string;
  recommendations: string[];
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: string;
  filename: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  extractedData?: Record<string, any>;
}
