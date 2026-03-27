import { TurretType, TurretCategory } from '../types';

export interface TurretConfig {
  type: TurretType;
  category: TurretCategory;
  name: string;
  cost: number;
  unlockCost: number;
  upgradeUnlockCost: number;
  upgradeCost: number;
  range: number;
  damage: number;
  fireRate: number;
  color: string;
  iconName: string;
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

export const TURRET_CONFIGS: Record<TurretType, TurretConfig> = {
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
    iconName: 'Zap',
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
    iconName: 'Target',
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
    iconName: 'Snowflake',
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
    iconName: 'Activity',
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
    iconName: 'Zap',
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
    iconName: 'Flame',
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
    iconName: 'Radio',
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
    iconName: 'Wind',
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
    iconName: 'Target',
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
    iconName: 'Skull',
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
    iconName: 'Flame',
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
    iconName: 'Zap',
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
    iconName: 'Target',
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
    iconName: 'Wind',
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
    iconName: 'Zap',
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

export const EMPTY_INVENTORY: Record<TurretType, { count: number, unlocked: boolean, upgradeUnlocked: boolean }> = Object.values(TurretType).reduce((acc, type) => {
  acc[type as TurretType] = { count: 0, unlocked: type === TurretType.BASIC, upgradeUnlocked: false };
  return acc;
}, {} as any);

export const getTurretDepth = (type: TurretType): number => {
  const config = TURRET_CONFIGS[type];
  if (config.prerequisites.length === 0) return 0;
  return 1 + Math.max(...config.prerequisites.map(getTurretDepth));
};
