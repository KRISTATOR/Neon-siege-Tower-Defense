/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Target, 
  Snowflake, 
  Coins, 
  Heart, 
  Play, 
  RotateCcw,
  Info,
  ShoppingCart,
  Skull,
  Flame,
  Wind,
  Radio,
  Activity,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowUp,
  LogOut,
  X,
  Settings as SettingsIcon,
  Star,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  BookOpen,
  Cpu,
  Plus,
  Minus,
  Square,
  Hexagon,
  Circle
} from 'lucide-react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

// --- Constants & Types ---

const GRID_SIZE = 40;

enum TurretType {
  BASIC = 'BASIC',
  SNIPER = 'SNIPER',
  FROST = 'FROST',
  GATLING = 'GATLING',
  TESLA = 'TESLA',
  MORTAR = 'MORTAR',
  SONIC = 'SONIC',
  BEAM = 'BEAM',
  MISSILE = 'MISSILE',
  VOID = 'VOID',
  FLAME = 'FLAME',
  SHOCK = 'SHOCK',
  ORBITAL = 'ORBITAL',
  GRAVITY = 'GRAVITY',
  PLASMA = 'PLASMA'
}

const EMPTY_INVENTORY: Record<TurretType, number> = {
  [TurretType.BASIC]: 0,
  [TurretType.SNIPER]: 0,
  [TurretType.FROST]: 0,
  [TurretType.GATLING]: 0,
  [TurretType.TESLA]: 0,
  [TurretType.MORTAR]: 0,
  [TurretType.SONIC]: 0,
  [TurretType.BEAM]: 0,
  [TurretType.MISSILE]: 0,
  [TurretType.VOID]: 0,
  [TurretType.FLAME]: 0,
  [TurretType.SHOCK]: 0,
  [TurretType.ORBITAL]: 0,
  [TurretType.GRAVITY]: 0,
  [TurretType.PLASMA]: 0,
};

enum TurretCategory {
  SHORT_RANGE = 'Short Range',
  MEDIUM_RANGE = 'Medium Range',
  LONG_RANGE = 'Long Range',
  LASERS = 'Lasers',
  SLOWERS = 'Slowers'
}

enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

enum GameMode {
  START = 'START',
  ENDLESS = 'ENDLESS',
  CAMPAIGN = 'CAMPAIGN',
  TUTORIAL = 'TUTORIAL',
  SANDBOX = 'SANDBOX'
}

interface MapConfig {
  id: string;
  name: string;
  path: Point[];
  cols: number;
  rows: number;
}

interface Sector {
  id: number;
  name: string;
  wavesToWin: number;
  description: string;
  mapConfig: MapConfig;
}

const DEFAULT_MAP: MapConfig = {
  id: 'default',
  name: 'Classic Grid',
  cols: 20,
  rows: 12,
  path: [
    { x: 0, y: 2 },
    { x: 16, y: 2 },
    { x: 16, y: 5 },
    { x: 3, y: 5 },
    { x: 3, y: 9 },
    { x: 19, y: 9 },
  ]
};

const CAMPAIGN_SECTORS: Sector[] = [
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
      path: [{ x: 0, y: 4 }, { x: 11, y: 4 }]
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
      path: [{ x: 0, y: 5 }, { x: 14, y: 5 }]
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
      path: [{ x: 2, y: 0 }, { x: 2, y: 8 }, { x: 12, y: 8 }, { x: 12, y: 2 }]
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
      path: [{ x: 0, y: 2 }, { x: 15, y: 2 }, { x: 15, y: 10 }, { x: 2, y: 10 }, { x: 2, y: 6 }, { x: 17, y: 6 }]
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
      path: [{ x: 10, y: 0 }, { x: 10, y: 11 }, { x: 2, y: 11 }, { x: 2, y: 2 }, { x: 18, y: 2 }, { x: 18, y: 9 }, { x: 5, y: 9 }]
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
      path: [{ x: 0, y: 4 }, { x: 24, y: 4 }]
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
      path: [{ x: 0, y: 2 }, { x: 18, y: 2 }, { x: 18, y: 13 }, { x: 2, y: 13 }, { x: 2, y: 7 }, { x: 19, y: 7 }]
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
      path: [{ x: 0, y: 0 }, { x: 21, y: 13 }]
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
      path: [{ x: 0, y: 6 }, { x: 5, y: 6 }, { x: 5, y: 2 }, { x: 15, y: 2 }, { x: 15, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 5 }, { x: 19, y: 5 }]
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
      path: [{ x: 12, y: 0 }, { x: 12, y: 15 }, { x: 0, y: 15 }, { x: 0, y: 0 }, { x: 23, y: 0 }, { x: 23, y: 15 }]
    }
  },
  { 
    id: 10, 
    name: "Singularity", 
    wavesToWin: 50, 
    description: "The final stand against the ultimate virus.", 
    mapConfig: {
      id: 'sector-10',
      name: 'Singularity',
      cols: 26,
      rows: 18,
      path: [
        { x: 0, y: 2 }, { x: 24, y: 2 }, { x: 24, y: 16 }, { x: 2, y: 16 }, 
        { x: 2, y: 5 }, { x: 21, y: 5 }, { x: 21, y: 13 }, { x: 5, y: 13 }, 
        { x: 5, y: 8 }, { x: 18, y: 8 }, { x: 18, y: 10 }, { x: 25, y: 10 }
      ]
    }
  },
];

const getTurretDepth = (type: TurretType): number => {
  const config = TURRET_CONFIGS[type];
  if (!config || config.prerequisites.length === 0) return 0;
  return 1 + Math.max(...config.prerequisites.map(getTurretDepth));
};

interface DifficultyConfig {
  gold: number;
  lives: number;
  scaling: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.EASY]: { gold: 300, lives: 30, scaling: 1.05 },
  [Difficulty.MEDIUM]: { gold: 200, lives: 15, scaling: 1.15 },
  [Difficulty.HARD]: { gold: 100, lives: 10, scaling: 1.3 }
};

interface Point {
  x: number;
  y: number;
}

interface TurretConfig {
  type: TurretType;
  category: TurretCategory;
  name: string;
  cost: number;
  unlockCost: number;
  upgradeUnlockCost: number;
  upgradeCost: number;
  range: number; // in grid units
  damage: number;
  fireRate: number; // seconds between shots
  color: string;
  icon: React.ReactNode;
  description: string;
  isAOE?: boolean;
  isContinuous?: boolean;
  prerequisites: TurretType[];
  report: {
    origin: string;
    tech: string;
    pros: string[];
    cons: string[];
  };
}

const TURRET_CONFIGS: Record<TurretType, TurretConfig> = {
  [TurretType.BASIC]: {
    type: TurretType.BASIC,
    category: TurretCategory.SHORT_RANGE,
    name: 'Pulse Laser',
    cost: 15,
    unlockCost: 0,
    upgradeUnlockCost: 50,
    upgradeCost: 20,
    range: 3,
    damage: 15,
    fireRate: 0.4,
    color: '#00f2ff',
    icon: <Zap className="w-4 h-4" />,
    description: 'Fast firing, low damage.',
    prerequisites: [],
    report: {
      origin: 'Early Grid Defense Division',
      tech: 'Coherent Light Amplification',
      pros: ['High reliability', 'Low energy cost'],
      cons: ['Low armor penetration', 'Limited range']
    }
  },
  [TurretType.SNIPER]: {
    type: TurretType.SNIPER,
    category: TurretCategory.LONG_RANGE,
    name: 'Railgun',
    cost: 30,
    unlockCost: 75,
    upgradeUnlockCost: 100,
    upgradeCost: 40,
    range: 7,
    damage: 100,
    fireRate: 2.0,
    color: '#ff00ff',
    icon: <Target className="w-4 h-4" />,
    description: 'Long range, massive damage.',
    prerequisites: [TurretType.BASIC],
    report: {
      origin: 'Deep Space Security',
      tech: 'Electromagnetic Acceleration',
      pros: ['Extreme range', 'One-shot potential'],
      cons: ['Slow recharge', 'Inefficient vs swarms']
    }
  },
  [TurretType.FROST]: {
    type: TurretType.FROST,
    category: TurretCategory.SLOWERS,
    name: 'Cryo Beam',
    cost: 25,
    unlockCost: 60,
    upgradeUnlockCost: 80,
    upgradeCost: 30,
    range: 4,
    damage: 5,
    fireRate: 0.8,
    color: '#00ff88',
    icon: <Snowflake className="w-4 h-4" />,
    description: 'Slows enemies by 50%.',
    prerequisites: [TurretType.BASIC],
    report: {
      origin: 'Arctic Containment Unit',
      tech: 'Endothermic Particle Stream',
      pros: ['Crowd control', 'Strategic utility'],
      cons: ['Minimal damage', 'Requires support']
    }
  },
  [TurretType.GATLING]: {
    type: TurretType.GATLING,
    category: TurretCategory.SHORT_RANGE,
    name: 'Gatling Gun',
    cost: 30,
    unlockCost: 70,
    upgradeUnlockCost: 90,
    upgradeCost: 35,
    range: 3.5,
    damage: 8,
    fireRate: 0.1,
    color: '#fbbf24',
    icon: <Activity className="w-4 h-4" />,
    description: 'Extreme fire rate.',
    prerequisites: [TurretType.BASIC],
    report: {
      origin: 'Frontier Outpost 9',
      tech: 'Multi-barrel Kinetic System',
      pros: ['High DPS', 'Effective vs swarms'],
      cons: ['Short range', 'High ammo consumption']
    }
  },
  [TurretType.TESLA]: {
    type: TurretType.TESLA,
    category: TurretCategory.SHORT_RANGE,
    name: 'Tesla Coil',
    cost: 45,
    unlockCost: 140,
    upgradeUnlockCost: 180,
    upgradeCost: 60,
    range: 3.5,
    damage: 40,
    fireRate: 1.2,
    color: '#a855f7',
    icon: <Zap className="w-4 h-4" />,
    description: 'High damage electrical discharge.',
    prerequisites: [TurretType.SNIPER],
    report: {
      origin: 'Power Grid R&D',
      tech: 'High-Voltage Arc Induction',
      pros: ['High burst damage', 'Ignores some shielding'],
      cons: ['Erratic targeting', 'High power draw']
    }
  },
  [TurretType.MORTAR]: {
    type: TurretType.MORTAR,
    category: TurretCategory.MEDIUM_RANGE,
    name: 'Plasma Mortar',
    cost: 60,
    unlockCost: 170,
    upgradeUnlockCost: 220,
    upgradeCost: 80,
    range: 5,
    damage: 60,
    fireRate: 2.5,
    color: '#f97316',
    icon: <Flame className="w-4 h-4" />,
    description: 'Hits multiple targets.',
    isAOE: true,
    prerequisites: [TurretType.FROST],
    report: {
      origin: 'Heavy Ordnance Division',
      tech: 'Encapsulated Plasma Shells',
      pros: ['Area of Effect', 'High impact'],
      cons: ['Slow projectile', 'Minimum range limit']
    }
  },
  [TurretType.SONIC]: {
    type: TurretType.SONIC,
    category: TurretCategory.SLOWERS,
    name: 'Sonic Pulse',
    cost: 75,
    unlockCost: 230,
    upgradeUnlockCost: 300,
    upgradeCost: 100,
    range: 4,
    damage: 10,
    fireRate: 1.5,
    color: '#60a5fa',
    icon: <Radio className="w-4 h-4" />,
    description: 'AOE slow and damage.',
    isAOE: true,
    prerequisites: [TurretType.MORTAR],
    report: {
      origin: 'Acoustic Research Lab',
      tech: 'Low-Frequency Resonance',
      pros: ['Massive crowd control', 'Disrupts formations'],
      cons: ['Long cooldown', 'Low direct damage']
    }
  },
  [TurretType.BEAM]: {
    type: TurretType.BEAM,
    category: TurretCategory.LASERS,
    name: 'Prism Beam',
    cost: 90,
    unlockCost: 300,
    upgradeUnlockCost: 400,
    upgradeCost: 120,
    range: 4.5,
    damage: 2,
    fireRate: 0.016,
    color: '#ec4899',
    icon: <Wind className="w-4 h-4" />,
    description: 'Continuous damage beam.',
    isContinuous: true,
    prerequisites: [TurretType.TESLA],
    report: {
      origin: 'Orbital Strike Command',
      tech: 'Focused Photon Stream',
      pros: ['Constant damage', 'Perfect accuracy'],
      cons: ['Single target only', 'High heat generation']
    }
  },
  [TurretType.MISSILE]: {
    type: TurretType.MISSILE,
    category: TurretCategory.LONG_RANGE,
    name: 'Missile Battery',
    cost: 100,
    unlockCost: 350,
    upgradeUnlockCost: 450,
    upgradeCost: 150,
    range: 8,
    damage: 120,
    fireRate: 3.0,
    color: '#ef4444',
    icon: <Target className="w-4 h-4" />,
    description: 'Long range AOE missiles.',
    isAOE: true,
    prerequisites: [TurretType.SNIPER],
    report: {
      origin: 'Global Defense Initiative',
      tech: 'Autonomous Homing Warheads',
      pros: ['Extreme range', 'Splash damage'],
      cons: ['Slow travel time', 'Vulnerable to decoys']
    }
  },
  [TurretType.VOID]: {
    type: TurretType.VOID,
    category: TurretCategory.LONG_RANGE,
    name: 'Void Hole',
    cost: 180,
    unlockCost: 600,
    upgradeUnlockCost: 800,
    upgradeCost: 250,
    range: 4,
    damage: 500,
    fireRate: 5.0,
    color: '#ffffff',
    icon: <Skull className="w-4 h-4" />,
    description: 'Extreme damage, very slow.',
    prerequisites: [TurretType.BEAM],
    report: {
      origin: 'Unknown / Dark Net',
      tech: 'Singularity Generation',
      pros: ['Unmatched damage', 'Annihilates bosses'],
      cons: ['Extremely slow', 'Massive cost']
    }
  },
  [TurretType.FLAME]: {
    type: TurretType.FLAME,
    category: TurretCategory.SHORT_RANGE,
    name: 'Inferno',
    cost: 40,
    unlockCost: 120,
    upgradeUnlockCost: 150,
    upgradeCost: 50,
    range: 2.5,
    damage: 12,
    fireRate: 0.1,
    color: '#f87171',
    icon: <Flame className="w-4 h-4" />,
    description: 'Short range AOE fire.',
    isAOE: true,
    prerequisites: [TurretType.BASIC],
    report: {
      origin: 'Hazardous Waste Disposal',
      tech: 'Superheated Napalm Spray',
      pros: ['Melts swarms', 'Lingering damage'],
      cons: ['Very short range', 'Ineffective vs armor']
    }
  },
  [TurretType.SHOCK]: {
    type: TurretType.SHOCK,
    category: TurretCategory.SHORT_RANGE,
    name: 'Shock Wave',
    cost: 50,
    unlockCost: 150,
    upgradeUnlockCost: 200,
    upgradeCost: 70,
    range: 3,
    damage: 20,
    fireRate: 1.0,
    color: '#60a5fa',
    icon: <Zap className="w-4 h-4" />,
    description: 'Stuns and damages nearby enemies.',
    isAOE: true,
    prerequisites: [TurretType.TESLA],
    report: {
      origin: 'Riot Control Systems',
      tech: 'Kinetic-Electric Pulse',
      pros: ['Stuns enemies', '360 degree coverage'],
      cons: ['Short range', 'Low fire rate']
    }
  },
  [TurretType.ORBITAL]: {
    type: TurretType.ORBITAL,
    category: TurretCategory.LONG_RANGE,
    name: 'Orbital Strike',
    cost: 250,
    unlockCost: 1000,
    upgradeUnlockCost: 1200,
    upgradeCost: 400,
    range: 10,
    damage: 2000,
    fireRate: 10.0,
    color: '#fbbf24',
    icon: <Target className="w-4 h-4" />,
    description: 'Devastating orbital laser.',
    isAOE: true,
    prerequisites: [TurretType.VOID],
    report: {
      origin: 'High Command Satellite',
      tech: 'Kinetic Bombardment',
      pros: ['Infinite range', 'Absolute destruction'],
      cons: ['Longest reload', 'Prohibitive cost']
    }
  },
  [TurretType.GRAVITY]: {
    type: TurretType.GRAVITY,
    category: TurretCategory.SLOWERS,
    name: 'Gravity Well',
    cost: 120,
    unlockCost: 400,
    upgradeUnlockCost: 500,
    upgradeCost: 150,
    range: 5,
    damage: 5,
    fireRate: 0.5,
    color: '#818cf8',
    icon: <Wind className="w-4 h-4" />,
    description: 'Extreme slow in a large area.',
    isAOE: true,
    prerequisites: [TurretType.SONIC],
    report: {
      origin: 'Singularity Research Lab',
      tech: 'Localized Spacetime Distortion',
      pros: ['Massive AOE slow', 'Pulls enemies together'],
      cons: ['High energy drain', 'Minimal damage']
    }
  },
  [TurretType.PLASMA]: {
    type: TurretType.PLASMA,
    category: TurretCategory.MEDIUM_RANGE,
    name: 'Plasma Cannon',
    cost: 80,
    unlockCost: 250,
    upgradeUnlockCost: 350,
    upgradeCost: 100,
    range: 5.5,
    damage: 80,
    fireRate: 1.8,
    color: '#4ade80',
    icon: <Zap className="w-4 h-4" />,
    description: 'Powerful plasma projectiles.',
    prerequisites: [TurretType.MORTAR],
    report: {
      origin: 'Advanced Energy Division',
      tech: 'Superheated Ionized Gas',
      pros: ['High armor penetration', 'Splash damage'],
      cons: ['Slow projectile speed', 'Medium fire rate']
    }
  }
};

const LORE_MESSAGES: Record<number, string> = {
  0: "Welcome to the Neon Perimeter, Commander. The Grid is under siege by digital entities from the Void. We've authorized basic Pulse Laser tech for your defense. Hold the line at all costs.",
  1: "First contact confirmed. They are weak, but numerous. Use the gold from their destruction to build more defenses.",
  3: "The entities are beginning to resonate. Our scanners show a 20% increase in structural integrity. You'll need to sniper them from a distance or slow them down.",
  5: "Intelligence reports suggest the swarm is adapting. They are moving faster now. Ensure your perimeter is tight.",
  7: "Thermal signatures are rising. The swarm is deploying heavy-plated units. It's time to research the Plasma Mortar or high-voltage Tesla Coils.",
  10: "We're losing ground in the outer sectors. The pressure is mounting. Upgrade your arsenal or be consumed.",
  12: "The Void is thinning. We're detecting massive energy signatures. The Prism Beam and Missile Batteries are now critical for our survival.",
  15: "The core is vibrating at a dangerous frequency. We need more firepower. The Void Hole technology is our last hope.",
  20: "This is it. The final resonance. The core stability is failing. If we don't stop them here, the entire Grid collapses into the Void. Good luck, Commander."
};

const CAMPAIGN_LORE: Record<number, string> = {
  0: "Welcome to the Training Grounds, Commander. Here you will learn the basics of grid defense. Establish a perimeter and neutralize the test viruses. Pulse Laser tech is online.",
  1: "The Neon Outskirts are being probed. This is just the beginning. We need to establish a perimeter before they reach the inner hubs. Secure the city limits.",
  2: "Data Hub Alpha is under threat. If they breach this node, our communication lines will be severed. Hold them back while we secure the archives.",
  3: "Grid Sector 7 is a high-traffic junction. The entities are using it to bypass our main firewalls. We must turn this transit zone into a graveyard.",
  4: "Silicon Valley—the heart of our manufacturing. If the core plants fall, we lose our ability to produce advanced turret components. Defend the assembly lines.",
  5: "The Firewall is our strongest linear defense, but it's being hammered by a concentrated swarm. This is a battle of attrition. Don't let a single bit leak.",
  6: "Cyber Port is the gateway for our off-world resources. The entities are trying to block our supply chains. Keep the docks clear at all costs.",
  7: "Neural Link is the backbone of the global mind. A breach here means total cognitive collapse for the citizens. The stakes have never been higher.",
  8: "The Void Gate has opened. They are no longer just probing; they are invading from the dark net itself. This sector is the thin line between us and oblivion.",
  9: "Mainframe Core is the brain of the entire Grid. They've bypassed almost all our defenses. If this falls, the war is over. Give them everything you've got.",
  10: "Singularity. The ultimate virus has manifested. It's trying to rewrite the laws of our reality. This is the final stand. For the Grid, for the Future!"
};

