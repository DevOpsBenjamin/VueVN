<template>
  <div v-if="isActive" class="fixed inset-0 bg-gradient-to-b from-purple-900 to-blue-900 flex items-center justify-center z-50">
    <div class="bg-black/80 backdrop-blur rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-purple-500">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-purple-300">🎵 Rhythm Challenge</h2>
        <p class="text-blue-300">Hit the notes in perfect rhythm!</p>
        <div class="mt-2 flex justify-center gap-8">
          <span class="text-sm text-gray-300">Score: {{ score }}</span>
          <span class="text-sm text-gray-300">Combo: {{ combo }}x</span>
          <span class="text-sm text-gray-300">{{ notesHit }}/{{ totalNotes }}</span>
        </div>
      </div>

      <!-- Game Area -->
      <div class="relative bg-gray-900/50 rounded-lg p-4 mb-6" style="height: 400px;">
        
        <!-- Hit Zones (bottom) -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <div 
            v-for="(key, index) in keys" 
            :key="index"
            class="w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-150"
            :class="{
              'border-red-500 bg-red-500/20 text-red-300': key.color === 'red',
              'border-blue-500 bg-blue-500/20 text-blue-300': key.color === 'blue', 
              'border-green-500 bg-green-500/20 text-green-300': key.color === 'green',
              'border-yellow-500 bg-yellow-500/20 text-yellow-300': key.color === 'yellow',
              'scale-125 brightness-150': key.pressed
            }"
          >
            {{ key.label }}
          </div>
        </div>

        <!-- Falling Notes -->
        <div 
          v-for="note in activeNotes" 
          :key="note.id"
          class="absolute w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-75"
          :class="{
            'border-red-400 bg-red-400/80 text-white': note.type === 0,
            'border-blue-400 bg-blue-400/80 text-white': note.type === 1,
            'border-green-400 bg-green-400/80 text-white': note.type === 2, 
            'border-yellow-400 bg-yellow-400/80 text-white': note.type === 3
          }"
          :style="{
            left: `${280 + (note.type * 80)}px`,
            top: `${note.y}px`
          }"
        >
          {{ keys[note.type].label }}
        </div>

        <!-- Hit Effects -->
        <div 
          v-for="effect in hitEffects" 
          :key="effect.id"
          class="absolute text-2xl font-bold pointer-events-none"
          :class="{
            'text-green-400': effect.type === 'perfect',
            'text-yellow-400': effect.type === 'good',
            'text-red-400': effect.type === 'miss'
          }"
          :style="{
            left: `${280 + (effect.lane * 80)}px`,
            bottom: '100px',
            opacity: effect.opacity,
            transform: `translateY(-${(1 - effect.opacity) * 50}px)`
          }"
        >
          {{ effect.type.toUpperCase() }}
        </div>
      </div>

      <!-- Controls -->
      <div class="text-center mb-4">
        <p class="text-gray-300 text-sm mb-2">Press the keys when notes reach the bottom!</p>
        <div class="flex justify-center gap-4">
          <span 
            v-for="(key, index) in keys" 
            :key="index"
            class="px-3 py-1 rounded border text-sm"
            :class="`border-${key.color}-500 text-${key.color}-400`"
          >
            {{ key.key }} = {{ key.label }}
          </span>
        </div>
      </div>

      <!-- Progress -->
      <div class="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div 
          class="bg-purple-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-center">
        <button 
          @click="giveUp"
          class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
        >
          😓 Give Up
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameState } from '@generate/stores';
import type { MinigameResult } from '@engine/Core/MinigameManager';

const gameState = useGameState();

const isActive = computed(() => gameState.ui?.activeMinigame?.type === 'rhythm');
const config = computed(() => gameState.ui?.activeMinigame || {});

// Game state
const score = ref(0);
const combo = ref(0);
const notesHit = ref(0);
const totalNotes = ref(0);
const progress = ref(0);

// Key configuration
const keys = [
  { key: 'A', label: '◀', color: 'red', pressed: false },
  { key: 'S', label: '▼', color: 'blue', pressed: false },
  { key: 'D', label: '▲', color: 'green', pressed: false },
  { key: 'F', label: '▶', color: 'yellow', pressed: false }
];

interface Note {
  id: number;
  type: number; // 0-3 for the four keys
  y: number;    // Vertical position
  timestamp: number;
  hit: boolean;
}

interface HitEffect {
  id: number;
  type: 'perfect' | 'good' | 'miss';
  lane: number;
  opacity: number;
}

const activeNotes = ref<Note[]>([]);
const hitEffects = ref<HitEffect[]>([]);
const gameStartTime = ref(0);
const noteSpawnTime = ref(0);

let gameTimer: NodeJS.Timeout | null = null;
let noteId = 0;
let effectId = 0;

// Game configuration
const noteSpeed = 200; // pixels per second
const hitZoneY = 320; // Y position of hit zone
const perfectThreshold = 20;
const goodThreshold = 40;

