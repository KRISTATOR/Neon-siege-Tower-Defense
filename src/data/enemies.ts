import { EnemyType } from '../types';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  description: string;
  color: string;
  iconName: string;
  hpMult: number;
  speedMult: number;
  size: number;
  reward: number;
  report: {
    threatLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
    behavior: string;
    weakness: string;
    data: string;
  };
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.SQUARE]: {
    type: EnemyType.SQUARE,
    name: 'Basic Virus',
    description: 'Standard hostile entity.',
    color: '#ef4444',
    iconName: 'Square',
    hpMult: 1,
    speedMult: 1,
    size: 20,
    reward: 5,
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
    iconName: 'Hexagon',
    hpMult: 3,
    speedMult: 0.5,
    size: 24,
    reward: 15,
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
    iconName: 'Circle',
    hpMult: 0.5,
    speedMult: 2,
    size: 16,
    reward: 8,
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
    iconName: 'Star',
    hpMult: 20,
    speedMult: 0.4,
    size: 40,
    reward: 100,
    report: {
      threatLevel: 'Extreme',
      behavior: 'Slow, heavy, and extremely durable.',
      weakness: 'Concentrated fire from all available turrets.',
      data: 'The System Overlord is the ultimate manifestation of the grid\'s corruption. It only appears when the system is under extreme stress, acting as a final safeguard for the virus. Its star-shaped geometry is designed to deflect standard pulse fire, requiring overwhelming force to neutralize.'
    }
  }
};
