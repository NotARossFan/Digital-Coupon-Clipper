import React, { useState, useCallback } from 'react';
import { InputMode, ScriptResponse } from './types';
import { generateScriptFromHtml, generateScriptFromImage } from './services/geminiService';
import CouponPlayground from './components/CouponPlayground';
import CodeOutput from './components/CodeOutput';
import { Upload, Code, Image as ImageIcon, Zap, AlertCircle, HelpCircle, Check, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<InputMode>(InputMode.SCREENSHOT);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState<ScriptResponse | null>(null);
  const [htmlInput, setHtmlInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
        setError("Image size must be under 4MB");
        return;
    }

    setError(null);
    setImageFile(file); // Store file for regeneration
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      // Automatically analyze upon upload
      analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string, mimeType: string) => {
    setIsLoading(true);
    setScriptResult(null);
    try {
      // Remove header for API
      const base64Data = base64.split(',')[1];
      const result = await generateScriptFromImage(base64Data, mimeType, autoScroll);
      setScriptResult(result);
    } catch (e) {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = () => {
      if (imagePreview && imageFile) {
          analyzeImage(imagePreview, imageFile.type);
      }
  };

  const handleHtmlAnalyze = async () => {
    if (!htmlInput.trim()) {
        setError("Please paste some HTML code.");
        return;
    }
    setError(null);
    setIsLoading(true);
    setScriptResult(null);
    try {
      const result = await generateScriptFromHtml(htmlInput, autoScroll);
      setScriptResult(result);
    } catch (e) {
      setError("Failed to analyze HTML. Ensure it contains button elements.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for Playground to clear state
  const resetAnalysis = useCallback(() => {
      // Optional: Clear result when playground resets? 
      // No, let's keep the script visible so they can try it.
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">AutoClip AI</span>
          </div>
          <div className="hidden md:flex items-center text-sm text-slate-500 space-x-6">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Gemini 2.5 Flash Active</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Instructions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Hero / Intro */}
            <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-3">Automate your grocery savings</h1>
                <p className="text-indigo-200 text-sm leading-relaxed max-w-lg">
                  Don't click 100 times. Upload a screenshot of your store's coupon page or paste the HTML source. 
                  Our AI detects the buttons and writes a custom "Select All" script for you.
                </p>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setMode(InputMode.SCREENSHOT)}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                    mode === InputMode.SCREENSHOT 
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon size={18} />
                  <span>From Screenshot</span>
                </button>
                <button
                  onClick={() => setMode(InputMode.HTML)}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                    mode === InputMode.HTML 
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Code size={18} />
                  <span>From HTML</span>
                </button>
              </div>

              <div className="p-6">
                
                {/* Common Options */}
                <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div 
                        className="flex items-center space-x-3 cursor-pointer group"
                        onClick={() => setAutoScroll(!autoScroll)}
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${autoScroll ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400 bg-white'}`}>
                            {autoScroll && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">Include auto-scrolling logic</span>
                    </div>
                    <div className="text-xs text-slate-400 hidden sm:block">For lazy-loading pages</div>
                </div>

                {mode === InputMode.SCREENSHOT ? (
                  <div className="space-y-4">
                    <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                        imagePreview ? 'border-indigo-200 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                    }`}>
                      {imagePreview ? (
                        <div className="flex flex-col w-full items-center">
                             <div className="relative w-full h-64 mb-4">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded" />
                                <button 
                                    onClick={(e) => { e.preventDefault(); setImagePreview(null); setImageFile(null); }}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition"
                                >
                                    <Zap size={14} />
                                </button>
                            </div>
                            <button
                                onClick={handleRegenerateImage}
                                disabled={isLoading}
                                className="flex items-center space-x-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                                <span>{isLoading ? 'Analzying...' : 'Regenerate Script'}</span>
                            </button>
                        </div>
                      ) : (
                        <>
                            <div className="bg-slate-100 p-4 rounded-full mb-3">
                                <Upload className="text-slate-400 w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Click to upload screenshot</p>
                            <p className="text-xs text-slate-500">PNG, JPG up to 4MB</p>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </>
                      )}
                    </div>
                    {!imagePreview && (
                        <div className="flex items-start space-x-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                            <HelpCircle size={14} className="mt-0.5 flex-shrink-0" />
                            <p>Tip: Take a screenshot that clearly shows both an "Unclipped" button and a "Clipped" button for best accuracy.</p>
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea 
                        value={htmlInput}
                        onChange={(e) => setHtmlInput(e.target.value)}
                        placeholder="Right click the coupon grid -> Inspect -> Copy Outer HTML -> Paste here..."
                        className="w-full h-64 p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />
                    <button
                        onClick={handleHtmlAnalyze}
                        disabled={isLoading || !htmlInput}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-sm flex items-center justify-center"
                    >
                        {isLoading ? 'Analyzing...' : 'Generate Script'}
                    </button>
                  </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}
              </div>
            </div>

            {/* Instructions Step */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">?</div>
                    How to use
                </h3>
                <ol className="space-y-4 text-sm text-slate-600">
                    <li className="flex">
                        <span className="font-bold mr-2 text-indigo-600">1.</span>
                        <span>Copy the generated code from the black box.</span>
                    </li>
                    <li className="flex">
                        <span className="font-bold mr-2 text-indigo-600">2.</span>
                        <span>Go to your grocery store's coupon page in your browser.</span>
                    </li>
                    <li className="flex">
                        <span className="font-bold mr-2 text-indigo-600">3.</span>
                        <span>Press <kbd className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-xs font-sans">F12</kbd> (Windows) or <kbd className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-xs font-sans">Cmd+Opt+J</kbd> (Mac) to open Developer Tools.</span>
                    </li>
                    <li className="flex">
                        <span className="font-bold mr-2 text-indigo-600">4.</span>
                        <span>Paste the code into the "Console" tab and hit Enter. Watch them clip!</span>
                    </li>
                </ol>
            </div>

          </div>

          {/* Right Column: Output & Playground */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Code Output */}
            <div className="h-[400px]">
                <CodeOutput data={scriptResult} isLoading={isLoading} />
            </div>

            {/* Playground */}
            <div className="h-[400px]">
                <CouponPlayground onRefReset={resetAnalysis} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;