<template>
  <div v-if="isActive" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">🎮 {{ minigameTitle }}</h2>
        <p class="text-gray-600">{{ minigameDescription }}</p>
        <div class="mt-2">
          <span class="text-sm text-gray-500">Time: {{ timeLeft }}s</span>
          <div class="w-full bg-gray-300 rounded-full h-2 mt-1">
            <div 
              class="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              :style="{ width: `${(timeLeft / totalTime) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Generic Content Area -->
      <div class="bg-white rounded-lg p-8 mb-6 text-center min-h-48 flex flex-col justify-center">
        <div class="text-6xl mb-4">{{ minigameIcon }}</div>
        <div class="text-lg text-gray-700 mb-4">
          {{ statusMessage }}
        </div>
        <div class="text-sm text-gray-500">
          Score: {{ score }}
        </div>
      </div>

      <!-- Generic Controls -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button 
          @click="performAction('left')"
          :disabled="!canPerformActions"
          class="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          ⬅️ Action 1
        </button>
        <button 
          @click="performAction('right')"
          :disabled="!canPerformActions"
          class="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          ➡️ Action 2
        </button>
        <button 
          @click="performAction('up')"
          :disabled="!canPerformActions"
          class="p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          ⬆️ Action 3
        </button>
        <button 
          @click="performAction('down')"
          :disabled="!canPerformActions"
          class="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          ⬇️ Action 4
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <button 
          @click="finishMinigame"
          :disabled="timeLeft > 0"
          class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          ✅ Complete
        </button>
        <button 
          @click="giveUp"
          class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
        >
          😓 Give Up
        </button>
      </div>

      <!-- Debug Info (if in development) -->
      <div v-if="isDevelopment" class="mt-6 p-4 bg-yellow-100 rounded-lg text-sm">
        <div class="font-semibold text-yellow-800 mb-2">Debug Info:</div>
        <div class="text-yellow-700">
          <div>Minigame Type: {{ config.type }}</div>
          <div>Difficulty: {{ config.difficulty }}</div>
          <div>Custom Params: {{ JSON.stringify(config.params) }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameState } from '@generate/stores';
import type { MinigameResult } from '@engine/Core/MinigameManager';

const gameState = useGameState();

const isActive = computed(() => gameState.ui?.activeMinigame?.type && !isKnownMinigameType(gameState.ui.activeMinigame.type));
const config = computed(() => gameState.ui?.activeMinigame || {});

// Check if this is a known minigame type that has its own component
function isKnownMinigameType(type: string): boolean {
  return ['cooking', 'lockpicking', 'rhythm', 'memory', 'dialogue_choice'].includes(type);
}

// Game state
const timeLeft = ref(30);
const totalTime = ref(30);
const score = ref(0);
const actionCount = ref(0);
const canPerformActions = ref(true);
const startTime = ref(0);

// Dynamic content based on minigame type
const minigameTitle = computed(() => {
  const type = config.value.type || 'Unknown';
  return `${type.charAt(0).toUpperCase() + type.slice(1)} Challenge`;
});

const minigameDescription = computed(() => {
  return config.value.params?.description || 'Complete the challenge before time runs out!';
});

const minigameIcon = computed(() => {
  const icons: Record<string, string> = {
    'puzzle': '🧩',
    'racing': '🏎️',
    'shooting': '🎯',
    'platformer': '🏃',
    'strategy': '♟️',
    'adventure': '🗺️'
  };
  return icons[config.value.type || ''] || '🎮';
});

const statusMessage = computed(() => {
  if (timeLeft.value <= 0) return 'Time\'s up!';
  if (actionCount.value === 0) return 'Click the action buttons to play!';
  if (actionCount.value < 5) return 'Keep going...';
  if (actionCount.value < 10) return 'You\'re doing great!';
  return 'Almost there!';
});

const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV;
});

let gameTimer: NodeJS.Timeout | null = null;

onMounted(() => {
  if (isActive.value) {
    startGame();
  }
});

onUnmounted(() => {
  if (gameTimer) clearInterval(gameTimer);
});

function startGame() {
  totalTime.value = config.value.timeLimit ? Math.floor(config.value.timeLimit / 1000) : 30;
  timeLeft.value = totalTime.value;
  startTime.value = Date.now();
  
  gameTimer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      timeUp();
    }
  }, 1000);
}

function performAction(action: string) {
  if (!canPerformActions.value) return;
  
  actionCount.value++;
  
  // Simple scoring: each action gives random points
  const points = Math.floor(Math.random() * 20) + 5;
  score.value += points;
  
  // Add some variety based on action type
  const bonusMessages = {
    left: '⬅️ Swift move!',
    right: '➡️ Nice timing!',
    up: '⬆️ Great choice!',
    down: '⬇️ Perfect!'
  };
  
  // Show brief feedback (you could expand this)
  console.log(bonusMessages[action as keyof typeof bonusMessages] || 'Good move!');
}

function timeUp() {
  canPerformActions.value = false;
  
  setTimeout(() => {
    finishMinigame();
  }, 1000);
}

function finishMinigame() {
  // Simple success criteria: score above 50 or performed enough actions
  const success = score.value >= 50 || actionCount.value >= 10;
  
  endMinigame({
    success,
    score: score.value,
    data: {
      actionsPerformed: actionCount.value,
      minigameType: config.value.type,
      timeRemaining: Math.max(0, timeLeft.value)
    },
    completionTime: totalTime.value - Math.max(0, timeLeft.value)
  });
}

function giveUp() {
  endMinigame({
    success: false,
    score: score.value,
    data: { 
      reason: 'gave_up',
      actionsPerformed: actionCount.value
    },
    completionTime: totalTime.value - timeLeft.value
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