
import React, { useState, useRef } from 'react';
import { Camera, Printer, Share2, Upload, Trash2, Sparkles, Wand2, Frame as FrameIcon, X } from 'lucide-react';
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
          title: 'Minha Foto do InstaPrint',
          text: state.aiCaption || 'Confira minha foto filtrada!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Sharing failed', err);
      }
    } else {
      alert('Compartilhamento não suportado neste navegador.');
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
    <div className="min-h-screen bg-black flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md px-6 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-40 no-print">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          InstaPrint
        </h1>
        {state.image && (
          <button onClick={reset} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <Trash2 size={20} />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md flex-1 flex flex-col no-print">
        {!state.image ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-64 h-64 bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 text-center p-4">
              <Camera size={48} className="mb-4 text-zinc-600" />
              <p className="text-sm">Capture ou carregue uma foto para começar</p>
            </div>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => setState(p => ({ ...p, isCameraOpen: true }))}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
              >
                <Camera size={20} />
                Abrir Câmera
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 border border-zinc-800 hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Upload size={20} />
                Carregar da Galeria
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleUpload} 
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 p-4 pb-20">
            {/* Image Preview with Filter and Frame */}
            <div className="relative aspect-square w-full bg-zinc-900 rounded-lg overflow-hidden shadow-2xl shadow-purple-500/10 mb-6 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img 
                  src={state.image} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-all duration-300 absolute inset-0"
                  style={{ filter: state.selectedFilter.cssFilter }}
                />
                {state.selectedFrame && state.selectedFrame.url && (
                  <img 
                    src={state.selectedFrame.url} 
                    alt="Frame" 
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
                  />
                )}
              </div>
              
              {state.isProcessing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="text-purple-400 animate-pulse" size={32} />
                    <p className="text-xs font-medium text-white">IA ANALISANDO...</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Caption Section */}
            {state.aiCaption && (
              <div className="mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                <p className="italic text-zinc-300 text-sm leading-relaxed">
                  "{state.aiCaption}"
                </p>
              </div>
            )}

            {/* Filter Slider */}
            <div className="mb-6">
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles size={12} /> Filtros
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {FILTERS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setState(prev => ({ ...prev, selectedFilter: f }))}
                    className="flex flex-col items-center flex-shrink-0 group"
                  >
                    <div className={`w-14 h-14 rounded-lg overflow-hidden mb-2 border-2 transition-all ${
                      state.selectedFilter.name === f.name ? 'border-purple-500 scale-105' : 'border-transparent group-hover:border-zinc-700'
                    }`}>
                      <img 
                        src={state.image!} 
                        className="w-full h-full object-cover" 
                        style={{ filter: f.cssFilter }} 
                      />
                    </div>
                    <span className={`text-[9px] font-bold uppercase ${
                      state.selectedFilter.name === f.name ? 'text-purple-400' : 'text-zinc-500'
                    }`}>
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <FrameIcon size={12} /> Molduras (PNG)
                </h3>
                <button 
                  onClick={() => frameInputRef.current?.click()}
                  className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-zinc-700"
                >
                  <Upload size={10} /> + PNG
                </button>
                <input 
                  type="file" 
                  ref={frameInputRef} 
                  className="hidden" 
                  accept="image/png" 
                  onChange={handleFrameUpload} 
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {allFrames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setState(prev => ({ ...prev, selectedFrame: frame.id === 'none' ? null : frame }))}
                    className="flex flex-col items-center flex-shrink-0 group"
                  >
                    <div className={`w-14 h-14 rounded-lg bg-zinc-900 border-2 transition-all flex items-center justify-center overflow-hidden relative ${
                      (state.selectedFrame?.id === frame.id || (!state.selectedFrame && frame.id === 'none')) ? 'border-orange-500 scale-105' : 'border-transparent group-hover:border-zinc-700'
                    }`}>
                      {frame.url ? (
                        <>
                          <div className="w-8 h-8 bg-zinc-800 rounded opacity-30" />
                          <img 
                            src={frame.url} 
                            className="absolute inset-0 w-full h-full object-contain" 
                          />
                        </>
                      ) : (
                        <X size={20} className="text-zinc-600" />
                      )}
                    </div>
                    <span className={`text-[9px] font-bold uppercase mt-2 ${
                      (state.selectedFrame?.id === frame.id || (!state.selectedFrame && frame.id === 'none')) ? 'text-orange-400' : 'text-zinc-500'
                    }`}>
                      {frame.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <button 
                onClick={handleGetAICaption}
                disabled={state.isProcessing}
                className="col-span-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-purple-900/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Wand2 size={18} />
                Gerar Legenda com IA
              </button>
              
              <button 
                onClick={handlePrint}
                className="py-4 bg-zinc-100 text-black rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all"
              >
                <Printer size={18} />
                Imprimir
              </button>
              
              <button 
                onClick={handleShare}
                className="py-4 bg-zinc-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all"
              >
                <Share2 size={18} />
                Compartilhar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Print View (Only visible when printing) */}
      {state.image && (
        <div className="hidden print-area fixed inset-0 bg-white p-8 overflow-hidden">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="relative w-[500px] border-[16px] border-white shadow-2xl bg-white p-4">
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
                <p className="text-black font-serif italic text-center text-xl mt-6 border-t border-zinc-100 pt-6 px-4">
                  {state.aiCaption}
                </p>
              )}
              <div className="flex justify-between items-center mt-10 px-2 opacity-30">
                 <p className="text-black font-bold text-[12px] tracking-widest uppercase">InstaPrint</p>
                 <p className="text-black text-[12px]">{new Date().toLocaleDateString('pt-BR')}</p>
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

      {/* Tailwind specific hack for hiding scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media print {
          body { background: white !important; }
          #root { visibility: hidden; }
          .print-area { visibility: visible; position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
