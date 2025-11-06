import React, { useState, useEffect } from 'react';
import { Upload, FileText, Settings, Play, ChevronRight, Eye, Download, Moon, Sun, Palette, X, Sparkles, Flower2 } from 'lucide-react';
import type { Step, ThemeMode, Agent, AgentOutput, GeminiModel } from './types';
import { THEMES, FLOWER_STYLES, DEFAULT_AGENTS } from './constants';
import { performOcr, executeAgentPrompt } from './services/geminiService';


const AgenticDocProcessor = () => {
  // State management
  const [step, setStep] = useState<Step>('upload');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [flowerStyle, setFlowerStyle] = useState<number>(0);
  
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [document, setDocument] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  
  const [ocrLanguage, setOcrLanguage] = useState('traditional-chinese');
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentCount, setSelectedAgentCount] = useState(5);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [agentOutputs, setAgentOutputs] = useState<AgentOutput[]>([]);
  
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isExecutingAgents, setIsExecutingAgents] = useState(false);
  
  const [showStylePicker, setShowStylePicker] = useState(false);

  const theme = THEMES[themeMode];
  const style = FLOWER_STYLES[flowerStyle];

  useEffect(() => {
    setAgents(DEFAULT_AGENTS);
    setAgentOutputs(DEFAULT_AGENTS.map(() => ({ input: '', output: '', time: 0 })));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileObject(file);
    setDocument('');

    if (file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        setDocument(readEvent.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessAndPreview = async () => {
    if (!fileObject) return;

    if (fileObject.type.startsWith('text/')) {
      setStep('preview');
      return;
    }

    if (fileObject.type.startsWith('image/')) {
      setIsProcessingOcr(true);
      try {
        const ocrText = await performOcr(fileObject, ocrLanguage);
        setDocument(ocrText);
        setStep('preview');
      } catch (error) {
        console.error("OCR Error:", error);
        alert("An error occurred during OCR processing. Please ensure your API key is valid and check the console for details.");
      } finally {
        setIsProcessingOcr(false);
      }
      return;
    }
    
    alert("Unsupported file type. Please upload a text file (.txt, .md) or an image file (.png, .jpg, .webp).");
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocument(e.target.value);
  };

  const executeAgent = async (index: number) => {
    setIsExecutingAgents(true);
    const agent = agents[index];
    const prevOutput = index === 0 ? document : agentOutputs[index - 1].output;
    
    const startTime = Date.now();
    try {
      const result = await executeAgentPrompt(agent.prompt, prevOutput, agent.model, agent.temperature, agent.topP);
      const endTime = Date.now();
      
      const newOutputs = [...agentOutputs];
      newOutputs[index] = { input: prevOutput, output: result, time: (endTime - startTime) / 1000 };
      setAgentOutputs(newOutputs);
      
      if (index < selectedAgentCount - 1) {
        // Automatically advance to the next agent view after successful execution
        // setCurrentAgentIndex(index + 1);
      }
    } catch (error) {
        console.error(`Error executing agent ${agent.name}:`, error);
        alert(`An error occurred while executing ${agent.name}. Please ensure your API key is valid and check the console for details.`);
    } finally {
      setIsExecutingAgents(false);
    }
  };

  const updateAgentParam = <K extends keyof Agent>(index: number, field: K, value: Agent[K]) => {
    const newAgents = [...agents];
    newAgents[index] = { ...newAgents[index], [field]: value };
    setAgents(newAgents);
  };

  const handleDownload = () => {
    let content = `# Agentic AI Document Processing Report\n\n`;
    content += `## 📄 Original Document/Text\n---\n${document}\n---\n\n`;

    agents.slice(0, selectedAgentCount).forEach((agent, idx) => {
        const output = agentOutputs[idx];
        if (output && output.output) {
            content += `## 🤖 Agent ${idx + 1}: ${agent.name}\n\n`;
            content += `### 📝 Prompt\n\`\`\`\n${agent.prompt}\n\`\`\`\n\n`;
            content += `### 📥 Input (truncated)\n\`\`\`\n${output.input.substring(0, 500)}${output.input.length > 500 ? '...' : ''}\n\`\`\`\n\n`;
            content += `### 📤 Output (Execution Time: ${output.time.toFixed(2)}s)\n---\n${output.output}\n---\n\n`;
        }
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.split('.')[0] || 'document'}_processing_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      <div className={`bg-gradient-to-r ${style.gradient} border-b ${theme.border} shadow-lg sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Flower2 size={40} style={{ color: style.accent }} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: style.accent }}>智能文件處理系統</h1>
                <p className="text-sm opacity-75">Agentic AI Document Processor</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowStylePicker(!showStylePicker)} className="p-2 rounded-lg hover:bg-white/20 transition-colors" style={{ color: style.accent }}>
                <Palette size={24} />
              </button>
              <button onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} className="p-2 rounded-lg hover:bg-white/20 transition-colors" style={{ color: style.accent }}>
                {themeMode === 'light' ? <Moon size={24} /> : <Sun size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showStylePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.card} rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles style={{ color: style.accent }} /> 選擇花卉主題風格
              </h2>
              <button onClick={() => setShowStylePicker(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FLOWER_STYLES.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => { setFlowerStyle(idx); setShowStylePicker(false); }}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${flowerStyle === idx ? 'border-4' : 'border'}`}
                  style={{ backgroundColor: s.secondary, borderColor: s.accent }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌸</div>
                    <div className="font-bold" style={{ color: s.accent }}>{s.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['上傳', '預覽', '設定', '執行'].map((s, idx) => (
              <React.Fragment key={idx}>
                <div
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${['upload', 'preview', 'config', 'execute'][idx] === step ? 'shadow-lg scale-110' : 'opacity-50'}`}
                  style={{ backgroundColor: ['upload', 'preview', 'config', 'execute'][idx] === step ? style.primary : style.secondary, color: style.accent }}
                >
                  {s}
                </div>
                {idx < 3 && <ChevronRight style={{ color: style.accent }} className="hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className={`${theme.card} rounded-2xl p-8 border-2`} style={{ borderColor: style.primary }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Upload style={{ color: style.accent }} /> 上傳文件</h2>
              <div className="border-4 border-dashed rounded-xl p-12 text-center mb-6 transition-colors hover:bg-opacity-50" style={{ borderColor: style.primary, backgroundColor: style.secondary }}>
                <input type="file" onChange={handleFileUpload} accept=".txt,.md,.png,.jpg,.jpeg,.webp" className="hidden" id="fileInput" />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <FileText size={64} className="mx-auto mb-4" style={{ color: style.accent }} />
                  <p className="text-lg font-semibold mb-2">點擊或拖放文件</p>
                  <p className="text-sm opacity-75">支援 TXT, MD, PNG, JPG, WEBP</p>
                </label>
              </div>

              {fileName && <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: style.secondary }}><p className="font-semibold">已選擇: {fileName}</p></div>}

              {fileObject && fileObject.type.startsWith('image/') && (
                <div className="space-y-4 mb-6">
                  <div>
                      <label className="block font-semibold mb-2">OCR 語言</label>
                      <select value={ocrLanguage} onChange={(e) => setOcrLanguage(e.target.value)} className={`w-full p-3 rounded-lg border-2 ${theme.bg} ${theme.text}`} style={{ borderColor: style.primary }}>
                          <option value="english">English</option>
                          <option value="traditional-chinese">繁體中文</option>
                      </select>
                  </div>
                </div>
              )}
              
              {fileName && (
                 <button
                    onClick={handleProcessAndPreview}
                    disabled={isProcessingOcr}
                    className="w-full py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: style.accent }}
                  >
                    {isProcessingOcr && <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isProcessingOcr ? '正在處理OCR...' : (fileObject?.type.startsWith('image/') ? '處理並預覽文件' : '下一步：預覽文件')}
                  </button>
              )}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="max-w-6xl mx-auto">
            <div className={`${theme.card} rounded-2xl p-8 border-2`} style={{ borderColor: style.primary }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Eye style={{ color: style.accent }} /> 文件預覽</h2>
              
              <label className="block font-semibold mb-2">可編輯的預覽結果</label>
              <div className="mb-6">
                <textarea
                  value={document}
                  onChange={handleDocumentChange}
                  className={`w-full p-4 rounded-xl border-2 h-96 font-mono text-sm resize-none ${theme.bg} ${theme.text}`}
                  style={{ borderColor: style.primary }}
                  placeholder="沒有可預覽的內容。在此處編輯文本..."
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('upload')} className="flex-1 py-3 rounded-xl font-bold border-2 hover:opacity-80" style={{ borderColor: style.accent, color: style.accent }}>返回</button>
                <button onClick={() => setStep('config')} className="flex-1 py-3 rounded-xl font-bold text-white hover:opacity-90" style={{ backgroundColor: style.accent }}>下一步：設定代理</button>
              </div>
            </div>
          </div>
        )}

        {step === 'config' && (
          <div className="max-w-6xl mx-auto">
            <div className={`${theme.card} rounded-2xl p-8 border-2`} style={{ borderColor: style.primary }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings style={{ color: style.accent }} /> 代理設定</h2>
                <div className="mb-6">
                    <label className="block font-semibold mb-2">要使用的代理數量: {selectedAgentCount}</label>
                    <input type="range" min="1" max={agents.length} value={selectedAgentCount} onChange={(e) => setSelectedAgentCount(parseInt(e.target.value))} className="w-full"/>
                </div>
                <div className="space-y-4 mb-6 max-h-[50vh] overflow-auto p-2">
                    {agents.slice(0, selectedAgentCount).map((agent, idx) => (
                        <div key={idx} className="p-6 rounded-xl border-2" style={{ borderColor: style.primary, backgroundColor: style.secondary }}>
                            <h3 className="font-bold text-lg mb-4" style={{ color: style.accent }}>代理 {idx + 1}: {agent.name}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block font-semibold mb-2">提示詞</label>
                                    <textarea value={agent.prompt} onChange={(e) => updateAgentParam(idx, 'prompt', e.target.value)} className={`w-full p-3 rounded-lg border ${theme.bg} ${theme.text}`} rows="3"/>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">模型</label>
                                    <select value={agent.model} onChange={(e) => updateAgentParam(idx, 'model', e.target.value as GeminiModel)} className={`w-full p-3 rounded-lg border ${theme.bg} ${theme.text}`}>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">溫度: {agent.temperature}</label>
                                    <input type="range" min="0" max="1" step="0.1" value={agent.temperature} onChange={(e) => updateAgentParam(idx, 'temperature', parseFloat(e.target.value))} className="w-full"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setStep('preview')} className="flex-1 py-3 rounded-xl font-bold border-2 hover:opacity-80" style={{ borderColor: style.accent, color: style.accent }}>返回</button>
                    <button onClick={() => { setStep('execute'); setCurrentAgentIndex(0); }} className="flex-1 py-3 rounded-xl font-bold text-white hover:opacity-90" style={{ backgroundColor: style.accent }}>開始執行</button>
                </div>
            </div>
          </div>
        )}

        {step === 'execute' && (
          <div className="max-w-7xl mx-auto">
            <div className={`${theme.card} rounded-2xl p-8 border-2 mb-6`} style={{ borderColor: style.primary }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Play style={{ color: style.accent }} /> 執行代理 ({currentAgentIndex < selectedAgentCount ? currentAgentIndex + 1 : selectedAgentCount} / {selectedAgentCount})
              </h2>
              {currentAgentIndex < selectedAgentCount && (
                <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: style.secondary, borderLeft: `6px solid ${style.accent}` }}>
                  <h3 className="font-bold text-xl mb-4" style={{ color: style.accent }}>當前代理: {agents[currentAgentIndex].name}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">輸入</h4>
                      <div className={`p-4 rounded-lg border h-64 overflow-auto ${theme.bg}`}>
                        <pre className="whitespace-pre-wrap text-sm">{currentAgentIndex === 0 ? document : agentOutputs[currentAgentIndex - 1].output}</pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">輸出</h4>
                      <div className={`p-4 rounded-lg border h-64 overflow-auto ${theme.bg}`}>
                        {isExecutingAgents && currentAgentIndex === agents.findIndex(a => a.name === agents[currentAgentIndex].name) && (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{borderColor: style.accent, borderTopColor: 'transparent'}}></div>
                            </div>
                        )}
                        {!isExecutingAgents && agentOutputs[currentAgentIndex].output && <pre className="whitespace-pre-wrap text-sm">{agentOutputs[currentAgentIndex].output}</pre>}
                        {!isExecutingAgents && !agentOutputs[currentAgentIndex].output && <p className="text-gray-400 italic">等待執行...</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => executeAgent(currentAgentIndex)}
                      disabled={isExecutingAgents || !!agentOutputs[currentAgentIndex].output}
                      className="flex-1 py-3 rounded-xl font-bold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ backgroundColor: style.accent }}
                    >
                      <Play size={20} /> {isExecutingAgents ? '執行中...' : '執行此代理'}
                    </button>
                    {agentOutputs[currentAgentIndex].output && currentAgentIndex < selectedAgentCount - 1 && (
                      <button onClick={() => setCurrentAgentIndex(currentAgentIndex + 1)} className="px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: style.accent }}>
                        下一個 <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentAgentIndex >= selectedAgentCount - 1 && agentOutputs[selectedAgentCount-1]?.output && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-3xl font-bold mb-6" style={{ color: style.accent }}>所有代理執行完成！</h3>
                  <button onClick={handleDownload} className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 flex items-center gap-2 mx-auto" style={{ backgroundColor: style.accent }}>
                    <Download size={24} /> 下載結果
                  </button>
                </div>
              )}

              <div className="mt-8">
                <h3 className="font-bold text-xl mb-4">執行歷史</h3>
                <div className="space-y-3">
                  {agents.slice(0, selectedAgentCount).map((agent, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition-opacity ${idx <= currentAgentIndex ? 'opacity-100' : 'opacity-50'}`}
                      style={{ borderColor: agentOutputs[idx].output ? style.accent : style.primary, backgroundColor: style.secondary }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${isExecutingAgents && currentAgentIndex === idx ? 'animate-pulse' : ''}`}
                            style={{backgroundColor: agentOutputs[idx].output ? style.accent : 'gray'}}
                          ></div>
                          <p className="font-bold">{agent.name}</p>
                        </div>
                        {agentOutputs[idx].output && <span className="text-xs font-mono">{agentOutputs[idx].time.toFixed(2)}s</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgenticDocProcessor;
