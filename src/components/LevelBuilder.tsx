import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Map as MapIcon, Activity, Play, Target, Upload, ChevronRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Point } from '../types';

interface LevelBuilderProps {
  onClose: () => void;
  user: User | null;
}

const LevelBuilder: React.FC<LevelBuilderProps> = ({ onClose, user }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cols, setCols] = useState(20);
  const [rows, setRows] = useState(12);
  const [grid, setGrid] = useState<number[]>(new Array(20 * 12).fill(0)); // 0: buildable, 1: path, 2: spawn, 3: goal
  const [selectedTool, setSelectedTool] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStart, setConnectionStart] = useState<number | null>(null);
  const [selectedSpawnIndex, setSelectedSpawnIndex] = useState<number | null>(null);
  const [spawnPaths, setSpawnPaths] = useState<Record<number, { path: Point[], goalIndex: number }[]>>({});

  const [currentEnemyPaths, setCurrentEnemyPaths] = useState<Point[][]>([]);

  useEffect(() => {
    if (selectedSpawnIndex !== null && spawnPaths[selectedSpawnIndex]) {
      setCurrentEnemyPaths(spawnPaths[selectedSpawnIndex].map(sp => sp.path));
    } else {
      setCurrentEnemyPaths([]);
    }
  }, [selectedSpawnIndex, spawnPaths]);

  const generatePaths = (startIdx: number, endIdx: number) => {
    const start = { x: startIdx % cols, y: Math.floor(startIdx / cols) };
    const end = { x: endIdx % cols, y: Math.floor(endIdx / cols) };

    const paths: Point[][] = [];
    const xDir = end.x >= start.x ? 1 : -1;
    const yDir = end.y >= start.y ? 1 : -1;

    // Path 1: Horizontal then Vertical
    const p1: Point[] = [];
    for (let x = start.x; x !== end.x + xDir; x += xDir) {
      p1.push({ x, y: start.y });
    }
    for (let y = start.y + yDir; y !== end.y + yDir; y += yDir) {
      p1.push({ x: end.x, y });
    }
    paths.push(p1);

    // Path 2: Vertical then Horizontal
    if (start.x !== end.x && start.y !== end.y) {
      const p2: Point[] = [];
      for (let y = start.y; y !== end.y + yDir; y += yDir) {
        p2.push({ x: start.x, y });
      }
      for (let x = start.x + xDir; x !== end.x + xDir; x += xDir) {
        p2.push({ x, y: end.y });
      }
      paths.push(p2);
    }

    return paths;
  };

  const applyPathToGrid = (path: Point[], targetGrid: number[]) => {
    // Clear existing paths (1) but keep spawn (2) and goal (3)
    for (let i = 0; i < targetGrid.length; i++) {
      if (targetGrid[i] === 1) targetGrid[i] = 0;
    }
    // Apply all paths from all spawns
    (Object.values(spawnPaths) as { path: Point[], goalIndex: number }[]).forEach(sp => {
      sp.path.forEach(pt => {
        const idx = pt.y * cols + pt.x;
        if (targetGrid[idx] === 0) targetGrid[idx] = 1;
      });
    });
    // Apply the new path
    path.forEach(p => {
      const idx = p.y * cols + p.x;
      if (targetGrid[idx] === 0) targetGrid[idx] = 1;
    });
  };

  const findPathThroughGrid = (startIdx: number, endIdx: number, mustPassThrough?: number) => {
    const start = { x: startIdx % cols, y: Math.floor(startIdx / cols) };
    const end = { x: endIdx % cols, y: Math.floor(endIdx / cols) };
    
    const getShortest = (s: Point, e: Point) => {
      const queue: { pos: Point, path: Point[] }[] = [{ pos: s, path: [s] }];
      const visited = new Set<string>();
      visited.add(`${s.x},${s.y}`);

      while (queue.length > 0) {
        const { pos, path } = queue.shift()!;
        if (pos.x === e.x && pos.y === e.y) return path;

        const neighbors = [
          { x: pos.x + 1, y: pos.y }, { x: pos.x - 1, y: pos.y },
          { x: pos.x, y: pos.y + 1 }, { x: pos.x, y: pos.y - 1 },
        ];

        for (const n of neighbors) {
          const idx = n.y * cols + n.x;
          if (n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows && 
              (grid[idx] === 1 || grid[idx] === 3 || idx === startIdx || idx === endIdx) && 
              !visited.has(`${n.x},${n.y}`)) {
            visited.add(`${n.x},${n.y}`);
            queue.push({ pos: n, path: [...path, n] });
          }
        }
      }
      return null;
    };

    if (mustPassThrough !== undefined) {
      const mid = { x: mustPassThrough % cols, y: Math.floor(mustPassThrough / cols) };
      const p1 = getShortest(start, mid);
      const p2 = getShortest(mid, end);
      if (p1 && p2) {
        return [...p1, ...p2.slice(1)];
      }
      return null;
    }

    return getShortest(start, end);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'paint' | 'erase' | null>(null);

  const handleCellAction = (index: number, isDrag: boolean = false) => {
    const newGrid = [...grid];
    setError(null);

    // If clicking a spawn, select it (only on click, not drag)
    if (!isDrag && grid[index] === 2) {
      setSelectedSpawnIndex(index);
      setConnectionStart(index);
      return;
    }

    // Auto-pathing logic (only on click, not drag)
    if (!isDrag && selectedTool === 1) {
      const cellType = grid[index];
      
      // If a spawn is selected and we click a PATH cell (type 1), try to re-route
      if (selectedSpawnIndex !== null && cellType === 1) {
        const currentPaths = spawnPaths[selectedSpawnIndex] || [];
        let updated = false;
        const newSpawnPaths = { ...spawnPaths };
        const updatedPaths = [...currentPaths];

        for (let i = 0; i < updatedPaths.length; i++) {
          const goalIdx = updatedPaths[i].goalIndex;
          const newPath = findPathThroughGrid(selectedSpawnIndex, goalIdx, index);
          if (newPath) {
            updatedPaths[i] = { ...updatedPaths[i], path: newPath };
            updated = true;
            break; // Just update the first one that can be re-routed
          }
        }

        if (updated) {
          newSpawnPaths[selectedSpawnIndex] = updatedPaths;
          setSpawnPaths(newSpawnPaths);
          return;
        }
      }

      if (cellType === 3) { // Goal
        if (selectedSpawnIndex !== null) {
          const existingPathIdx = (spawnPaths[selectedSpawnIndex] || []).findIndex(p => p.goalIndex === index);
          
          if (existingPathIdx !== -1) {
            const newPaths = spawnPaths[selectedSpawnIndex].filter(p => p.goalIndex !== index);
            const newSpawnPaths = { ...spawnPaths, [selectedSpawnIndex]: newPaths };
            if (newPaths.length === 0) delete newSpawnPaths[selectedSpawnIndex];
            setSpawnPaths(newSpawnPaths);
          } else {
            const path = findPathThroughGrid(selectedSpawnIndex, index);
            if (path) {
              const newPaths = [...(spawnPaths[selectedSpawnIndex] || []), { path, goalIndex: index }];
              setSpawnPaths({ ...spawnPaths, [selectedSpawnIndex]: newPaths });
            } else {
              setError("No path found through painted cells! Paint a path first.");
            }
          }
          return;
        }
      }
    }

    if (!isDrag) setConnectionStart(null);

    const currentType = grid[index];
    const targetType = selectedTool;

    // Brush logic
    if (isDrag) {
      if (dragMode === 'paint') {
        if (currentType === 0) newGrid[index] = targetType;
      } else if (dragMode === 'erase') {
        if (currentType === targetType) newGrid[index] = 0;
      }
    } else {
      // Toggle logic for single click
      if (currentType === targetType) {
        newGrid[index] = 0;
      } else {
        newGrid[index] = targetType;
      }
    }

    // If grid changed, handle side effects
    if (newGrid[index] !== grid[index]) {
      if (grid[index] === 1 || newGrid[index] === 1) {
        // If a path cell is modified, re-validate all paths
        const newSpawnPaths = { ...spawnPaths };
        let changed = false;
        Object.keys(newSpawnPaths).forEach(spawnIdxKey => {
          const spawnIdx = Number(spawnIdxKey);
          const updatedPaths = newSpawnPaths[spawnIdx].map(sp => {
            // Check if current path still works
            const stillValid = sp.path.every(pt => {
              const pIdx = pt.y * cols + pt.x;
              // Path is valid if cell is still path (1), or is the spawn/goal itself
              return pIdx === spawnIdx || pIdx === sp.goalIndex || (newGrid[pIdx] === 1);
            });
            if (stillValid) return sp;
            // Try to find a new path
            const newPath = findPathThroughGrid(spawnIdx, sp.goalIndex);
            return newPath ? { ...sp, path: newPath } : null;
          }).filter((p): p is { path: Point[], goalIndex: number } => p !== null);
          
          if (updatedPaths.length !== newSpawnPaths[spawnIdx].length || 
              JSON.stringify(updatedPaths) !== JSON.stringify(newSpawnPaths[spawnIdx])) {
            newSpawnPaths[spawnIdx] = updatedPaths;
            if (updatedPaths.length === 0) delete newSpawnPaths[spawnIdx];
            changed = true;
          }
        });
        if (changed) setSpawnPaths(newSpawnPaths);
      }

      if (grid[index] === 2) {
        const newSpawnPaths = { ...spawnPaths };
        delete newSpawnPaths[index];
        setSpawnPaths(newSpawnPaths);
        if (selectedSpawnIndex === index) setSelectedSpawnIndex(null);
      }

      if (grid[index] === 3) {
        const newSpawnPaths = { ...spawnPaths };
        let changed = false;
        Object.keys(newSpawnPaths).forEach(spawnIdxKey => {
          const spawnIdx = Number(spawnIdxKey);
          const filtered = newSpawnPaths[spawnIdx].filter(p => p.goalIndex !== index);
          if (filtered.length !== newSpawnPaths[spawnIdx].length) {
            newSpawnPaths[spawnIdx] = filtered;
            if (filtered.length === 0) delete newSpawnPaths[spawnIdx];
            changed = true;
          }
        });
        if (changed) setSpawnPaths(newSpawnPaths);
      }

      setGrid(newGrid);
    }
  };

  const handleMouseDown = (index: number) => {
    setIsDragging(true);
    const mode = grid[index] === selectedTool ? 'erase' : 'paint';
    setDragMode(mode);
    handleCellAction(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isDragging) {
      handleCellAction(index, true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  const handleUpload = async () => {
    if (!user) return;
    if (!name.trim()) { setError('Please name your map.'); return; }
    
    const allPaths = (Object.values(spawnPaths) as { path: Point[], goalIndex: number }[][]).flatMap(pathsArr => pathsArr.map(sp => sp.path));
    if (allPaths.length === 0) { setError('Please connect at least one Spawn to a Goal!'); return; }

    setIsUploading(true);
    try {
      await addDoc(collection(db, 'community_maps'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        name,
        description,
        cols,
        rows,
        grid,
        paths: allPaths,
        createdAt: new Date().toISOString(),
        likes: 0,
        plays: 0
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to upload map.');
    } finally {
      setIsUploading(false);
    }
  };

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
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <MapIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Level Builder</h2>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Design and Share Community Maps</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-white/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Editor Grid */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative self-start">
              <div 
                className="grid gap-px bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  width: 'fit-content'
                }}
                onMouseLeave={handleMouseUp}
              >
                {grid.map((cell, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleMouseDown(i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseUp={handleMouseUp}
                    className={`w-6 h-6 md:w-8 md:h-8 transition-colors relative ${
                      cell === 1 ? 'bg-white/20' : 
                      cell === 2 ? 'bg-emerald-500/50' : 
                      cell === 3 ? 'bg-rose-500/50' : 
                      'bg-black/40 hover:bg-white/5'
                    } ${connectionStart === i || selectedSpawnIndex === i ? 'ring-2 ring-cyan-500 ring-inset' : ''}`}
                  >
                    {(connectionStart === i || selectedSpawnIndex === i) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {currentEnemyPaths.length > 0 && (
                <svg 
                  className="absolute inset-0 pointer-events-none" 
                  viewBox={`0 0 ${cols} ${rows}`}
                  preserveAspectRatio="none"
                >
                  {currentEnemyPaths.map((path, idx) => (
                    <polyline
                      key={idx}
                      points={path.map(p => `${p.x + 0.5},${p.y + 0.5}`).join(' ')}
                      fill="none"
                      stroke="rgba(6, 182, 212, 0.8)"
                      strokeWidth="0.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="0.3 0.3"
                      className="animate-[dash_2s_linear_infinite]"
                    />
                  ))}
                  <style>{`
                    @keyframes dash {
                      to { stroke-dashoffset: -0.6; }
                    }
                  `}</style>
                </svg>
              )}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {[
                { id: 1, name: 'Path', icon: <Activity className="w-4 h-4" />, color: 'bg-white/20' },
                { id: 2, name: 'Spawn', icon: <Play className="w-4 h-4" />, color: 'bg-emerald-500/50' },
                { id: 3, name: 'Goal', icon: <Target className="w-4 h-4" />, color: 'bg-rose-500/50' },
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool.id);
                    setConnectionStart(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all uppercase tracking-widest font-bold text-[10px] ${
                    selectedTool === tool.id ? 'bg-white/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-sm ${tool.color}`} />
                  {tool.name}
                </button>
              ))}
            </div>
            {selectedTool === 1 && (
              <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">
                Tip: Click a Spawn to select it, then click Goals to connect. Click painted path cells to re-route connections.
              </p>
            )}
          </div>

          {/* Metadata Form */}
          <div className="w-full md:w-80 flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Map Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter map name..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Annotation / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading || !user}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Publish Map
                </>
              )}
            </button>
            {!user && <p className="text-[9px] text-rose-400 text-center font-bold uppercase tracking-widest">Sign in to publish maps</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LevelBuilder;
