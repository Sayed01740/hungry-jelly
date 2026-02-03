
import { Skin } from "./types";

export const COLORS = {
  BACKGROUND: '#87CEEB',
  JELLY: '#FF69B4',
  ENEMY_CLASSIC: '#FF4500', // Red-Orange
  ENEMY_SPEEDER: '#800080', // Purple
  ENEMY_CHASER: '#8B0000',  // Dark Red
  FOOD: ['#FFD700', '#ADFF2F', '#00FFFF', '#FFA500'],
  WHITE: '#FFFFFF',
  BLACK: '#000000',
};

export const GAME_CONFIG = {
  INITIAL_RADIUS: 30,
  SPEED_EASING: 0.08,
  FOOD_SPAWN_RATE: 0.02,
  ENEMY_SPAWN_RATE: 0.015, // Slightly increased spawn rate for variety
  SCORE_FOOD: 10,
  SCORE_DAMAGE: -50,
  RADIUS_GAIN: 2,
  RADIUS_LOSS: 10,
  MIN_RADIUS: 10,
  PARTICLE_COUNT: 8,
  BG_ITEM_COUNT: 18,
  MISSION_COOLDOWN_FRAMES: 120, // 2 seconds between missions
};

export const SKINS: Skin[] = [
  { 
    id: 'classic', 
    name: 'Classic Pink', 
    color: '#FF69B4', 
    eyeColor: '#FFFFFF', 
    unlockScore: 0, 
    description: "The original jelly flavor." 
  },
  { 
    id: 'blueberry', 
    name: 'Blueberry', 
    color: '#4169E1', 
    eyeColor: '#FFD700', 
    unlockScore: 500, 
    description: "A cool blue vibe. Unlock at 500%." 
  },
  { 
    id: 'lime', 
    name: 'Sour Lime', 
    color: '#32CD32', 
    eyeColor: '#000000', 
    unlockScore: 1500, 
    description: "Zesty and dangerous. Unlock at 1500%." 
  },
  { 
    id: 'grape', 
    name: 'Royal Grape', 
    color: '#9932CC', 
    eyeColor: '#00FFFF', 
    unlockScore: 3000, 
    description: "For royalty only. Unlock at 3000%." 
  },
  { 
    id: 'magma', 
    name: 'Magma', 
    color: '#FF4500', 
    eyeColor: '#FFFF00', 
    unlockScore: 5000, 
    description: "Hot to the touch! Unlock at 5000%." 
  },
  { 
    id: 'midnight', 
    name: 'Midnight', 
    color: '#191970', 
    eyeColor: '#00FF00', 
    unlockScore: 8000, 
    description: "Stealthy mode. Unlock at 8000%." 
  },
  { 
    id: 'golden', 
    name: 'Golden God', 
    color: '#FFD700', 
    eyeColor: '#FFFFFF', 
    unlockScore: 10000, 
    description: "Pure luxury. Unlock at 10000%." 
  }
];

