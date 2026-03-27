import { SoundManager } from './SoundManager';
import { GRID_SIZE } from '../constants';
import { Enemy } from './Enemy';
import { TurretType } from '../types';
import { TURRET_CONFIGS, TurretConfig } from '../data/turrets';

export class Turret {
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

  update(enemies: Enemy[], currentTime: number, deltaTime: number) {
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
    this.angle += angleDiff * 0.15 * (deltaTime / 16.67);

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
