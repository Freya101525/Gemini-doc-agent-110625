export type Step = 'upload' | 'preview' | 'config' | 'execute';
export type ThemeMode = 'light' | 'dark';
export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface Theme {
  bg: string;
  text: string;
  card: string;
  border: string;
}

export interface FlowerStyle {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

export interface Agent {
  name: string;
  prompt: string;
  model: GeminiModel;
  temperature: number;
  topP: number;
}

export interface AgentOutput {
  input: string;
  output: string;
  time: number;
}