const TECH_TREE_POSITIONS: Record<TurretType, { x: number; y: number }> = {
  [TurretType.BASIC]: { x: 0, y: 0 },
  [TurretType.GATLING]: { x: 350, y: -225 },
  [TurretType.SNIPER]: { x: 350, y: -75 },
  [TurretType.FROST]: { x: 350, y: 75 },
  [TurretType.FLAME]: { x: 350, y: 225 },
  [TurretType.TESLA]: { x: 700, y: -150 },
  [TurretType.MISSILE]: { x: 700, y: 0 },
  [TurretType.MORTAR]: { x: 700, y: 150 },
  [TurretType.BEAM]: { x: 1050, y: -225 },
  [TurretType.SHOCK]: { x: 1050, y: -75 },
  [TurretType.SONIC]: { x: 1050, y: 75 },
  [TurretType.PLASMA]: { x: 1050, y: 225 },
  [TurretType.VOID]: { x: 1400, y: -75 },
  [TurretType.GRAVITY]: { x: 1400, y: 75 },
  [TurretType.ORBITAL]: { x: 1750, y: 0 },
};

// --- Sound Manager (Web Audio API) ---
const SoundManager = {
  audioCtx: null as AudioContext | null,
  bgmSource: null as AudioBufferSourceNode | null,
  isMuted: false,

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.bgmSource) {
        this.bgmSource.stop();
        this.bgmSource = null;
      }
    } else {
      this.playBGM();
    }
  },

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },

  playSynth(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (this.audioCtx!.state === 'suspended') {
      this.audioCtx!.resume();
    }
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.audioCtx!.currentTime + duration);
    
    gain.gain.setValueAtTime(volume, this.audioCtx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx!.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.audioCtx!.destination);
    
    osc.start();
    osc.stop(this.audioCtx!.currentTime + duration);
  },

  playBGM() {
    if (this.isMuted) return;
    this.init();
    if (this.bgmSource) return;
    if (this.audioCtx!.state === 'suspended') {
      this.audioCtx!.resume();
    }

    const duration = 2; // 2 seconds loop
    const sampleRate = this.audioCtx!.sampleRate;
    const buffer = this.audioCtx!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Simple rhythmic pulse
      const pulse = Math.sin(2 * Math.PI * 40 * t) * 0.1;
      const beat = (i % (sampleRate / 2) < 1000) ? 0.05 : 0;
      data[i] = pulse + beat;
    }

    this.bgmSource = this.audioCtx!.createBufferSource();
    this.bgmSource.buffer = buffer;
    this.bgmSource.loop = true;
    const gain = this.audioCtx!.createGain();
    gain.gain.value = 0.05;
    this.bgmSource.connect(gain);
    gain.connect(this.audioCtx!.destination);
    this.bgmSource.start();
  },

  playZap() { this.playSynth(800, 'square', 0.05, 0.03); },
  playThud() { this.playSynth(150, 'sine', 0.3, 0.1); },
  playBuy() { this.playSynth(1200, 'triangle', 0.2, 0.1); },
  playPlace() { this.playSynth(400, 'sine', 0.1, 0.1); },
  playDelete() { this.playSynth(200, 'sawtooth', 0.2, 0.1); },
  playDeath() { this.playSynth(100, 'square', 0.4, 0.05); },
  playWaveStart() { this.playSynth(600, 'sine', 0.8, 0.1); },
  playVictory() { 
    this.playSynth(800, 'sine', 0.2, 0.1);
    setTimeout(() => this.playSynth(1000, 'sine', 0.2, 0.1), 100);
    setTimeout(() => this.playSynth(1200, 'sine', 0.4, 0.1), 200);
  }
};

// --- Game Logic Classes ---

enum EnemyType {
  SQUARE = 'SQUARE',
  HEXAGON = 'HEXAGON',
  CIRCLE = 'CIRCLE',
  STAR = 'STAR'
}

interface EnemyConfig {
  type: EnemyType;
  name: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  report: {
    threatLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
    behavior: string;
    weakness: string;
    data: string;
  };
}

const ACHIEVEMENTS = [
  { id: 'first_contact', name: 'First Contact', description: 'Survive your first wave.', isSecret: false },
  { id: 'campaign_hero', name: 'Campaign Hero', description: 'Secure all 11 sectors of the campaign.', isSecret: false },
  { id: 'endless_survivor', name: 'Endless Survivor', description: 'Reach wave 50 in Endless Mode.', isSecret: false },
  { id: 'tech_specialist', name: 'Tech Specialist', description: 'Unlock all available turret types.', isSecret: false },
  { id: 'rich_commander', name: 'Rich Commander', description: 'Accumulate 5,000 gold in a single session.', isSecret: true },
  { id: 'close_call', name: 'Close Call', description: 'Survive a wave with only 1 integrity point remaining.', isSecret: true },
  { id: 'archivist', name: 'Archivist', description: 'Save 10 sessions to the Endless Library.', isSecret: false },
  { id: 'centurion', name: 'Centurion', description: 'Reach wave 100 in Endless Mode.', isSecret: false },
  { id: 'grid_master', name: 'Grid Master', description: 'Unlock all campaign sectors.', isSecret: false },
];

const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.SQUARE]: {
    type: EnemyType.SQUARE,
    name: 'Basic Virus',
    description: 'Standard hostile entity.',
    color: '#ef4444',
    icon: <Square className="w-4 h-4" />,
    report: {
      threatLevel: 'Low',
      behavior: 'Predictable linear movement.',
      weakness: 'Pulse Lasers and Gatling Guns.',
      data: 'The most common form of system corruption. Easily dispatched but dangerous in large numbers.'
    }
  },
  [EnemyType.HEXAGON]: {
    type: EnemyType.HEXAGON,
    name: 'Armored Worm',
    description: 'High health, slow movement.',
    color: '#f59e0b',
    icon: <Hexagon className="w-4 h-4" />,
    report: {
      threatLevel: 'Medium',
      behavior: 'Slow but relentless advance.',
      weakness: 'Railguns and Plasma Mortars.',
      data: 'Encased in a hardened data shell. Requires concentrated fire or high-impact weaponry to breach.'
    }
  },
  [EnemyType.CIRCLE]: {
    type: EnemyType.CIRCLE,
    name: 'Speed Glitch',
    description: 'Fast but fragile.',
    color: '#3b82f6',
    icon: <Circle className="w-4 h-4" />,
    report: {
      threatLevel: 'High',
      behavior: 'Rapid erratic movement.',
      weakness: 'Cryo Beams and Tesla Coils.',
      data: 'A temporal anomaly in the grid. Its high speed makes it difficult for slow-firing turrets to track.'
    }
  },
  [EnemyType.STAR]: {
    type: EnemyType.STAR,
    name: 'System Overlord',
    description: 'A massive star-shaped boss entity.',
    color: '#f43f5e',
    icon: <Star className="w-4 h-4" />,
    report: {
      threatLevel: 'Extreme',
      behavior: 'Slow, heavy, and extremely durable.',
      weakness: 'Concentrated fire from all available turrets.',
      data: 'The System Overlord is the ultimate manifestation of the grid\'s corruption. It only appears when the system is under extreme stress, acting as a final safeguard for the virus. Its star-shaped geometry is designed to deflect standard pulse fire, requiring overwhelming force to neutralize.'
    }
  }
};

class Enemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: EnemyType;
  pathIndex: number = 0;
  progress: number = 0; // Distance along current segment
  totalDistance: number = 0; // Total distance traveled
  isDead: boolean = false;
  isLeaked: boolean = false;
  slowTimer: number = 0;

  path: Point[];

  constructor(hp: number, speed: number, type: EnemyType = EnemyType.SQUARE, path: Point[]) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.path = path;
    this.x = this.path[0].x * GRID_SIZE;
    this.y = this.path[0].y * GRID_SIZE;
    this.type = type;
    
    // Adjust stats based on type
    let hpMult = 1;
    let speedMult = 1;
    
    if (type === EnemyType.HEXAGON) {
      hpMult = 3;
      speedMult = 0.5;
    } else if (type === EnemyType.CIRCLE) {
      hpMult = 0.5;
      speedMult = 2;
    } else if (type === EnemyType.STAR) {
      hpMult = 20;
      speedMult = 0.4;
    }
    
    this.maxHp = hp * hpMult;
    this.hp = this.maxHp;
    this.speed = speed * speedMult;
  }

  update(deltaTime: number) {
    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
    }

    const currentSpeed = this.slowTimer > 0 ? this.speed * 0.5 : this.speed;
    const moveDist = currentSpeed * (deltaTime / 16.67) * 2; // Normalize to ~60fps

    if (this.pathIndex < this.path.length - 1) {
      const start = this.path[this.pathIndex];
      const end = this.path[this.pathIndex + 1];
      
      const dx = (end.x - start.x) * GRID_SIZE;
      const dy = (end.y - start.y) * GRID_SIZE;
      const segmentLen = Math.sqrt(dx * dx + dy * dy);
      
      this.progress += moveDist;
      this.totalDistance += moveDist;

      if (this.progress >= segmentLen) {
        this.progress -= segmentLen;
        this.pathIndex++;
        if (this.pathIndex >= this.path.length - 1) {
          this.isLeaked = true;
          return;
        }
      }

      const ratio = this.progress / segmentLen;
      const nextStart = this.path[this.pathIndex];
      const nextEnd = this.path[this.pathIndex + 1];
      this.x = nextStart.x * GRID_SIZE + (nextEnd.x - nextStart.x) * GRID_SIZE * ratio;
      this.y = nextStart.y * GRID_SIZE + (nextEnd.y - nextStart.y) * GRID_SIZE * ratio;
    } else {
      this.isLeaked = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.slowTimer > 0 ? '#4ade80' : 
                    this.type === EnemyType.HEXAGON ? '#f59e0b' :
                    this.type === EnemyType.CIRCLE ? '#3b82f6' : 
                    this.type === EnemyType.STAR ? '#f43f5e' : '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;
    
    const size = this.type === EnemyType.HEXAGON ? 24 : 
                 this.type === EnemyType.CIRCLE ? 16 : 
                 this.type === EnemyType.STAR ? 40 : 20;
    
    if (this.type === EnemyType.SQUARE) {
      ctx.fillRect(this.x - size/2, this.y - size/2, size, size);
    } else if (this.type === EnemyType.CIRCLE) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, size/2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === EnemyType.HEXAGON) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = this.x + (size / 2) * Math.cos(angle);
        const y = this.y + (size / 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.type === EnemyType.STAR) {
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = size / 2;
      const innerRadius = size / 4;
      let rot = Math.PI / 2 * 3;
      let x = this.x;
      let y = this.y;
      const step = Math.PI / spikes;

      ctx.moveTo(this.x, this.y - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = this.x + Math.cos(rot) * outerRadius;
        y = this.y + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = this.x + Math.cos(rot) * innerRadius;
        y = this.y + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(this.x, this.y - outerRadius);
      ctx.closePath();
      ctx.fill();
    }
    
    // HP Bar
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x - size/2 - 5, this.y - size/2 - 10, size + 10, 4);
    ctx.fillStyle = this.type === EnemyType.HEXAGON ? '#f59e0b' : 
                    this.type === EnemyType.STAR ? '#f43f5e' : '#ef4444';
    ctx.fillRect(this.x - size/2 - 5, this.y - size/2 - 10, (size + 10) * (this.hp / this.maxHp), 4);
  }
}

class Turret {
  id: string;
  x: number;
  y: number;
  config: TurretConfig;
  lastShot: number = 0;
  target: Enemy | null = null;
  level: number = 1;
  maxLevel: number = 3;
  angle: number = 0;
  targetAngle: number = 0;
  lastTargetPos: { x: number, y: number } | null = null;
  lastUpgradeTime: number = 0;

  constructor(gridX: number, gridY: number, type: TurretType) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = gridX * GRID_SIZE + GRID_SIZE / 2;
    this.y = gridY * GRID_SIZE + GRID_SIZE / 2;
    this.config = TURRET_CONFIGS[type];
  }

  get damage() {
    return this.config.damage * (1 + (this.level - 1) * 0.5);
  }

  get range() {
    return this.config.range * (1 + (this.level - 1) * 0.15);
  }

  get fireRate() {
    // Lower is faster
    return this.config.fireRate * Math.pow(0.85, this.level - 1);
  }

  update(enemies: Enemy[], currentTime: number) {
    // Targeting: Furthest enemy in range
    let bestTarget: Enemy | null = null;
    let maxDist = -1;

    for (const enemy of enemies) {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.range * GRID_SIZE) {
        if (enemy.totalDistance > maxDist) {
          maxDist = enemy.totalDistance;
          bestTarget = enemy;
        }
      }
    }

    this.target = bestTarget;

    // Update rotation
    if (this.target) {
      this.targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }

    // Smooth rotation
    let angleDiff = this.targetAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.angle += angleDiff * 0.15;

    if (this.target && currentTime - this.lastShot >= this.fireRate * 1000) {
      this.lastTargetPos = { x: this.target.x, y: this.target.y };
      this.shoot(enemies);
      this.lastShot = currentTime;
    }
  }

  shoot(enemies: Enemy[]) {
    if (!this.target) return;
    
    SoundManager.playZap();
    
    if (this.config.isAOE) {
      // AOE Damage
      enemies.forEach(enemy => {
        const dx = enemy.x - this.target!.x;
        const dy = enemy.y - this.target!.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) { // AOE Radius
          enemy.hp -= this.damage;
          if (enemy.hp <= 0) enemy.isDead = true;
        }
      });
    } else {
      // Single Target
      this.target.hp -= this.damage;
      if (this.target.hp <= 0) {
        this.target.isDead = true;
      }
    }
    
    if (this.config.type === TurretType.FROST) {
      this.target.slowTimer = 2000; // 2 seconds slow
    }
  }

  draw(ctx: CanvasRenderingContext2D, currentTime: number, isSelected: boolean = false) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Draw Range (Only if selected)
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(0, 0, this.range * GRID_SIZE, 0, Math.PI * 2);
      ctx.strokeStyle = `${this.config.color}44`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `${this.config.color}11`;
      ctx.fill();
    }

    // Rotate towards target
    ctx.rotate(this.angle);

    // Upgrade Animation (Scale Pop)
    const upgradeElapsed = currentTime - this.lastUpgradeTime;
    let upgradeScale = 1;
    let barrelOffset = 0;
    if (upgradeElapsed < 600) {
      const t = upgradeElapsed / 600;
      // Scale pop
      upgradeScale = 1 + Math.sin(t * Math.PI) * 0.2 * (1 - t);
      // Barrel extension/retraction
      barrelOffset = Math.sin(t * Math.PI * 2) * 3 * (1 - t);
      
      // Extra glow during upgrade
      ctx.shadowBlur = 20 + Math.sin(t * Math.PI) * 20;
      ctx.shadowColor = '#fff';
    }
    ctx.scale(upgradeScale, upgradeScale);

    // Highlight if selected
    if (isSelected) {
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#fff';
      ctx.fillStyle = '#fff'; // Signal selection with white
    } else if (upgradeElapsed >= 600) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.config.color;
      ctx.fillStyle = this.config.color; // Use original unique color
    } else {
      ctx.fillStyle = this.config.color;
    }

    if (this.level === 1) {
      // Level 1: Sleek Triangle
      ctx.beginPath();
      ctx.moveTo(12 + barrelOffset, 0);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.level === 2) {
      // Level 2: Twin Barrels
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -12);
      ctx.lineTo(-10, 12);
      ctx.closePath();
      ctx.fill();
      
      // Barrels
      ctx.lineWidth = 4;
      ctx.strokeStyle = this.config.color;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(18 + barrelOffset, -8);
      ctx.moveTo(0, 8);
      ctx.lineTo(18 + barrelOffset, 8);
      ctx.stroke();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.level === 3) {
      // Level 3: Heavy Chassis + Triple Barrel
      // Chassis
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-12, -16);
      ctx.lineTo(-12, 16);
      ctx.closePath();
      ctx.fill();
      
      // Barrels (Triple)
      ctx.lineWidth = 5;
      ctx.strokeStyle = this.config.color;
      ctx.beginPath();
      ctx.moveTo(-5, -12);
      ctx.lineTo(18 + barrelOffset, -12);
      ctx.moveTo(-5, 12);
      ctx.lineTo(18 + barrelOffset, 12);
      ctx.moveTo(5, 0);
      ctx.lineTo(20 + barrelOffset, 0);
      ctx.stroke();
      
      // Core
      const pulse = Math.sin(currentTime / 200) * 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 6 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      
      // Detail lines
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const tipOffset = this.level === 1 ? 12 : this.level === 2 ? 18 : 20;

    // Continuous Beam
    if (this.config.isContinuous && this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      ctx.beginPath();
      ctx.moveTo(tipOffset, 0);
      ctx.lineTo(dist, 0);
      ctx.strokeStyle = this.config.color;
      ctx.lineWidth = 3 + (this.level - 1) * 2;
      ctx.shadowBlur = 15;
      ctx.stroke();
      
      // Beam core
      ctx.beginPath();
      ctx.moveTo(tipOffset, 0);
      ctx.lineTo(dist, 0);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1 + (this.level - 1);
      ctx.stroke();
    }

    // Muzzle Flash and Attack Visuals
    if (!this.config.isContinuous && currentTime - this.lastShot < 150) {
      const progress = (currentTime - this.lastShot) / 150;
      
      // Muzzle Flash
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tipOffset, 0);
      ctx.lineTo(tipOffset + 10, -5);
      ctx.lineTo(tipOffset + 10, 5);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();

      // Attack Visuals based on type
      if (this.lastTargetPos) {
        const tx = this.lastTargetPos.x - this.x;
        const ty = this.lastTargetPos.y - this.y;
        
        ctx.restore(); // Exit local turret space
        ctx.save(); // Re-save for global space effects
        
        const dist = Math.sqrt(tx * tx + ty * ty);
        const angle = Math.atan2(ty, tx);

        switch (this.config.type) {
          case TurretType.BASIC:
          case TurretType.GATLING:
            // Fast tracer
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(angle) * tipOffset, this.y + Math.sin(angle) * tipOffset);
            ctx.lineTo(this.x + Math.cos(angle) * (tipOffset + dist * progress), this.y + Math.sin(angle) * (tipOffset + dist * progress));
            ctx.strokeStyle = this.config.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;

          case TurretType.SNIPER:
            // Long thin beam
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(angle) * tipOffset, this.y + Math.sin(angle) * tipOffset);
            ctx.lineTo(this.lastTargetPos.x, this.lastTargetPos.y);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1 - progress;
            ctx.stroke();
            ctx.strokeStyle = this.config.color;
            ctx.lineWidth = 3;
            ctx.stroke();
            break;

          case TurretType.TESLA:
            // Lightning bolt
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(angle) * tipOffset, this.y + Math.sin(angle) * tipOffset);
            let curX = this.x + Math.cos(angle) * tipOffset;
            let curY = this.y + Math.sin(angle) * tipOffset;
            const segments = 5;
            for (let i = 1; i <= segments; i++) {
              const targetX = this.x + Math.cos(angle) * (tipOffset + (dist * i / segments));
              const targetY = this.y + Math.sin(angle) * (tipOffset + (dist * i / segments));
              curX = targetX + (Math.random() - 0.5) * 20;
              curY = targetY + (Math.random() - 0.5) * 20;
              ctx.lineTo(curX, curY);
            }
            ctx.lineTo(this.lastTargetPos.x, this.lastTargetPos.y);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.config.color;
            ctx.stroke();
            break;

          case TurretType.MORTAR:
          case TurretType.PLASMA:
          case TurretType.MISSILE:
            // Projectile / Impact
            const radius = progress * 40;
            ctx.beginPath();
            ctx.arc(this.lastTargetPos.x, this.lastTargetPos.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.config.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 1 - progress;
            ctx.stroke();
            ctx.fillStyle = `${this.config.color}33`;
            ctx.fill();
            break;

          case TurretType.SONIC:
          case TurretType.SHOCK:
          case TurretType.GRAVITY:
            // Expanding rings
            for (let i = 0; i < 3; i++) {
              const r = ((progress + i/3) % 1) * 60;
              ctx.beginPath();
              ctx.arc(this.lastTargetPos.x, this.lastTargetPos.y, r, 0, Math.PI * 2);
              ctx.strokeStyle = this.config.color;
              ctx.lineWidth = 2;
              ctx.globalAlpha = 1 - ((progress + i/3) % 1);
              ctx.stroke();
            }
            break;

          case TurretType.FLAME:
            // Flame cone
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(angle) * tipOffset, this.y + Math.sin(angle) * tipOffset);
            const coneAngle = 0.4;
            ctx.lineTo(this.x + Math.cos(angle - coneAngle) * dist * progress, this.y + Math.sin(angle - coneAngle) * dist * progress);
            ctx.lineTo(this.x + Math.cos(angle + coneAngle) * dist * progress, this.y + Math.sin(angle + coneAngle) * dist * progress);
            ctx.closePath();
            ctx.fillStyle = `rgba(248, 113, 113, ${0.5 * (1 - progress)})`;
            ctx.fill();
            break;

          case TurretType.ORBITAL:
            // Massive vertical beam
            ctx.beginPath();
            ctx.moveTo(this.lastTargetPos.x, 0);
            ctx.lineTo(this.lastTargetPos.x, ctx.canvas.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 20 * (1 - progress);
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.config.color;
            ctx.stroke();
            break;

          case TurretType.VOID:
            // Dark implosion
            ctx.beginPath();
            ctx.arc(this.lastTargetPos.x, this.lastTargetPos.y, (1 - progress) * 50, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#fff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.lastTargetPos.x, this.lastTargetPos.y, (1 - progress) * 30, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            break;

          case TurretType.FROST:
            // Frosty blast
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(angle) * tipOffset, this.y + Math.sin(angle) * tipOffset);
            ctx.lineTo(this.lastTargetPos.x, this.lastTargetPos.y);
            ctx.strokeStyle = this.config.color;
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -currentTime / 10;
            ctx.stroke();
            break;
        }
        
        ctx.restore();
        ctx.save(); // Re-enter local space for the final restore in the original code
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
      }
    }

    ctx.restore();
  }
}

