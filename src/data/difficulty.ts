export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface DifficultyConfig {
  gold: number;
  lives: number;
  scaling: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.EASY]: { gold: 300, lives: 30, scaling: 1.05 },
  [Difficulty.MEDIUM]: { gold: 200, lives: 15, scaling: 1.15 },
  [Difficulty.HARD]: { gold: 100, lives: 10, scaling: 1.3 }
};
