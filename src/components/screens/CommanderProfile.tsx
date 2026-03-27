import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Save, Star, Globe, Lock, Check, Activity } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/achievements';

interface CommanderProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  nickname: string;
  setNickname: (val: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  commanderExp: number;
  getCommanderLevel: (exp: number) => number;
  getExpToNextLevel: (level: number) => number;
  totalWavesSurvived: number;
  totalEnemiesKilled: number;
  totalGoldEarned: number;
  highestEndlessWaves: Record<string, number>;
  medals: string[];
  onShowLeaderboard: () => void;
}

export const CommanderProfile: React.FC<CommanderProfileProps> = ({
  isOpen,
  onClose,
  user,
  nickname,
  setNickname,
  saveStatus,
  onSave,
  commanderExp,
  getCommanderLevel,
  getExpToNextLevel,
  totalWavesSurvived,
  totalEnemiesKilled,
  totalGoldEarned,
  highestEndlessWaves,
  medals,
  onShowLeaderboard
}) => {
  const currentLevel = getCommanderLevel(commanderExp);
  const expToNext = getExpToNextLevel(currentLevel);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#050505] border border-amber-500/30 rounded-[2rem] flex flex-col max-h-[90vh] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="p-6 md:p-10 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-amber-400">Commander Profile</h2>
                  <p className="text-white/40 font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] mt-1">{user?.displayName || 'Anonymous'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-white/40 group-hover:text-amber-400" />
              </button>
            </div>

            <div className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Nickname Section */}
              <div className="space-y-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Commander Nickname</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                    placeholder="Enter Nickname..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <button
                    onClick={onSave}
                    disabled={saveStatus === 'saving'}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase italic rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-2"
                  >
                    {saveStatus === 'saving' ? (
                      <Activity className="w-4 h-4 animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saveStatus === 'saved' ? 'Updated' : saveStatus === 'saving' ? 'Updating' : 'Update'}
                  </button>
                </div>
              </div>

              {/* Level Progress */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Current Rank</p>
                    <h3 className="text-2xl font-black text-white uppercase italic">Level {currentLevel}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Next Rank</p>
                    <p className="text-sm font-mono text-amber-400">{commanderExp} / {expToNext} XP</p>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(commanderExp / expToNext) * 100}%` }}
                    className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Waves Survived</p>
                  <p className="text-xl font-black text-white font-mono">{totalWavesSurvived}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Enemies Killed</p>
                  <p className="text-xl font-black text-white font-mono">{totalEnemiesKilled}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Gold Earned</p>
                  <p className="text-xl font-black text-white font-mono">{totalGoldEarned}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Max Wave</p>
                  <p className="text-xl font-black text-white font-mono">
                    {Math.max(0, ...(Object.values(highestEndlessWaves) as number[]))}
                  </p>
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Service Achievements</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {ACHIEVEMENTS.map(achievement => {
                    const isEarned = medals.includes(achievement.id);
                    if (achievement.isSecret && !isEarned) {
                      return (
                        <div key={achievement.id} className="bg-white/5 border border-dashed border-white/10 rounded-xl p-3 flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white/20" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Secret Achievement</p>
                            <p className="text-[8px] text-white/20">Keep playing to uncover this mystery.</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={achievement.id} className={`bg-white/5 border ${isEarned ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'} rounded-xl p-3 flex items-center gap-3 transition-all`}>
                        <div className={`w-8 h-8 rounded-lg ${isEarned ? 'bg-amber-500/20' : 'bg-white/5'} flex items-center justify-center`}>
                          {isEarned ? <Star className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4 text-white/20" />}
                        </div>
                        <div>
                          <p className={`text-[10px] font-bold ${isEarned ? 'text-white' : 'text-white/40'} uppercase tracking-widest`}>{achievement.name}</p>
                          <p className="text-[8px] text-white/40">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <button
                  onClick={onShowLeaderboard}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all text-cyan-400 font-bold uppercase tracking-widest text-xs"
                >
                  <Globe className="w-4 h-4" />
                  View Global Rankings
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/60 font-bold uppercase tracking-widest text-xs"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
