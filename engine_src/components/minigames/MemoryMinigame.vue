<template>
  <div v-if="isActive" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="bg-gradient-to-b from-indigo-100 to-purple-200 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-indigo-800">🧠 Memory Challenge</h2>
        <p class="text-purple-600">Remember the sequence and repeat it!</p>
        <div class="mt-2">
          <span class="text-sm text-gray-600">Round: {{ round }} | Score: {{ score }}</span>
          <div v-if="!gameComplete" class="text-sm mt-1">
            <span v-if="phase === 'showing'" class="text-blue-600">👀 Watch carefully...</span>
            <span v-else-if="phase === 'input'" class="text-green-600">🎯 Your turn! Repeat the sequence</span>
            <span v-else-if="phase === 'waiting'" class="text-orange-600">⏳ Get ready...</span>
          </div>
        </div>
      </div>

      <!-- Memory Grid -->
      <div class="flex justify-center mb-6">
        <div 
          class="grid gap-2 p-4 bg-white rounded-lg shadow-inner"
          :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }"
        >
          <button
            v-for="(cell, index) in grid"
            :key="index"
            @click="cellClicked(index)"
            :disabled="phase !== 'input'"
            class="w-16 h-16 rounded-lg border-2 transition-all duration-200 font-bold text-2xl flex items-center justify-center"
            :class="{
              'border-gray-300 bg-gray-100 hover:bg-gray-200': !cell.lit && !cell.showing,
              'border-blue-500 bg-blue-500 text-white': cell.lit && cell.showing,
              'border-green-500 bg-green-500 text-white': cell.correct,
              'border-red-500 bg-red-500 text-white': cell.error,
              'cursor-pointer': phase === 'input',
              'cursor-not-allowed opacity-60': phase !== 'input'
            }"
          >
            {{ cell.lit && cell.showing ? '✨' : '' }}
            {{ cell.correct ? '✅' : '' }}
            {{ cell.error ? '❌' : '' }}
          </button>
        </div>
      </div>

      <!-- Progress -->
      <div class="mb-6">
        <div class="text-center text-sm text-gray-600 mb-2">
          Sequence Progress: {{ userSequence.length }}/{{ targetSequence.length }}
        </div>
        <div class="w-full bg-gray-300 rounded-full h-2">
          <div 
            class="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: targetSequence.length > 0 ? `${(userSequence.length / targetSequence.length) * 100}%` : '0%' }"
          ></div>
        </div>
      </div>

      <!-- Controls -->
      <div v-if="gameComplete" class="text-center mb-6">
        <div class="text-xl font-bold mb-4" :class="lastRoundSuccess ? 'text-green-600' : 'text-red-600'">
          {{ lastRoundSuccess ? '🎉 Perfect!' : '💥 Game Over!' }}
        </div>
        <div class="text-gray-600">
          Final Score: {{ score }} | Rounds Completed: {{ round - 1 }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <button 
          v-if="!gameComplete && phase === 'waiting'"
          @click="startRound"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          🚀 Start Round {{ round }}
        </button>
        
        <button 
          v-if="gameComplete"
          @click="finishGame"
          class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
        >
          ✨ Finish
        </button>
        
        <button 
          @click="giveUp"
          class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
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

const isActive = computed(() => gameState.ui?.activeMinigame?.type === 'memory');
const config = computed(() => gameState.ui?.activeMinigame || {});

// Game state
const round = ref(1);
const score = ref(0);
const phase = ref<'waiting' | 'showing' | 'input' | 'complete'>('waiting');
const gameComplete = ref(false);
const lastRoundSuccess = ref(false);

const gridSize = computed(() => config.value.params?.gridSize || 4);
const maxSequenceLength = computed(() => config.value.params?.sequence || 6);

interface Cell {
  lit: boolean;
  showing: boolean;
  correct: boolean;
  error: boolean;
}

const grid = ref<Cell[]>([]);
const targetSequence = ref<number[]>([]);
const userSequence = ref<number[]>([]);
const startTime = ref(0);

let showTimer: NodeJS.Timeout | null = null;

onMounted(() => {
  if (isActive.value) {
    initGame();
  }
});

onUnmounted(() => {
  if (showTimer) clearTimeout(showTimer);
});

function initGame() {
  const size = gridSize.value;
  grid.value = Array.from({ length: size * size }, () => ({
    lit: false,
    showing: false,
    correct: false,
    error: false
  }));
  
  startTime.value = Date.now();
}

function startRound() {
  phase.value = 'showing';
  userSequence.value = [];
  
  // Clear previous visual states
  grid.value.forEach(cell => {
    cell.lit = false;
    cell.showing = false;
    cell.correct = false;
    cell.error = false;
  });
  
  // Generate sequence for this round (starts with 2, adds 1 each round)
  const sequenceLength = Math.min(1 + round.value, maxSequenceLength.value);
  targetSequence.value = Array.from({ length: sequenceLength }, () => 
    Math.floor(Math.random() * grid.value.length)
  );
  
  // Show the sequence
  showSequence();
}

function showSequence() {
  let index = 0;
  const showNext = () => {
    if (index >= targetSequence.value.length) {
      // Sequence shown, now wait for user input
      setTimeout(() => {
        grid.value.forEach(cell => {
          cell.lit = false;
          cell.showing = false;
        });
        phase.value = 'input';
      }, 500);
      return;
    }
    
    // Light up current cell
    const cellIndex = targetSequence.value[index];
    grid.value[cellIndex].lit = true;
    grid.value[cellIndex].showing = true;
    
    showTimer = setTimeout(() => {
      grid.value[cellIndex].lit = false;
      grid.value[cellIndex].showing = false;
      
      index++;
      showTimer = setTimeout(showNext, 300);
    }, 600);
  };
  
  setTimeout(showNext, 500);
}

function cellClicked(index: number) {
  if (phase.value !== 'input') return;
  
  userSequence.value.push(index);
  const currentStep = userSequence.value.length - 1;
  
  // Check if this step is correct
  if (targetSequence.value[currentStep] === index) {
    // Correct!
    grid.value[index].correct = true;
    
    // Check if sequence is complete
    if (userSequence.value.length === targetSequence.value.length) {
      roundComplete(true);
    }
  } else {
    // Wrong!
    grid.value[index].error = true;
    roundComplete(false);
  }
  
  // Clear visual feedback after a moment
  setTimeout(() => {
    grid.value[index].correct = false;
    grid.value[index].error = false;
  }, 1000);
}

function roundComplete(success: boolean) {
  lastRoundSuccess.value = success;
  
  if (success) {
    score.value += round.value * 10;
    round.value++;
    
    if (round.value > 8 || targetSequence.value.length >= maxSequenceLength.value) {
      // Game complete!
      gameComplete.value = true;
      phase.value = 'complete';
    } else {
      // Next round
      setTimeout(() => {
        phase.value = 'waiting';
      }, 1500);
    }
  } else {
    // Game over
    gameComplete.value = true;
    phase.value = 'complete';
  }
}

function finishGame() {
  endMinigame({
    success: lastRoundSuccess.value,
    score: score.value,
    data: {
      roundsCompleted: round.value - 1,
      perfectGame: round.value > 8,
      gridSize: gridSize.value,
      maxSequenceLength: maxSequenceLength.value
    },
    completionTime: Date.now() - startTime.value
  });
}

function giveUp() {
  endMinigame({
    success: false,
    score: score.value,
    data: { 
      reason: 'gave_up',
      roundsCompleted: Math.max(0, round.value - 1)
    },
    completionTime: Date.now() - startTime.value
  });
}

function endMinigame(result: MinigameResult) {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  
  // Clear UI state
  gameState.ui.activeMinigame = null;
  
  // Notify the minigame manager
  window.dispatchEvent(new CustomEvent('minigame-complete', { detail: result }));
}
</script>