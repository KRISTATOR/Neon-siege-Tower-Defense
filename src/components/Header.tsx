import React from 'react';
import { Shield, LogOut, Coins, Heart, RotateCcw, X } from 'lucide-react';
import { GameMode } from '../types';
import { CAMPAIGN_SECTORS } from '../data/maps';

interface HeaderProps {
  gameMode: GameMode;
  isMobile: boolean;
  isLandscape: boolean;
  setIsLandscape: (val: boolean) => void;
  resetToStart: () => void;
  difficulty: string | null;
  gold: number;
  lives: number;
  wave: number;
  currentSectorIndex: number;
}

export const Header: React.FC<HeaderProps> = ({
  gameMode,
  isMobile,
  isLandscape,
  setIsLandscape,
  resetToStart,
  difficulty,
  gold,
  lives,
  wave,
  currentSectorIndex,
}) => {
  if (gameMode === GameMode.START) return null;

  return (
    <header className={`border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 transition-all ${isMobile && isLandscape ? 'p-2 px-4 h-14' : 'p-2 md:p-4'}`}>
      {/* Orientation Hint (Non-blocking) */}
      {isMobile && !isLandscape && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-cyan-500/20 backdrop-blur-md border border-cyan-500/40 rounded-full px-6 py-3 flex items-center gap-3 animate-bounce shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <RotateCcw className="w-4 h-4 text-cyan-400 rotate-90" />
          <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Landscape mode recommended</p>
          <button onClick={() => setIsLandscape(true)} className="ml-2 text-white/40 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-3">
        <div className={`${isMobile && isLandscape ? 'w-6 h-6' : 'w-8 h-8 md:w-10 md:h-10'} bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]`}>
          <Shield className={`text-black ${isMobile && isLandscape ? 'w-3 h-3' : 'w-5 h-5 md:w-6 md:h-6'}`} />
        </div>
        <div className={`${isMobile && isLandscape ? 'block' : 'hidden sm:block'}`}>
          <h1 className={`${isMobile && isLandscape ? 'text-xs' : 'text-lg md:text-xl'} font-bold tracking-tight uppercase italic`}>Neon Siege</h1>
          {!isLandscape && <p className="text-[8px] md:text-[10px] text-cyan-400 font-mono tracking-widest uppercase opacity-70">Defense Protocol Active</p>}
        </div>
      </div>

      <div className={`flex items-center ${isMobile && isLandscape ? 'gap-3' : 'gap-4 md:gap-8'}`}>
        <button
          onClick={resetToStart}
          className={`rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group relative ${isMobile && isLandscape ? 'p-1' : 'p-2 mr-2'}`}
          title="Exit to Menu"
        >
          <LogOut className={`${isMobile && isLandscape ? 'w-3 h-3' : 'w-5 h-5'}`} />
          <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-black text-[9px] uppercase tracking-widest text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Exit to Menu</span>
        </button>
        
        {difficulty && (
          <>
            <div className="flex flex-col items-end">
              <span className={`${isMobile && isLandscape ? 'text-[7px]' : 'text-[10px]'} uppercase tracking-tighter text-white/40 font-semibold`}>Credits</span>
              <div className="flex items-center gap-1 md:gap-2 text-yellow-400">
                <Coins className={`${isMobile && isLandscape ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <span className={`${isMobile && isLandscape ? 'text-sm' : 'text-xl'} font-mono font-bold leading-none`}>{gold}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`${isMobile && isLandscape ? 'text-[7px]' : 'text-[10px]'} uppercase tracking-tighter text-white/40 font-semibold`}>Integrity</span>
              <div className="flex items-center gap-1 md:gap-2 text-red-500">
                <Heart className={`${isMobile && isLandscape ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <span className={`${isMobile && isLandscape ? 'text-sm' : 'text-xl'} font-mono font-bold leading-none`}>{lives}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`${isMobile && isLandscape ? 'text-[7px]' : 'text-[10px]'} uppercase tracking-tighter text-white/40 font-semibold`}>Wave</span>
              <div className="flex items-center gap-1 md:gap-2 text-cyan-400">
                <RotateCcw className={`${isMobile && isLandscape ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <span className={`${isMobile && isLandscape ? 'text-sm' : 'text-xl'} font-mono font-bold leading-none`}>
                  {gameMode === GameMode.CAMPAIGN 
                    ? `${wave}/${CAMPAIGN_SECTORS[currentSectorIndex].wavesToWin}` 
                    : wave}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