export const MISSIONS_LIST = [
  // 1-10: Beginner
  { type: 'EAT', target: 5, description: "Eat 5 Snacks", reward: 50 },
  { type: 'SCORE', target: 100, description: "Reach 200% Fatness", reward: 50 },
  { type: 'SURVIVE', target: 15, description: "Survive 15 Seconds", reward: 50 },
  { type: 'EAT', target: 10, description: "Eat 10 Snacks", reward: 75 },
  { type: 'SCORE', target: 300, description: "Reach 400% Fatness", reward: 75 },
  { type: 'SURVIVE', target: 30, description: "Survive 30 Seconds", reward: 75 },
  { type: 'EAT', target: 15, description: "Eat 15 Snacks", reward: 100 },
  { type: 'SCORE', target: 600, description: "Reach 700% Fatness", reward: 100 },
  { type: 'SURVIVE', target: 45, description: "Survive 45 Seconds", reward: 100 },
  { type: 'EAT', target: 20, description: "Eat 20 Snacks", reward: 150 },

  // 11-20: Intermediate
  { type: 'SCORE', target: 1000, description: "Reach 1100% Fatness", reward: 150 },
  { type: 'SURVIVE', target: 60, description: "Survive 60 Seconds", reward: 150 },
  { type: 'EAT', target: 25, description: "Eat 25 Snacks", reward: 200 },
  { type: 'SCORE', target: 1500, description: "Reach 1600% Fatness", reward: 200 },
  { type: 'SURVIVE', target: 75, description: "Survive 75 Seconds", reward: 200 },
  { type: 'EAT', target: 30, description: "Eat 30 Snacks", reward: 250 },
  { type: 'SCORE', target: 2000, description: "Reach 2100% Fatness", reward: 250 },
  { type: 'SURVIVE', target: 90, description: "Survive 90 Seconds", reward: 250 },
  { type: 'EAT', target: 35, description: "Eat 35 Snacks", reward: 300 },
  { type: 'SCORE', target: 2500, description: "Reach 2600% Fatness", reward: 300 },

  // 21-30: Advanced
  { type: 'SURVIVE', target: 100, description: "Survive 100 Seconds", reward: 300 },
  { type: 'EAT', target: 40, description: "Eat 40 Snacks", reward: 350 },
  { type: 'SCORE', target: 3200, description: "Reach 3300% Fatness", reward: 350 },
  { type: 'SURVIVE', target: 120, description: "Survive 2 Minutes", reward: 350 },
  { type: 'EAT', target: 45, description: "Eat 45 Snacks", reward: 400 },
  { type: 'SCORE', target: 4000, description: "Reach 4100% Fatness", reward: 400 },
  { type: 'SURVIVE', target: 150, description: "Survive 2.5 Minutes", reward: 400 },
  { type: 'EAT', target: 50, description: "Eat 50 Snacks", reward: 450 },
  { type: 'SCORE', target: 5000, description: "Reach 5100% Fatness", reward: 450 },
  { type: 'SURVIVE', target: 180, description: "Survive 3 Minutes", reward: 500 },

  // 31-40: Expert
  { type: 'EAT', target: 60, description: "Eat 60 Snacks", reward: 500 },
  { type: 'SCORE', target: 6000, description: "Reach 6100% Fatness", reward: 550 },
  { type: 'SURVIVE', target: 200, description: "Survive 3m 20s", reward: 600 },
  { type: 'EAT', target: 70, description: "Eat 70 Snacks", reward: 650 },
  { type: 'SCORE', target: 7500, description: "Reach 7600% Fatness", reward: 700 },
  { type: 'SURVIVE', target: 220, description: "Survive 3m 40s", reward: 750 },
  { type: 'EAT', target: 80, description: "Eat 80 Snacks", reward: 800 },
  { type: 'SCORE', target: 9000, description: "Reach 9100% Fatness", reward: 850 },
  { type: 'SURVIVE', target: 240, description: "Survive 4 Minutes", reward: 900 },
  { type: 'EAT', target: 90, description: "Eat 90 Snacks", reward: 950 },

  // 41-50: Master
  { type: 'SCORE', target: 10000, description: "Reach 10100% Fatness", reward: 1000 },
  { type: 'SURVIVE', target: 300, description: "Survive 5 Minutes", reward: 1100 },
  { type: 'EAT', target: 100, description: "Eat 100 Snacks", reward: 1200 },
  { type: 'SCORE', target: 12000, description: "Reach 12100% Fatness", reward: 1300 },
  { type: 'SURVIVE', target: 360, description: "Survive 6 Minutes", reward: 1400 },
  { type: 'EAT', target: 120, description: "Eat 120 Snacks", reward: 1500 },
  { type: 'SCORE', target: 15000, description: "Reach 15100% Fatness", reward: 1600 },
  { type: 'SURVIVE', target: 420, description: "Survive 7 Minutes", reward: 1700 },
  { type: 'EAT', target: 150, description: "Eat 150 Snacks", reward: 1800 },
  { type: 'SCORE', target: 20000, description: "Reach 20100% Fatness", reward: 2000 },
];
