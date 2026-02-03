
import React, { useEffect, useRef } from 'react';
import { GameState, Jelly, Food, Enemy, Particle, GameStatus, EnemyType, BackgroundItem, Mission, MissionType, InputType, Skin } from '../types';
import { COLORS, GAME_CONFIG, MISSIONS_LIST } from '../constants';
import { audioManager } from '../utils/audio';

interface GameCanvasProps {
  status: GameStatus;
  currentSkin: Skin;
  onScoreUpdate: (score: number) => void;
  onMissionUpdate: (mission: Mission) => void;
  onGameOver: (finalScore: number) => void;
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

// Utility functions extracted to keep the component clean
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const randomColor = () => COLORS.FOOD[Math.floor(Math.random() * COLORS.FOOD.length)];

const createJelly = (width: number, height: number, skin: Skin): Jelly => ({
  x: width / 2,
  y: height / 2,
  radius: GAME_CONFIG.INITIAL_RADIUS,
  targetRadius: GAME_CONFIG.INITIAL_RADIUS,
  color: skin.color,
  eyeColor: skin.eyeColor,
  vx: 0,
  vy: 0,
});

const getMission = (index: number): Mission => {
  // Use defined list if available
  if (index < MISSIONS_LIST.length) {
    const data = MISSIONS_LIST[index];
    return {
      description: data.description,
      type: data.type as MissionType,
      target: data.target,
      current: 0,
      completed: false,
      reward: data.reward,
    };
  }

  // Procedural Generation for infinite replayability beyond level 50
  const baseIndex = index - MISSIONS_LIST.length;
  const typeCycle = ['EAT', 'SCORE', 'SURVIVE'] as const;
  const type = typeCycle[baseIndex % 3];

  // Scale difficulty: 10% harder each loop
  const multiplier = 1 + (baseIndex + 1) * 0.1;
  const baseReward = 2000;

  let target = 0;
  let description = "";

  if (type === 'EAT') {
    target = Math.floor(150 * multiplier);
    description = `Eat ${target} Snacks`;
  } else if (type === 'SCORE') {
    target = Math.floor(20000 * multiplier);
    description = `Reach ${Math.floor(target / 100 + 100)}% Fatness`;
  } else {
    // Base 5 minutes + 30s per extra level
    const seconds = 300 + (baseIndex * 30);
    target = seconds;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    description = `Survive ${m}m ${s > 0 ? s + 's' : ''}`;
  }

  return {
    description,
    type,
    target,
    current: 0,
    completed: false,
    reward: Math.floor(baseReward * multiplier),
  };
};

const createBackgroundItems = (width: number, height: number): BackgroundItem[] => {
  const items: BackgroundItem[] = [];
  for (let i = 0; i < GAME_CONFIG.BG_ITEM_COUNT; i++) {
    const roll = Math.random();
    let type: 'CLOUD' | 'COMIC_SHAPE' | 'CITY';
    if (roll < 0.4) type = 'CLOUD';
    else if (roll < 0.7) type = 'COMIC_SHAPE';
    else type = 'CITY';

    items.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5, // Slow drift
      vy: (Math.random() - 0.5) * 0.5,
      size: type === 'CITY' ? random(60, 100) : (type === 'CLOUD' ? random(40, 80) : random(30, 60)),
      type,
      rotation: type === 'CITY' ? (Math.random() - 0.5) * 0.2 : Math.random() * Math.PI * 2, // Cities lean less
      rotSpeed: (Math.random() - 0.5) * 0.01,
      variant: Math.floor(Math.random() * 3), // 0: Panel, 1: Burst, 2: Dots (or City variants)
    });
  }
  return items;
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ status, currentSkin, onScoreUpdate, onMissionUpdate, onGameOver, setCanvasRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Mutable game state stored in ref to avoid re-renders during game loop
  const gameStateRef = useRef<GameState>({
    jelly: { x: 0, y: 0, vx: 0, vy: 0, radius: 0, targetRadius: 0, color: '', eyeColor: '' },
    foods: [],
    enemies: [],
    particles: [],
    backgroundItems: [],
    score: 0,
    width: 0,
    height: 0,
    mouse: { x: 0, y: 0 },
    status: 'MENU',
    frameCount: 0,
    mission: getMission(0),
    missionIndex: 0,
    missionCooldown: 0,
    missionTimer: 0,
    inputType: 'MOUSE',
  });

  // Handle skin changes immediately (useful for menu preview)
  useEffect(() => {
    if (gameStateRef.current.status === 'MENU') {
      gameStateRef.current.jelly.color = currentSkin.color;
      gameStateRef.current.jelly.eyeColor = currentSkin.eyeColor;
    }
  }, [currentSkin]);

  // Handle initialization and resets
  useEffect(() => {
    // Only reset game if moving to PLAYING from MENU or GAME_OVER
    // If coming from PAUSED, resume current state
    if (status === 'PLAYING') {
      if (gameStateRef.current.status === 'MENU' || gameStateRef.current.status === 'GAME_OVER') {
        const { width, height } = gameStateRef.current;
        const initialJelly = createJelly(width, height, currentSkin);
        gameStateRef.current = {
          ...gameStateRef.current,
          jelly: initialJelly,
          foods: [],
          enemies: [],
          particles: [],
          score: 0,
          status: 'PLAYING',
          frameCount: 0,
          mouse: { x: width / 2, y: height / 2 },
          // Reset Mission
          missionIndex: 0,
          mission: getMission(0),
          missionCooldown: 0,
          missionTimer: 0,
        };
        // Keep existing background items if they exist, or init if empty
        if (gameStateRef.current.backgroundItems.length === 0) {
          gameStateRef.current.backgroundItems = createBackgroundItems(width, height);
        }
        onScoreUpdate(0);
        onMissionUpdate(gameStateRef.current.mission);
      }
    } else {
      // Silence wobble if we exit playing state (PAUSED, MENU, GAME_OVER)
      audioManager.stopWobble();
    }

    gameStateRef.current.status = status;
  }, [status, onScoreUpdate, onMissionUpdate, currentSkin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setCanvasRef(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize Handler
    const handleResize = () => {
      // High DPI Support
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = window.innerWidth;
      const logicalHeight = window.innerHeight;

      // Set internal resolution to match device pixels for sharpness
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;

      // Set display size to match logical pixels
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;

      // Scale drawing context so we can use logical coordinates
      ctx.scale(dpr, dpr);

      gameStateRef.current.width = logicalWidth;
      gameStateRef.current.height = logicalHeight;

      // Init background if needed (e.g. first load)
      if (gameStateRef.current.backgroundItems.length === 0) {
        gameStateRef.current.backgroundItems = createBackgroundItems(logicalWidth, logicalHeight);
      }

      // If first load/menu, center jelly and target
      if (gameStateRef.current.status === 'MENU') {
        const cx = logicalWidth / 2;
        const cy = logicalHeight / 2;
        gameStateRef.current.jelly.x = cx;
        gameStateRef.current.jelly.y = cy;
        gameStateRef.current.mouse.x = cx;
        gameStateRef.current.mouse.y = cy;

        // Ensure initial jelly has correct skin properties on load
        gameStateRef.current.jelly.color = currentSkin.color;
        gameStateRef.current.jelly.eyeColor = currentSkin.eyeColor;
        gameStateRef.current.jelly.radius = GAME_CONFIG.INITIAL_RADIUS;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // Input Handler Logic
    const updateInput = (x: number, y: number, type: InputType) => {
      gameStateRef.current.mouse.x = x;
      gameStateRef.current.mouse.y = y;
      gameStateRef.current.inputType = type;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateInput(e.clientX, e.clientY, 'MOUSE');
    };

    const handleTouch = (e: TouchEvent) => {
      // Prevent browser scrolling/zooming gestures
      if (e.cancelable) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      if (touch) {
        // touch.clientX is in logical pixels, which matches our system
        updateInput(touch.clientX, touch.clientY, 'TOUCH');
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('touchmove', handleTouch, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);

    // --- GAME LOOP FUNCTIONS ---

    const spawnFood = (state: GameState) => {
      state.foods.push({
        x: random(50, state.width - 50),
        y: random(50, state.height - 50),
        radius: 10,
        color: randomColor(),
        floatOffset: random(0, 100),
        id: Math.random().toString(36).substr(2, 9),
      });
    };

    const spawnEnemy = (state: GameState) => {
      const side = Math.floor(random(0, 4));
      let x, y, vx, vy;

      // Select Enemy Type
      const roll = Math.random();
      let type: EnemyType = 'CLASSIC';
      let speed = random(2, 4);
      let radius = 20;
      let color = COLORS.ENEMY_CLASSIC;

      if (roll < 0.6) {
        // Classic (60%)
        type = 'CLASSIC';
        speed = random(2, 4);
        radius = 20;
        color = COLORS.ENEMY_CLASSIC;
      } else if (roll < 0.85) {
        // Speeder (25%) - Fast, small
        type = 'SPEEDER';
        speed = random(5, 8);
        radius = 12;
        color = COLORS.ENEMY_SPEEDER;
      } else {
        // Chaser (15%) - Slow, tracking
        type = 'CHASER';
        speed = random(1.5, 2.5);
        radius = 25;
        color = COLORS.ENEMY_CHASER;
      }

      if (side === 0) { // Top
        x = random(0, state.width); y = -radius - 10; vx = 0; vy = speed;
      } else if (side === 1) { // Right
        x = state.width + radius + 10; y = random(0, state.height); vx = -speed; vy = 0;
      } else if (side === 2) { // Bottom
        x = random(0, state.width); y = state.height + radius + 10; vx = 0; vy = -speed;
      } else { // Left
        x = -radius - 10; y = random(0, state.height); vx = speed; vy = 0;
      }

      state.enemies.push({
        x, y, vx, vy,
        radius,
        angle: 0,
        id: Math.random().toString(36).substr(2, 9),
        type,
        color
      });
    };

    const createParticles = (state: GameState, x: number, y: number, color: string) => {
      for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
        state.particles.push({
          x, y,
          vx: random(-5, 5),
          vy: random(-5, 5),
          color,
          life: 1.0,
          maxLife: 1.0,
        });
      }
    };

    const update = (dt: number) => {
      const state = gameStateRef.current;

      // Always update background even in menu OR pause
      state.backgroundItems.forEach(item => {
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.rotation += item.rotSpeed * dt;

        // Wrap around screen with buffer
        const buffer = 150;
        if (item.x < -buffer) item.x = state.width + buffer;
        if (item.x > state.width + buffer) item.x = -buffer;
        if (item.y < -buffer) item.y = state.height + buffer;
        if (item.y > state.height + buffer) item.y = -buffer;
      });

      if (state.status !== 'PLAYING') return;

      // 1. Jelly Physics
      const dx = state.mouse.x - state.jelly.x;
      const dy = state.mouse.y - state.jelly.y;

      // Frame-rate independent easing
      // standard easing x += (target - x) * factor
      // time-based x += (target - x) * (1 - (1 - factor)^dt)
      const easing = 1 - Math.pow(1 - GAME_CONFIG.SPEED_EASING, dt);

      state.jelly.x += dx * easing;
      state.jelly.y += dy * easing;

      // Calculate normalized velocity (amount moved per 60fps unit) for visuals/audio
      // This matches previous behavior where vx was exactly dx * easing_constant
      state.jelly.vx = (dx * easing) / (dt || 1);
      state.jelly.vy = (dy * easing) / (dt || 1);

      // Update wobble sound based on speed
      const speed = Math.hypot(state.jelly.vx, state.jelly.vy);
      audioManager.updateWobble(speed);

      // Smooth radius transition
      const radiusEasing = 1 - Math.pow(1 - 0.1, dt);
      state.jelly.radius += (state.jelly.targetRadius - state.jelly.radius) * radiusEasing;

      // Check Game Over by size
      if (state.jelly.targetRadius < GAME_CONFIG.MIN_RADIUS) {
        state.status = 'GAME_OVER';
        audioManager.stopWobble();
        onGameOver(state.score);
        return;
      }

      // 2. Mission Logic
      let missionUpdated = false;

      // Check Completion Cooldown
      if (state.mission.completed) {
        state.missionCooldown -= dt;
        if (state.missionCooldown <= 0) {
          // Load Next Mission
          state.missionIndex++;
          state.mission = getMission(state.missionIndex);
          state.missionTimer = 0;
          missionUpdated = true;
        }
      } else {
        // Update Active Mission
        if (state.mission.type === 'SURVIVE') {
          state.missionTimer += dt;
          // Every 60 units is roughly 1 second
          if (state.missionTimer >= 60) {
            const secondsPassed = Math.floor(state.missionTimer / 60);
            state.mission.current += secondsPassed;
            state.missionTimer -= secondsPassed * 60;
            missionUpdated = true;
          }
        } else if (state.mission.type === 'SCORE') {
          if (state.mission.current !== state.score) {
            state.mission.current = state.score;
            missionUpdated = true;
          }
        }

        // Check Completion
        if (state.mission.current >= state.mission.target) {
          state.mission.completed = true;
          state.score += state.mission.reward;
          state.missionCooldown = GAME_CONFIG.MISSION_COOLDOWN_FRAMES;
          audioManager.playMissionComplete();
          onScoreUpdate(state.score); // Notify score change immediately
          missionUpdated = true;
        }
      }

      if (missionUpdated) {
        onMissionUpdate({ ...state.mission }); // Spread to create new object reference
      }

      // 3. Spawning (Scaled by dt)
      // Probability P for one frame. For dt frames, roughly P * dt for small P.
      if (Math.random() < GAME_CONFIG.FOOD_SPAWN_RATE * dt) spawnFood(state);
      if (Math.random() < GAME_CONFIG.ENEMY_SPAWN_RATE * dt) spawnEnemy(state);

      // 4. Update Foods
      for (let i = state.foods.length - 1; i >= 0; i--) {
        const f = state.foods[i];
        f.y += Math.sin(f.floatOffset + Date.now() / 200) * 0.5 * dt;

        const dist = Math.hypot(state.jelly.x - f.x, state.jelly.y - f.y);
        if (dist < state.jelly.radius + f.radius) {
          createParticles(state, f.x, f.y, f.color);
          audioManager.playEat();
          state.jelly.targetRadius += GAME_CONFIG.RADIUS_GAIN;
          state.score += GAME_CONFIG.SCORE_FOOD;
          onScoreUpdate(state.score);
          state.foods.splice(i, 1);

          // Mission Update: FOOD
          if (state.mission.type === 'EAT' && !state.mission.completed) {
            state.mission.current++;
            onMissionUpdate({ ...state.mission });
          }
        }
      }

      // 5. Update Enemies
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];

        // --- Movement Logic ---
        if (e.type === 'CHASER') {
          // Steering behavior towards jelly
          const angleToPlayer = Math.atan2(state.jelly.y - e.y, state.jelly.x - e.x);
          // Accelerate towards player
          const accel = 0.05 * dt;
          e.vx += Math.cos(angleToPlayer) * accel;
          e.vy += Math.sin(angleToPlayer) * accel;

          // Limit max speed
          const maxSpeed = 2.5;
          const currentSpeed = Math.hypot(e.vx, e.vy);
          if (currentSpeed > maxSpeed) {
            e.vx = (e.vx / currentSpeed) * maxSpeed;
            e.vy = (e.vy / currentSpeed) * maxSpeed;
          }
        }

        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.angle += 0.1 * dt;

        // --- Collision Logic ---
        const dist = Math.hypot(state.jelly.x - e.x, state.jelly.y - e.y);
        if (dist < state.jelly.radius + e.radius) {
          createParticles(state, state.jelly.x, state.jelly.y, e.color);
          audioManager.playHit();
          state.jelly.targetRadius = Math.max(0, state.jelly.targetRadius - GAME_CONFIG.RADIUS_LOSS);
          state.score = Math.max(0, state.score + GAME_CONFIG.SCORE_DAMAGE);
          onScoreUpdate(state.score);
          state.enemies.splice(i, 1);
        }

        // --- Despawn Logic ---
        const margin = e.type === 'CHASER' ? 150 : 50;
        if (e.x < -margin || e.x > state.width + margin || e.y < -margin || e.y > state.height + margin) {
          state.enemies.splice(i, 1);
        }
      }

      // 6. Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.05 * dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }
    };

    const draw = () => {
      const state = gameStateRef.current;
      const { width, height } = state;

      // Clear Screen
      ctx.clearRect(0, 0, width, height);

      // Draw Background (Sky)
      ctx.fillStyle = COLORS.BACKGROUND;
      ctx.fillRect(0, 0, width, height);

      // Background Items
      state.backgroundItems.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

        if (item.type === 'CLOUD') {
          ctx.beginPath();
          ctx.arc(0, 0, item.size, 0, Math.PI * 2);
          ctx.arc(item.size * 0.6, -item.size * 0.2, item.size * 0.7, 0, Math.PI * 2);
          ctx.arc(-item.size * 0.6, -item.size * 0.2, item.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'COMIC_SHAPE') {
          ctx.beginPath();
          if (item.variant === 0) {
            ctx.rect(-item.size / 2, -item.size / 2, item.size, item.size);
          } else if (item.variant === 1) {
            ctx.moveTo(0, -item.size / 2);
            ctx.lineTo(item.size / 2, item.size / 2);
            ctx.lineTo(-item.size / 2, item.size / 2);
          } else {
            ctx.arc(0, 0, item.size / 2, 0, Math.PI * 2);
          }
          ctx.fill();
        } else if (item.type === 'CITY') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(-item.size / 2, -item.size, item.size, item.size * 2);
        }
        ctx.restore();
      });

      // Common Styles for game objects
      ctx.lineWidth = 4;
      ctx.strokeStyle = COLORS.BLACK;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // --- Draw Touch Reticle (only on touch input) ---
      if (state.inputType === 'TOUCH') {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        // Rotating reticle
        const angle = (Date.now() / 500) % (Math.PI * 2);
        ctx.translate(state.mouse.x, state.mouse.y);
        ctx.rotate(angle);
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Inner cross
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.stroke();

        ctx.restore();
      }

      // Particles
      state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Foods
      state.foods.forEach(f => {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(f.x - f.radius * 0.3, f.y - f.radius * 0.3, f.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enemies
      state.enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.fillStyle = e.color;

        if (e.type === 'CLASSIC') {
          ctx.beginPath();
          // Star shape spikes (5 points) matching Hungry Jelly style
          const spikes = 5;
          const outerRadius = e.radius;
          const innerRadius = e.radius / 2;
          for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            const a = (i / (spikes * 2)) * Math.PI * 2;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Central eye
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(0, 0, e.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(0, 0, e.radius * 0.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'SPEEDER') {
          ctx.beginPath();
          ctx.moveTo(e.radius, 0);
          ctx.lineTo(-e.radius, e.radius);
          ctx.lineTo(-e.radius / 2, 0);
          ctx.lineTo(-e.radius, -e.radius);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (e.type === 'CHASER') {
          ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
          ctx.strokeRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(-e.radius * 0.4, -e.radius * 0.3, e.radius * 0.3, 0, Math.PI * 2);
          ctx.arc(e.radius * 0.4, -e.radius * 0.3, e.radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(-e.radius * 0.4, -e.radius * 0.3, e.radius * 0.1, 0, Math.PI * 2);
          ctx.arc(e.radius * 0.4, -e.radius * 0.3, e.radius * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Jelly
      const { jelly } = state;
      // Draw Jelly if playing OR if we are in pause/gameover but it has radius
      if (state.status !== 'MENU' || jelly.radius > 0) {
        ctx.save();
        ctx.translate(jelly.x, jelly.y);

        const speed = Math.hypot(jelly.vx, jelly.vy);
        let angle = Math.atan2(jelly.vy, jelly.vx);
        if (speed < 0.1) angle = 0;

        ctx.rotate(angle);

        const stretchFactor = Math.min(speed * 0.02, 0.4);
        const scaleX = 1 + stretchFactor;
        const scaleY = 1 - stretchFactor * 0.5;

        ctx.scale(scaleX, scaleY);

        ctx.fillStyle = jelly.color;
        ctx.beginPath();
        ctx.arc(0, 0, jelly.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = COLORS.BLACK;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = jelly.eyeColor || 'white';
        const eyeX = jelly.radius * 0.3;
        const eyeY = jelly.radius * 0.35;
        const eyeSize = jelly.radius * 0.25;

        // Eye Offset logic to match Hungry Jelly style (eyes look forward with speed)
        const eyeOffset = Math.min(speed * 0.5, jelly.radius * 0.3);

        ctx.beginPath();
        ctx.arc(eyeX + eyeOffset, -eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupil color contrast logic could go here, but black usually works on all eye colors
        ctx.fillStyle = jelly.eyeColor === '#000000' ? 'white' : 'black';
        const pupilSize = eyeSize * 0.4;
        const pupilOffset = eyeSize * 0.2;
        ctx.beginPath();
        ctx.arc(eyeX + eyeOffset + pupilOffset, -eyeY, pupilSize, 0, Math.PI * 2);
        ctx.arc(eyeX + eyeOffset + pupilOffset, eyeY, pupilSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(-jelly.radius * 0.4, -jelly.radius * 0.4, jelly.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    };

    const animate = (time: number) => {
      // Calculate delta time
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaMS = time - lastTimeRef.current;
      // Cap delta to prevent huge jumps (e.g. if tab was inactive) - max 100ms
      const safeDeltaMS = Math.min(deltaMS, 100);

      // Target 60 FPS (16.66ms per frame). 
      // dt = 1.0 means exactly 60fps speed.
      // dt = 0.5 means 120fps speed.
      const dt = safeDeltaMS / 16.667;

      lastTimeRef.current = time;

      update(dt);
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('contextmenu', handleContextMenu);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      audioManager.stopWobble();
    };
  }, [status, onGameOver, onScoreUpdate, onMissionUpdate, setCanvasRef, currentSkin]);

  return <canvas ref={canvasRef} className="block w-full h-full" style={{ touchAction: 'none' }} />;
};
