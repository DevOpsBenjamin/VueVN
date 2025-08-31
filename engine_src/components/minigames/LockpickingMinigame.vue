<template>
  <div v-if="isActive" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-gray-600">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-amber-400">🔓 Lockpicking Challenge</h2>
        <p class="text-gray-300">Pick the lock before time runs out!</p>
        <div class="mt-2">
          <span class="text-sm text-gray-400">Time: {{ timeLeft }}s | Attempts: {{ attemptsLeft }}</span>
          <div class="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div 
              class="bg-amber-500 h-2 rounded-full transition-all duration-1000"
              :style="{ width: `${(timeLeft / totalTime) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Lock Visualization -->
      <div class="text-center mb-6">
        <div class="inline-block bg-gray-700 rounded-lg p-6 border-2 border-gray-500">
          <div class="text-6xl mb-4">🔒</div>
          
          <!-- Pin Status -->
          <div class="flex justify-center gap-2 mb-4">
            <div 
              v-for="(pin, index) in pins" 
              :key="index"
              class="w-4 h-12 rounded border-2 transition-colors duration-300"
              :class="pin.picked ? 'bg-green-500 border-green-400' : 'bg-red-500 border-red-400'"
            >
              <div 
                class="w-full bg-gray-300 rounded transition-all duration-200"
                :style="{ height: `${pin.position}%`, marginTop: pin.picked ? '0' : 'auto' }"
              ></div>
            </div>
          </div>
          
          <!-- Current Pin Indicator -->
          <div class="text-amber-400 text-sm">
            Working on pin {{ currentPin + 1 }} of {{ pins.length }}
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <!-- Pick Controls -->
        <div>
          <h3 class="font-semibold text-amber-400 mb-3">Lockpick Control</h3>
          <div class="space-y-3">
            <button 
              @click="adjustPick(-5)"
              :disabled="isWorking"
              class="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              ⬆️ Move Pick Up
            </button>
            <button 
              @click="adjustPick(5)"
              :disabled="isWorking"
              class="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              ⬇️ Move Pick Down
            </button>
          </div>
        </div>
        
        <!-- Tension -->
        <div>
          <h3 class="font-semibold text-amber-400 mb-3">Tension Wrench</h3>
          <div class="space-y-3">
            <button 
              @click="applyTension"
              :disabled="isWorking || pins[currentPin].picked"
              class="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              🔧 Apply Tension
            </button>
            <div class="text-center text-gray-400 text-sm">
              Position: {{ pins[currentPin]?.position || 0 }}%<br>
              Target: {{ pins[currentPin]?.target || 0 }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGameState } from '@generate/stores';
import type { MinigameResult } from '@engine/Core/MinigameManager';

const gameState = useGameState();

const isActive = computed(() => gameState.ui?.activeMinigame?.type === 'lockpicking');
const config = computed(() => gameState.ui?.activeMinigame || {});

// Minigame state
const timeLeft = ref(60);
const totalTime = ref(60);
const attemptsLeft = ref(3);
const currentPin = ref(0);
const isWorking = ref(false);

interface Pin {
  target: number;  // Correct position (0-100)
  position: number; // Current position (0-100)
  picked: boolean;
}

const pins = ref<Pin[]>([]);

let gameTimer: NodeJS.Timeout | null = null;

// Initialize game when activated
onMounted(() => {
  if (isActive.value) {
    startGame();
  }
});

onUnmounted(() => {
  if (gameTimer) clearInterval(gameTimer);
});

function startGame() {
  const pinCount = config.value.params?.pins || 5;
  const difficulty = config.value.params?.difficulty || 'medium';
  
  totalTime.value = config.value.timeLimit ? Math.floor(config.value.timeLimit / 1000) : 60;
  timeLeft.value = totalTime.value;
  attemptsLeft.value = config.value.params?.attempts || 3;
  
  // Generate pins with difficulty-based tolerances
  const tolerance = difficulty === 'easy' ? 15 : difficulty === 'hard' ? 5 : 10;
  
  pins.value = Array.from({ length: pinCount }, () => ({
    target: Math.floor(Math.random() * 80) + 10, // 10-90% range
    position: 50, // Start in middle
    picked: false
  }));
  
  currentPin.value = 0;
  
  gameTimer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      timeUp();
    }
  }, 1000);
}

function adjustPick(delta: number) {
  if (!pins.value[currentPin.value] || pins.value[currentPin.value].picked) return;
  
  const pin = pins.value[currentPin.value];
  pin.position = Math.max(0, Math.min(100, pin.position + delta));
}

function applyTension() {
  if (isWorking.value || !pins.value[currentPin.value] || pins.value[currentPin.value].picked) return;
  
  isWorking.value = true;
  const pin = pins.value[currentPin.value];
  const tolerance = config.value.params?.difficulty === 'easy' ? 15 : 
                   config.value.params?.difficulty === 'hard' ? 5 : 10;
  
  setTimeout(() => {
    const distance = Math.abs(pin.position - pin.target);
    
    if (distance <= tolerance) {
      // Success! Pin is picked
      pin.picked = true;
      pin.position = pin.target;
      
      // Move to next unpicked pin
      const nextPin = pins.value.findIndex((p, index) => index > currentPin.value && !p.picked);
      if (nextPin !== -1) {
        currentPin.value = nextPin;
      } else {
        // All pins picked!
        setTimeout(checkWin, 500);
      }
    } else {
      // Failed attempt
      attemptsLeft.value--;
      pin.position = 50; // Reset position
      
      if (attemptsLeft.value <= 0) {
        failMinigame();
        return;
      }
    }
    
    isWorking.value = false;
  }, 800);
}

function checkWin() {
  if (pins.value.every(pin => pin.picked)) {
    endMinigame({
      success: true,
      score: Math.floor((timeLeft.value / totalTime.value) * 100),
      data: {
        timeRemaining: timeLeft.value,
        attemptsUsed: (config.value.params?.attempts || 3) - attemptsLeft.value,
        difficulty: config.value.params?.difficulty
      },
      completionTime: totalTime.value - timeLeft.value
    });
  }
}

function failMinigame() {
  endMinigame({
    success: false,
    score: Math.floor((pins.value.filter(p => p.picked).length / pins.value.length) * 100),
    data: { 
      reason: 'no_attempts',
      pinsCompleted: pins.value.filter(p => p.picked).length
    },
    completionTime: totalTime.value - timeLeft.value
  });
}

function timeUp() {
  const pickedPins = pins.value.filter(p => p.picked).length;
  const allPicked = pickedPins === pins.value.length;
  
  endMinigame({
    success: allPicked,
    score: Math.floor((pickedPins / pins.value.length) * 100),
    data: { 
      reason: 'time_up',
      pinsCompleted: pickedPins
    },
    completionTime: totalTime.value
  });
}

function giveUp() {
  endMinigame({
    success: false,
    score: 0,
    data: { reason: 'gave_up' },
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