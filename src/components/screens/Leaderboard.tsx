import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Activity, Skull, Coins, Shield, Star, Globe } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface LeaderboardProps {
  onClose: () => void;
  currentUserId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, currentUserId }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'highestWave' | 'totalEnemiesKilled' | 'totalGoldEarned' | 'commanderLevel'>('highestWave');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'leaderboard'), orderBy(category, 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [category]);

  const categories = [
    { id: 'highestWave', name: 'Max Wave', icon: <Activity className="w-4 h-4" /> },
    { id: 'totalEnemiesKilled', name: 'Kills', icon: <Skull className="w-4 h-4" /> },
    { id: 'totalGoldEarned', name: 'Gold', icon: <Coins className="w-4 h-4" /> },
    { id: 'commanderLevel', name: 'Level', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#050505] border border-cyan-500/30 rounded-[2.5rem] overflow-hidden flex flex-col max-h-full relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        
        <div className="p-6 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Star className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-cyan-400">Global Rankings</h2>
              <p className="text-white/40 font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] mt-1">Elite Commander Network</p>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${category === cat.id ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'}`}
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-white/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Activity className="w-12 h-12 text-cyan-500 animate-spin" />
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Syncing Data Streams...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
              <Globe className="w-16 h-16 text-white/10" />
              <h3 className="text-xl font-bold text-white/60 uppercase tracking-widest">No Data Recorded</h3>
              <p className="text-white/30 text-sm max-w-xs">Be the first to leave your mark on the global network!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${entry.userId === currentUserId ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-white/5 border-white/10'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg font-mono ${index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/5 text-white/40'}`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-white uppercase italic">{entry.nickname || 'Anonymous'}</h3>
                      {entry.userId === currentUserId && (
                        <span className="px-2 py-0.5 bg-cyan-500 text-black text-[8px] font-bold uppercase tracking-widest rounded">You</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">LVL {entry.commanderLevel} Commander</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{categories.find(c => c.id === category)?.name}</p>
                    <p className="text-xl font-black text-cyan-400 font-mono">
                      {category === 'totalGoldEarned' 
                        ? (entry[category] >= 1000 ? `${(entry[category] / 1000).toFixed(1)}K` : entry[category])
                        : entry[category]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
          <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-mono">
            Top 50 Commanders Synchronized
          </p>
          {entries.length > 0 && (
            <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-mono">
              Last Sync: {new Date(Math.max(...entries.map(e => new Date(e.lastUpdated).getTime()))).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
