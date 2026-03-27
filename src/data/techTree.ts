import { TurretType } from '../types';

export const TECH_TREE_POSITIONS: Record<TurretType, { x: number; y: number }> = {
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