onMounted(() => {
  if (isActive.value) {
    startGame();
  }
  
  // Add keyboard listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  if (gameTimer) clearInterval(gameTimer);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

function startGame() {
  const duration = config.value.timeLimit || 45000;
  const noteCount = config.value.params?.notes || 20;
  const bpm = config.value.params?.bpm || 120;
  
  totalNotes.value = noteCount;
  gameStartTime.value = Date.now();
  
  // Calculate note spawn intervals based on BPM
  const beatInterval = (60 / bpm) * 1000; // ms per beat
  const spawnInterval = (duration / noteCount);
  
  let notesSpawned = 0;
  
  gameTimer = setInterval(() => {
    const elapsed = Date.now() - gameStartTime.value;
    progress.value = Math.min(100, (elapsed / duration) * 100);
    
    // Spawn notes
    if (notesSpawned < noteCount && elapsed >= noteSpawnTime.value) {
      spawnNote();
      notesSpawned++;
      noteSpawnTime.value += spawnInterval + (Math.random() - 0.5) * (spawnInterval * 0.3);
    }
    
    // Update note positions
    updateNotes();
    
    // Update effects
    updateEffects();
    
    // Check if game is complete
    if (elapsed >= duration && activeNotes.value.length === 0) {
      endGame();
    }
  }, 16); // 60fps
}

function spawnNote() {
  const note: Note = {
    id: noteId++,
    type: Math.floor(Math.random() * 4),
    y: -50,
    timestamp: Date.now(),
    hit: false
  };
  activeNotes.value.push(note);
}

function updateNotes() {
  const now = Date.now();
  
  for (let i = activeNotes.value.length - 1; i >= 0; i--) {
    const note = activeNotes.value[i];
    const elapsed = now - note.timestamp;
    note.y = -50 + (elapsed * noteSpeed) / 1000;
    
    // Remove notes that have gone off-screen
    if (note.y > 450) {
      if (!note.hit) {
        missNote(note.type);
      }
      activeNotes.value.splice(i, 1);
    }
  }
}

function updateEffects() {
  for (let i = hitEffects.value.length - 1; i >= 0; i--) {
    const effect = hitEffects.value[i];
    effect.opacity -= 0.02;
    
    if (effect.opacity <= 0) {
      hitEffects.value.splice(i, 1);
    }
  }
}

function handleKeyDown(event: KeyboardEvent) {
  const keyIndex = keys.findIndex(k => k.key.toLowerCase() === event.key.toLowerCase());
  if (keyIndex === -1) return;
  
  event.preventDefault();
  keys[keyIndex].pressed = true;
  
  // Check for notes to hit
  hitNote(keyIndex);
}

function handleKeyUp(event: KeyboardEvent) {
  const keyIndex = keys.findIndex(k => k.key.toLowerCase() === event.key.toLowerCase());
  if (keyIndex === -1) return;
  
  keys[keyIndex].pressed = false;
}

function hitNote(lane: number) {
  // Find the closest note in this lane
  let closestNote: Note | null = null;
  let closestDistance = Infinity;
  
  for (const note of activeNotes.value) {
    if (note.type === lane && !note.hit) {
      const distance = Math.abs(note.y - hitZoneY);
      if (distance < closestDistance) {
        closestNote = note;
        closestDistance = distance;
      }
    }
  }
  
  if (!closestNote) return;
  
  let hitType: 'perfect' | 'good' | 'miss';
  let points = 0;
  
  if (closestDistance <= perfectThreshold) {
    hitType = 'perfect';
    points = 100;
    combo.value++;
  } else if (closestDistance <= goodThreshold) {
    hitType = 'good';
    points = 50;
    combo.value++;
  } else {
    hitType = 'miss';
    combo.value = 0;
  }
  
  if (hitType !== 'miss') {
    closestNote.hit = true;
    notesHit.value++;
    score.value += points * Math.max(1, Math.floor(combo.value / 5));
  }
  
  // Show hit effect
  showHitEffect(hitType, lane);
}

function missNote(lane: number) {
  combo.value = 0;
  showHitEffect('miss', lane);
}

function showHitEffect(type: 'perfect' | 'good' | 'miss', lane: number) {
  hitEffects.value.push({
    id: effectId++,
    type,
    lane,
    opacity: 1
  });
}

function endGame() {
  const accuracy = totalNotes.value > 0 ? (notesHit.value / totalNotes.value) * 100 : 0;
  const success = accuracy >= 60; // 60% accuracy for success
  
  endMinigame({
    success,
    score: score.value,
    data: {
      accuracy,
      notesHit: notesHit.value,
      totalNotes: totalNotes.value,
      maxCombo: combo.value,
      song: config.value.params?.song
    },
    completionTime: Date.now() - gameStartTime.value
  });
}

function giveUp() {
  endMinigame({
    success: false,
    score: score.value,
    data: { reason: 'gave_up', accuracy: (notesHit.value / Math.max(1, totalNotes.value)) * 100 },
    completionTime: Date.now() - gameStartTime.value
  });
}

function endMinigame(result: MinigameResult) {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  
  // Clear UI state
  gameState.ui.activeMinigame = null;
  
  // Notify the minigame manager
  window.dispatchEvent(new CustomEvent('minigame-complete', { detail: result }));
}
</script>