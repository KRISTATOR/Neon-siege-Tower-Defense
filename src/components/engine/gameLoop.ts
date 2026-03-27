import { MutableRefObject } from 'react';
import { Enemy } from './Enemy';
import { EnemyType, Point } from '../types';
import { Turret } from './Turret';
import { SoundManager } from './SoundManager';
import { GRID_SIZE } from '../constants';
import { DIFFICULTY_CONFIGS } from '../data/difficulty';
import { CAMPAIGN_SECTORS } from '../data/maps';

interface GameState {
  enemies: Enemy[];
  turrets: Turret[];
  projectiles: any[];
  particles: any[];
  lives: number;
  gold: number;
  score: number;
  wave: number;
  isGameOver: boolean;
  isPaused: boolean;
  gameTime: number;
  spawnTimer: number;
  enemiesKilled: number;
  totalEnemiesKilled: number;
  totalGoldEarned: number;
  commanderExp: number;
}

export interface GameRefs {
  enemiesRef: MutableRefObject<Enemy[]>;
  turretsRef: MutableRefObject<Turret[]>;
  livesRef: MutableRefObject<number>;
  goldRef: MutableRefObject<number>;
  scoreRef: MutableRefObject<number>;
  waveRef: MutableRefObject<number>;
  gameTimeRef: MutableRefObject<number>;
  spawnTimerRef: MutableRefObject<number>;
  enemiesKilledRef: MutableRefObject<number>;
  totalEnemiesKilledRef: MutableRefObject<number>;
  totalGoldEarnedRef: MutableRefObject<number>;
  commanderExpRef: MutableRefObject<number>;
  isGameOverRef: MutableRefObject<boolean>;
  isPausedRef: MutableRefObject<boolean>;
}

export const updateGameLogic = (
  deltaTime: number,
  refs: GameRefs,
  params: {
    difficulty: any;
    gameMode: any;
    currentSectorIndex: number;
    unlockedSectorCount: number;
    isWaveActive: boolean;
    enemiesToSpawnRef: MutableRefObject<number>;
    waveSpawnTimerRef: MutableRefObject<number>;
    PATHS: Point[][];
    encounteredEnemies: Set<string>;
    user: any;
  },
  callbacks: {
    onGameOver: () => void;
    onWaveComplete: () => void;
    onEnemyKilled: (enemy: Enemy) => void;
    onBaseHit: () => void;
    onEncounterNewEnemy: (type: EnemyType) => void;
    onGoldUpdate: (gold: number) => void;
    onLivesUpdate: (lives: number) => void;
  }
) => {
  const { isGameOverRef, isPausedRef, enemiesRef, turretsRef, livesRef, goldRef, scoreRef, waveRef, gameTimeRef, enemiesKilledRef, totalEnemiesKilledRef, totalGoldEarnedRef, commanderExpRef } = refs;
  const { difficulty, gameMode, currentSectorIndex, unlockedSectorCount, isWaveActive, enemiesToSpawnRef, waveSpawnTimerRef, PATHS, encounteredEnemies, user } = params;
  const { onGameOver, onWaveComplete, onEnemyKilled, onBaseHit, onEncounterNewEnemy, onGoldUpdate, onLivesUpdate } = callbacks;

  if (isGameOverRef.current || isPausedRef.current) return;

  gameTimeRef.current += deltaTime;

  // 1. Spawn Enemies
  if (isWaveActive && enemiesToSpawnRef.current > 0 && difficulty) {
    waveSpawnTimerRef.current += deltaTime;
    if (waveSpawnTimerRef.current > 1000) { // 1 second between spawns
      const config = DIFFICULTY_CONFIGS[difficulty];
      const wave = waveRef.current;
      
      // Base HP and Speed scaling
      const baseHp = (10 + wave * 5) * Math.pow(1.1, wave) * config.scaling;
      const baseSpeed = (1 + wave * 0.02) * Math.pow(1.05, wave * 0.5) * config.scaling;
      
      // Determine Enemy Type
      let type = EnemyType.SQUARE;
      
      if (gameMode === 'ENDLESS' || gameMode === 'SANDBOX') {
        if (wave % 10 === 0 && enemiesToSpawnRef.current === 1) {
          type = EnemyType.STAR; // Boss every 10 waves
        } else if (wave >= 3) {
          const rand = Math.random();
          // Probabilities shift as waves progress
          if (wave >= 8 && rand < 0.2) type = EnemyType.CIRCLE;
          else if (wave >= 5 && rand < 0.4) type = EnemyType.HEXAGON;
        }
      } else if (gameMode === 'CAMPAIGN') {
        const currentSector = CAMPAIGN_SECTORS[currentSectorIndex];
        // Boss on final wave of final sector
        if (currentSectorIndex === 10 && wave === currentSector.wavesToWin && enemiesToSpawnRef.current === 1) {
          type = EnemyType.STAR;
        } else if (wave >= 3) {
          const rand = Math.random();
          if (wave >= 8 && rand < 0.2) type = EnemyType.CIRCLE;
          else if (wave >= 5 && rand < 0.4) type = EnemyType.HEXAGON;
        }
      }
      
      const randomPath = PATHS[Math.floor(Math.random() * PATHS.length)];
      const newEnemy = new Enemy(baseHp, baseSpeed, type, randomPath);
      enemiesRef.current.push(newEnemy);
      enemiesToSpawnRef.current--;
      waveSpawnTimerRef.current = 0;

      if (!encounteredEnemies.has(type)) {
        onEncounterNewEnemy(type);
      }
    }
  }

  // 2. Update Enemies
  for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
    const enemy = enemiesRef.current[i];
    enemy.update(deltaTime);

    // Handle Leaked Enemies
    if (enemy.isLeaked) {
      livesRef.current = Math.max(0, livesRef.current - 1);
      enemiesRef.current.splice(i, 1);
      onBaseHit();
      onLivesUpdate(livesRef.current);
      SoundManager.playBaseHit();

      if (livesRef.current <= 0) {
        isGameOverRef.current = true;
        onGameOver();
      }
    } 
    // Handle Dead Enemies
    else if (enemy.isDead) {
      const bounty = enemy.config.reward;
      
      // Update Stats
      goldRef.current += bounty;
      totalGoldEarnedRef.current += bounty;
      scoreRef.current += Math.floor(enemy.maxHp);
      enemiesKilledRef.current++;
      totalEnemiesKilledRef.current++;
      
      // Commander Experience Scaling
      const expGain = Math.ceil(enemy.maxHp / 10);
      commanderExpRef.current += expGain;
      
      onEnemyKilled(enemy);
      onGoldUpdate(goldRef.current);
      SoundManager.playEnemyDeath();
      enemiesRef.current.splice(i, 1);
    }
  }

  // 3. Update Turrets & Shooting
  turretsRef.current.forEach(turret => {
    turret.update(enemiesRef.current, gameTimeRef.current, deltaTime);
  });

  // 4. Check Wave Completion
  if (isWaveActive && enemiesToSpawnRef.current === 0 && enemiesRef.current.length === 0) {
    onWaveComplete();
  }
};
