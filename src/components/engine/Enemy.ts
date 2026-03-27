import { Point, EnemyType } from '../types';
import { GRID_SIZE } from '../constants';
import { ENEMY_CONFIGS, EnemyConfig } from '../data/enemies';

export class Enemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: EnemyType;
  config: EnemyConfig;
  pathIndex: number = 0;
  progress: number = 0; // Distance along current segment
  totalDistance: number = 0; // Total distance traveled
  isDead: boolean = false;
  isLeaked: boolean = false;
  slowTimer: number = 0;

  path: Point[];

  constructor(baseHp: number, baseSpeed: number, type: EnemyType = EnemyType.SQUARE, path: Point[]) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.path = path;
    this.x = this.path[0].x * GRID_SIZE;
    this.y = this.path[0].y * GRID_SIZE;
    this.type = type;
    this.config = ENEMY_CONFIGS[type];
    
    this.maxHp = baseHp * this.config.hpMult;
    this.hp = this.maxHp;
    this.speed = baseSpeed * this.config.speedMult;
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
    ctx.fillStyle = this.slowTimer > 0 ? '#4ade80' : this.config.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;
    
    const size = this.config.size;
    
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
    ctx.fillStyle = this.config.color;
    ctx.fillRect(this.x - size/2 - 5, this.y - size/2 - 10, (size + 10) * (this.hp / this.maxHp), 4);
  }
}
