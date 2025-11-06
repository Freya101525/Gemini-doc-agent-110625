import type { Theme, FlowerStyle, Agent } from './types';

export const THEMES: { [key: string]: Theme } = {
  light: { bg: 'bg-white', text: 'text-gray-900', card: 'bg-gray-50', border: 'border-gray-200' },
  dark: { bg: 'bg-gray-900', text: 'text-white', card: 'bg-gray-800', border: 'border-gray-700' }
};

export const FLOWER_STYLES: FlowerStyle[] = [
  { name: '櫻花 Sakura', primary: '#FFB7C5', secondary: '#FFF0F5', accent: '#FF69B4', gradient: 'from-pink-200 to-pink-50' },
  { name: '薰衣草 Lavender', primary: '#E6E6FA', secondary: '#F8F8FF', accent: '#9370DB', gradient: 'from-purple-200 to-purple-50' },
  { name: '向日葵 Sunflower', primary: '#FFD700', secondary: '#FFFACD', accent: '#FFA500', gradient: 'from-yellow-200 to-yellow-50' },
  { name: '玫瑰 Rose', primary: '#FF6B9D', secondary: '#FFE5EC', accent: '#C71585', gradient: 'from-rose-200 to-rose-50' },
  { name: '蓮花 Lotus', primary: '#FFB6C1', secondary: '#FFF5F7', accent: '#FF1493', gradient: 'from-pink-300 to-pink-100' },
];

export const DEFAULT_AGENTS: Agent[] = [
  { name: '文件摘要器', prompt: '請提供這份文件的簡要摘要，包含主要重點。', model: 'gemini-2.5-pro', temperature: 0.7, topP: 0.9 },
  { name: '關鍵詞提取器', prompt: '從文件中提取最重要的關鍵詞和術語。', model: 'gemini-2.5-flash', temperature: 0.5, topP: 0.9 },
  { name: '情感分析器', prompt: '分析文件的整體情感傾向和語氣。', model: 'gemini-2.5-pro', temperature: 0.6, topP: 0.9 },
  { name: '實體識別器', prompt: '識別文件中的所有命名實體（人名、地名、組織名）。', model: 'gemini-2.5-flash', temperature: 0.4, topP: 0.9 },
  { name: '行動項目提取器', prompt: '列出文件中提到的所有行動項目和待辦事項。', model: 'gemini-2.5-pro', temperature: 0.7, topP: 0.9 }
];