// --- Helper Components ---

interface TechNodeProps {
  type: TurretType;
  unlockedTurrets: Set<TurretType>;
  unlockedUpgrades: Set<TurretType>;
  gold: number;
  onUnlock: (type: TurretType) => void;
  x: number;
  y: number;
}

const TechNode: React.FC<TechNodeProps> = ({ type, unlockedTurrets, unlockedUpgrades, gold, onUnlock, x, y }) => {
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
        {config.icon}
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

// --- Main Component ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.START);
  const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
  const [unlockedSectorCount, setUnlockedSectorCount] = useState(1);
  const [isSectorComplete, setIsSectorComplete] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [gold, setGold] = useState(100);
  const [lives, setLives] = useState(10);
  const [wave, setWave] = useState(0);
  const isWaveActiveRef = useRef(false);
  const [isWaveActive, _setIsWaveActive] = useState(false);
  const setIsWaveActive = (val: boolean) => {
    isWaveActiveRef.current = val;
    _setIsWaveActive(val);
  };
  const [selectedTurretType, setSelectedTurretType] = useState<TurretType | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedLibraryUnit, setSelectedLibraryUnit] = useState<TurretType | EnemyType | null>(null);
  const [libraryUnitType, setLibraryUnitType] = useState<'turret' | 'enemy' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [highestEndlessWaves, setHighestEndlessWaves] = useState<Record<string, number>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMapSelect, setShowMapSelect] = useState(false);
  const [isSandboxEntry, setIsSandboxEntry] = useState(false);
  const [isSandboxMenuCollapsed, setIsSandboxMenuCollapsed] = useState(false);
  const [selectedEndlessMap, setSelectedEndlessMap] = useState<MapConfig | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [rating, setRating] = useState(10);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('gameTheme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('gameTheme', theme);
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [encounteredEnemies, setEncounteredEnemies] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('encounteredEnemies');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [boughtTurrets, setBoughtTurrets] = useState<Set<TurretType>>(() => {
    const saved = localStorage.getItem('boughtTurrets');
    return saved ? new Set(JSON.parse(saved)) : new Set([TurretType.BASIC]);
  });
  const [currentMapConfig, setCurrentMapConfig] = useState<MapConfig>(DEFAULT_MAP);

  const [isLandscape, setIsLandscape] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const CANVAS_WIDTH = currentMapConfig.cols * GRID_SIZE;
  const CANVAS_HEIGHT = currentMapConfig.rows * GRID_SIZE;
  const COLS = currentMapConfig.cols;
  const ROWS = currentMapConfig.rows;
  const PATH_POINTS = currentMapConfig.path;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const [totalWavesSurvived, setTotalWavesSurvived] = useState(0);
  const [totalSessionsSaved, setTotalSessionsSaved] = useState(0);
  const [commanderExp, setCommanderExp] = useState(0);
  const [medals, setMedals] = useState<string[]>([]);
  const [showCommanderProfile, setShowCommanderProfile] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState<any | null>(null);

  const getCommanderLevel = (exp: number) => Math.floor(Math.sqrt(exp / 100)) + 1;
  const getExpToNextLevel = (level: number) => Math.pow(level, 2) * 100;

  // Sync progress from Firestore on login
  useEffect(() => {
    if (user) {
      const path = `users/${user.uid}/progress/current`;
      const progressDoc = doc(db, path);
      const unsubscribe = onSnapshot(progressDoc, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUnlockedSectorCount(data.unlockedSectorCount || 1);
          setHighestEndlessWaves(data.highestEndlessWaves || {});
          setEndlessSessions(data.endlessSessions || {});
          setTotalWavesSurvived(data.totalWavesSurvived || 0);
          setTotalSessionsSaved(data.totalSessionsSaved || 0);
          setCommanderExp(data.commanderExp || 0);
          setMedals(data.medals || []);
          
          if (data.encounteredEnemies) {
            setEncounteredEnemies(new Set(data.encounteredEnemies));
          }
          if (data.unlockedTurrets) {
            setUnlockedTurrets(new Set(data.unlockedTurrets as TurretType[]));
          }
          if (data.unlockedUpgrades) {
            setUnlockedUpgrades(new Set(data.unlockedUpgrades as TurretType[]));
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const [librarySessions, setLibrarySessions] = useState<any[]>([]);
  const [showEndlessLibrary, setShowEndlessLibrary] = useState(false);

  useEffect(() => {
    if (isAuthReady && user) {
      const path = 'endless_sessions';
      const q = query(collection(db, path), orderBy('lastUpdated', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLibrarySessions(sessions);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
      return () => unsubscribe();
    } else if (isAuthReady && !user) {
      setLibrarySessions([]);
    }
  }, [isAuthReady, user]);

  const loadSession = (session: any) => {
    setGameMode(GameMode.ENDLESS);
    setDifficulty(session.difficulty);
    setWave(session.wave);
    setGold(session.gold);
    setLives(session.lives);
    
    // Find map config
    const mapConfig = CAMPAIGN_SECTORS.find(s => s.mapConfig.id === session.mapId)?.mapConfig || DEFAULT_MAP;
    setCurrentMapConfig(mapConfig);
    
    // Reconstruct turrets
    const newTurrets = session.turrets.map((t: any) => {
      const turret = new Turret(t.gridX, t.gridY, t.type);
      turret.level = t.level;
      return turret;
    });
    turretsRef.current = newTurrets;
    
    // Inventory and tech
    setInventory(session.inventory || EMPTY_INVENTORY);
    setUnlockedTurrets(new Set(session.unlockedTurrets || [TurretType.BASIC]));
    setUnlockedUpgrades(new Set(session.unlockedUpgrades || []));
    
    setShowEndlessLibrary(false);
    setShowMapSelect(false);
    setShowDifficultySelect(false);
    setGameOver(false);
    setIsWaveActive(false);
    enemiesRef.current = [];
    SoundManager.playBuy();
  };

  // Save progress to Firestore
  const [endlessSessions, setEndlessSessions] = useState<Record<string, any>>({});

  const saveProgress = async (
    newSectorCount?: number, 
    newWave?: number, 
    newEncountered?: string[], 
    newUnlockedTurrets?: string[], 
    newUnlockedUpgrades?: string[], 
    newEndlessSession?: any, 
    targetMapId?: string,
    expGain?: number,
    sessionSaved?: boolean,
    currentGold?: number,
    currentLives?: number,
    campaignComplete?: boolean
  ) => {
    if (!user) return;
    setIsSyncing(true);
    const mapId = targetMapId || currentMapConfig.id;
    const path = `users/${user.uid}/progress/current`;
    try {
      const progressDoc = doc(db, path);
      
      const updatedWaves = { ...highestEndlessWaves };
      if (newWave !== undefined && mapId) {
        const currentMax = updatedWaves[mapId] || 0;
        if (newWave > currentMax) {
          updatedWaves[mapId] = newWave;
          setHighestEndlessWaves(updatedWaves);
        }
      }

      const updatedSessions = { ...endlessSessions };
      if (newEndlessSession && mapId) {
        updatedSessions[mapId] = newEndlessSession;
        setEndlessSessions(updatedSessions);

        // Sync to global library if in endless mode
        if (gameMode === GameMode.ENDLESS) {
          const libraryPath = `endless_sessions/${user.uid}_${mapId}`;
          await setDoc(doc(db, libraryPath), {
            ...newEndlessSession,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            commanderLevel: getCommanderLevel(commanderExp),
            mapId: mapId,
            lastUpdated: new Date().toISOString()
          });
        }
      } else if (newEndlessSession === null && mapId) {
        delete updatedSessions[mapId];
        setEndlessSessions(updatedSessions);

        // Remove from global library
        const libraryPath = `endless_sessions/${user.uid}_${mapId}`;
        await deleteDoc(doc(db, libraryPath));
      }

      const newExp = commanderExp + (expGain || 0);
      const newTotalSaved = totalSessionsSaved + (sessionSaved ? 1 : 0);
      
      // Check for achievements (medals)
      const newMedals = [...medals];
      const newlyEarned: string[] = [];

      const checkAchievement = (id: string, condition: boolean) => {
        if (condition && !newMedals.includes(id)) {
          newMedals.push(id);
          newlyEarned.push(id);
        }
      };

      checkAchievement('first_contact', !!((newWave && newWave >= 1) || (newSectorCount && newSectorCount >= 1)));
      checkAchievement('archivist', newTotalSaved >= 10);
      checkAchievement('centurion', !!(newWave && newWave >= 100));
      checkAchievement('grid_master', !!(newSectorCount && newSectorCount >= 11));
      checkAchievement('campaign_hero', !!campaignComplete);
      checkAchievement('endless_survivor', !!(newWave && newWave >= 50));
      checkAchievement('tech_specialist', !!(newUnlockedTurrets && newUnlockedTurrets.length === Object.keys(TURRET_CONFIGS).length));
      checkAchievement('rich_commander', !!(currentGold && currentGold >= 5000));
      checkAchievement('close_call', currentLives === 1);

      if (newlyEarned.length > 0) {
        setMedals(newMedals);
        const lastEarned = newlyEarned[newlyEarned.length - 1];
        const achievement = ACHIEVEMENTS.find(a => a.id === lastEarned);
        if (achievement) {
          setAchievementNotification(achievement);
          setTimeout(() => setAchievementNotification(null), 5000);
          SoundManager.playVictory();
        }
      }

      await setDoc(progressDoc, {
        unlockedSectorCount: newSectorCount ?? unlockedSectorCount,
        highestEndlessWaves: updatedWaves,
        endlessSessions: updatedSessions,
        encounteredEnemies: newEncountered ?? Array.from(encounteredEnemies),
        unlockedTurrets: newUnlockedTurrets ?? Array.from(unlockedTurrets),
        unlockedUpgrades: newUnlockedUpgrades ?? Array.from(unlockedUpgrades),
        totalWavesSurvived: totalWavesSurvived + (expGain ? 1 : 0),
        totalSessionsSaved: newTotalSaved,
        commanderExp: newExp,
        medals: newMedals,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Reset local progress on sign out
      setUnlockedSectorCount(1);
      setHighestEndlessWaves({});
      setUnlockedTurrets(new Set([TurretType.BASIC]));
      setUnlockedUpgrades(new Set());
      setEncounteredEnemies(new Set());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('encounteredEnemies', JSON.stringify(Array.from(encounteredEnemies)));
  }, [encounteredEnemies]);

  useEffect(() => {
    localStorage.setItem('boughtTurrets', JSON.stringify(Array.from(boughtTurrets)));
  }, [boughtTurrets]);

  const handleToggleMute = () => {
    SoundManager.toggleMute();
    setIsMuted(SoundManager.isMuted);
  };

  const submitFeedback = async () => {
    if (isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    const path = 'feedback';
    try {
      await addDoc(collection(db, path), {
        rating,
        message: feedbackMessage,
        timestamp: new Date().toISOString()
      });
      setFeedbackMessage('');
      setShowSettings(false);
      SoundManager.playBuy();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const fetchFeedback = async () => {
    const path = 'feedback';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbackList(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  };

  const handleAdminAuth = () => {
    if (adminCode === '2011' || user?.email === 'kristianai2011@gmail.com') {
      setIsAdminAuthenticated(true);
      fetchFeedback();
    } else {
      alert('Invalid access code.');
    }
  };
  const [gameOver, setGameOver] = useState(false);
  const [confirmingTech, setConfirmingTech] = useState<TurretType | null>(null);
  const [currentLore, setCurrentLore] = useState<string | null>(null);
  const [isAutoStart, setIsAutoStart] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTechTreeOpen, setIsTechTreeOpen] = useState(false);
  const [confirmingPurchase, setConfirmingPurchase] = useState<TurretType | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const techTreeContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingTechTree, setIsDraggingTechTree] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  useEffect(() => {
    if (isTechTreeOpen && techTreeContainerRef.current) {
      const container = techTreeContainerRef.current;
      // Center the BASIC node which is at 600, 400 relative to the 2500x1000 container
      container.scrollLeft = 600 - container.clientWidth / 2;
      container.scrollTop = 400 - container.clientHeight / 2;
    }
  }, [isTechTreeOpen]);

  const handleTechTreeMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!techTreeContainerRef.current) return;
    setIsDraggingTechTree(true);
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    setDragStartX(pageX - techTreeContainerRef.current.offsetLeft);
    setDragScrollLeft(techTreeContainerRef.current.scrollLeft);
  };

  const handleTechTreeMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingTechTree || !techTreeContainerRef.current) return;
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const x = pageX - techTreeContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    techTreeContainerRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const handleTechTreeMouseUp = () => {
    setIsDraggingTechTree(false);
  };
  
  // New State for Tech Tree and Inventory
  const [unlockedTurrets, setUnlockedTurrets] = useState<Set<TurretType>>(new Set([TurretType.BASIC]));
  const [unlockedUpgrades, setUnlockedUpgrades] = useState<Set<TurretType>>(new Set());
  const [inventory, setInventory] = useState<Record<TurretType, number>>(EMPTY_INVENTORY);
  const [activeTab, setActiveTab] = useState<'armory' | 'inventory'>('armory');
  const [isRetractMode, setIsRetractMode] = useState(false);
  const [selectedMapTurret, setSelectedMapTurret] = useState<Turret | null>(null);
  const [confirmingUpgradeTech, setConfirmingUpgradeTech] = useState<TurretType | null>(null);
  
  // Tutorial Auto-advance
  useEffect(() => {
    if (gameMode === GameMode.TUTORIAL && showTutorial) {
      if (tutorialStep === 1 && isTechTreeOpen) {
        setTutorialStep(2);
      }
      if (tutorialStep === 2 && activeTab === 'armory') {
        setTutorialStep(3);
      }
      if (tutorialStep === 3 && Object.values(inventory).some(count => (count as number) > 0)) {
        setTutorialStep(4);
      }
      if (tutorialStep === 4 && activeTab === 'inventory' && Object.values(inventory).every(count => (count as number) === 0) && boughtTurrets.size > 0) {
        setTutorialStep(5);
      }
      if (tutorialStep === 5 && isWaveActive) {
        setShowTutorial(false);
      }
    }
  }, [gameMode, showTutorial, tutorialStep, isTechTreeOpen, activeTab, inventory, isWaveActive, boughtTurrets]);

  // Game State Refs (for the loop)
  const enemiesRef = useRef<Enemy[]>([]);
  const turretsRef = useRef<Turret[]>([]);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const waveSpawnTimerRef = useRef<number>(0);
  const enemiesToSpawnRef = useRef<number>(0);
  const mousePosRef = useRef<Point | null>(null);

  const startWave = useCallback(() => {
    if (isWaveActive || gameOver || !difficulty) return;
    
    SoundManager.playWaveStart();
    const nextWave = gameMode === GameMode.SANDBOX ? wave : wave + 1;
    if (gameMode !== GameMode.SANDBOX) setWave(nextWave);
    
    if (gameMode === GameMode.ENDLESS && currentMapConfig.id) {
      setHighestEndlessWaves(prev => ({
        ...prev,
        [currentMapConfig.id]: Math.max(prev[currentMapConfig.id] || 0, nextWave)
      }));
    }
    setIsWaveActive(true);
    enemiesToSpawnRef.current = 5 + nextWave * 2;
    waveSpawnTimerRef.current = 0;
  }, [isWaveActive, gameOver, difficulty, wave]);

  const isPausedRef = useRef(isPaused);
  const gameOverRef = useRef(gameOver);
  const waveRef = useRef(wave);
  const difficultyRef = useRef(difficulty);
  const gameModeRef = useRef(gameMode);
  const currentSectorIndexRef = useRef(currentSectorIndex);
  const unlockedSectorCountRef = useRef(unlockedSectorCount);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { waveRef.current = wave; }, [wave]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { currentSectorIndexRef.current = currentSectorIndex; }, [currentSectorIndex]);
  useEffect(() => { unlockedSectorCountRef.current = unlockedSectorCount; }, [unlockedSectorCount]);

  const goldRef = useRef(gold);
  const livesRef = useRef(lives);
  const inventoryRef = useRef(inventory);
  const unlockedTurretsRef = useRef(unlockedTurrets);
  const unlockedUpgradesRef = useRef(unlockedUpgrades);

  useEffect(() => { goldRef.current = gold; }, [gold]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { unlockedTurretsRef.current = unlockedTurrets; }, [unlockedTurrets]);
  useEffect(() => { unlockedUpgradesRef.current = unlockedUpgrades; }, [unlockedUpgrades]);

  const sellTurret = (turret: Turret) => {
    const sellValue = Math.floor(turret.config.cost * 0.75);
    setGold(prev => prev + sellValue);
    turretsRef.current = turretsRef.current.filter(t => t.id !== turret.id);
    setSelectedMapTurret(null);
    SoundManager.playBuy(); // Reuse buy sound for selling
  };

  const updateLogic = useCallback((deltaTime: number) => {
    const isPaused = isPausedRef.current;
    const gameOver = gameOverRef.current;
    if (isPaused || gameOver) return;
    const time = performance.now();
    const difficulty = difficultyRef.current;
    const wave = waveRef.current;
    const gameMode = gameModeRef.current;
    const currentSectorIndex = currentSectorIndexRef.current;
    const unlockedSectorCount = unlockedSectorCountRef.current;
    
    // Spawn Enemies
    if (isWaveActive && enemiesToSpawnRef.current > 0 && difficulty) {
      waveSpawnTimerRef.current += deltaTime;
      if (waveSpawnTimerRef.current > 1000) { // 1 second between spawns
        const config = DIFFICULTY_CONFIGS[difficulty];
        const hp = (10 + wave * 5) * Math.pow(1.1, wave) * config.scaling;
        const speed = (1 + wave * 0.02) * Math.pow(1.05, wave * 0.5) * config.scaling;
        
        let type = EnemyType.SQUARE;
        if (gameMode === GameMode.ENDLESS || gameMode === GameMode.SANDBOX) {
          if (wave % 10 === 0 && enemiesToSpawnRef.current === 1) {
            type = EnemyType.STAR;
          } else if (wave >= 3) {
            const rand = Math.random();
            if (wave >= 8 && rand < 0.2) type = EnemyType.CIRCLE;
            else if (wave >= 5 && rand < 0.4) type = EnemyType.HEXAGON;
          }
        } else if (gameMode === GameMode.CAMPAIGN) {
          const currentSector = CAMPAIGN_SECTORS[currentSectorIndex];
          if (currentSectorIndex === 10 && wave === currentSector.wavesToWin && enemiesToSpawnRef.current === 1) {
            type = EnemyType.STAR;
          } else if (wave >= 3) {
            const rand = Math.random();
            if (wave >= 8 && rand < 0.2) type = EnemyType.CIRCLE;
            else if (wave >= 5 && rand < 0.4) type = EnemyType.HEXAGON;
          }
        }
        
        const newEnemy = new Enemy(hp, speed, type, PATH_POINTS);
        enemiesRef.current.push(newEnemy);
        enemiesToSpawnRef.current--;
        waveSpawnTimerRef.current = 0;

        // Check encountered status only on spawn
        if (!encounteredEnemies.has(type)) {
          setEncounteredEnemies(prev => {
            const next = new Set(prev);
            next.add(type);
            if (user) saveProgress(unlockedSectorCount, undefined, Array.from(next) as string[], undefined, undefined, undefined, undefined, undefined, undefined, goldRef.current, livesRef.current);
            return next;
          });
          
          if (type === EnemyType.STAR) {
            setCurrentLore(ENEMY_CONFIGS[EnemyType.STAR].report.data);
            SoundManager.playWaveStart();
          }
        }
      }
    }

    // Update Enemies
    let goldEarned = 0;
    let livesLost = 0;
    let isGameOverTriggered = false;

    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const enemy = enemiesRef.current[i];
      enemy.update(deltaTime);
      if (enemy.isLeaked) {
        livesLost++;
        SoundManager.playThud();
        enemiesRef.current.splice(i, 1);
      } else if (enemy.isDead) {
        goldEarned += 15;
        SoundManager.playDeath();
        enemiesRef.current.splice(i, 1);
      }
    }

    if (goldEarned > 0) setGold(prev => prev + goldEarned);
    if (livesLost > 0) {
      setLives(prev => {
        const next = prev - livesLost;
        if (next <= 0) isGameOverTriggered = true;
        return next;
      });
    }
    if (isGameOverTriggered) {
      setGameOver(true);
      if (user && gameMode === GameMode.ENDLESS) {
        saveProgress(undefined, undefined, undefined, undefined, undefined, null, undefined, undefined, undefined, goldRef.current, livesRef.current);
      }
    }

    // Update Turrets
    turretsRef.current.forEach(turret => {
      turret.update(enemiesRef.current, time);
    });

    // Check Wave Completion
    if (isWaveActiveRef.current && enemiesToSpawnRef.current === 0 && enemiesRef.current.length === 0) {
      setIsWaveActive(false);
      
      if (gameMode === GameMode.ENDLESS) {
        const nextWave = wave + 1;
        if (LORE_MESSAGES[nextWave]) {
          setCurrentLore(LORE_MESSAGES[nextWave]);
        }
      }
      
      if (gameMode === GameMode.CAMPAIGN) {
        const sector = CAMPAIGN_SECTORS[currentSectorIndex];
        if (wave >= sector.wavesToWin) {
          setIsSectorComplete(true);
          SoundManager.playVictory();
          setUnlockedSectorCount(prev => {
            const isLastSector = currentSectorIndex === 10;
            const nextCount = (currentSectorIndex + 1 === prev && prev < 11) ? prev + 1 : prev;
            if (user) saveProgress(nextCount, wave, undefined, undefined, undefined, undefined, undefined, undefined, undefined, goldRef.current, livesRef.current, isLastSector);
            return nextCount;
          });
        } else {
          // Save progress on wave completion in campaign too
          if (user) saveProgress(undefined, wave, undefined, undefined, undefined, undefined, undefined, undefined, undefined, goldRef.current, livesRef.current);
        }
      } else if (gameMode === GameMode.ENDLESS) {
        if (user) {
          const session = {
            wave: wave,
            gold: goldRef.current,
            lives: livesRef.current,
            turrets: turretsRef.current.map(t => ({
              gridX: Math.floor(t.x / GRID_SIZE),
              gridY: Math.floor(t.y / GRID_SIZE),
              type: t.config.type,
              level: t.level
            })),
            inventory: inventoryRef.current,
            unlockedTurrets: Array.from(unlockedTurretsRef.current),
            unlockedUpgrades: Array.from(unlockedUpgradesRef.current),
            difficulty: difficulty
          };
          saveProgress(unlockedSectorCount, wave, undefined, undefined, undefined, session, undefined, 10, true, goldRef.current, livesRef.current);
        }
      }
    }
  }, [isWaveActive, encounteredEnemies, user, PATH_POINTS]);

  // Auto-Start Effect for reliability
  useEffect(() => {
    if (isAutoStart && !isWaveActive && wave > 0 && !gameOver && difficulty) {
      const timer = setTimeout(() => {
        startWave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAutoStart, isWaveActive, wave, gameOver, difficulty, startWave]);

  useEffect(() => {
    SoundManager.playBGM();
  }, []);

  const selectedTurretTypeRef = useRef(selectedTurretType);
  const selectedMapTurretRef = useRef(selectedMapTurret);

  useEffect(() => { selectedTurretTypeRef.current = selectedTurretType; }, [selectedTurretType]);
  useEffect(() => { selectedMapTurretRef.current = selectedMapTurret; }, [selectedMapTurret]);

  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!gridCanvasRef.current) {
      gridCanvasRef.current = document.createElement('canvas');
    }
    const canvas = gridCanvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Theme-aware colors
    const gridColor = theme === 'dark' ? '#1a1a1a' : '#e2e8f0';
    const pathColor = theme === 'dark' ? '#222' : '#f1f5f9';
    const glowColor = theme === 'dark' ? '#333' : '#cbd5e1';

    // Draw Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw Path
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = GRID_SIZE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    PATH_POINTS.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x * GRID_SIZE + GRID_SIZE/2, p.y * GRID_SIZE + GRID_SIZE/2);
      else ctx.lineTo(p.x * GRID_SIZE + GRID_SIZE/2, p.y * GRID_SIZE + GRID_SIZE/2);
    });
    ctx.stroke();
    
    // Path Glow
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, COLS, ROWS, PATH_POINTS, theme]);

  const draw = useCallback(() => {
    if (document.hidden) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const time = performance.now();
    const selectedTurretType = selectedTurretTypeRef.current;
    const selectedMapTurret = selectedMapTurretRef.current;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Pre-rendered Grid & Path
    if (gridCanvasRef.current) {
      ctx.drawImage(gridCanvasRef.current, 0, 0);
    }

    // Draw Enemies
    enemiesRef.current.forEach(enemy => {
      enemy.draw(ctx);
    });

    // Draw Turrets
    turretsRef.current.forEach(turret => {
      const isSelected = selectedMapTurret?.id === turret.id;
      turret.draw(ctx, time, isSelected);
    });

    // Draw Placement Preview
    const currentMouseGrid = mousePosRef.current;
    if (selectedTurretType && currentMouseGrid) {
      const config = TURRET_CONFIGS[selectedTurretType];
      const px = currentMouseGrid.x * GRID_SIZE + GRID_SIZE / 2;
      const py = currentMouseGrid.y * GRID_SIZE + GRID_SIZE / 2;

      // Draw Range Preview
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, config.range * GRID_SIZE, 0, Math.PI * 2);
      ctx.strokeStyle = `${config.color}44`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `${config.color}11`;
      ctx.fill();
      ctx.restore();

      // Validation
      const isOnPath = PATH_POINTS.some((p, i) => {
        if (i === PATH_POINTS.length - 1) return false;
        const next = PATH_POINTS[i + 1];
        const minX = Math.min(p.x, next.x);
        const maxX = Math.max(p.x, next.x);
        const minY = Math.min(p.y, next.y);
        const maxY = Math.max(p.y, next.y);
        return currentMouseGrid.x >= minX && currentMouseGrid.x <= maxX && currentMouseGrid.y >= minY && currentMouseGrid.y <= maxY;
      });
      const isOccupied = turretsRef.current.some(t => 
        Math.floor(t.x / GRID_SIZE) === currentMouseGrid.x && Math.floor(t.y / GRID_SIZE) === currentMouseGrid.y
      );
      const isValid = !isOnPath && !isOccupied;
      const previewColor = isValid ? config.color : '#ef4444';

      // Range Circle (Dashed)
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.arc(px, py, config.range * GRID_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = `${previewColor}11`;
      ctx.fill();
      ctx.strokeStyle = `${previewColor}88`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Ghost Turret (30% Opacity)
      ctx.save();
      ctx.translate(px, py);
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = previewColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = previewColor;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -10);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, PATH_POINTS]);

  // Initialize Game
  useEffect(() => {
    SoundManager.playBGM();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
      
      if (x >= 0 && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT) {
        mousePosRef.current = {
          x: Math.floor(x / GRID_SIZE),
          y: Math.floor(y / GRID_SIZE)
        };
      } else {
        mousePosRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    // Game Loop using setInterval for background execution
    const TICK_RATE = 16.67; // ~60fps
    const intervalId = setInterval(() => {
      const now = performance.now();
      const deltaTime = lastTimeRef.current ? now - lastTimeRef.current : TICK_RATE;
      lastTimeRef.current = now;
      
      // Process logic in steps if delta is large (background throttling)
      let remainingDelta = Math.min(deltaTime, 2000); // Cap at 2s to prevent spiral of death
      const step = 16.67;
      while (remainingDelta > 0) {
        const currentStep = Math.min(remainingDelta, step);
        updateLogic(currentStep);
        remainingDelta -= currentStep;
        if (remainingDelta < 1) break;
      }
    }, TICK_RATE);

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [updateLogic, draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !difficulty) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);

    // Check if clicking on a turret
    const existingTurretIndex = turretsRef.current.findIndex(t => 
      Math.floor(t.x / GRID_SIZE) === gridX && Math.floor(t.y / GRID_SIZE) === gridY
    );

    if (existingTurretIndex !== -1) {
      const turret = turretsRef.current[existingTurretIndex];
      if (isRetractMode) {
        const retractCost = 5;
        if (gold >= retractCost) {
          setGold(prev => prev - retractCost);
          setInventory(prev => ({
            ...prev,
            [turret.config.type]: prev[turret.config.type] + 1
          }));
          turretsRef.current.splice(existingTurretIndex, 1);
          SoundManager.playDelete();
          if (selectedMapTurret === turret) setSelectedMapTurret(null);
        }
      } else {
        setSelectedMapTurret(turret);
        setSelectedTurretType(null);
      }
      return;
    }

    // If clicking empty space, deselect
    setSelectedMapTurret(null);

    if (!selectedTurretType) return;

    // Check if on path
    const isOnPath = PATH_POINTS.some((p, i) => {
      if (i === PATH_POINTS.length - 1) return false;
      const next = PATH_POINTS[i + 1];
      const minX = Math.min(p.x, next.x);
      const maxX = Math.max(p.x, next.x);
      const minY = Math.min(p.y, next.y);
      const maxY = Math.max(p.y, next.y);
      return gridX >= minX && gridX <= maxX && gridY >= minY && gridY <= maxY;
    });

    // Check if already occupied
    const isOccupied = existingTurretIndex !== -1;

    if (!isOnPath && !isOccupied && inventory[selectedTurretType] > 0) {
      const newTurret = new Turret(gridX, gridY, selectedTurretType);
      turretsRef.current.push(newTurret);
      SoundManager.playPlace();
      setInventory(prev => ({
        ...prev,
        [selectedTurretType]: prev[selectedTurretType] - 1
      }));
      if (inventory[selectedTurretType] <= 1) {
        setSelectedTurretType(null);
      }
    }
  };

  const buyTurret = (type: TurretType, quantity: number = 1) => {
    const config = TURRET_CONFIGS[type];
    const totalCost = config.cost * quantity;
    if (gold >= totalCost) {
      setGold(prev => prev - totalCost);
      setInventory(prev => ({
        ...prev,
        [type]: prev[type] + quantity
      }));
      setBoughtTurrets(prev => {
        const next = new Set(prev);
        next.add(type);
        return next;
      });
      setConfirmingPurchase(null);
      setPurchaseQuantity(1);
      SoundManager.playBuy();
    }
  };

  const unlockTurret = (type: TurretType) => {
    const config = TURRET_CONFIGS[type];
    const hasPrereqs = config.prerequisites.every(p => unlockedTurrets.has(p));
    if (gold >= config.unlockCost && !unlockedTurrets.has(type) && hasPrereqs) {
      setGold(prev => prev - config.unlockCost);
      const nextTurrets = new Set(unlockedTurrets);
      nextTurrets.add(type);
      setUnlockedTurrets(nextTurrets);
      
      setBoughtTurrets(prev => {
        const next = new Set(prev);
        next.add(type);
        return next;
      });
      SoundManager.playBuy();
      setConfirmingTech(null);
      if (user) saveProgress(undefined, undefined, undefined, Array.from(nextTurrets) as string[], undefined, undefined, undefined, undefined, undefined, goldRef.current, livesRef.current);
    }
  };

  const unlockUpgradeTech = (type: TurretType) => {
    const config = TURRET_CONFIGS[type];
    if (gold >= config.upgradeUnlockCost && unlockedTurrets.has(type) && !unlockedUpgrades.has(type)) {
      setGold(prev => prev - config.upgradeUnlockCost);
      const nextUpgrades = new Set(unlockedUpgrades);
      nextUpgrades.add(type);
      setUnlockedUpgrades(nextUpgrades);
      SoundManager.playBuy();
      setConfirmingUpgradeTech(null);
      if (user) saveProgress(undefined, undefined, undefined, undefined, Array.from(nextUpgrades) as string[], undefined, undefined, undefined, undefined, goldRef.current, livesRef.current);
    }
  };

  const upgradeTurretOnMap = (turret: Turret) => {
    const config = TURRET_CONFIGS[turret.config.type];
    if (gold >= config.upgradeCost && turret.level < turret.maxLevel) {
      setGold(prev => prev - config.upgradeCost);
      turret.level++;
      turret.lastUpgradeTime = performance.now();
      SoundManager.playBuy();
    }
  };

  const initiateUnlock = (type: TurretType) => {
    const config = TURRET_CONFIGS[type];
    if (unlockedTurrets.has(type)) {
      // If already unlocked, initiate upgrade research
      if (!unlockedUpgrades.has(type)) {
        setConfirmingUpgradeTech(type);
      }
      return;
    }
    const hasPrereqs = config.prerequisites.every(p => unlockedTurrets.has(p));
    if (hasPrereqs) {
      setConfirmingTech(type);
    }
  };

  const selectDifficulty = (diff: Difficulty) => {
    const config = DIFFICULTY_CONFIGS[diff];
    setCurrentMapConfig(selectedEndlessMap || DEFAULT_MAP);
    setDifficulty(diff);
    setGold(config.gold);
    setLives(config.lives);
    setGameMode(GameMode.ENDLESS);
    setWave(0);
    setGameOver(false);
    setIsWaveActive(false);
    setUnlockedTurrets(new Set([TurretType.BASIC]));
    setUnlockedUpgrades(new Set());
    setInventory({
      [TurretType.BASIC]: 0,
      [TurretType.SNIPER]: 0,
      [TurretType.FROST]: 0,
      [TurretType.GATLING]: 0,
      [TurretType.TESLA]: 0,
      [TurretType.MORTAR]: 0,
      [TurretType.SONIC]: 0,
      [TurretType.BEAM]: 0,
      [TurretType.MISSILE]: 0,
      [TurretType.VOID]: 0,
      [TurretType.FLAME]: 0,
      [TurretType.SHOCK]: 0,
      [TurretType.ORBITAL]: 0,
      [TurretType.GRAVITY]: 0,
      [TurretType.PLASMA]: 0,
    });
    enemiesRef.current = [];
    turretsRef.current = [];
    enemiesToSpawnRef.current = 0;
    setShowDifficultySelect(false);
    setCurrentLore(LORE_MESSAGES[0]);
  };

  const resumeEndlessSession = (mapId: string) => {
    const session = endlessSessions[mapId];
    if (!session) return;
    
    setDifficulty(session.difficulty);
    setGold(session.gold);
    setLives(session.lives);
    setWave(session.wave);
    setInventory(session.inventory);
    setUnlockedTurrets(new Set(session.unlockedTurrets));
    setUnlockedUpgrades(new Set(session.unlockedUpgrades));
    
    const newTurrets = session.turrets.map((t: any) => {
      const turret = new Turret(t.gridX, t.gridY, t.type);
      turret.level = t.level;
      return turret;
    });
    turretsRef.current = newTurrets;
    enemiesRef.current = [];
    
    const map = [DEFAULT_MAP, ...CAMPAIGN_SECTORS.map(s => s.mapConfig)].find(m => m.id === mapId);
    if (map) setCurrentMapConfig(map);
    
    setGameMode(GameMode.ENDLESS);
    setShowMapSelect(false);
    setShowDifficultySelect(false);
    SoundManager.playBuy();
    if (user && map) {
      saveProgress(undefined, undefined, undefined, undefined, undefined, null, map.id, undefined, undefined, goldRef.current, livesRef.current);
    }
  };

  const startCampaignSector = (index: number) => {
    const config = DIFFICULTY_CONFIGS[Difficulty.MEDIUM];
    const sector = CAMPAIGN_SECTORS[index];
    setCurrentMapConfig(sector.mapConfig);
    setDifficulty(Difficulty.MEDIUM);
    setGold(config.gold);
    setLives(config.lives);
    setCurrentSectorIndex(index);
    setGameMode(GameMode.CAMPAIGN);
    setWave(0);
    setGameOver(false);
    setIsSectorComplete(false);
    setIsWaveActive(false);
    setUnlockedTurrets(new Set([TurretType.BASIC]));
    setUnlockedUpgrades(new Set());
    setSelectedMapTurret(null);
    setInventory({
      [TurretType.BASIC]: 0,
      [TurretType.SNIPER]: 0,
      [TurretType.FROST]: 0,
      [TurretType.GATLING]: 0,
      [TurretType.TESLA]: 0,
      [TurretType.MORTAR]: 0,
      [TurretType.SONIC]: 0,
      [TurretType.BEAM]: 0,
      [TurretType.MISSILE]: 0,
      [TurretType.VOID]: 0,
      [TurretType.FLAME]: 0,
      [TurretType.SHOCK]: 0,
      [TurretType.ORBITAL]: 0,
      [TurretType.GRAVITY]: 0,
      [TurretType.PLASMA]: 0,
    });
    enemiesRef.current = [];
    turretsRef.current = [];
    enemiesToSpawnRef.current = 0;
    setCurrentLore(CAMPAIGN_LORE[index] || `Sector ${index + 1}: ${CAMPAIGN_SECTORS[index].name}. Objective: Survive ${CAMPAIGN_SECTORS[index].wavesToWin} waves.`);
    // Ensure we are in the game view
    setShowDifficultySelect(false);
  };

  const resetToStart = () => {
    setGameMode(GameMode.START);
    setDifficulty(null);
    setShowDifficultySelect(false);
    setShowMapSelect(false);
    setSelectedEndlessMap(null);
    setWave(0);
    setGameOver(false);
    setIsSectorComplete(false);
    setIsWaveActive(false);
    setGold(0);
    setLives(0);
    setUnlockedTurrets(new Set([TurretType.BASIC]));
    setUnlockedUpgrades(new Set());
    setInventory({
      [TurretType.BASIC]: 0,
      [TurretType.SNIPER]: 0,
      [TurretType.FROST]: 0,
      [TurretType.GATLING]: 0,
      [TurretType.TESLA]: 0,
      [TurretType.MORTAR]: 0,
      [TurretType.SONIC]: 0,
      [TurretType.BEAM]: 0,
      [TurretType.MISSILE]: 0,
      [TurretType.VOID]: 0,
      [TurretType.FLAME]: 0,
      [TurretType.SHOCK]: 0,
      [TurretType.ORBITAL]: 0,
      [TurretType.GRAVITY]: 0,
      [TurretType.PLASMA]: 0,
    });
    enemiesRef.current = [];
    turretsRef.current = [];
    enemiesToSpawnRef.current = 0;
  };

  const resetGame = () => {
    setGameOver(false);
    setIsWaveActive(false);
    enemiesRef.current = [];
    turretsRef.current = [];
    enemiesToSpawnRef.current = 0;

    if (gameMode === GameMode.CAMPAIGN) {
      startCampaignSector(currentSectorIndex);
    } else {
      setShowDifficultySelect(true);
      setDifficulty(null);
      setGold(100);
      setLives(10);
      setWave(0);
      setUnlockedTurrets(new Set([TurretType.BASIC]));
      setUnlockedUpgrades(new Set());
      setSelectedMapTurret(null);
      setInventory({
        [TurretType.BASIC]: 0,
        [TurretType.SNIPER]: 0,
        [TurretType.FROST]: 0,
        [TurretType.GATLING]: 0,
        [TurretType.TESLA]: 0,
        [TurretType.MORTAR]: 0,
        [TurretType.SONIC]: 0,
        [TurretType.BEAM]: 0,
        [TurretType.MISSILE]: 0,
        [TurretType.VOID]: 0,
        [TurretType.FLAME]: 0,
        [TurretType.SHOCK]: 0,
        [TurretType.ORBITAL]: 0,
        [TurretType.GRAVITY]: 0,
        [TurretType.PLASMA]: 0,
      });
      enemiesRef.current = [];
      turretsRef.current = [];
      enemiesToSpawnRef.current = 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
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

      {/* Header */}
      {gameMode !== GameMode.START && (
        <header className={`border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 transition-all ${isMobile && isLandscape ? 'p-2 px-4 h-14' : 'p-2 md:p-4'}`}>
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
            {gameMode !== GameMode.START && (
              <button
                onClick={resetToStart}
                className={`rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group relative ${isMobile && isLandscape ? 'p-1' : 'p-2 mr-2'}`}
                title="Exit to Menu"
              >
                <LogOut className={`${isMobile && isLandscape ? 'w-3 h-3' : 'w-5 h-5'}`} />
                <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-black text-[9px] uppercase tracking-widest text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Exit to Menu</span>
              </button>
            )}
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
      )}

      <main className={`flex h-[calc(100vh-56px)] md:h-[calc(100vh-73px)] overflow-hidden ${isMobile && isLandscape ? 'flex-row' : 'flex-col md:flex-row'}`}>
        {/* Sidebar / Shop */}
        {difficulty && (
          <aside className={`border-white/10 bg-black/30 flex shrink-0 transition-all ${isMobile && isLandscape ? 'w-64 border-r flex-col p-4 overflow-y-auto' : 'w-full md:w-80 border-b md:border-b-0 md:border-r p-3 md:p-4 flex-row md:flex-col overflow-x-auto md:overflow-y-auto'} gap-3 md:gap-4 custom-scrollbar`}>
            {/* Tabs */}
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
                            {config.icon}
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
                              {config.icon}
                            </div>
                            <div className="bg-cyan-500 text-black px-2 py-0.5 rounded text-[10px] md:text-xs font-bold font-mono">
                              x{count}
                            </div>
                          </div>
                          <h3 className="font-bold text-[10px] md:text-sm truncate text-white">{config.name}</h3>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (count > 0) {
                              setInventory(prev => ({ ...prev, [type]: prev[type] - 1 }));
                              setGold(prev => prev + Math.floor(config.cost * 0.5));
                              SoundManager.playDelete();
                            }
                          }}
                          className="w-full py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] group/sell"
                        >
                          <Trash2 className="w-2.5 h-2.5 group-hover/sell:scale-110 transition-transform" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Scrap ({Math.floor(config.cost * 0.5)}G)</span>
                        </button>
                      </div>
                    );
                  })}
                  {Object.values(inventory).every(c => c === 0) && (
                    <div className="hidden md:flex text-center py-8 border border-dashed border-white/10 rounded-xl items-center justify-center w-full">
                      <p className="text-[10px] uppercase tracking-widest text-white/20">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className={`shrink-0 flex flex-col gap-2 md:gap-3 ${isMobile && isLandscape ? 'mt-auto pt-2 border-t border-white/10' : 'md:mt-auto md:pt-4 md:border-t border-white/10'}`}>
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className={`w-full py-2.5 md:py-3 rounded-xl border transition-all flex items-center justify-center gap-2 md:gap-3 font-bold uppercase tracking-widest text-[9px] md:text-xs ${isPaused ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              {isPaused ? <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" /> : <Shield className="w-3 h-3 md:w-4 md:h-4" />}
              {isPaused ? 'Resume Game' : 'Pause Game'}
            </button>

            <button 
              onClick={() => setIsAutoStart(!isAutoStart)}
              className={`w-full py-2.5 md:py-3 rounded-xl border transition-all flex items-center justify-center gap-2 md:gap-3 font-bold uppercase tracking-widest text-[9px] md:text-xs ${isAutoStart ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
              Auto-Start: {isAutoStart ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={startWave}
              disabled={isWaveActive || gameOver}
              className={`
                w-full font-bold uppercase tracking-widest transition-all
                ${isMobile && isLandscape ? 'h-10 text-[10px]' : 'h-10 md:h-auto px-4 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-base'}
                ${isWaveActive || gameOver
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]'}
                ${gameMode === GameMode.TUTORIAL && tutorialStep === 5 ? 'tutorial-highlight' : ''}
              `}
            >
              {isWaveActive ? (
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-3 h-3 md:w-5 md:h-5 animate-spin" />
                  <span>{isMobile && isLandscape ? 'Active' : 'Wave In Progress'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Play className="w-3 h-3 md:w-5 md:h-5 fill-current" />
                  <span>{isMobile && isLandscape ? 'Deploy' : 'Deploy Wave'}</span>
                </div>
              )}
            </button>
          </section>
        </aside>
      )}

        {/* Game Area */}
        <section className={`flex-1 relative ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]' : 'bg-[radial-gradient(circle_at_center,_#f1f5f9_0%,_#e2e8f0_100%)]'} flex items-center justify-center overflow-auto custom-scrollbar ${isMobile && isLandscape ? 'p-1' : 'p-4'}`}>
          {/* Start Screen Overlay */}
          {gameMode === GameMode.START && (
            <div className={`absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center overflow-y-auto ${isMobile && isLandscape ? 'p-2' : 'p-4 md:p-8'}`}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full text-center ${isMobile && isLandscape ? 'py-4 max-w-2xl' : 'py-10 max-w-4xl'}`}
              >
                <div className={`flex flex-col items-center ${isMobile && isLandscape ? 'gap-2 mb-4' : 'gap-4 md:gap-6 mb-8 md:mb-12'}`}>
                  <div className={`absolute flex items-center ${isMobile && isLandscape ? 'top-2 right-2 gap-2' : 'top-4 right-4 md:top-8 md:right-8 gap-2 md:gap-4'}`}>
                    {user ? (
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-xs font-bold text-white uppercase tracking-widest">{user.displayName}</p>
                          <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest flex items-center justify-end gap-2">
                            {isSyncing ? (
                              <>
                                <RotateCcw className="w-2 h-2 animate-spin text-cyan-400" />
                                Syncing Data...
                              </>
                            ) : (
                              'Protocol Sync: Active'
                            )}
                          </p>
                        </div>
                        <img 
                          src={user.photoURL || ''} 
                          alt="Profile" 
                          referrerPolicy="no-referrer"
                          className={`${isMobile && isLandscape ? 'w-6 h-6' : 'w-8 h-8 md:w-10 md:h-10'} rounded-full border border-white/10`}
                        />
                        <button 
                          onClick={handleSignOut}
                          className="p-1 md:p-2 text-white/40 hover:text-red-500 transition-colors"
                          title="Sign Out"
                        >
                          <LogOut className={`${isMobile && isLandscape ? 'w-3 h-3' : 'w-4 h-4 md:w-5 md:h-5'}`} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleSignIn}
                        className={`flex items-center gap-2 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] ${isMobile && isLandscape ? 'px-3 py-1.5 text-[8px]' : 'px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs'}`}
                      >
                        <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                        Sign In
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Shield className={`${isMobile && isLandscape ? 'w-10 h-10' : 'w-16 h-16 md:w-24 md:h-24'} text-cyan-500 animate-pulse`} />
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                  </div>
                  <div>
                    <h1 className={`${isMobile && isLandscape ? 'text-2xl' : 'text-4xl md:text-7xl'} font-black uppercase italic tracking-tighter mb-1 md:mb-2`}>Neon Siege</h1>
                    <p className={`text-cyan-400 font-mono uppercase ${isMobile && isLandscape ? 'tracking-[0.2em] text-[8px]' : 'tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm'}`}>Advanced Defense Protocol</p>
                  </div>
                </div>

                {!showMapSelect && !showDifficultySelect ? (
                  <>
                    <div className={`grid grid-cols-1 md:grid-cols-3 ${isMobile && isLandscape ? 'gap-4 mb-4' : 'gap-4 md:gap-8 mb-6 md:mb-8'}`}>
                      <button
                        onClick={() => setShowMapSelect(true)}
                        className={`group relative bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left overflow-hidden ${isMobile && isLandscape ? 'p-6' : 'p-6 md:p-10'}`}
                      >
                        <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Activity className={`${isMobile && isLandscape ? 'w-12 h-12' : 'w-20 h-20 md:w-32 md:h-32'}`} />
                        </div>
                        <h2 className={`${isMobile && isLandscape ? 'text-lg' : 'text-xl md:text-3xl'} font-black uppercase italic tracking-tight mb-1 md:mb-4 text-cyan-400`}>Endless Mode</h2>
                        <p className={`text-white/60 leading-relaxed ${isMobile && isLandscape ? 'text-[8px] mb-2' : 'text-[10px] md:text-sm mb-4 md:mb-8'}`}>
                          Test your endurance against infinite waves of evolving threats.
                        </p>
                        <div className="flex justify-between items-end gap-2">
                          <div className={`text-cyan-500 font-bold uppercase tracking-widest ${isMobile && isLandscape ? 'text-[7px]' : 'text-[8px] md:text-xs'} leading-tight flex-1`}>
                            Initialize Protocol
                          </div>
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-cyan-500 mb-1 flex-shrink-0" />
                          <div className="flex-1 text-right">
                            {Object.keys(highestEndlessWaves).length > 0 ? (
                              <>
                                <p className="text-[7px] md:text-[8px] text-white/40 uppercase tracking-widest mb-0.5">Max Wave</p>
                                <p className={`${isMobile && isLandscape ? 'text-xs' : 'text-sm md:text-xl'} font-black text-cyan-400 font-mono`}>
                                  {Math.max(0, ...(Object.values(highestEndlessWaves) as number[]))}
                                </p>
                              </>
                            ) : (
                              <div className="h-8 md:h-12" />
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setGameMode(GameMode.CAMPAIGN)}
                        className={`group relative bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] hover:bg-white/10 hover:border-emerald-500/50 transition-all text-left overflow-hidden ${isMobile && isLandscape ? 'p-6' : 'p-6 md:p-10'}`}
                      >
                        <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Target className={`${isMobile && isLandscape ? 'w-12 h-12' : 'w-20 h-20 md:w-32 md:h-32'}`} />
                        </div>
                        <h2 className={`${isMobile && isLandscape ? 'text-lg' : 'text-xl md:text-3xl'} font-black uppercase italic tracking-tight mb-1 md:mb-4 text-emerald-400`}>Campaign</h2>
                        <p className={`text-white/60 leading-relaxed ${isMobile && isLandscape ? 'text-[8px] mb-2' : 'text-[10px] md:text-sm mb-4 md:mb-8'}`}>
                          Progress through 11 critical sectors. Secure each zone to unlock tech.
                        </p>
                        <div className="flex justify-between items-end gap-2">
                          <div className={`text-emerald-500 font-bold uppercase tracking-widest ${isMobile && isLandscape ? 'text-[7px]' : 'text-[8px] md:text-xs'} leading-tight flex-1`}>
                            Begin Operation
                          </div>
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 mb-1 flex-shrink-0" />
                          <div className="flex-1 text-right">
                            <p className="text-[7px] md:text-[8px] text-white/40 uppercase tracking-widest mb-0.5">Sectors</p>
                            <p className={`${isMobile && isLandscape ? 'text-xs' : 'text-sm md:text-xl'} font-black text-emerald-400 font-mono`}>{unlockedSectorCount - 1}/11</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsSandboxEntry(true);
                          setShowMapSelect(true);
                        }}
                        className={`group relative bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] hover:bg-white/10 hover:border-purple-500/50 transition-all text-left overflow-hidden ${isMobile && isLandscape ? 'p-6' : 'p-6 md:p-10'}`}
                      >
                        <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Cpu className={`${isMobile && isLandscape ? 'w-12 h-12' : 'w-20 h-20 md:w-32 md:h-32'}`} />
                        </div>
                        <h2 className={`${isMobile && isLandscape ? 'text-lg' : 'text-xl md:text-3xl'} font-black uppercase italic tracking-tight mb-1 md:mb-4 text-purple-400`}>Sandbox</h2>
                        <p className={`text-white/60 leading-relaxed ${isMobile && isLandscape ? 'text-[8px] mb-2' : 'text-[10px] md:text-sm mb-4 md:mb-8'}`}>
                          Infinite resources. All tech unlocked. Experiment without limits.
                        </p>
                        <div className="flex justify-between items-end gap-2">
                          <div className={`text-purple-500 font-bold uppercase tracking-widest ${isMobile && isLandscape ? 'text-[7px]' : 'text-[8px] md:text-xs'} leading-tight flex-1`}>
                            Enter Sandbox
                          </div>
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-purple-500 mb-1 flex-shrink-0" />
                          <div className="flex-1 text-right">
                            <p className="text-[7px] md:text-[8px] text-white/40 uppercase tracking-widest mb-0.5">Resources</p>
                            <p className={`${isMobile && isLandscape ? 'text-xs' : 'text-sm md:text-xl'} font-black text-purple-400 font-mono`}>UNLIMITED</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                      <button
                        onClick={() => setShowCommanderProfile(true)}
                        className={`group flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber-500/50 transition-all text-white/60 hover:text-white ${isMobile && isLandscape ? 'px-6 py-3 text-[10px]' : 'px-8 py-4 text-xs md:text-sm'} font-bold uppercase tracking-widest`}
                      >
                        <Shield className="w-4 h-4 md:w-5 md:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                        Commander Profile
                      </button>

                      <button
                        onClick={() => {
                          setCurrentMapConfig(CAMPAIGN_SECTORS[0].mapConfig);
                          setGameMode(GameMode.TUTORIAL);
                          setDifficulty(Difficulty.MEDIUM);
                          setGold(500); // Give extra gold for training
                          setLives(20);
                          setWave(0);
                          setInventory(EMPTY_INVENTORY);
                          setBoughtTurrets(new Set([TurretType.BASIC]));
                          setUnlockedTurrets(new Set([TurretType.BASIC]));
                          setShowTutorial(true);
                          setTutorialStep(0);
                        }}
                        className={`group flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/50 transition-all font-bold uppercase tracking-widest ${isMobile && isLandscape ? 'px-6 py-3 text-[10px]' : 'px-8 py-4 md:px-12 md:py-6 text-xs md:text-sm'}`}
                      >
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                        Training Protocol
                      </button>
                      
                      <button
                        onClick={() => setShowLibrary(true)}
                        className={`group flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 transition-all font-bold uppercase tracking-widest ${isMobile && isLandscape ? 'px-6 py-3 text-[10px]' : 'px-8 py-4 md:px-12 md:py-6 text-xs md:text-sm'}`}
                      >
                        <Info className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                        Database
                      </button>

                      <button
                        onClick={() => setShowSettings(true)}
                        className={`group flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all font-bold uppercase tracking-widest ${isMobile && isLandscape ? 'px-6 py-3 text-[10px]' : 'px-8 py-4 md:px-12 md:py-6 text-xs md:text-sm'}`}
                      >
                        <SettingsIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                        Settings
                      </button>
                    </div>
                  </>
                ) : showMapSelect ? (
                  <div className={`${isMobile && isLandscape ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}>
                    <div className={`flex items-center justify-center ${isMobile && isLandscape ? 'gap-4 mb-6' : 'gap-4 mb-6 md:mb-8'}`}>
                      <button 
                        onClick={() => setShowMapSelect(false)} 
                        className={`bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group ${isMobile && isLandscape ? 'p-1.5' : 'p-2 md:p-3'}`}
                      >
                        <ChevronLeft className={`${isMobile && isLandscape ? 'w-4 h-4' : 'w-4 h-4 md:w-6 md:h-6'} text-white/40 group-hover:text-cyan-400`} />
                      </button>
                      <h2 className={`${isMobile && isLandscape ? 'text-lg' : 'text-xl md:text-3xl'} font-black uppercase italic tracking-tight`}>Select Map</h2>
                      <button
                        onClick={() => setShowEndlessLibrary(true)}
                        className={`ml-4 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all text-cyan-400 font-bold uppercase tracking-widest ${isMobile && isLandscape ? 'px-3 py-1.5 text-[8px]' : 'px-4 py-2 text-[10px]'}`}
                      >
                        <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                        Library
                      </button>
                    </div>
                    <div className={`grid gap-3 md:gap-4 ${isMobile && isLandscape ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                      {[DEFAULT_MAP, ...CAMPAIGN_SECTORS.map(s => s.mapConfig)].map(map => (
                        <div
                          key={map.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            if (isSandboxEntry) {
                              setCurrentMapConfig(map);
                              setGameMode(GameMode.SANDBOX);
                              setDifficulty(Difficulty.EASY);
                              setGold(999999);
                              setLives(999);
                              setWave(1);
                              setInventory(EMPTY_INVENTORY);
                              const allTurrets = Object.values(TurretType);
                              setUnlockedTurrets(new Set(allTurrets));
                              setIsSandboxEntry(false);
                              setShowMapSelect(false);
                            } else {
                              setSelectedEndlessMap(map);
                              setShowMapSelect(false);
                              setShowDifficultySelect(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              if (isSandboxEntry) {
                                setCurrentMapConfig(map);
                                setGameMode(GameMode.SANDBOX);
                                setDifficulty(Difficulty.EASY);
                                setGold(999999);
                                setLives(999);
                                setWave(1);
                                setInventory(EMPTY_INVENTORY);
                                const allTurrets = Object.values(TurretType);
                                setUnlockedTurrets(new Set(allTurrets));
                                setIsSandboxEntry(false);
                                setShowMapSelect(false);
                              } else {
                                setSelectedEndlessMap(map);
                                setShowMapSelect(false);
                                setShowDifficultySelect(true);
                              }
                            }
                          }}
                          className={`group relative bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left flex flex-col cursor-pointer ${isMobile && isLandscape ? 'p-4 h-36' : 'p-4 md:p-6 h-40 md:h-48'}`}
                        >
                          <div className={`flex justify-between items-start ${isMobile && isLandscape ? 'mb-1' : 'mb-2 md:mb-4'}`}>
                            <h3 className={`font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors ${isMobile && isLandscape ? 'text-[10px]' : 'text-sm md:text-lg'}`}>{map.name}</h3>
                            <div className="bg-cyan-500/10 px-1.5 py-0.5 rounded text-[7px] md:text-[8px] font-bold text-cyan-400 uppercase tracking-widest">
                              {map.cols}x{map.rows}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-[7px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Layout Difficulty</p>
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`h-1 rounded-full ${isMobile && isLandscape ? 'w-2' : 'w-3 md:w-4'} ${i < Math.min(5, Math.ceil(map.path.length / 2)) ? 'bg-cyan-500' : 'bg-white/10'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className={`border-t border-white/5 flex justify-between items-center ${isMobile && isLandscape ? 'mt-1 pt-1' : 'mt-2 md:mt-4 pt-2 md:pt-4'}`}>
                            {endlessSessions[map.id] ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resumeEndlessSession(map.id);
                                }}
                                className="flex items-center gap-1 text-cyan-400 font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:text-white transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Resume (W{endlessSessions[map.id].wave})
                              </button>
                            ) : (
                              <span className="text-[7px] md:text-[9px] text-white/20 uppercase tracking-widest font-bold">Max Wave</span>
                            )}
                            <span className={`${isMobile && isLandscape ? 'text-[10px]' : 'text-xs md:text-sm'} font-black text-cyan-400 font-mono`}>{highestEndlessWaves[map.id] || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto">
                    <div className={`flex items-center justify-center ${isMobile && isLandscape ? 'gap-4 mb-6' : 'gap-4 mb-6 md:mb-8'}`}>
                      <button 
                        onClick={() => {
                          setShowDifficultySelect(false);
                          setShowMapSelect(true);
                        }} 
                        className={`bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group ${isMobile && isLandscape ? 'p-1.5' : 'p-2 md:p-3'}`}
                      >
                        <ChevronLeft className={`${isMobile && isLandscape ? 'w-4 h-4' : 'w-4 h-4 md:w-6 md:h-6'} text-white/40 group-hover:text-cyan-400`} />
                      </button>
                      <h2 className={`${isMobile && isLandscape ? 'text-lg' : 'text-xl md:text-3xl'} font-black uppercase italic tracking-tight`}>Game Difficulty</h2>
                    </div>
                    <div className={`grid gap-3 md:gap-4 ${isMobile && isLandscape ? 'grid-cols-3' : 'grid-cols-1'}`}>
                      {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map(diff => (
                        <button
                          key={diff}
                          onClick={() => selectDifficulty(diff)}
                          className={`group relative bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left ${isMobile && isLandscape ? 'p-4' : 'p-4 md:p-6'}`}
                        >
                          <div className={`flex justify-between items-center ${isMobile && isLandscape ? 'mb-0.5' : 'mb-1 md:mb-2'}`}>
                            <span className={`font-bold uppercase tracking-widest text-cyan-400 ${isMobile && isLandscape ? 'text-xs' : 'text-lg md:text-xl'}`}>{diff}</span>
                            {!isLandscape && <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />}
                          </div>
                          <div className={`flex flex-col md:flex-row gap-1 md:gap-4 font-mono uppercase tracking-widest text-white/40 ${isMobile && isLandscape ? 'text-[6px]' : 'text-[8px] md:text-[10px]'}`}>
                            <span>Gold: {DIFFICULTY_CONFIGS[diff].gold}</span>
                            <span>Lives: {DIFFICULTY_CONFIGS[diff].lives}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Campaign Sector Map Overlay */}
          {gameMode === GameMode.CAMPAIGN && !difficulty && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col p-2 md:p-4 overflow-hidden">
              <div className="w-full h-full flex flex-col">
                <header className={`flex justify-between items-center px-4 ${isMobile && isLandscape ? 'mb-2' : 'mb-4'}`}>
                  <div className="relative">
                    <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-1 bg-emerald-500 rounded-full ${isMobile && isLandscape ? 'h-6' : 'h-10'}`} />
                    <h2 className={`${isMobile && isLandscape ? 'text-2xl' : 'text-4xl md:text-5xl'} font-black uppercase italic tracking-tighter text-emerald-400`}>Sector Map</h2>
                    {!isLandscape && <p className="text-white/40 font-mono text-[9px] uppercase tracking-[0.4em] mt-1">Grid Restoration Protocol: {unlockedSectorCount}/11</p>}
                  </div>
                </header>

                <div className={`relative flex-1 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 overflow-y-auto custom-scrollbar ${isMobile && isLandscape ? 'p-2' : 'p-4 md:p-6'}`}>
                  <div className={`grid relative z-10 ${isMobile && isLandscape ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6'}`}>
                    {CAMPAIGN_SECTORS.map((sector, idx) => {
                      const isUnlocked = idx < unlockedSectorCount;
                      const isCurrent = idx === currentSectorIndex;
                      const isSecured = idx < unlockedSectorCount - 1;
                      
                      return (
                        <button
                          key={sector.id}
                          disabled={!isUnlocked}
                          onClick={() => startCampaignSector(idx)}
                          className={`
                            relative rounded-[2rem] md:rounded-[2.5rem] border transition-all text-left flex flex-col group
                            ${isUnlocked 
                              ? 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10' 
                              : 'bg-black/40 border-white/5 opacity-40 grayscale cursor-not-allowed'}
                            ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-black' : ''}
                            ${isSecured ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
                            ${isMobile && isLandscape ? 'p-4 h-48' : 'p-6 md:p-8 h-64 md:h-72'}
                          `}
                        >
                          <div className={`flex justify-between items-start ${isMobile && isLandscape ? 'mb-2' : 'mb-6'}`}>
                            <div className={`
                              rounded-2xl flex items-center justify-center font-black
                              ${isSecured ? 'bg-emerald-500 text-black' : isUnlocked ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'}
                              ${isMobile && isLandscape ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-xl'}
                            `}>
                              {idx + 1}
                            </div>
                            {isSecured ? (
                              <div className="bg-emerald-500/20 px-2 py-1 rounded text-[7px] font-bold text-emerald-400 uppercase tracking-widest">Secured</div>
                            ) : !isUnlocked ? (
                              <Lock className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                            ) : (
                              <div className="bg-cyan-500/20 px-2 py-1 rounded text-[7px] font-bold text-cyan-400 uppercase tracking-widest">Active</div>
                            )}
                          </div>
                          
                          <h3 className={`font-black uppercase tracking-tight group-hover:text-emerald-400 transition-colors ${isMobile && isLandscape ? 'text-sm mb-1' : 'text-xl mb-3'}`}>{sector.name}</h3>
                          <p className={`text-white/40 leading-relaxed mb-auto font-medium ${isMobile && isLandscape ? 'text-[8px]' : 'text-[10px]'}`}>{sector.description}</p>
                          
                          <div className={`border-t border-white/5 flex flex-col gap-1 ${isMobile && isLandscape ? 'mt-2 pt-2' : 'mt-6 pt-6 gap-2'}`}>
                            <div className="flex justify-between items-center text-[7px] md:text-[9px] uppercase tracking-widest font-bold">
                              <span className="text-white/20">Objective</span>
                              <span className="text-emerald-400">{sector.wavesToWin} Waves</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sector Complete Overlay */}
          <AnimatePresence>
            {isSectorComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className={`w-full bg-[#050505] border border-emerald-500/30 rounded-[2rem] text-center relative overflow-hidden ${isMobile && isLandscape ? 'max-w-xl p-4' : 'max-w-md p-10'}`}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                  <div className={`rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/50 ${isMobile && isLandscape ? 'w-10 h-10 mb-4' : 'w-20 h-20 mb-8'}`}>
                    <Target className={`${isMobile && isLandscape ? 'w-5 h-5' : 'w-10 h-10'} text-emerald-400`} />
                  </div>
                  <h2 className={`font-black uppercase italic tracking-tighter text-emerald-400 ${isMobile && isLandscape ? 'text-2xl mb-1' : 'text-4xl mb-2'}`}>Sector Secured</h2>
                  <p className={`text-white/60 mb-4 md:mb-8 ${isMobile && isLandscape ? 'text-[10px]' : 'text-sm'}`}>
                    You have successfully defended {CAMPAIGN_SECTORS[currentSectorIndex].name}. The grid is one step closer to stability.
                  </p>
                  
                  <div className={`bg-white/5 rounded-2xl border border-white/5 ${isMobile && isLandscape ? 'p-3 mb-4' : 'p-6 mb-8'}`}>
                    <div className="flex justify-center items-center">
                      <span className="text-[10px] md:text-xs uppercase tracking-widest text-emerald-400 font-bold">Sector Secured & Data Recovered</span>
                    </div>
                  </div>

                  <div className={`flex gap-3 ${isMobile && isLandscape ? 'flex-row' : 'flex-col'}`}>
                    <button
                      onClick={() => {
                        setIsSectorComplete(false);
                        setDifficulty(null);
                        setGold(0);
                        setLives(0);
                        setWave(0);
                        setInventory({
                          [TurretType.BASIC]: 0,
                          [TurretType.SNIPER]: 0,
                          [TurretType.FROST]: 0,
                          [TurretType.GATLING]: 0,
                          [TurretType.TESLA]: 0,
                          [TurretType.MORTAR]: 0,
                          [TurretType.SONIC]: 0,
                          [TurretType.BEAM]: 0,
                          [TurretType.MISSILE]: 0,
                          [TurretType.VOID]: 0,
                          [TurretType.FLAME]: 0,
                          [TurretType.SHOCK]: 0,
                          [TurretType.ORBITAL]: 0,
                          [TurretType.GRAVITY]: 0,
                          [TurretType.PLASMA]: 0,
                        });
                        enemiesRef.current = [];
                        turretsRef.current = [];
                        enemiesToSpawnRef.current = 0;
                      }}
                      className="flex-1 py-3 md:py-4 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] text-[10px] md:text-base"
                    >
                      Return to Map
                    </button>
                    <button
                      onClick={resetToStart}
                      className="flex-1 py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] md:text-base"
                    >
                      Exit to Menu
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievement Notification Popup */}
          <AnimatePresence>
            {achievementNotification && (
              <motion.div
                initial={{ opacity: 0, y: -100, x: '-50%' }}
                animate={{ opacity: 1, y: 20, x: '-50%' }}
                exit={{ opacity: 0, y: -100, x: '-50%' }}
                className="fixed top-0 left-1/2 z-[300] w-full max-w-sm px-4"
              >
                <div className="bg-black/90 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center gap-4 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                    <Star className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mb-0.5">Achievement Unlocked</p>
                    <h4 className="text-sm font-black text-white uppercase italic truncate">{achievementNotification.name}</h4>
                    <p className="text-[10px] text-white/60 truncate">{achievementNotification.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Commander Profile Modal */}
          <AnimatePresence>
            {showCommanderProfile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-2xl bg-[#050505] border border-amber-500/30 rounded-[2rem] flex flex-col relative overflow-hidden"
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
                      onClick={() => setShowCommanderProfile(false)}
                      className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6 text-white/40 group-hover:text-amber-400" />
                    </button>
                  </div>

                  <div className="p-6 md:p-10 space-y-8">
                    {/* Level Progress */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Current Rank</p>
                          <h3 className="text-2xl font-black text-white uppercase italic">Level {getCommanderLevel(commanderExp)}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Next Rank</p>
                          <p className="text-sm font-mono text-amber-400">{commanderExp} / {getExpToNextLevel(getCommanderLevel(commanderExp))} XP</p>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(commanderExp / getExpToNextLevel(getCommanderLevel(commanderExp))) * 100}%` }}
                          className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Waves Survived</p>
                        <p className="text-xl font-black text-white font-mono">{totalWavesSurvived}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Sessions Saved</p>
                        <p className="text-xl font-black text-white font-mono">{totalSessionsSaved}</p>
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
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Endless Library Modal */}
          <AnimatePresence>
            {showEndlessLibrary && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-4xl bg-[#050505] border border-cyan-500/30 rounded-[2rem] flex flex-col max-h-[90vh] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                  
                  <div className="p-6 md:p-10 flex justify-between items-center border-b border-white/5">
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-cyan-400">Endless Library</h2>
                      <p className="text-white/40 font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] mt-1">Active Defense Protocols</p>
                    </div>
                    <button 
                      onClick={() => setShowEndlessLibrary(false)}
                      className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6 text-white/40 group-hover:text-cyan-400" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                    {librarySessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                          <BookOpen className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-white/60 uppercase tracking-widest mb-2">Library Empty</h3>
                        <p className="text-white/30 text-sm max-w-xs">No active endless sessions found. Start a new game and complete a wave to save your progress.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {librarySessions.map((session) => {
                          const mapName = CAMPAIGN_SECTORS.find(s => s.mapConfig.id === session.mapId)?.name || 'Unknown Sector';
                          return (
                            <button
                              key={session.id}
                              onClick={() => loadSession(session)}
                              className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity className="w-24 h-24" />
                              </div>
                              
                              <div className="flex justify-between items-start mb-4">
                                <div className="px-3 py-1 bg-cyan-500/20 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/30">
                                  {session.difficulty}
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Last Active</p>
                                  <p className="text-[10px] text-white/40 font-mono">{new Date(session.lastUpdated).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <h3 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-cyan-400 transition-colors mb-1">{mapName}</h3>
                              <div className="flex items-center gap-2 mb-6">
                                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Commander: {session.userName}</p>
                                <div className="px-2 py-0.5 bg-amber-500/20 rounded text-[8px] font-bold text-amber-400 uppercase tracking-widest border border-amber-500/30">
                                  LVL {session.commanderLevel || 1}
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-6">
                                <div>
                                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">Wave</p>
                                  <p className="text-lg font-black text-cyan-400 font-mono">{session.wave}</p>
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
                              
                              <div className="mt-6 flex items-center justify-end gap-2 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Resume Protocol</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions Overlay */}
          {!isWaveActive && wave === 0 && !selectedTurretType && !isRetractMode && difficulty && (
            <div className={`absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none ${isMobile && isLandscape ? 'top-2' : 'top-10'}`}>
              <div className={`bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4 animate-bounce ${isMobile && isLandscape ? 'p-2' : 'p-4'}`}>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Info className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                </div>
                <p className={`${isMobile && isLandscape ? 'text-[10px]' : 'text-sm'} font-medium text-white/80`}>Buy in Armory, deploy from Inventory!</p>
              </div>
            </div>
          )}

          {isRetractMode && (
            <div className={`absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none ${isMobile && isLandscape ? 'top-2' : 'top-10'}`}>
              <div className={`bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-2xl flex items-center gap-4 ${isMobile && isLandscape ? 'p-2' : 'p-4'}`}>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <RotateCcw className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                </div>
                <p className={`${isMobile && isLandscape ? 'text-[9px]' : 'text-sm'} font-medium text-red-400 uppercase tracking-widest`}>Retraction Mode: Click turret to return to inventory (5G)</p>
              </div>
            </div>
          )}

          <div 
            className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 rounded-sm overflow-hidden shrink-0"
            style={{ 
              width: isMobile ? 'auto' : CANVAS_WIDTH, 
              height: isMobile ? 'auto' : CANVAS_HEIGHT,
              maxWidth: '100%',
              maxHeight: '100%',
              aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
            }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseLeave={() => { mousePosRef.current = null; }}
              onClick={handleCanvasClick}
              className={`block w-full h-full ${selectedTurretType ? 'cursor-crosshair' : isRetractMode ? 'cursor-pointer' : 'cursor-default'}`}
            />
            
            {/* Placement Preview */}
            {selectedTurretType && (
              <div className="absolute inset-0 pointer-events-none opacity-20">
                {/* Could add a ghost turret here if needed */}
              </div>
            )}
          </div>

          {/* Sandbox Controls Overlay */}
          {gameMode === GameMode.SANDBOX && (
            <div className="absolute top-4 right-4 z-[60] flex flex-col gap-2">
              <motion.div 
                layout
                className="bg-black/90 backdrop-blur-2xl border border-purple-500/40 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] ring-1 ring-white/10 overflow-hidden"
                animate={{ width: isSandboxMenuCollapsed ? 160 : 240 }}
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setIsSandboxMenuCollapsed(!isSandboxMenuCollapsed)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <Cpu className="w-4 h-4 text-purple-400" />
                    </div>
                    {!isSandboxMenuCollapsed && (
                      <div>
                        <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-white">Sandbox</h3>
                        <p className="text-[7px] text-purple-400/60 uppercase font-bold tracking-widest">Admin Overrides</p>
                      </div>
                    )}
                  </div>
                  {isSandboxMenuCollapsed ? <ChevronDown className="w-3 h-3 text-white/40" /> : <ChevronUp className="w-3 h-3 text-white/40" />}
                </div>
                
                <AnimatePresence>
                  {!isSandboxMenuCollapsed && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 flex flex-col gap-5"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-bold">Credits</label>
                          <span className="text-[10px] font-mono font-bold text-yellow-400">{gold.toLocaleString()}G</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setGold(prev => Math.max(0, prev - 1000))} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-purple-500/20 rounded-lg text-white/40 hover:text-purple-400 transition-all border border-transparent hover:border-purple-500/30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <input 
                            type="number" 
                            value={gold} 
                            onChange={(e) => setGold(parseInt(e.target.value) || 0)}
                            className="bg-transparent text-center text-xs font-mono text-white w-full focus:outline-none no-spinner"
                          />
                          <button 
                            onClick={() => setGold(prev => prev + 1000)} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-purple-500/20 rounded-lg text-white/40 hover:text-purple-400 transition-all border border-transparent hover:border-purple-500/30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-bold">Lives</label>
                          <span className="text-[10px] font-mono font-bold text-red-400">{lives}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setLives(prev => Math.max(1, prev - 1))} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-purple-500/20 rounded-lg text-white/40 hover:text-purple-400 transition-all border border-transparent hover:border-purple-500/30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <input 
                            type="number" 
                            value={lives} 
                            onChange={(e) => setLives(parseInt(e.target.value) || 1)}
                            className="bg-transparent text-center text-xs font-mono text-white w-full focus:outline-none no-spinner"
                          />
                          <button 
                            onClick={() => setLives(prev => prev + 1)} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-purple-500/20 rounded-lg text-white/40 hover:text-purple-400 transition-all border border-transparent hover:border-purple-500/30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-bold">Next Wave</label>
                          <span className="text-[10px] font-mono font-bold text-purple-400">W{wave}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" 
                            min="1" 
                            max={Math.max(1, ...(Object.values(highestEndlessWaves) as number[]), unlockedSectorCount * 5)} 
                            value={wave}
                            onChange={(e) => {
                              if (!isWaveActive) {
                                setWave(parseInt(e.target.value));
                              }
                            }}
                            disabled={isWaveActive}
                            className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-30"
                          />
                        </div>
                        {isWaveActive && <p className="text-[7px] text-red-400 italic text-center">Wave in progress...</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
          <AnimatePresence>
            {currentLore && (
              <motion.div
                key="lore-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-8"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="max-w-lg w-full bg-[#050505] border border-white/10 p-10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <Info className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Incoming Transmission</h3>
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-500/60">Secure Channel Alpha-9</p>
                    </div>
                  </div>

                  <p className="text-lg text-white/80 leading-relaxed font-medium italic mb-10 border-l-2 border-cyan-500/30 pl-6">
                    "{currentLore}"
                  </p>

                  <button
                    onClick={() => setCurrentLore(null)}
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 group"
                  >
                    Acknowledge
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </motion.div>
            )}

            {confirmingUpgradeTech && (
              <motion.div
                key="upgrade-tech-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-black/40" style={{ color: TURRET_CONFIGS[confirmingUpgradeTech].color }}>
                      {TURRET_CONFIGS[confirmingUpgradeTech].icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase italic tracking-tight">{TURRET_CONFIGS[confirmingUpgradeTech].name} Upgrade</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Advanced Research</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/60 mb-8 leading-relaxed">
                    Unlock the ability to upgrade individual {TURRET_CONFIGS[confirmingUpgradeTech].name} units on the battlefield. Upgrades increase damage, range, and fire rate.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Research Cost</span>
                      <span className="text-sm font-bold text-yellow-400">{TURRET_CONFIGS[confirmingUpgradeTech].upgradeUnlockCost}G</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Unit Upgrade Cost</span>
                      <span className="text-sm font-bold text-cyan-400">{TURRET_CONFIGS[confirmingUpgradeTech].upgradeCost}G</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => unlockUpgradeTech(confirmingUpgradeTech)}
                      disabled={gold < TURRET_CONFIGS[confirmingUpgradeTech].upgradeUnlockCost}
                      className={`
                        w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                        ${gold >= TURRET_CONFIGS[confirmingUpgradeTech].upgradeUnlockCost
                          ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : 'bg-white/5 text-white/20 cursor-not-allowed'}
                      `}
                    >
                      <ArrowUp className="w-4 h-4" />
                      Research Upgrades ({TURRET_CONFIGS[confirmingUpgradeTech].upgradeUnlockCost}G)
                    </button>
                    <button
                      onClick={() => setConfirmingUpgradeTech(null)}
                      className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
              {/* Tech Tree Fullscreen Overlay */}
            {isTechTreeOpen && (
              <motion.div
                key="tech-tree-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col p-4 md:p-12 overflow-y-auto"
              >
                  <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
                    <header className={`flex justify-between items-center ${isMobile && isLandscape ? 'mb-6' : 'mb-12'}`}>
                      <div>
                        <h2 className={`${isMobile && isLandscape ? 'text-xl' : 'text-3xl md:text-5xl'} font-black uppercase italic tracking-tighter text-white mb-1 md:mb-2`}>Research Lab</h2>
                        <p className="text-cyan-500 font-mono text-[8px] md:text-xs uppercase tracking-[0.4em]">Advanced Perimeter Defense Technologies</p>
                      </div>
                      <button
                        onClick={() => setIsTechTreeOpen(false)}
                        className={`${isMobile && isLandscape ? 'p-2 rounded-xl' : 'p-4 rounded-2xl'} bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all`}
                      >
                        <X className={`${isMobile && isLandscape ? 'w-4 h-4' : 'w-6 h-6 md:w-8 md:h-8'}`} />
                      </button>
                    </header>

                    <div className={`flex-1 relative overflow-hidden bg-black/40 rounded-3xl border border-white/5 ${isMobile && isLandscape ? 'p-1' : ''}`}>
                      <div 
                        ref={techTreeContainerRef}
                        onMouseDown={handleTechTreeMouseDown}
                        onMouseMove={handleTechTreeMouseMove}
                        onMouseUp={handleTechTreeMouseUp}
                        onMouseLeave={handleTechTreeMouseUp}
                        onTouchStart={handleTechTreeMouseDown}
                        onTouchMove={handleTechTreeMouseMove}
                        onTouchEnd={handleTechTreeMouseUp}
                        className={`absolute inset-0 overflow-auto no-scrollbar cursor-grab active:cursor-grabbing ${isMobile && isLandscape ? 'p-8' : 'p-10'}`}
                      >
                        <div className="relative min-w-[2500px] min-h-[1000px] flex items-center justify-center">
                          {/* Sector Backgrounds */}
                          <div className="absolute inset-0 pointer-events-none opacity-5">
                            <div className="absolute top-0 left-0 w-1/4 h-full border-r border-white/20 flex items-center justify-center">
                              <span className="text-6xl font-black uppercase italic tracking-tighter opacity-20 [writing-mode:vertical-rl] rotate-180">Foundation</span>
                            </div>
                            <div className="absolute top-0 left-1/4 w-1/4 h-full border-r border-white/20 flex items-center justify-center">
                              <span className="text-6xl font-black uppercase italic tracking-tighter opacity-20 [writing-mode:vertical-rl] rotate-180">Specialization</span>
                            </div>
                            <div className="absolute top-0 left-2/4 w-1/4 h-full border-r border-white/20 flex items-center justify-center">
                              <span className="text-6xl font-black uppercase italic tracking-tighter opacity-20 [writing-mode:vertical-rl] rotate-180">Advanced Systems</span>
                            </div>
                            <div className="absolute top-0 left-3/4 w-1/4 h-full flex items-center justify-center">
                              <span className="text-6xl font-black uppercase italic tracking-tighter opacity-20 [writing-mode:vertical-rl] rotate-180">Ultimate Tech</span>
                            </div>
                          </div>

                          {/* SVG Connections */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255, 255, 255, 0.2)" />
                              </marker>
                              <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(6, 182, 212, 0.8)" />
                              </marker>
                            </defs>
                            {(Object.keys(TURRET_CONFIGS) as TurretType[]).map(type => {
                              const config = TURRET_CONFIGS[type];
                              const endPos = TECH_TREE_POSITIONS[type];
                              return config.prerequisites.map(prereq => {
                                const startPos = TECH_TREE_POSITIONS[prereq];
                                const isUnlocked = unlockedTurrets.has(type) && unlockedTurrets.has(prereq);
                                
                                // Manhattan routing: Horizontal -> Vertical -> Horizontal
                                const offsetX = 600;
                                const offsetY = 400;
                                const halfNodeWidth = 128;

                                const startX = startPos.x + offsetX + halfNodeWidth;
                                const startY = startPos.y + offsetY;
                                const endX = endPos.x + offsetX - halfNodeWidth;
                                const endY = endPos.y + offsetY;
                                const midX = (startX + endX) / 2;

                                return (
                                  <path
                                    key={`${type}-${prereq}`}
                                    d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
                                    fill="none"
                                    stroke={isUnlocked ? TURRET_CONFIGS[type].color : 'rgba(255, 255, 255, 0.05)'}
                                    strokeWidth={isUnlocked ? 2 : 1}
                                    strokeDasharray={isUnlocked ? 'none' : '4 4'}
                                    filter={isUnlocked ? 'url(#glow)' : 'none'}
                                    markerEnd={isUnlocked ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                                    style={{ transition: 'all 0.5s ease' }}
                                  />
                                );
                              });
                            })}
                          </svg>

                          {/* Nodes */}
                          {(Object.keys(TURRET_CONFIGS) as TurretType[]).map(type => (
                            <TechNode 
                              key={`tech-${type}`} 
                              type={type} 
                              unlockedTurrets={unlockedTurrets} 
                              unlockedUpgrades={unlockedUpgrades} 
                              gold={gold} 
                              onUnlock={initiateUnlock}
                              x={TECH_TREE_POSITIONS[type].x + 600}
                              y={TECH_TREE_POSITIONS[type].y + 400}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <footer className={`border-t border-white/10 flex justify-between items-center ${isMobile && isLandscape ? 'mt-2 pt-2' : 'mt-12 pt-8'}`}>
                      <div className="flex gap-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Available Funds</span>
                          <div className={`flex items-center gap-2 text-yellow-400 font-mono font-bold ${isMobile && isLandscape ? 'text-lg' : 'text-2xl'}`}>
                            <Coins className={`${isMobile && isLandscape ? 'w-4 h-4' : 'w-6 h-6'}`} />
                            {gold}G
                          </div>
                        </div>
                      </div>
                      {!isLandscape && <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Select a node to authorize research or upgrades</p>}
                    </footer>
                  </div>
                </motion.div>
              )}

            {confirmingPurchase && (
                <motion.div
                  key="confirm-purchase-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className={`bg-[#111] border border-white/10 rounded-3xl w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto ${isMobile && isLandscape ? 'max-w-xl p-6 max-h-[90vh]' : 'max-w-sm p-8'}`}
                  >
                    <div className={`flex items-center gap-4 ${isMobile && isLandscape ? 'mb-6' : 'mb-6'}`}>
                      <div className={`rounded-2xl bg-black/40 ${isMobile && isLandscape ? 'p-3' : 'p-3'}`} style={{ color: TURRET_CONFIGS[confirmingPurchase].color }}>
                        {TURRET_CONFIGS[confirmingPurchase].icon}
                      </div>
                      <div>
                        <h3 className={`font-bold uppercase italic tracking-tight ${isMobile && isLandscape ? 'text-xl' : 'text-xl'}`}>{TURRET_CONFIGS[confirmingPurchase].name}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Armory Acquisition</p>
                      </div>
                    </div>
                    
                    <div className={`grid gap-2 md:gap-4 ${isMobile && isLandscape ? 'grid-cols-4 mb-4' : 'grid-cols-2 mb-6'}`}>
                      <div className="bg-white/5 p-2 md:p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-0.5 md:mb-1">Damage</span>
                        <span className="text-xs md:text-sm font-bold text-white">{TURRET_CONFIGS[confirmingPurchase].damage}</span>
                      </div>
                      <div className="bg-white/5 p-2 md:p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-0.5 md:mb-1">Range</span>
                        <span className="text-xs md:text-sm font-bold text-white">{TURRET_CONFIGS[confirmingPurchase].range}</span>
                      </div>
                      <div className="bg-white/5 p-2 md:p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-0.5 md:mb-1">Fire Rate</span>
                        <span className="text-xs md:text-sm font-bold text-white">{TURRET_CONFIGS[confirmingPurchase].fireRate}s</span>
                      </div>
                      <div className="bg-white/5 p-2 md:p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-0.5 md:mb-1">Type</span>
                        <span className="text-xs md:text-sm font-bold text-white">{TURRET_CONFIGS[confirmingPurchase].isAOE ? 'AOE' : 'Single'}</span>
                      </div>
                    </div>

                    <p className={`text-white/60 leading-relaxed ${isMobile && isLandscape ? 'text-[10px] mb-4' : 'text-sm mb-6'}`}>
                      {TURRET_CONFIGS[confirmingPurchase].description}
                    </p>

                    <div className={`bg-white/5 rounded-2xl border border-white/5 ${isMobile && isLandscape ? 'p-3 mb-4' : 'p-4 mb-8'}`}>
                      <div className={`flex justify-between items-center ${isMobile && isLandscape ? 'mb-2' : 'mb-4'}`}>
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Quantity</span>
                        <span className="text-sm font-bold text-cyan-400">{purchaseQuantity}</span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max="10"
                        value={purchaseQuantity}
                        onChange={(e) => setPurchaseQuantity(parseInt(e.target.value))}
                        className={`w-full bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${isMobile && isLandscape ? 'h-1 mb-4' : 'h-1.5 mb-6'}`}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Total Acquisition Cost</span>
                        <span className="text-sm font-bold text-yellow-400">{TURRET_CONFIGS[confirmingPurchase].cost * purchaseQuantity}G</span>
                      </div>
                    </div>

                    <div className={`flex gap-3 ${isMobile && isLandscape ? 'flex-row' : 'flex-col'}`}>
                      <button
                        onClick={() => buyTurret(confirmingPurchase, purchaseQuantity)}
                        disabled={gold < TURRET_CONFIGS[confirmingPurchase].cost * purchaseQuantity}
                        className={`
                          flex-1 py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-[10px] md:text-base
                          ${gold >= TURRET_CONFIGS[confirmingPurchase].cost * purchaseQuantity
                            ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Purchase ({TURRET_CONFIGS[confirmingPurchase].cost * purchaseQuantity}G)
                      </button>
                      <button
                        onClick={() => { setConfirmingPurchase(null); setPurchaseQuantity(1); }}
                        className="flex-1 py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] md:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

            {confirmingTech && (
                <motion.div
                  key="confirm-tech-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-2xl bg-black/40" style={{ color: TURRET_CONFIGS[confirmingTech].color }}>
                        {TURRET_CONFIGS[confirmingTech].icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold uppercase italic tracking-tight">{TURRET_CONFIGS[confirmingTech].name}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Research Authorization</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/60 mb-8 leading-relaxed">
                      {TURRET_CONFIGS[confirmingTech].description}
                    </p>

                    <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Research Cost</span>
                        <span className="text-sm font-bold text-yellow-400">{TURRET_CONFIGS[confirmingTech].unlockCost}G</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Shop Price</span>
                        <span className="text-sm font-bold text-cyan-400">{TURRET_CONFIGS[confirmingTech].cost}G</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => unlockTurret(confirmingTech)}
                        disabled={gold < TURRET_CONFIGS[confirmingTech].unlockCost}
                        className={`
                          w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                          ${gold >= TURRET_CONFIGS[confirmingTech].unlockCost
                            ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        <Coins className="w-4 h-4" />
                        Research ({TURRET_CONFIGS[confirmingTech].unlockCost}G)
                      </button>
                      <button
                        onClick={() => setConfirmingTech(null)}
                        className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

            {selectedMapTurret && (
              <motion.div
                key="selected-turret-overlay"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 md:left-[340px] md:right-auto z-30"
              >
                <div className={`bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col ${isMobile && isLandscape ? 'p-2 gap-2' : 'p-4 gap-4'} min-w-[300px]`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${isMobile && isLandscape ? 'p-1.5 rounded-lg' : 'p-3 rounded-xl'} bg-black/40 border border-white/10`} style={{ color: selectedMapTurret.config.color }}>
                        {selectedMapTurret.config.icon}
                      </div>
                      <div>
                        <h3 className={`${isMobile && isLandscape ? 'text-[10px]' : 'text-sm'} font-black uppercase italic tracking-tight text-white`}>{selectedMapTurret.config.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] md:text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-bold">Level {selectedMapTurret.level}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMapTurret(null)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-white/60 leading-relaxed italic border-l-2 border-white/10 pl-3">
                      {selectedMapTurret.config.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Damage</p>
                        <p className="text-sm font-mono font-bold text-white">{Math.round(selectedMapTurret.damage)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Range</p>
                        <p className="text-sm font-mono font-bold text-white">{selectedMapTurret.range.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => sellTurret(selectedMapTurret)}
                      className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-500 text-white hover:bg-red-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                      <Trash2 className="w-3 h-3" />
                      Sell ({Math.floor(selectedMapTurret.config.cost * 0.75)}G)
                    </button>
                    {unlockedUpgrades.has(selectedMapTurret.config.type) && selectedMapTurret.level < selectedMapTurret.maxLevel ? (
                      <button
                        onClick={() => upgradeTurretOnMap(selectedMapTurret)}
                        disabled={gold < selectedMapTurret.config.upgradeCost}
                        className={`
                          flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2
                          ${gold >= selectedMapTurret.config.upgradeCost
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        <ArrowUp className="w-3 h-3" />
                        Upgrade ({selectedMapTurret.config.upgradeCost}G)
                      </button>
                    ) : selectedMapTurret.level >= selectedMapTurret.maxLevel ? (
                      <div className="flex-1 py-3 rounded-xl bg-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] text-center border border-white/5">
                        Max Level
                      </div>
                    ) : (
                      <div className="flex-1 py-3 rounded-xl bg-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-white/5">
                        <Lock className="w-3 h-3" />
                        Locked
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTurretType && (
              <motion.div
                key="selected-inventory-overlay"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 md:left-[340px] md:right-auto z-30"
              >
                <div className={`bg-black/90 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl shadow-2xl flex flex-col ${isMobile && isLandscape ? 'p-2 gap-2' : 'p-4 gap-4'} min-w-[300px]`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${isMobile && isLandscape ? 'p-1.5 rounded-lg' : 'p-3 rounded-xl'} bg-black/40 border border-cyan-500/20`} style={{ color: TURRET_CONFIGS[selectedTurretType].color }}>
                        {TURRET_CONFIGS[selectedTurretType].icon}
                      </div>
                      <div>
                        <h3 className={`${isMobile && isLandscape ? 'text-[10px]' : 'text-sm'} font-black uppercase italic tracking-tight text-white`}>{TURRET_CONFIGS[selectedTurretType].name}</h3>
                        <p className="text-[8px] md:text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-bold">Ready for Deployment</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTurretType(null)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-white/60 leading-relaxed italic border-l-2 border-cyan-500/30 pl-3">
                      {TURRET_CONFIGS[selectedTurretType].description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Damage</p>
                        <p className="text-sm font-mono font-bold text-white">{TURRET_CONFIGS[selectedTurretType].damage}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Range</p>
                        <p className="text-sm font-mono font-bold text-white">{TURRET_CONFIGS[selectedTurretType].range.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-3 rounded-xl bg-cyan-500/10 text-cyan-400 font-black uppercase tracking-widest text-[10px] text-center border border-cyan-500/20 animate-pulse">
                    Click Map to Place
                  </div>
                </div>
              </motion.div>
            )}

            {gameOver && (
              <motion.div
                key="game-over-overlay"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
              >
                <div className={`bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 ${isMobile && isLandscape ? 'w-12 h-12 mb-4' : 'w-24 h-24 mb-6'}`}>
                  <Shield className={`${isMobile && isLandscape ? 'w-6 h-6' : 'w-12 h-12'} text-red-500`} />
                </div>
                <h2 className={`font-black uppercase italic tracking-tighter mb-2 text-red-500 ${isMobile && isLandscape ? 'text-3xl' : 'text-6xl'}`}>System Failure</h2>
                <p className="text-white/60 max-w-md mb-12 uppercase tracking-widest text-xs font-mono">
                  The perimeter has been breached. All units lost. Wave {wave} was your final stand.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button
                    onClick={resetGame}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-colors flex items-center justify-center gap-3"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reboot System
                  </button>
                  <button
                    onClick={resetToStart}
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Exit to Menu
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-4 right-4 flex gap-4 items-center z-[100]">
        {gameMode === GameMode.START && (
          <>
            {user?.email === 'kristianai2011@gmail.com' && (
              <button 
                onClick={() => {
                  setIsAdminAuthenticated(true);
                  setShowAdmin(true);
                  fetchFeedback();
                }}
                className="bg-cyan-500 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                <Eye className="w-3 h-3" />
                Database Access
              </button>
            )}
            <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">System Online</span>
            </div>
            <button 
              onClick={() => setShowAdmin(true)}
              className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center opacity-5 hover:opacity-100"
              title="Admin Access"
            >
              <Lock className="w-3 h-3 text-white/20" />
            </button>
          </>
        )}
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#050505] border border-white/10 p-10 rounded-[2rem] relative"
            >
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-black uppercase italic tracking-tight mb-8">Settings</h2>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Sound</h3>
                    <p className="text-[10px] text-white/40 uppercase">Toggle audio protocols</p>
                  </div>
                  <button 
                    onClick={handleToggleMute}
                    className={`w-12 h-6 rounded-full relative transition-all ${!isMuted ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!isMuted ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Appearance</h3>
                    <p className="text-[10px] text-white/40 uppercase">Switch between light and dark</p>
                  </div>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      Dark
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${theme === 'light' ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      Light
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Rate Game</h3>
                  <div className="flex justify-between gap-1">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${rating === n ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Feedback</h3>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Transmission message..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 min-h-[100px] resize-none"
                  />
                </div>

                <button
                  onClick={submitFeedback}
                  disabled={isSubmittingFeedback}
                  className="w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50"
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed z-[200] flex items-center justify-center p-4 ${gameMode === GameMode.TUTORIAL ? 'bottom-4 right-4 md:bottom-8 md:right-8' : 'inset-0 bg-black/95 backdrop-blur-xl'}`}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.15)] ${gameMode === GameMode.TUTORIAL ? 'max-w-md w-full' : 'max-w-2xl w-full'}`}
            >
              <div className={`relative ${gameMode === GameMode.TUTORIAL ? 'p-6' : 'p-8 md:p-12'}`}>
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <motion.div
                    key={`step-icon-${tutorialStep}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`${gameMode === GameMode.TUTORIAL ? 'mb-4 p-3' : 'mb-8 p-6'} rounded-2xl bg-white/5 border border-white/10`}
                  >
                    {tutorialStep === 0 && <Shield className={`${gameMode === GameMode.TUTORIAL ? 'w-8 h-8' : 'w-16 h-16'} text-cyan-500`} />}
                    {tutorialStep === 1 && <Cpu className={`${gameMode === GameMode.TUTORIAL ? 'w-8 h-8' : 'w-16 h-16'} text-purple-500`} />}
                    {tutorialStep === 2 && <ShoppingCart className={`${gameMode === GameMode.TUTORIAL ? 'w-8 h-8' : 'w-16 h-16'} text-yellow-500`} />}
                    {tutorialStep === 3 && <Zap className={`${gameMode === GameMode.TUTORIAL ? 'w-8 h-8' : 'w-16 h-16'} text-cyan-400`} />}
                    {tutorialStep === 4 && <Activity className={`${gameMode === GameMode.TUTORIAL ? 'w-8 h-8' : 'w-16 h-16'} text-emerald-500`} />}
                    {tutorialStep === 5 && <Play className={`${gameMode === GameMode.TUTORIAL ? 'w-8 h-8' : 'w-16 h-16'} text-red-500`} />}
                  </motion.div>

                  <div className={`${gameMode === GameMode.TUTORIAL ? 'mb-6' : 'mb-12'}`}>
                    <h2 className={`${gameMode === GameMode.TUTORIAL ? 'text-xl' : 'text-3xl md:text-4xl'} font-black uppercase italic tracking-tighter mb-2 text-white`}>
                      {tutorialStep === 0 && "Welcome, Commander"}
                      {tutorialStep === 1 && "The Tech Tree"}
                      {tutorialStep === 2 && "The Armory"}
                      {tutorialStep === 3 && "Deployment"}
                      {tutorialStep === 4 && "Unit Management"}
                      {tutorialStep === 5 && "Combat Protocol"}
                    </h2>
                    <div className="flex flex-col gap-3">
                      <p className={`${gameMode === GameMode.TUTORIAL ? 'text-xs' : 'text-lg'} text-white/60 leading-relaxed max-w-md mx-auto`}>
                        {tutorialStep === 0 && "Welcome to Neon Siege. Your mission is to defend the core against waves of cyber-threats. Let's walk through the basic operations."}
                        {tutorialStep === 1 && "Before you can deploy advanced units, you must research them. Use the 'Tech Tree' button in the sidebar to unlock new turret types and powerful upgrades using Gold earned from combat."}
                        {tutorialStep === 2 && "Once researched, turrets become available in the Armory. Click a turret in the shop to purchase it. Purchased units are stored in your Inventory until you're ready to deploy them."}
                        {tutorialStep === 3 && "To place a turret, select it from your Inventory tab. Then, click any valid empty space on the map grid. Remember: turrets cannot be placed directly on the enemy path!"}
                        {tutorialStep === 4 && "Select a placed turret to see its stats. You can Upgrade it to increase its power or Scrap (Sell) it for 50% of its value if you need to reposition your defenses."}
                        {tutorialStep === 5 && "When your defenses are ready, click 'Deploy Wave' to start the attack. Defeated enemies grant Gold. If enemies reach the end of the path, you lose Lives. Good luck!"}
                      </p>
                      
                      {gameMode === GameMode.TUTORIAL && (
                        <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-center">
                          <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-cyan-400 font-black mb-1">Interactive Task:</p>
                          <p className="text-[10px] md:text-sm text-white font-bold italic">
                            {tutorialStep === 0 && "Click 'Next Protocol' to begin."}
                            {tutorialStep === 1 && "Open the Tech Tree to see available research."}
                            {tutorialStep === 2 && "Switch to the Armory tab in the sidebar."}
                            {tutorialStep === 3 && "Buy a Basic Turret from the Armory."}
                            {tutorialStep === 4 && "Select the turret in 'Inv' and place it on the map."}
                            {tutorialStep === 5 && "Click 'Deploy Wave' to start the simulation."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                    {tutorialStep > 0 && (
                      <button
                        onClick={() => setTutorialStep(prev => prev - 1)}
                        className={`flex-1 rounded-xl font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/5 ${gameMode === GameMode.TUTORIAL ? 'py-3 text-[10px]' : 'py-5'}`}
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (tutorialStep < 5) {
                          setTutorialStep(prev => prev + 1);
                        } else {
                          setShowTutorial(false);
                        }
                      }}
                      className={`flex-[2] rounded-xl font-bold uppercase tracking-widest bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all ${gameMode === GameMode.TUTORIAL ? 'py-3 text-[10px]' : 'py-5'}`}
                    >
                      {tutorialStep < 5 ? "Next Protocol" : "Begin Mission"}
                    </button>
                  </div>

                  <div className="mt-6 flex gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={`dot-${i}`}
                        className={`h-1.5 rounded-full transition-all ${i === tutorialStep ? 'w-6 bg-cyan-500' : 'bg-white/10 w-1.5'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full bg-[#050505] border border-white/10 rounded-[2rem] md:rounded-[3rem] relative overflow-y-auto custom-scrollbar ${isMobile && isLandscape ? 'max-w-3xl p-6 max-h-[95vh]' : 'max-w-4xl p-10 max-h-[80vh]'}`}
            >
              <button 
                onClick={() => {
                  if (selectedLibraryUnit) {
                    setSelectedLibraryUnit(null);
                    setLibraryUnitType(null);
                  } else {
                    setShowLibrary(false);
                  }
                }} 
                className={`absolute text-white/40 hover:text-white ${isMobile && isLandscape ? 'top-4 right-4' : 'top-6 right-6'}`}
              >
                {selectedLibraryUnit ? <ChevronLeft className={`${isMobile && isLandscape ? 'w-4 h-4' : 'w-6 h-6'}`} /> : <X className={`${isMobile && isLandscape ? 'w-4 h-4' : 'w-6 h-6'}`} />}
              </button>

              <AnimatePresence mode="wait">
                {!selectedLibraryUnit ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className={`font-black uppercase italic tracking-tight ${isMobile && isLandscape ? 'text-2xl mb-6' : 'text-4xl mb-12'}`}>Database Library</h2>
                    
                    <div className={`grid gap-8 md:gap-12 ${isMobile && isLandscape ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                      <div>
                        <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 mb-4 md:mb-6 flex items-center gap-2">
                          <Shield className="w-3 h-3 md:w-4 md:h-4" /> Turret Blueprints
                        </h3>
                        <div className={`grid gap-3 md:gap-4 grid-cols-2`}>
                          {(Object.keys(TURRET_CONFIGS) as TurretType[]).map(type => {
                            const isUnlocked = boughtTurrets.has(type);
                            const config = TURRET_CONFIGS[type];
                            return (
                              <button 
                                key={type} 
                                onClick={() => {
                                  if (isUnlocked) {
                                    setSelectedLibraryUnit(type);
                                    setLibraryUnitType('turret');
                                  }
                                }}
                                className={`text-left rounded-2xl border transition-all ${isUnlocked ? 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10' : 'bg-black/40 border-white/5 grayscale opacity-40 cursor-not-allowed'} ${isMobile && isLandscape ? 'p-3' : 'p-4'}`}
                              >
                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                  <div className="p-1.5 md:p-2 rounded-lg bg-white/5" style={{ color: isUnlocked ? config.color : '#444' }}>
                                    {config.icon}
                                  </div>
                                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{isUnlocked ? config.name : 'Unknown'}</span>
                                </div>
                                {isUnlocked && <p className="text-[7px] md:text-[9px] text-white/40 leading-relaxed uppercase line-clamp-2">{config.description}</p>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-4 md:mb-6 flex items-center gap-2">
                          <Activity className="w-3 h-3 md:w-4 md:h-4" /> Enemy Signatures
                        </h3>
                        <div className={`grid gap-3 md:gap-4 grid-cols-2`}>
                          {(Object.values(EnemyType)).map(type => {
                            const isEncountered = encounteredEnemies.has(type);
                            const config = ENEMY_CONFIGS[type];
                            return (
                              <button 
                                key={type} 
                                onClick={() => {
                                  if (isEncountered) {
                                    setSelectedLibraryUnit(type);
                                    setLibraryUnitType('enemy');
                                  }
                                }}
                                className={`text-left rounded-2xl border transition-all ${isEncountered ? 'bg-white/5 border-white/10 hover:border-red-500/50 hover:bg-white/10' : 'bg-black/40 border-white/5 grayscale opacity-40 cursor-not-allowed'} ${isMobile && isLandscape ? 'p-3' : 'p-4'}`}
                              >
                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: isEncountered ? config.color : '#444' }}>
                                    {isEncountered ? config.icon : <Skull className="w-3 h-3 md:w-4 md:h-4 text-white/10" />}
                                  </div>
                                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{isEncountered ? config.name : 'Unknown'}</span>
                                </div>
                                {isEncountered && <p className="text-[7px] md:text-[9px] text-white/40 leading-relaxed uppercase line-clamp-2">{config.description}</p>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full"
                  >
                    {libraryUnitType === 'turret' ? (
                      <>
                        <div className={`flex items-center gap-6 ${isMobile && isLandscape ? 'mb-6' : 'mb-10'}`}>
                          <div className={`${isMobile && isLandscape ? 'w-12 h-12 rounded-xl' : 'w-20 h-20 rounded-3xl'} bg-white/5 flex items-center justify-center border border-white/10`} style={{ color: TURRET_CONFIGS[selectedLibraryUnit as TurretType].color }}>
                            {React.cloneElement(TURRET_CONFIGS[selectedLibraryUnit as TurretType].icon as React.ReactElement, { className: isMobile && isLandscape ? 'w-6 h-6' : 'w-10 h-10' })}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">Tactical Report</span>
                              <div className="h-px w-12 bg-cyan-400/30" />
                            </div>
                            <h2 className={`${isMobile && isLandscape ? 'text-2xl' : 'text-4xl'} font-black uppercase italic tracking-tight`}>{TURRET_CONFIGS[selectedLibraryUnit as TurretType].name}</h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-8">
                            <div>
                              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                <Info className="w-3 h-3" /> Origin & Development
                              </h3>
                              <p className="text-sm text-white/80 leading-relaxed font-medium">{TURRET_CONFIGS[selectedLibraryUnit as TurretType].report.origin}</p>
                            </div>
                            <div>
                              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                <Cpu className="w-3 h-3" /> Technological Basis
                              </h3>
                              <p className="text-sm text-white/80 leading-relaxed font-medium">{TURRET_CONFIGS[selectedLibraryUnit as TurretType].report.tech}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                                  <Plus className="w-3 h-3" /> Strategic Pros
                                </h3>
                                <ul className="space-y-2">
                                  {TURRET_CONFIGS[selectedLibraryUnit as TurretType].report.pros.map((pro, i) => (
                                    <li key={i} className="text-[11px] text-white/60 uppercase font-bold flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-emerald-400" /> {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                                  <Minus className="w-3 h-3" /> Strategic Cons
                                </h3>
                                <ul className="space-y-2">
                                  {TURRET_CONFIGS[selectedLibraryUnit as TurretType].report.cons.map((con, i) => (
                                    <li key={i} className="text-[11px] text-white/60 uppercase font-bold flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-red-400" /> {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Technical Specifications</h3>
                            <div className="space-y-6">
                              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-[10px] font-bold uppercase text-white/40">Damage Output</span>
                                <span className="text-xl font-black font-mono text-white">{TURRET_CONFIGS[selectedLibraryUnit as TurretType].damage}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-[10px] font-bold uppercase text-white/40">Effective Range</span>
                                <span className="text-xl font-black font-mono text-white">{TURRET_CONFIGS[selectedLibraryUnit as TurretType].range}u</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-[10px] font-bold uppercase text-white/40">Fire Interval</span>
                                <span className="text-xl font-black font-mono text-white">{TURRET_CONFIGS[selectedLibraryUnit as TurretType].fireRate}s</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-[10px] font-bold uppercase text-white/40">Targeting Mode</span>
                                <span className="text-xl font-black font-mono text-white uppercase">{TURRET_CONFIGS[selectedLibraryUnit as TurretType].isAOE ? 'Area Effect' : 'Single Point'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`flex items-center gap-6 ${isMobile && isLandscape ? 'mb-6' : 'mb-10'}`}>
                          <div className={`${isMobile && isLandscape ? 'w-12 h-12 rounded-xl' : 'w-20 h-20 rounded-3xl'} bg-white/5 flex items-center justify-center border border-white/10`} style={{ color: ENEMY_CONFIGS[selectedLibraryUnit as EnemyType].color }}>
                            {React.cloneElement(ENEMY_CONFIGS[selectedLibraryUnit as EnemyType].icon as React.ReactElement, { className: isMobile && isLandscape ? 'w-6 h-6' : 'w-10 h-10' })}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">Threat Assessment</span>
                              <div className="h-px w-12 bg-red-500/30" />
                            </div>
                            <h2 className={`${isMobile && isLandscape ? 'text-2xl' : 'text-4xl'} font-black uppercase italic tracking-tight`}>{ENEMY_CONFIGS[selectedLibraryUnit as EnemyType].name}</h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-8">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Threat Level</span>
                              <span className="text-lg font-black uppercase italic text-red-500">{ENEMY_CONFIGS[selectedLibraryUnit as EnemyType].report.threatLevel}</span>
                            </div>
                            <div>
                              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Behavior Pattern
                              </h3>
                              <p className="text-sm text-white/80 leading-relaxed font-medium">{ENEMY_CONFIGS[selectedLibraryUnit as EnemyType].report.behavior}</p>
                            </div>
                            <div>
                              <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Identified Weakness
                              </h3>
                              <p className="text-sm text-white/80 leading-relaxed font-medium">{ENEMY_CONFIGS[selectedLibraryUnit as EnemyType].report.weakness}</p>
                            </div>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Intercepted Data</h3>
                            <div className="relative">
                              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-500/30 rounded-full" />
                              <p className="text-sm text-white/60 leading-relaxed italic font-mono">
                                "{ENEMY_CONFIGS[selectedLibraryUnit as EnemyType].report.data}"
                              </p>
                              <div className="mt-6 flex items-center gap-2 text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">
                                <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
                                Encrypted Stream Decoded
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full bg-[#050505] border border-white/10 rounded-[2rem] relative overflow-y-auto flex flex-col custom-scrollbar ${isMobile && isLandscape ? 'max-w-3xl p-6 max-h-[95vh]' : 'max-w-4xl p-10 max-h-[80vh]'}`}
            >
              <button onClick={() => { setShowAdmin(false); setIsAdminAuthenticated(false); setAdminCode(''); }} className={`absolute text-white/40 hover:text-white ${isMobile && isLandscape ? 'top-4 right-4' : 'top-6 right-6'}`}>
                <X className={`${isMobile && isLandscape ? 'w-4 h-4' : 'w-6 h-6'}`} />
              </button>
              
              {!isAdminAuthenticated ? (
                <div className={`flex flex-col items-center justify-center text-center ${isMobile && isLandscape ? 'py-10' : 'py-20'}`}>
                  <Lock className={`${isMobile && isLandscape ? 'w-10 h-10 mb-4' : 'w-16 h-16 mb-8'} text-white/10`} />
                  <h2 className={`${isMobile && isLandscape ? 'text-xl mb-4' : 'text-3xl mb-8'} font-black uppercase italic tracking-tight`}>Restricted Access</h2>
                  <div className="flex flex-col gap-4 mb-8 w-full max-w-xs">
                    <input
                      type="text"
                      autoFocus
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Enter Protocol Code..."
                      className={`bg-white/5 border border-white/10 rounded-xl text-center font-mono tracking-[0.5em] focus:outline-none focus:border-cyan-500/50 w-full ${isMobile && isLandscape ? 'px-4 py-2 text-sm' : 'px-6 py-4'}`}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                    />
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Press Enter to Authorize</p>
                  </div>
                  <button
                    onClick={handleAdminAuth}
                    className={`bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all ${isMobile && isLandscape ? 'px-8 py-3 text-xs' : 'px-12 py-4'}`}
                  >
                    Authorize
                  </button>
                </div>
              ) : (
                <>
                  <h2 className={`font-black uppercase italic tracking-tight flex items-center gap-4 ${isMobile && isLandscape ? 'text-2xl mb-4' : 'text-4xl mb-8'}`}>
                    <Eye className={`${isMobile && isLandscape ? 'w-6 h-6' : 'w-8 h-8'} text-cyan-400`} /> Transmission Logs
                  </h2>

                  {/* Review Stats Graph */}
                  {feedbackList.length > 0 && (
                    <div className={`bg-white/5 border border-white/10 rounded-[2rem] ${isMobile && isLandscape ? 'p-4 mb-6' : 'p-8 mb-10'}`}>
                      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                        <div className="text-center md:text-left">
                          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-1">Total Rating</p>
                          <div className="flex items-baseline gap-2">
                            <span className={`${isMobile && isLandscape ? 'text-4xl' : 'text-6xl'} font-black text-cyan-400 font-mono`}>
                              {(feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / feedbackList.length).toFixed(1)}
                            </span>
                            <span className="text-xl text-white/20 font-bold">/ 10</span>
                          </div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">{feedbackList.length} Transmissions</p>
                        </div>
                        <div className={`flex-1 w-full grid grid-cols-10 gap-2 items-end ${isMobile && isLandscape ? 'h-20' : 'h-32'}`}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => {
                            const count = feedbackList.filter(f => f.rating === star).length;
                            const percentage = (count / feedbackList.length) * 100;
                            return (
                              <div key={star} className="group relative flex flex-col items-center h-full justify-end">
                                <div 
                                  className="w-full bg-cyan-500/20 group-hover:bg-cyan-500/40 transition-all rounded-t-sm"
                                  style={{ height: `${Math.max(percentage, 2)}%` }}
                                >
                                  {count > 0 && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      {count}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[8px] font-mono text-white/20 mt-2">{star}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                    {feedbackList.length === 0 ? (
                      <div className="text-center py-20 text-white/20 uppercase tracking-widest text-xs">No transmissions recorded</div>
                    ) : (
                      feedbackList.map((item) => (
                        <div key={item.id} className={`bg-white/5 border border-white/10 rounded-2xl ${isMobile && isLandscape ? 'p-4' : 'p-6'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                                <Star className="w-3 h-3 text-cyan-400 fill-current" />
                                <span className="text-xs font-bold text-cyan-400">{item.rating}/10</span>
                              </div>
                              <span className="text-[10px] font-mono text-white/20 uppercase">{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <p className={`text-white/80 leading-relaxed italic ${isMobile && isLandscape ? 'text-xs' : 'text-sm'}`}>"{item.message || 'No message provided.'}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
