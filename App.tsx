
import React, { useState, useRef } from 'react';
import { Camera, Printer, Share2, Upload, Trash2, Sparkles, Wand2, Frame as FrameIcon, X, Layout, Image as ImageIcon } from 'lucide-react';
import { FILTERS, FRAMES, Filter, Frame, AppState } from './types';
import { CameraView } from './components/CameraView';
import { generateImageCaption } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    selectedFilter: FILTERS[0],
    selectedFrame: null,
    isCameraOpen: false,
    isProcessing: false,
    aiCaption: '',
  });

  const [customFrames, setCustomFrames] = useState<Frame[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (img: string) => {
    setState(prev => ({ ...prev, image: img, isCameraOpen: false, aiCaption: '' }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({ ...prev, image: event.target?.result as string, aiCaption: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFrame: Frame = {
          id: `custom-${Date.now()}`,
          name: 'Custom',
          url: event.target?.result as string
        };
        setCustomFrames(prev => [newFrame, ...prev]);
        setState(prev => ({ ...prev, selectedFrame: newFrame }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetAICaption = async () => {
    if (!state.image) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    const caption = await generateImageCaption(state.image);
    setState(prev => ({ ...prev, aiCaption: caption, isProcessing: false }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && state.image) {
      try {
        await navigator.share({
          title: 'InstaPrint Web',
          text: state.aiCaption || 'Veja minha criação!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Sharing failed', err);
      }
    } else {
      alert('Compartilhamento não suportado. Você pode baixar ou imprimir a foto.');
    }
  };

  const reset = () => {
    setState({
      image: null,
      selectedFilter: FILTERS[0],
      selectedFrame: null,
      isCameraOpen: false,
      isProcessing: false,
      aiCaption: '',
    });
  };

  const allFrames = [...FRAMES, ...customFrames];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-black/40 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
             <ImageIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              InstaPrint <span className="text-xs font-normal text-zinc-500 ml-1">WEB v2.0</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {state.image && (
            <button 
              onClick={reset} 
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 bg-zinc-900/50 rounded-lg border border-zinc-800"
            >
              <Trash2 size={16} /> <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </header>

      {/* Main App Area */}
      <main className="flex-1 flex flex-col lg:flex-row no-print">
        
        {!state.image ? (
          /* Empty State / Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                  Suas fotos com <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
                    Estilo Profissional.
                  </span>
                </h2>
                <p className="text-zinc-400 text-lg max-w-md mx-auto md:mx-0">
                  Aplique filtros premium, molduras personalizadas e use IA para criar legendas memoráveis para suas impressões.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button 
                    onClick={() => setState(p => ({ ...p, isCameraOpen: true }))}
                    className="px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                  >
                    <Camera size={20} /> Iniciar Câmera
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 border border-zinc-800 hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
                  >
                    <Upload size={20} /> Abrir Arquivo
                  </button>
                </div>
              </div>
              <div className="hidden md:block relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-zinc-900 rounded-3xl p-8 border border-zinc-800 aspect-[4/5] flex flex-col justify-end overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                   <div className="relative z-10">
                     <div className="h-2 w-12 bg-purple-500 rounded-full mb-4"></div>
                     <p className="text-sm font-medium text-zinc-300">"Capturando momentos através da lente do design."</p>
                   </div>
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
          </div>
        ) : (
          /* Editor UI */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Sidebar: Controls (Filters & Frames) */}
            <aside className="w-full lg:w-80 bg-zinc-950 border-r border-white/5 flex flex-col no-scrollbar overflow-y-auto">
              <div className="p-6 space-y-8">
                
                {/* Filters Section */}
                <div>
                  <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-500" /> Filtros Premium
                  </h3>
                  <div className="grid grid-cols-4 lg:grid-cols-2 gap-3">
                    {FILTERS.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setState(prev => ({ ...prev, selectedFilter: f }))}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          state.selectedFilter.name === f.name ? 'border-purple-500' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <img 
                          src={state.image!} 
                          className="w-full h-full object-cover rounded-lg" 
                          style={{ filter: f.cssFilter }} 
                        />
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                          state.selectedFilter.name === f.name ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                        }`}>
                           <span className="text-[10px] font-bold uppercase tracking-tighter">{f.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frames Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                      <FrameIcon size={14} className="text-orange-500" /> Molduras PNG
                    </h3>
                    <button 
                      onClick={() => frameInputRef.current?.click()}
                      className="p-1.5 bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors"
                    >
                      <Upload size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 lg:grid-cols-2 gap-3">
                    {allFrames.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setState(prev => ({ ...prev, selectedFrame: frame.id === 'none' ? null : frame }))}
                        className={`relative aspect-square rounded-xl bg-zinc-900 border-2 transition-all flex items-center justify-center overflow-hidden ${
                          (state.selectedFrame?.id === frame.id || (!state.selectedFrame && frame.id === 'none')) ? 'border-orange-500' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {frame.url ? (
                          <img src={frame.url} className="w-full h-full object-contain p-2" />
                        ) : (
                          <X size={20} className="text-zinc-600" />
                        )}
                        <span className="absolute bottom-1 text-[8px] font-bold uppercase text-zinc-500">{frame.name}</span>
                      </button>
                    ))}
                  </div>
                  <input type="file" ref={frameInputRef} className="hidden" accept="image/png" onChange={handleFrameUpload} />
                </div>

              </div>
            </aside>

            {/* Central Stage: Large Image Preview */}
            <section className="flex-1 bg-zinc-900/30 p-4 lg:p-12 flex items-center justify-center relative min-h-[400px]">
              <div className="relative max-w-full max-h-full flex items-center justify-center shadow-[0_0_100px_rgba(168,85,247,0.15)] rounded-2xl overflow-hidden group">
                <div className="relative max-w-full">
                  <img 
                    src={state.image} 
                    alt="Preview" 
                    className="max-h-[70vh] w-auto object-contain transition-all duration-500"
                    style={{ filter: state.selectedFilter.cssFilter }}
                  />
                  {state.selectedFrame && state.selectedFrame.url && (
                    <img 
                      src={state.selectedFrame.url} 
                      alt="Frame" 
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
                    />
                  )}
                  
                  {state.isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto text-purple-400 animate-pulse" size={24} />
                      </div>
                      <p className="mt-4 text-xs font-bold tracking-widest text-purple-200">IA ANALISANDO IMAGEM...</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right Sidebar: AI & Actions */}
            <aside className="w-full lg:w-80 bg-zinc-950 border-l border-white/5 flex flex-col p-6 space-y-6">
              
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Editor de Legenda</h3>
                  <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 space-y-4">
                    {state.aiCaption ? (
                      <textarea 
                        className="w-full bg-transparent text-sm text-zinc-300 resize-none focus:outline-none min-h-[100px]"
                        value={state.aiCaption}
                        onChange={(e) => setState(p => ({ ...p, aiCaption: e.target.value }))}
                      />
                    ) : (
                      <div className="text-center py-6">
                        <Wand2 size={24} className="mx-auto text-zinc-700 mb-3" />
                        <p className="text-xs text-zinc-500">Nenhuma legenda gerada ainda.</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={handleGetAICaption}
                      disabled={state.isProcessing}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-purple-900/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles size={14} />
                      {state.aiCaption ? 'Regerar com IA' : 'Gerar com IA'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Ações</h3>
                  <button 
                    onClick={handlePrint}
                    className="w-full py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-bold text-sm hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5"
                  >
                    <Printer size={18} /> Imprimir Agora
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-sm border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all"
                  >
                    <Share2 size={18} /> Compartilhar
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900">
                <div className="flex items-center gap-3 text-zinc-600">
                  <Layout size={16} />
                  <p className="text-[10px] font-medium leading-tight">
                    Otimizado para impressão em alta resolução 300DPI.
                  </p>
                </div>
              </div>
            </aside>

          </div>
        )}
      </main>

      {/* Print View (Optimized for Web Printing) */}
      {state.image && (
        <div className="hidden print-area fixed inset-0 bg-white">
          <div className="flex flex-col items-center justify-center min-h-screen p-10">
            {/* Simulation of a Photo Paper */}
            <div className="relative w-[15cm] bg-white shadow-none border-[1cm] border-white text-black">
              <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                <img 
                  src={state.image} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  style={{ filter: state.selectedFilter.cssFilter }} 
                />
                {state.selectedFrame && state.selectedFrame.url && (
                  <img 
                    src={state.selectedFrame.url} 
                    className="absolute inset-0 w-full h-full object-fill z-10"
                  />
                )}
              </div>
              {state.aiCaption && (
                <div className="pt-8 pb-4 px-2 text-center">
                  <p className="font-serif italic text-2xl leading-relaxed text-zinc-800">
                    "{state.aiCaption}"
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center mt-8 px-2 opacity-40 border-t border-zinc-100 pt-4">
                 <p className="font-bold text-[10px] tracking-[0.3em] uppercase">InstaPrint Web Collection</p>
                 <p className="text-[10px] tabular-nums">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Overlay */}
      {state.isCameraOpen && (
        <CameraView 
          onCapture={handleCapture} 
          onClose={() => setState(p => ({ ...p, isCameraOpen: false }))} 
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          #root { display: none !important; }
          .print-area { 
            display: flex !important; 
            position: relative !important; 
            visibility: visible !important;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }

        /* Smooth scroll for filters */
        aside {
          scrollbar-gutter: stable;
        }
        aside::-webkit-scrollbar {
          width: 4px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
