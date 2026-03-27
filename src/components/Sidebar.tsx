import React from 'react';
import { ShoppingCart, Shield, Coins, ArrowUp, Trash2, Lock, X, Target } from 'lucide-react';
import { GameMode, TurretType } from '../types';
import { TURRET_CONFIGS } from '../data/turrets';
import { CAMPAIGN_SECTORS } from '../data/maps';
import { Icon } from './Icon';
import { Turret } from '../engine/Turret';

interface SidebarProps {
  difficulty: string | null;
  isMobile: boolean;
  isLandscape: boolean;
  selectedMapTurret: Turret | null;
  setSelectedMapTurret: (turret: Turret | null) => void;
  selectedTurretType: TurretType | null;
  setSelectedTurretType: (type: TurretType | null) => void;
  gold: number;
  unlockedUpgrades: Set<TurretType>;
  upgradeTurretOnMap: (turret: Turret) => void;
  sellTurret: (turret: Turret) => void;
  gameMode: GameMode;
  currentSectorIndex: number;
  wave: number;
  activeTab: 'armory' | 'inventory';
  setActiveTab: (tab: 'armory' | 'inventory') => void;
  setIsRetractMode: (val: boolean) => void;
  isRetractMode: boolean;
  setIsTechTreeOpen: (val: boolean) => void;
  tutorialStep: number;
  unlockedTurrets: Set<TurretType>;
  setConfirmingPurchase: (type: TurretType) => void;
  inventory: Record<TurretType, number>;
  getTurretDepth: (type: TurretType) => number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  difficulty,
  isMobile,
  isLandscape,
  selectedMapTurret,
  setSelectedMapTurret,
  selectedTurretType,
  setSelectedTurretType,
  gold,
  unlockedUpgrades,
  upgradeTurretOnMap,
  sellTurret,
  gameMode,
  currentSectorIndex,
  wave,
  activeTab,
  setActiveTab,
  setIsRetractMode,
  isRetractMode,
  setIsTechTreeOpen,
  tutorialStep,
  unlockedTurrets,
  setConfirmingPurchase,
  inventory,
  getTurretDepth,
}) => {
  if (!difficulty) return null;

  return (
    <aside className={`border-white/10 bg-black/30 flex shrink-0 transition-all ${isMobile && isLandscape ? 'w-64 border-r flex-col p-4 overflow-y-auto' : 'w-full md:w-80 border-b md:border-b-0 md:border-r p-3 md:p-4 flex-row md:flex-col overflow-x-auto md:overflow-y-auto'} gap-3 md:gap-4 custom-scrollbar`}>
      {/* Selected Turret View (Overrides tabs if active) */}
      {selectedMapTurret ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10" style={{ color: selectedMapTurret.config.color }}>
                <Icon name={selectedMapTurret.config.iconName} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-tight text-white">{selectedMapTurret.config.name}</h3>
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-bold">Level {selectedMapTurret.level}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedMapTurret(null)}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-white/60 leading-relaxed italic border-l-2 border-white/10 pl-3">
              {selectedMapTurret.config.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
              <div>
                <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Damage</p>
                <p className="text-sm font-mono font-bold text-white">{Math.round(selectedMapTurret.damage)}</p>
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Range</p>
                <p className="text-sm font-mono font-bold text-white">{selectedMapTurret.range.toFixed(1)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {unlockedUpgrades.has(selectedMapTurret.config.type) && selectedMapTurret.level < selectedMapTurret.maxLevel ? (
                <button
                  onClick={() => upgradeTurretOnMap(selectedMapTurret)}
                  disabled={gold < selectedMapTurret.config.upgradeCost}
                  className={`
                    w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
                    ${gold >= selectedMapTurret.config.upgradeCost
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'}
                  `}
                >
                  <ArrowUp className="w-4 h-4" />
                  Upgrade ({selectedMapTurret.config.upgradeCost}G)
                </button>
              ) : selectedMapTurret.level >= selectedMapTurret.maxLevel ? (
                <div className="w-full py-4 rounded-xl bg-white/5 text-white/20 font-black uppercase tracking-widest text-xs text-center border border-white/5">
                  Max Level Reached
                </div>
              ) : (
                <div className="w-full py-4 rounded-xl bg-white/5 text-white/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-white/5">
                  <Lock className="w-4 h-4" />
                  Upgrades Locked
                </div>
              )}
              
              <button
                onClick={() => sellTurret(selectedMapTurret)}
                className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Sell Unit ({Math.floor(selectedMapTurret.config.cost * 0.75)}G)
              </button>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-white/5">
            <button 
              onClick={() => setSelectedMapTurret(null)}
              className="w-full py-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              Back to Shop
            </button>
          </div>
        </div>
      ) : selectedTurretType ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20" style={{ color: TURRET_CONFIGS[selectedTurretType].color }}>
                <Icon name={TURRET_CONFIGS[selectedTurretType].iconName} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-tight text-white">{TURRET_CONFIGS[selectedTurretType].name}</h3>
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-bold">Ready to Deploy</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTurretType(null)}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-white/60 leading-relaxed italic border-l-2 border-cyan-500/30 pl-3">
              {TURRET_CONFIGS[selectedTurretType].description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
              <div>
                <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Damage</p>
                <p className="text-sm font-mono font-bold text-white">{TURRET_CONFIGS[selectedTurretType].damage}</p>
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Range</p>
                <p className="text-sm font-mono font-bold text-white">{TURRET_CONFIGS[selectedTurretType].range.toFixed(1)}</p>
              </div>
            </div>

            <div className="py-4 rounded-xl bg-cyan-500/10 text-cyan-400 font-black uppercase tracking-widest text-xs text-center border border-cyan-500/20 animate-pulse">
              Click Map to Place
            </div>

            <button 
              onClick={() => setSelectedTurretType(null)}
              className="w-full py-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              Cancel Placement
            </button>
          </div>
        </div>
      ) : (
        <>
          {(gameMode === GameMode.CAMPAIGN || gameMode === GameMode.TUTORIAL) && (
            <div className={`${isMobile && isLandscape ? 'p-2' : 'hidden md:block p-4'} bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-2`}>
              <div className="flex justify-between items-center mb-1 md:mb-2">
                <span className="text-[7px] md:text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Sector</span>
                <span className="text-[7px] md:text-[9px] font-mono text-emerald-400">#{gameMode === GameMode.TUTORIAL ? '0' : currentSectorIndex + 1}</span>
              </div>
              <h3 className="text-[10px] md:text-sm font-bold text-white mb-1 uppercase tracking-tight truncate">
                {gameMode === GameMode.TUTORIAL ? 'Training Grounds' : CAMPAIGN_SECTORS[currentSectorIndex].name}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-[7px] md:text-[9px] uppercase tracking-widest text-white/40">Objective</span>
                <span className="text-[8px] md:text-[10px] font-bold text-emerald-400">
                  {wave}/{gameMode === GameMode.TUTORIAL ? '3' : CAMPAIGN_SECTORS[currentSectorIndex].wavesToWin}
                </span>
              </div>
            </div>
          )}

          <div className={`flex gap-2 shrink-0 ${isMobile && isLandscape ? 'flex-col' : 'md:flex-col'}`}>
            <div className={`flex gap-1 p-1 bg-white/5 rounded-lg ${isMobile && isLandscape ? 'w-full' : 'w-32 md:w-full'}`}>
              <button 
                onClick={() => { setActiveTab('armory'); setIsRetractMode(false); }}
                className={`flex-1 py-1 md:py-2 text-[7px] md:text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${activeTab === 'armory' ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'} ${gameMode === GameMode.TUTORIAL && tutorialStep === 2 ? 'tutorial-highlight' : ''}`}
              >
                Armory
              </button>
              <button 
                onClick={() => { setActiveTab('inventory'); setIsRetractMode(false); }}
                className={`flex-1 py-1 md:py-2 text-[7px] md:text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${activeTab === 'inventory' ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'} ${gameMode === GameMode.TUTORIAL && (tutorialStep === 3 || tutorialStep === 4) ? 'tutorial-highlight' : ''}`}
              >
                Inventory
              </button>
            </div>

            <button 
              onClick={() => setIsTechTreeOpen(true)}
              className={`py-2 md:py-3 bg-white/5 border border-white/10 rounded-xl text-[7px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 group shrink-0 ${isMobile && isLandscape ? 'w-full' : 'w-32 md:w-full'} ${gameMode === GameMode.TUTORIAL && tutorialStep === 1 ? 'tutorial-highlight' : ''}`}
            >
              <Target className="w-3 h-3 md:w-4 md:h-4 group-hover:scale-110 transition-transform" />
              <span className={`${isMobile && isLandscape ? 'inline' : 'hidden md:inline'}`}>Tech Tree</span>
              {!isLandscape && <span className="md:hidden">Tech</span>}
            </button>
          </div>

          <section className={`flex-1 flex gap-2 md:gap-3 no-scrollbar ${isMobile && isLandscape ? 'flex-col overflow-y-auto' : 'overflow-x-auto md:overflow-y-auto flex-row md:flex-col'}`}>
            {activeTab === 'armory' && (
              <div className={`flex gap-2 ${isMobile && isLandscape ? 'flex-col' : 'md:flex-col'}`}>
                <div className="hidden md:flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-white/40" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Purchase Units</h2>
                </div>
                <div className={`flex gap-2 md:gap-3 ${isMobile && isLandscape ? 'flex-col' : 'md:grid md:grid-cols-1'}`}>
                  {(Object.keys(TURRET_CONFIGS) as TurretType[])
                    .sort((a, b) => {
                      const depthA = getTurretDepth(a);
                      const depthB = getTurretDepth(b);
                      if (depthA !== depthB) return depthA - depthB;
                      return TURRET_CONFIGS[a].cost - TURRET_CONFIGS[b].cost;
                    })
                    .map((type) => {
                      const config = TURRET_CONFIGS[type];
                      const isUnlocked = unlockedTurrets.has(type);
                      const canAfford = gold >= config.cost;
                      if (!isUnlocked) return null;

                      return (
                        <button
                          key={`armory-${type}`}
                          onClick={() => setConfirmingPurchase(type)}
                          disabled={!canAfford}
                          className={`
                            relative group p-3 md:p-4 rounded-xl border transition-all text-left shrink-0
                            bg-white/5 border-white/5 hover:border-white/20
                            ${isMobile && isLandscape ? 'w-full' : 'w-full'}
                            ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="p-1.5 rounded-lg bg-black/40" style={{ color: config.color }}>
                              <Icon name={config.iconName} className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400 font-mono text-[10px] md:text-sm font-bold">
                              <Coins className="w-3 h-3 md:w-4 md:h-4" />
                              {config.cost}
                            </div>
                          </div>
                          <h3 className="font-bold text-[10px] md:text-sm truncate text-white mb-1">{config.name}</h3>
                          <p className="hidden md:block text-[10px] text-white/60 leading-tight">{config.description}</p>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className={`flex gap-2 ${isMobile && isLandscape ? 'flex-col' : 'md:flex-col'}`}>
                <div className="hidden md:flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-white/40" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Deployable Units</h2>
                  </div>
                  <button 
                    onClick={() => setIsRetractMode(!isRetractMode)}
                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${isRetractMode ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                  >
                    {isRetractMode ? 'Cancel' : 'Move (5G)'}
                  </button>
                </div>
                
                {/* Mobile Retract Button */}
                <button 
                  onClick={() => setIsRetractMode(!isRetractMode)}
                  className={`md:hidden shrink-0 w-full h-8 rounded-lg flex items-center justify-center transition-all text-[8px] font-bold uppercase tracking-widest ${isRetractMode ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40'}`}
                >
                  {isRetractMode ? 'Cancel Move' : 'Move Unit (5G)'}
                </button>

                <div className={`flex gap-2 md:gap-3 ${isMobile && isLandscape ? 'flex-col' : 'md:grid md:grid-cols-1'}`}>
                  {(Object.keys(inventory) as TurretType[]).map((type) => {
                    const count = inventory[type];
                    if (count === 0) return null;
                    const config = TURRET_CONFIGS[type];
                    const isSelected = selectedTurretType === type;

                    return (
                      <div
                        key={`inv-${type}`}
                        className="flex flex-col gap-1 w-full"
                      >
                        <div
                          onClick={() => { setSelectedTurretType(isSelected ? null : type); setIsRetractMode(false); }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && (setSelectedTurretType(isSelected ? null : type), setIsRetractMode(false))}
                          className={`
                            p-3 md:p-4 rounded-xl border transition-all text-left cursor-pointer w-full
                            ${isSelected 
                              ? 'bg-white/10 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                              : 'bg-white/5 border-white/5 hover:border-white/20'}
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="p-1.5 rounded-lg bg-black/40" style={{ color: config.color }}>
                              <Icon name={config.iconName} className="w-4 h-4" />
                            </div>
                            <div className="bg-cyan-500 text-black px-2 py-0.5 rounded text-[10px] md:text-xs font-bold font-mono">
                              x{count}
                            </div>
                          </div>
                          <h3 className="font-bold text-[10px] md:text-sm truncate text-white">{config.name}</h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </aside>
  );
};
