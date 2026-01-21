
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';

interface CameraViewProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    try {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Não foi possível acessar a câmera.");
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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between">
      <div className="w-full p-4 flex justify-between items-center text-white">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X size={24} />
        </button>
        <span className="font-semibold text-sm">CÂMERA</span>
        <div className="w-10"></div>
      </div>

      <div className="relative flex-1 w-full max-w-md bg-zinc-900 overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="w-full p-8 flex justify-around items-center bg-black">
        <button 
          onClick={toggleCamera} 
          className="p-4 bg-zinc-800 rounded-full text-white"
        >
          <RefreshCw size={24} />
        </button>
        
        <button 
          onClick={capturePhoto}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1"
        >
          <div className="w-full h-full bg-white rounded-full transition-transform active:scale-90" />
        </button>

        <div className="w-14 h-14" /> {/* Spacer */}
      </div>
    </div>
  );
};
