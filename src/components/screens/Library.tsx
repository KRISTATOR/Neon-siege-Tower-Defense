import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Activity, ChevronRight, Trash2, Cpu } from 'lucide-react';
import { CAMPAIGN_SECTORS } from '../../data/maps';

interface LibraryProps {
  isOpen: boolean;
  onClose: () => void;
  sessionsList: any[];
  onLoadSession: (session: any) => void;
  onDeleteSession: (session: any) => void;
  type: 'endless' | 'sandbox';
}

export const Library: React.FC<LibraryProps> = ({ 
  isOpen, 
  onClose, 
  sessionsList, 
  onLoadSession, 
  onDeleteSession,
  type
}) => {
  const isSandbox = type === 'sandbox';
  const accentColor = isSandbox ? 'purple' : 'cyan';
  const IconComponent = isSandbox ? Cpu : Activity;

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
            className={`w-full max-w-4xl bg-[#050505] border border-${accentColor}-500/30 rounded-[2rem] flex flex-col max-h-[90vh] relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${accentColor}-500 to-transparent`} />
            
            <div className="p-6 md:p-10 flex justify-between items-center border-b border-white/5">
              <div>
                <h2 className={`text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-${accentColor}-400`}>
                  {isSandbox ? 'Sandbox Library' : 'Endless Library'}
                </h2>
                <p className="text-white/40 font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] mt-1">
                  {isSandbox ? 'Experimental Defense Logs' : 'Active Defense Protocols'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group`}
              >
                <X className={`w-5 h-5 md:w-6 md:h-6 text-white/40 group-hover:text-${accentColor}-400`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              {sessionsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                    {isSandbox ? <Cpu className="w-10 h-10 text-white/20" /> : <BookOpen className="w-10 h-10 text-white/20" />}
                  </div>
                  <h3 className="text-xl font-bold text-white/60 uppercase tracking-widest mb-2">
                    {isSandbox ? 'Sandbox Empty' : 'Library Empty'}
                  </h3>
                  <p className="text-white/30 text-sm max-w-xs">
                    {isSandbox 
                      ? 'No experimental sessions found. Save your sandbox progress to see them here.'
                      : 'No active endless sessions found. Start a new game and complete a wave to save your progress.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {sessionsList.map((session) => {
                    const mapName = CAMPAIGN_SECTORS.find(s => s.mapConfig.id === session.mapId)?.name || 'Unknown Sector';
                    return (
                      <div
                        key={session.id}
                        onClick={() => onLoadSession(session)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onLoadSession(session);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-${accentColor}-500/50 transition-all text-left overflow-hidden cursor-pointer`}
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <IconComponent className="w-24 h-24" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 bg-${accentColor}-500/20 rounded text-[10px] font-bold text-${accentColor}-400 uppercase tracking-widest border border-${accentColor}-500/30`}>
                            {session.difficulty}
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Last Active</p>
                            <p className="text-[10px] text-white/40 font-mono">{new Date(session.lastUpdated).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <h3 className={`text-xl font-black uppercase italic tracking-tight text-white group-hover:text-${accentColor}-400 transition-colors mb-1`}>{mapName}</h3>
                        <div className="flex items-center gap-2 mb-6">
                          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Commander: {session.userName}</p>
                          <div className="px-2 py-0.5 bg-amber-500/20 rounded text-[8px] font-bold text-amber-400 uppercase tracking-widest border border-amber-500/30">
                            LVL {session.commanderLevel || 1}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-6">
                          <div>
                            <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Wave</p>
                            <p className={`text-lg font-black text-${accentColor}-400 font-mono`}>{session.wave}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Gold</p>
                            <p className="text-lg font-black text-emerald-400 font-mono">{session.gold}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Lives</p>
                            <p className="text-lg font-black text-rose-400 font-mono">{session.lives}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between">
                          <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border bg-${accentColor}-500/20 text-${accentColor}-400 border-${accentColor}-500/30`}>
                            {isSandbox ? 'Sandbox' : 'Endless'}
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session);
                              }}
                              className="p-2 text-white/20 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className={`flex items-center gap-2 text-${accentColor}-500 opacity-0 group-hover:opacity-100 transition-opacity`}>
                              <span className="text-[10px] font-bold uppercase tracking-widest">Resume Protocol</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
