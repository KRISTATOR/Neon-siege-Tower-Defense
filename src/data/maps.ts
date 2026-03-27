import { Point } from '../types';

export interface MapConfig {
  id: string;
  name: string;
  paths: Point[][];
  cols: number;
  rows: number;
  difficulty?: number;
}

export interface Sector {
  id: number;
  name: string;
  wavesToWin: number;
  description: string;
  mapConfig: MapConfig;
}

export const DEFAULT_MAP: MapConfig = {
  id: 'default',
  name: 'Classic Grid',
  cols: 20,
  rows: 12,
  paths: [[
    { x: 0, y: 2 },
    { x: 16, y: 2 },
    { x: 16, y: 5 },
    { x: 3, y: 5 },
    { x: 3, y: 9 },
    { x: 19, y: 9 },
  ]]
};

export const CAMPAIGN_SECTORS: Sector[] = [
  { 
    id: 0, 
    name: "Training Grounds", 
    wavesToWin: 3, 
    description: "Learn the basics of defense in a controlled environment.", 
    mapConfig: {
      id: 'training',
      name: 'Training Grounds',
      cols: 12,
      rows: 8,
      paths: [[{ x: 0, y: 4 }, { x: 11, y: 4 }]],
      difficulty: 1
    }
  },
  { 
    id: 1, 
    name: "Neon Outskirts", 
    wavesToWin: 5, 
    description: "Secure the perimeter of the neon city.", 
    mapConfig: {
      id: 'sector-1',
      name: 'Neon Outskirts',
      cols: 15,
      rows: 10,
      paths: [[{ x: 0, y: 5 }, { x: 14, y: 5 }]],
      difficulty: 1
    }
  },
  { 
    id: 2, 
    name: "Data Hub Alpha", 
    wavesToWin: 8, 
    description: "Protect the central data processing unit.", 
    mapConfig: {
      id: 'sector-2',
      name: 'Data Hub Alpha',
      cols: 15,
      rows: 10,
      paths: [[{ x: 2, y: 0 }, { x: 2, y: 8 }, { x: 12, y: 8 }, { x: 12, y: 2 }]],
      difficulty: 2
    }
  },
  { 
    id: 3, 
    name: "Grid Sector 7", 
    wavesToWin: 10, 
    description: "A high-traffic zone requiring dense defenses.", 
    mapConfig: {
      id: 'sector-3',
      name: 'Grid Sector 7',
      cols: 18,
      rows: 12,
      paths: [[{ x: 0, y: 2 }, { x: 15, y: 2 }, { x: 15, y: 10 }, { x: 2, y: 10 }, { x: 2, y: 6 }, { x: 17, y: 6 }]],
      difficulty: 2
    }
  },
  { 
    id: 4, 
    name: "Silicon Valley", 
    wavesToWin: 12, 
    description: "Defend the core manufacturing plants.", 
    mapConfig: {
      id: 'sector-4',
      name: 'Silicon Valley',
      cols: 20,
      rows: 12,
      paths: [[{ x: 10, y: 0 }, { x: 10, y: 11 }, { x: 2, y: 11 }, { x: 2, y: 2 }, { x: 18, y: 2 }, { x: 18, y: 9 }, { x: 5, y: 9 }]],
      difficulty: 3
    }
  },
  { 
    id: 5, 
    name: "The Firewall", 
    wavesToWin: 15, 
    description: "A narrow pass with intense enemy waves.", 
    mapConfig: {
      id: 'sector-5',
      name: 'The Firewall',
      cols: 25,
      rows: 8,
      paths: [[{ x: 0, y: 4 }, { x: 24, y: 4 }]],
      difficulty: 3
    }
  },
  { 
    id: 6, 
    name: "Cyber Port", 
    wavesToWin: 18, 
    description: "Secure the main shipping docks.", 
    mapConfig: {
      id: 'sector-6',
      name: 'Cyber Port',
      cols: 20,
      rows: 15,
      paths: [[{ x: 0, y: 2 }, { x: 18, y: 2 }, { x: 18, y: 13 }, { x: 2, y: 13 }, { x: 2, y: 7 }, { x: 19, y: 7 }]],
      difficulty: 3
    }
  },
  { 
    id: 7, 
    name: "Neural Link", 
    wavesToWin: 20, 
    description: "Protect the global communication uplink.", 
    mapConfig: {
      id: 'sector-7',
      name: 'Neural Link',
      cols: 22,
      rows: 14,
      paths: [[{ x: 0, y: 0 }, { x: 21, y: 13 }]],
      difficulty: 4
    }
  },
  { 
    id: 8, 
    name: "The Void Gate", 
    wavesToWin: 25, 
    description: "Hold back the entities from the dark net.", 
    mapConfig: {
      id: 'sector-8',
      name: 'The Void Gate',
      cols: 20,
      rows: 12,
      paths: [[{ x: 0, y: 6 }, { x: 5, y: 6 }, { x: 5, y: 2 }, { x: 15, y: 2 }, { x: 15, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 5 }, { x: 19, y: 5 }]],
      difficulty: 4
    }
  },
  { 
    id: 9, 
    name: "Mainframe Core", 
    wavesToWin: 30, 
    description: "The heart of the system is under attack.", 
    mapConfig: {
      id: 'sector-9',
      name: 'Mainframe Core',
      cols: 24,
      rows: 16,
      paths: [[{ x: 12, y: 0 }, { x: 12, y: 15 }, { x: 0, y: 15 }, { x: 0, y: 0 }, { x: 23, y: 0 }, { x: 23, y: 15 }]],
      difficulty: 4
    }
  },
  { 
    id: 10, 
    name: "Singularity", 
    wavesToWin: 50, 
    description: "The final stand against the ultimate virus. Enemies approach from all directions.", 
    mapConfig: {
      id: 'sector-10',
      name: 'Singularity',
      cols: 26,
      rows: 18,
      paths: [
        // North entrance
        [{ x: 13, y: 0 }, { x: 13, y: 9 }, { x: 25, y: 9 }],
        // South entrance
        [{ x: 13, y: 17 }, { x: 13, y: 9 }, { x: 25, y: 9 }],
        // West entrance
        [{ x: 0, y: 9 }, { x: 13, y: 9 }, { x: 25, y: 9 }],
        // East entrance (alternative)
        [{ x: 0, y: 2 }, { x: 24, y: 2 }, { x: 24, y: 16 }, { x: 2, y: 16 }, { x: 2, y: 9 }, { x: 25, y: 9 }]
      ],
      difficulty: 5
    }
  },
  {
    id: 11,
    name: "The Crossroads",
    wavesToWin: 20,
    description: "Two paths intersect at a critical junction.",
    mapConfig: {
      id: 'sector-11',
      name: 'The Crossroads',
      cols: 20,
      rows: 12,
      paths: [
        [{ x: 0, y: 6 }, { x: 19, y: 6 }],
        [{ x: 10, y: 0 }, { x: 10, y: 11 }]
      ],
      difficulty: 3
    }
  },
  {
    id: 12,
    name: "Triple Threat",
    wavesToWin: 25,
    description: "Three separate data streams converge on the core.",
    mapConfig: {
      id: 'sector-12',
      name: 'Triple Threat',
      cols: 22,
      rows: 14,
      paths: [
        [{ x: 0, y: 2 }, { x: 11, y: 2 }, { x: 11, y: 13 }],
        [{ x: 0, y: 11 }, { x: 11, y: 11 }, { x: 11, y: 13 }],
        [{ x: 21, y: 6 }, { x: 11, y: 6 }, { x: 11, y: 13 }]
      ],
      difficulty: 4
    }
  },
  {
    id: 13,
    name: "The Gauntlet",
    wavesToWin: 30,
    description: "Two parallel paths test your ability to manage multiple fronts.",
    mapConfig: {
      id: 'sector-13',
      name: 'The Gauntlet',
      cols: 24,
      rows: 16,
      paths: [
        [{ x: 0, y: 4 }, { x: 23, y: 4 }],
        [{ x: 0, y: 11 }, { x: 23, y: 11 }]
      ],
      difficulty: 4
    }
  }
];

export const getLayoutDifficulty = (map: MapConfig): number => {
  if (map.difficulty) return map.difficulty;
  
  // Base difficulty from number of entrances
  if (map.paths.length >= 4) return 5;
  if (map.paths.length === 3) return 4;
  if (map.paths.length === 2) return 3;
  
  // For single path maps, look at complexity (number of points)
  // Fewer points usually means more direct/faster paths
  const points = map.paths[0].length;
  if (points <= 3) return 2;
  return 1;
};
