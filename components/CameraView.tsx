
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, X, Maximize2 } from 'lucide-react';

interface CameraViewProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isReady, setIsReady] = useState(false);

  const startCamera = async () => {
    try {
      setIsReady(false);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
      onClose();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Capture square aspect ratio
      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        <div className="p-4 flex justify-between items-center bg-black/50 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-bold tracking-widest uppercase">Live View</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-video lg:aspect-square bg-black overflow-hidden flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="h-full w-full object-cover scale-x-[-1]"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Square Frame Overlay */}
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
             <div className="w-full h-full max-w-md max-h-md border border-white/20"></div>
          </div>
          
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-xs font-medium text-zinc-500">Iniciando câmera...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 flex justify-center items-center gap-8 bg-black/50">
          <button 
            onClick={toggleCamera} 
            title="Alternar Câmera"
            className="p-4 bg-zinc-800 rounded-2xl text-white hover:bg-zinc-700 transition-colors active:scale-95"
          >
            <RefreshCw size={24} />
          </button>
          
          <button 
            onClick={capturePhoto}
            disabled={!isReady}
            className="group relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 transition-all active:scale-90 disabled:opacity-50"
          >
            <div className="w-full h-full bg-white rounded-full transition-transform group-hover:scale-95" />
            <div className="absolute -inset-4 border border-white/10 rounded-full animate-ping opacity-20 pointer-events-none"></div>
          </button>

          <div className="w-14" /> {/* Spacer para equilíbrio visual */}
        </div>
      </div>
      
      <p className="mt-4 text-zinc-500 text-xs font-medium">Posicione-se no centro do quadro para o enquadramento perfeito.</p>
    </div>
  );
};
