import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { TurretType, TURRET_CONFIGS } from '../engine/Turret';
import { Icon } from './Icon';

interface TechNodeProps {
  type: TurretType;
  unlockedTurrets: Set<TurretType>;
  unlockedUpgrades: Set<TurretType>;
  gold: number;
  onUnlock: (type: TurretType) => void;
  x: number;
  y: number;
}

export const TechNode: React.FC<TechNodeProps> = ({ type, unlockedTurrets, unlockedUpgrades, gold, onUnlock, x, y }) => {
  const config = TURRET_CONFIGS[type];
  const isUnlocked = unlockedTurrets.has(type);
  const isUpgradeUnlocked = unlockedUpgrades.has(type);
  const canAfford = gold >= config.unlockCost;
  const hasPrereqs = config.prerequisites.length === 0 || config.prerequisites.every(p => unlockedTurrets.has(p));

  return (
    <button
      onClick={() => onUnlock(type)}
      disabled={(!isUnlocked && (!hasPrereqs)) || (isUnlocked && isUpgradeUnlocked)}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
      className={`
        absolute group rounded-xl border flex items-center transition-all w-64 h-20 z-10 overflow-hidden
        ${isUnlocked 
          ? isUpgradeUnlocked
            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
            : 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
          : hasPrereqs
            ? canAfford 
              ? 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10'
              : 'bg-white/5 border-white/10 opacity-60'
            : 'bg-black/20 border-white/5 opacity-20 grayscale'}
      `}
    >
      {/* Icon Section */}
      <div className="w-16 h-full flex items-center justify-center bg-black/40 border-r border-white/10" style={{ color: config.color }}>
        <Icon name={config.iconName} className="w-6 h-6" />
      </div>
      
      {/* Content Section */}
      <div className="flex-1 px-4 text-left">
        <h4 className="text-xs font-bold uppercase tracking-tight text-white truncate">{config.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          {isUnlocked ? (
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 uppercase font-bold">
              <Shield className="w-2.5 h-2.5" />
              Complete
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[9px] text-white/40 uppercase font-bold">
              {hasPrereqs ? (
                <span className="text-yellow-400">{config.unlockCost}G</span>
              ) : (
                <Lock className="w-2.5 h-2.5" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        {isUnlocked ? (
           <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
           </div>
        ) : !hasPrereqs && (
           <Lock className="w-3 h-3 text-white/20" />
        )}
      </div>
    </button>
  );
};
