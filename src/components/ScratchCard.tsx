import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  content: string;
  isLocked: boolean;
  onReveal: () => void;
  onStartScratch?: () => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ content, isLocked, onReveal, onStartScratch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // 強制瀏覽器下載並準備好 Klee One 字體，避免 Canvas 繪製時字體還沒下載完
    document.fonts.load('bold 20px "Klee One"').then(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // 避免 CSS Grid 分配出帶有小數點的寬度，導致 Canvas 渲染抗鋸齒模糊（字體變細）
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#e8ede9');
      gradient.addColorStop(0.5, '#dce5df');
      gradient.addColorStop(1, '#b5c5b8');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for(let i=0; i<30; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * width, 
          Math.random() * height, 
          Math.random() * 2, 
          0, Math.PI * 2
        );
        ctx.fillStyle = Math.random() > 0.5 ? '#fcf9e3' : '#fff';
        ctx.fill();
      }
      
      ctx.fillStyle = '#6b826e';
      const fontSize = Math.max(14, width * 0.16); 
      ctx.font = `bold ${Math.floor(fontSize)}px "Klee One", "Caveat", cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // 確保文字繪製在絕對的整數座標上，消除次像素渲染帶來的模糊感
      ctx.fillText('刮刮看', Math.round(width / 2), Math.round(height / 2));

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(20, width * 0.25);
    });
  }, []);

  const calculateScratchPercentage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }
    const totalPixels = pixels.length / 4;
    return (transparentPixels / totalPixels) * 100;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isScratched || isLocked) return;
    setIsDrawing(true);
    if (onStartScratch) onStartScratch();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const rect = canvas!.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isScratched || isLocked) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && !isScratched && !isLocked) {
      const percentage = calculateScratchPercentage(ctx, canvas.width, canvas.height);
      if (percentage > 40) {
        setIsScratched(true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onReveal();
      }
    }
  };

  return (
    <div 
      className={`relative w-full aspect-square hand-drawn-border bg-white transition-all duration-700 
        ${isLocked && !isScratched ? 'opacity-60 grayscale scale-95' : 'hover:scale-105'}`}
    >
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 md:p-3 transition-opacity duration-300 ${isLocked && !isScratched ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#5c7a65] text-center break-words w-full line-clamp-3 leading-tight">
          {content}
        </span>
      </div>
      
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full touch-none hand-drawn-border !border-0
          ${isScratched ? 'pointer-events-none' : 'cursor-pointer'}`}
      />
    </div>
  );
};
