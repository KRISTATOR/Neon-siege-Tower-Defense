import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Shield, Trash2, Star, Map as MapIcon, Activity, Search, AlertTriangle } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface AdminProps {
  onClose: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'community_maps'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteMap = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this map? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'community_maps', id));
      } catch (error) {
        console.error('Error deleting map:', error);
      }
    }
  };

  const handleUpdateLikes = async (id: string, currentLikes: number) => {
    const newLikes = prompt('Enter new like count:', currentLikes.toString());
    if (newLikes !== null) {
      try {
        await updateDoc(doc(db, 'community_maps', id), {
          likes: parseInt(newLikes) || 0
        });
      } catch (error) {
        console.error('Error updating likes:', error);
      }
    }
  };

  const filteredMaps = maps.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-6xl bg-[#0a0a0a] border border-red-500/30 rounded-[2.5rem] overflow-hidden flex flex-col max-h-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-red-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Central Command Console</h2>
              <p className="text-xs text-red-400/60 font-bold uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Restricted Access - Administrator Only
              </p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search maps or authors..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-white/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Activity className="w-12 h-12 text-red-500 animate-spin" />
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <div className="col-span-4">Map Name / Author</div>
                <div className="col-span-2">Stats</div>
                <div className="col-span-3">Created</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              
              {filteredMaps.map((map) => (
                <div
                  key={map.id}
                  className="grid grid-cols-12 gap-4 items-center bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <MapIcon className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">{map.name}</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">By {map.userName}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-mono text-white/60">{map.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs font-mono text-white/60">{map.plays || 0}</span>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <p className="text-xs font-mono text-white/40">{new Date(map.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="col-span-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleUpdateLikes(map.id, map.likes || 0)}
                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/20"
                      title="Edit Likes"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMap(map.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                      title="Delete Map"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
