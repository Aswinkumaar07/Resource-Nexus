
import React, { useState, useRef, useEffect } from 'react';
import { analyzeWasteImage } from '../services/geminiService';
import { ScanResult, MaterialComponent } from '../types';

interface ScanModuleProps {
  onResultsFound: (results: ScanResult) => void;
  onCancel: () => void;
}

const ScanModule: React.FC<ScanModuleProps> = ({ onResultsFound, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ScanResult | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await startCamera();
    };
    init();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      stopCamera(); 
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setHasCamera(true);
            setCameraError(null);
          }).catch(err => {
            console.error("Video play failed:", err);
            setCameraError("Failed to start video playback.");
          });
        };
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setHasCamera(false);
      setCameraError("Camera access denied. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsFlashActive(true);
      setTimeout(() => setIsFlashActive(false), 150);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        setImage(dataUrl);
        stopCamera();
        processImage(dataUrl);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        stopCamera();
        processImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setAnalyzing(true);
    try {
      const data = base64.split(',')[1];
      const result = await analyzeWasteImage(data);
      
      const formattedResult: ScanResult = {
        components: result.components.map((c: any) => ({
          name: c.name,
          weightKg: c.weight_kg
        })),
        upcyclingIdeas: result.upcycling_ideas
      };
      
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
      resetScanner();
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setAnalyzing(false);
    setAnalysisResult(null);
    startCamera();
  };

  const handleProceed = () => {
    if (analysisResult) {
      onResultsFound(analysisResult);
    }
  };

  if (analysisResult) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-4 h-[calc(100vh-140px)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex items-center justify-between shrink-0">
           <h2 className="text-xl font-black text-white">Detection Review</h2>
           <button onClick={resetScanner} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 glass rounded-full">Retake</button>
        </div>

        <div className="glass rounded-[28px] overflow-hidden border border-white/10 relative h-32 shrink-0">
          <img src={image!} alt="Snapshot" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-4">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">Assets Verified</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pl-1">Components</h3>
          <div className="grid grid-cols-1 gap-2">
            {analysisResult.components.map((comp, idx) => (
              <div key={idx} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-base">
                    {comp.name.toLowerCase().includes('plastic') ? '🥤' : comp.name.toLowerCase().includes('metal') ? '⚙️' : comp.name.toLowerCase().includes('paper') ? '📜' : '📦'}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{comp.name}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Resource Unit</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400">{comp.weightKg.toFixed(2)}<span className="text-[9px] ml-1 text-slate-500 font-normal">KG</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 shrink-0">
          <button 
            onClick={handleProceed}
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
          >
            <span>Proceed to Market</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 h-[calc(100vh-140px)] overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <button onClick={onCancel} className="p-2 glass rounded-full text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-white tracking-tight">Nexus Vision</h2>
        <div className="w-9"></div>
      </div>

      <div className="flex-1 relative glass rounded-[32px] overflow-hidden flex flex-col items-center justify-center border border-white/10 bg-slate-900 min-h-0">
        {!image && (
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hasCamera ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {image && (
          <img src={image} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {!image && hasCamera && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-emerald-400/30 rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-emerald-400/30 rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-emerald-400/30 rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-emerald-400/30 rounded-br-lg" />
          </div>
        )}

        {isFlashActive && (
          <div className="absolute inset-0 bg-white z-[60] animate-out fade-out duration-150" />
        )}

        {analyzing && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-[50]">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
            <h4 className="text-white font-black text-xl mb-1">Analyzing...</h4>
            <p className="text-emerald-400 text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse">Running Gemini Vision AI</p>
          </div>
        )}

        {!image && !hasCamera && !analyzing && (
          <div className="text-center p-6 z-10">
            <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm">{cameraError ? 'Sensor Issue' : 'Connecting...'}</h3>
            {cameraError && (
              <button 
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/20"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="shrink-0 pb-2">
        {!image && !analyzing ? (
          <div className="flex items-center justify-between px-8">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-300 active:scale-90 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            
            <button 
              onClick={capturePhoto}
              disabled={!hasCamera}
              className="h-20 w-20 relative group active:scale-95 transition-transform"
            >
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40" />
              <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border border-slate-200 rounded-full" />
              </div>
            </button>

            <button 
              onClick={startCamera}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-300 active:scale-90 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        ) : (
          image && !analyzing && !analysisResult && (
            <div className="flex flex-col gap-2">
              <button 
                onClick={resetScanner}
                className="w-full glass text-white text-sm font-bold py-3 rounded-xl transition-all"
              >
                Cancel & Retake
              </button>
            </div>
          )
        )}
        {!analyzing && !image && (
          <p className="text-center text-[8px] text-slate-600 font-mono tracking-widest uppercase mt-4">
            Point sensor at waste material
          </p>
        )}
      </div>
    </div>
  );
};

export default ScanModule;
