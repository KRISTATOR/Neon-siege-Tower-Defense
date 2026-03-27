import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Globe, Search, Map as MapIcon, Play, Star, ChevronRight, Activity } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface CommunityMapsProps {
  onClose: () => void;
  onPlay: (map: any) => void;
}

export const CommunityMaps: React.FC<CommunityMapsProps> = ({ onClose, onPlay }) => {
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'community_maps'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredMaps = maps.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col max-h-full"
      >
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Community Maps</h2>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Explore Player-Created Battlefields</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search maps or authors..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-white/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Activity className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Scanning Network...</p>
            </div>
          ) : filteredMaps.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
              <MapIcon className="w-16 h-16 text-white/10" />
              <h3 className="text-xl font-bold text-white/60 uppercase tracking-widest">No Maps Found</h3>
              <p className="text-white/30 text-sm max-w-xs">Be the first to create and share a map with the community!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => onPlay(map)}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all text-left flex flex-col gap-4 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <MapIcon className="w-24 h-24" />
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div className="px-3 py-1 bg-purple-500/20 rounded text-[10px] font-bold text-purple-400 uppercase tracking-widest border border-purple-500/30">
                      {map.cols}x{map.rows}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Published</p>
                      <p className="text-[10px] text-white/40 font-mono">{new Date(map.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-purple-400 transition-colors mb-1">{map.name}</h3>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">By {map.userName}</p>
                    <p className="text-white/30 text-[10px] line-clamp-2 leading-relaxed">{map.description || 'No description provided.'}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-bold text-white/40">{map.plays || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-bold text-white/40">{map.likes || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Deploy</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
