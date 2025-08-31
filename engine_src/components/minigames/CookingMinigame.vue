<template>
  <div v-if="isActive" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="bg-gradient-to-b from-orange-100 to-orange-200 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-orange-800">🍳 Cooking Challenge</h2>
        <p class="text-orange-600">Make the perfect {{ recipe }}!</p>
        <div class="mt-2">
          <span class="text-sm text-gray-600">Time: {{ timeLeft }}s</span>
          <div class="w-full bg-gray-300 rounded-full h-2 mt-1">
            <div 
              class="bg-orange-500 h-2 rounded-full transition-all duration-1000"
              :style="{ width: `${(timeLeft / totalTime) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Cooking Interface -->
      <div class="grid grid-cols-2 gap-6">
        
        <!-- Ingredients -->
        <div>
          <h3 class="font-semibold text-orange-700 mb-3">Available Ingredients</h3>
          <div class="space-y-2">
            <button 
              v-for="ingredient in availableIngredients" 
              :key="ingredient"
              @click="addIngredient(ingredient)"
              :disabled="!canAddIngredient(ingredient)"
              class="w-full p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="text-lg mr-2">{{ getIngredientEmoji(ingredient) }}</span>
              {{ ingredient }}
              <span v-if="ingredientCounts[ingredient]" class="ml-2 text-sm text-orange-600">
                ({{ ingredientCounts[ingredient] }})
              </span>
            </button>
          </div>
        </div>

        <!-- Recipe Progress -->
        <div>
          <h3 class="font-semibold text-orange-700 mb-3">Your {{ recipe }}</h3>
          <div class="bg-white rounded-lg p-4 min-h-48">
            <div v-if="addedIngredients.length === 0" class="text-gray-400 text-center mt-8">
              Start adding ingredients...
            </div>
            <div v-else>
              <div v-for="(ingredient, index) in addedIngredients" :key="index" class="flex items-center justify-between py-2 border-b border-gray-200">
                <span>
                  <span class="text-lg mr-2">{{ getIngredientEmoji(ingredient) }}</span>
                  {{ ingredient }}
                </span>
                <button @click="removeIngredient(index)" class="text-red-500 hover:text-red-700">
                  ❌
                </button>
              </div>
              <div class="mt-4 text-center">
                <div class="text-lg">Quality: {{ getQualityText() }}</div>
                <div class="text-sm text-gray-600">Score: {{ currentScore }}/100</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 mt-6">
        <button 
          @click="finishCooking"
          :disabled="addedIngredients.length < 2"
          class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🍽️ Finish Cooking
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

const isActive = computed(() => gameState.ui?.activeMinigame?.type === 'cooking');
const config = computed(() => gameState.ui?.activeMinigame || {});

// Minigame state
const timeLeft = ref(30);
const totalTime = ref(30);
const addedIngredients = ref<string[]>([]);
const ingredientCounts = ref<Record<string, number>>({});

const availableIngredients = computed(() => config.value.params?.ingredients || ['flour', 'eggs', 'milk', 'butter', 'sugar']);
const recipe = computed(() => config.value.params?.recipe || 'dish');

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
  totalTime.value = config.value.timeLimit ? Math.floor(config.value.timeLimit / 1000) : 30;
  timeLeft.value = totalTime.value;
  
  gameTimer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      timeUp();
    }
  }, 1000);
}

function addIngredient(ingredient: string) {
  if (canAddIngredient(ingredient)) {
    addedIngredients.value.push(ingredient);
    ingredientCounts.value[ingredient] = (ingredientCounts.value[ingredient] || 0) + 1;
  }
}

function removeIngredient(index: number) {
  const ingredient = addedIngredients.value[index];
  addedIngredients.value.splice(index, 1);
  ingredientCounts.value[ingredient]--;
  if (ingredientCounts.value[ingredient] <= 0) {
    delete ingredientCounts.value[ingredient];
  }
}

function canAddIngredient(ingredient: string): boolean {
  const maxPerIngredient = 3;
  return (ingredientCounts.value[ingredient] || 0) < maxPerIngredient;
}

function getIngredientEmoji(ingredient: string): string {
  const emojis: Record<string, string> = {
    'flour': '🌾',
    'eggs': '🥚', 
    'milk': '🥛',
    'butter': '🧈',
    'sugar': '🍯',
    'chocolate': '🍫',
    'vanilla': '🌰',
    'salt': '🧂'
  };
  return emojis[ingredient] || '🥄';
}

const currentScore = computed(() => {
  let score = 0;
  
  // Perfect recipe scoring
  const perfectRecipe: Record<string, string[]> = {
    'pancakes': ['flour', 'eggs', 'milk'],
    'cookies': ['flour', 'butter', 'sugar'],
    'cake': ['flour', 'eggs', 'milk', 'sugar']
  };
  
  const requiredIngredients = perfectRecipe[recipe.value] || ['flour', 'eggs'];
  
  // Score for having required ingredients
  requiredIngredients.forEach(required => {
    if (ingredientCounts.value[required]) {
      score += 30;
    }
  });
  
  // Bonus for perfect amounts
  const idealAmounts: Record<string, number> = {
    'flour': 2,
    'eggs': 1, 
    'milk': 1,
    'butter': 1,
    'sugar': 1
  };
  
  Object.entries(ingredientCounts.value).forEach(([ingredient, count]) => {
    const ideal = idealAmounts[ingredient] || 1;
    if (count === ideal) {
      score += 10;
    } else if (Math.abs(count - ideal) === 1) {
      score += 5;
    }
  });
  
  return Math.min(100, Math.max(0, score));
});

function getQualityText(): string {
  const score = currentScore.value;
  if (score >= 90) return '🌟 Perfect!';
  if (score >= 70) return '😊 Great!';
  if (score >= 50) return '👍 Good';
  if (score >= 30) return '😐 Okay';
  return '😵 Disaster...';
}

function finishCooking() {
  endMinigame({
    success: currentScore.value >= 50,
    score: currentScore.value,
    data: {
      recipe: recipe.value,
      ingredients: [...addedIngredients.value],
      timeRemaining: timeLeft.value
    },
    completionTime: totalTime.value - timeLeft.value
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

function timeUp() {
  endMinigame({
    success: currentScore.value >= 30, // Lower threshold for time up
    score: currentScore.value,
    data: { 
      recipe: recipe.value,
      ingredients: [...addedIngredients.value],
      reason: 'time_up'
    },
    completionTime: totalTime.value
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
  // This would be handled by a global minigame manager
  window.dispatchEvent(new CustomEvent('minigame-complete', { detail: result }));
}
</script>