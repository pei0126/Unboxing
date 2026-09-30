import { useState, useRef } from 'react';
import { ScratchCard } from './components/ScratchCard';
import { generateGridOptions } from './utils/shuffle';
import type { GameConfig } from './types';
import { Sparkles, Wand2, ArrowLeft, Share2, RotateCcw, Globe, Image, MessageCircle, AtSign, Copy, Camera, X, Plus, Trash2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export default function App() {
  const [config, setConfig] = useState<GameConfig>({
    title: '',
    subtitle: '',
    gridSize: 3,
    options: []
  });
  
  // 以陣列形式管理選項，改善手機端輸入體驗
  const [optionsList, setOptionsList] = useState([
    { id: '1', text: '去吃拉麵' },
    { id: '2', text: '吃壽司' },
    { id: '3', text: '隨便吃吃' },
    { id: '4', text: '買鹹酥雞' },
    { id: '5', text: '自己煮' },
  ]);
  
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [gameCards, setGameCards] = useState<string[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const [showShareOptions, setShowShareOptions] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d))) as GameConfig;
        setConfig(decoded);
        setOptionsList(decoded.options.map((opt, i) => ({ id: i.toString(), text: opt })));
        const count = decoded.gridSize * decoded.gridSize;
        setGameCards(generateGridOptions(decoded.options, count));
        setIsConfiguring(false);
      } catch(e) {
        console.error("Invalid share link");
      }
    }
  }, []);

  const handleAddOption = () => {
    setOptionsList([...optionsList, { id: Date.now().toString(), text: '' }]);
  };

  const handleUpdateOption = (id: string, text: string) => {
    setOptionsList(optionsList.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handleRemoveOption = (id: string) => {
    setOptionsList(optionsList.filter(opt => opt.id !== id));
  };

  const startGame = () => {
    const validOptions = optionsList.map(o => o.text.trim()).filter(o => o);
    if(validOptions.length === 0) {
      alert("請至少輸入一個選項喔！");
      return;
    }
    
    setConfig(prev => ({ ...prev, options: validOptions }));
    const count = config.gridSize * config.gridSize;
    setGameCards(generateGridOptions(validOptions, count));
    setActiveCardIndex(null);
    setResult(null);
    setIsConfiguring(false);
    setShowShareOptions(false);
  };

  const handleReveal = (option: string) => {
    setTimeout(() => {
      setResult(option);
    }, 600); 
  };

  const handleShareGame = async () => {
    const validOptions = optionsList.map(o => o.text.trim()).filter(o => o);
    if(validOptions.length === 0) {
      alert("請至少輸入一個選項喔！");
      return;
    }
    const currentConfig = { ...config, options: validOptions };
    const encoded = btoa(encodeURIComponent(JSON.stringify(currentConfig)));
    const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
    
    try {
      await navigator.clipboard.writeText(url);
      alert('已複製「盲盒遊戲連結」！快貼給朋友讓他們刮刮看吧！');
    } catch (e) {
      alert('複製失敗，請手動複製。');
    }
  };

  const resetGame = () => {
    const count = config.gridSize * config.gridSize;
    setGameCards(generateGridOptions(config.options, count));
    setActiveCardIndex(null);
    setResult(null);
    setShowShareOptions(false);
  };

  const shareText = `我刮中了：「${result}」！\n${config.title || '你的專屬盲盒'}\n快來一起玩～ ${window.location.href}`;

  const handleShareLine = () => window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, '_blank');
  const handleShareFB = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const handleShareThreads = () => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, '_blank');

  const handleCopyIG = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('已複製文字！請前往 Instagram 貼上分享～');
    } catch (e) {
      alert('複製失敗，請手動複製網址。');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('連結已複製！');
    } catch (e) {
      alert('複製失敗。');
    }
  };

  const handleScreenshot = async () => {
    if (!modalRef.current) return;
    
    // 隱藏按鈕區塊
    const buttonsDiv = modalRef.current.querySelector('.action-buttons') as HTMLElement;
    if (buttonsDiv) buttonsDiv.style.opacity = '0';

    try {
      const dataUrl = await htmlToImage.toPng(modalRef.current, { 
        backgroundColor: '#ffffff',
        pixelRatio: 2, // 高畫質
        style: {
          transform: 'scale(1)', // 避免動畫狀態影響截圖
        }
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `盲盒結果_${result}.png`;
      link.click();
    } catch (e) {
      console.error(e);
      alert('截圖失敗，請稍後再試。');
    } finally {
      if (buttonsDiv) buttonsDiv.style.opacity = '1';
    }
  };

  if (isConfiguring) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[30px] hand-drawn-border max-w-md w-full shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5c7a65] flex items-center justify-center gap-2 mb-2">
              <Sparkles className="text-[#aebdac]" />
              專屬盲盒設定
              <Sparkles className="text-[#aebdac]" />
            </h1>
            <p className="text-[#8ca38f]">打造你的選擇刮刮樂</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[#5c7a65] font-bold mb-2">🎈 主標題 (留白亦可)</label>
                <input 
                  type="text" 
                  placeholder="你的專屬盲盒"
                  value={config.title}
                  onChange={e => setConfig({...config, title: e.target.value})}
                  className="w-full px-4 py-3 bg-[#f4f7f5] border-2 border-[#dce5df] rounded-2xl focus:outline-none focus:border-[#aebdac] text-[#5c7a65] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[#5c7a65] font-bold mb-2">✨ 副標題 (留白亦可)</label>
                <input 
                  type="text" 
                  placeholder="直接刮下去猶豫，揭曉驚喜決定。"
                  value={config.subtitle}
                  onChange={e => setConfig({...config, subtitle: e.target.value})}
                  className="w-full px-4 py-3 bg-[#f4f7f5] border-2 border-[#dce5df] rounded-2xl focus:outline-none focus:border-[#aebdac] text-[#5c7a65] transition-colors"
                />
              </div>
            </div>
            
            <div className="border-t-2 border-dashed border-[#dce5df] pt-6">
              <label className="block text-[#5c7a65] font-bold mb-2">🎲 網格大小 (N x N)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="2" max="5" 
                  value={config.gridSize}
                  onChange={e => setConfig({...config, gridSize: parseInt(e.target.value)})}
                  className="w-full accent-[#8ca38f]"
                />
                <span className="text-xl font-bold text-[#5c7a65] bg-[#e8ede9] px-4 py-1 rounded-full">
                  {config.gridSize}x{config.gridSize}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-[#dce5df] pt-6">
              <label className="block text-[#5c7a65] font-bold mb-3">📝 候選名單</label>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 pb-2">
                {optionsList.map((opt, index) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="text-[#aebdac] font-bold w-6 text-right">{index + 1}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                      placeholder="輸入選項..."
                      className="flex-1 px-4 py-3 bg-[#f4f7f5] border-2 border-[#dce5df] rounded-2xl focus:outline-none focus:border-[#aebdac] text-[#5c7a65] transition-colors"
                    />
                    <button 
                      onClick={() => handleRemoveOption(opt.id)}
                      className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddOption}
                className="mt-3 w-full py-3 border-2 border-dashed border-[#aebdac] text-[#8ca38f] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#f4f7f5] transition-colors"
              >
                <Plus size={20} /> 新增選項
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button 
                onClick={startGame}
                className="w-full py-4 bg-[#8ca38f] hover:bg-[#7b947e] text-white font-bold text-xl hand-drawn-btn shadow-lg shadow-[#dce5df] flex items-center justify-center gap-2"
              >
                <Wand2 size={24} />
                自己先刮刮看
              </button>

              <button 
                onClick={handleShareGame}
                className="w-full py-3 bg-[#f4f7f5] hover:bg-[#e8ede9] text-[#5c7a65] border-2 border-[#dce5df] font-bold text-lg hand-drawn-btn flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={20} />
                產生連結傳給朋友刮
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }[config.gridSize] || 'grid-cols-3';

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 select-none relative overflow-hidden">
      <button 
        onClick={() => {
          window.history.pushState({}, '', window.location.pathname);
          setIsConfiguring(true);
        }}
        className="absolute top-4 left-4 p-3 text-[#8ca38f] hover:bg-[#e8ede9] rounded-full transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={20} />
        <span className="font-bold hidden sm:inline">重新設定</span>
      </button>

      <header className="mb-8 md:mb-10 text-center z-10 max-w-lg mt-6 md:mt-10 px-2">
        <h1 className="text-3xl md:text-5xl font-bold gold-text mb-2 md:mb-4 tracking-wider">
          {config.title || '你的專屬盲盒'}
        </h1>
        <p className="text-sm md:text-lg text-[#8ca38f]">
          {config.subtitle || '直接刮下去猶豫，揭曉驚喜決定。'}
        </p>
      </header>

      <main className="w-full max-w-xl z-10">
        <div className={`grid ${gridColsClass} gap-3 md:gap-4`}>
          {gameCards.map((option, index) => (
            <ScratchCard
              key={`${option}-${index}`} 
              content={option}
              isLocked={activeCardIndex !== null && activeCardIndex !== index}
              onStartScratch={() => {
                if (activeCardIndex === null) {
                  setActiveCardIndex(index);
                }
              }}
              onReveal={() => handleReveal(option)}
            />
          ))}
        </div>
      </main>

      {/* 開獎彈窗 */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5c7a65]/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div 
            ref={modalRef}
            // 確保彈窗背景色是實心白，避免截圖時出現怪異透視
            className="bg-white p-8 max-w-sm w-full text-center shadow-2xl hand-drawn-border border-4 relative"
          >
            <div className="flex justify-center mb-2">
              {/* 取消 mix-blend-multiply，直接顯示原圖，有助於截圖正常 */}
              <img src="/parrot.jpg" alt="Cute Parrot" className="w-32 h-32 object-contain rounded-full" />
            </div>
            
            <h2 className="text-xl font-bold text-[#8ca38f] mb-4 tracking-widest">開出驚喜！</h2>
            <p className="text-3xl font-bold text-[#5c7a65] mb-8 leading-snug">{result}</p>
            
            {/* 按鈕區塊 (截圖時會被暫時隱藏) */}
            <div className="action-buttons flex flex-col gap-3 transition-opacity duration-200">
              {!showShareOptions ? (
                <>
                  <button
                    onClick={() => setShowShareOptions(true)}
                    className="w-full py-3 bg-[#f4f7f5] text-[#5c7a65] border-2 border-[#dce5df] font-bold text-lg hand-drawn-btn flex justify-center items-center gap-2 hover:bg-[#e8ede9] transition-all"
                  >
                    <Share2 size={20} />
                    分享結果
                  </button>
                  
                  <button
                    onClick={resetGame}
                    className="w-full py-3 bg-[#8ca38f] text-white font-bold text-lg hand-drawn-btn shadow-xl shadow-[#dce5df]/50 flex justify-center items-center gap-2 hover:bg-[#7b947e] transition-all"
                  >
                    <RotateCcw size={20} />
                    返回重刮
                  </button>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[#8ca38f] font-bold text-sm">選擇分享方式</span>
                    <button onClick={() => setShowShareOptions(false)} className="text-[#aebdac] hover:text-[#5c7a65]">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={handleShareLine} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#f4f7f5] text-[#06C755] transition-colors">
                      <div className="bg-[#06C755]/10 p-3 rounded-full"><MessageCircle size={24} /></div>
                      <span className="text-xs font-bold">LINE</span>
                    </button>
                    
                    <button onClick={handleCopyIG} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#f4f7f5] text-[#E1306C] transition-colors">
                      <div className="bg-[#E1306C]/10 p-3 rounded-full"><Image size={24} /></div>
                      <span className="text-xs font-bold">IG</span>
                    </button>
                    
                    <button onClick={handleShareThreads} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#f4f7f5] text-black transition-colors">
                      <div className="bg-black/5 p-3 rounded-full"><AtSign size={24} /></div>
                      <span className="text-xs font-bold">Threads</span>
                    </button>
                    
                    <button onClick={handleShareFB} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#f4f7f5] text-[#1877F2] transition-colors">
                      <div className="bg-[#1877F2]/10 p-3 rounded-full"><Globe size={24} /></div>
                      <span className="text-xs font-bold">FB</span>
                    </button>
                    
                    <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#f4f7f5] text-[#8ca38f] transition-colors">
                      <div className="bg-[#8ca38f]/10 p-3 rounded-full"><Copy size={24} /></div>
                      <span className="text-xs font-bold">複製連結</span>
                    </button>
                    
                    <button onClick={handleScreenshot} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#f4f7f5] text-[#eab308] transition-colors">
                      <div className="bg-[#eab308]/10 p-3 rounded-full"><Camera size={24} /></div>
                      <span className="text-xs font-bold">直接截圖</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
