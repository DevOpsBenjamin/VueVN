<template>
  <div v-if="isActive" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="bg-gradient-to-b from-rose-100 to-pink-200 rounded-xl p-8 max-w-3xl w-full mx-4 shadow-2xl">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-rose-800">💬 Quick Response Challenge</h2>
        <p class="text-pink-600">Choose the best response under pressure!</p>
        <div class="mt-2">
          <div class="flex justify-center gap-4 text-sm text-gray-600">
            <span>Round: {{ currentRound }}/{{ totalRounds }}</span>
            <span>Score: {{ score }}</span>
            <span v-if="timeLeft > 0" class="text-red-600 font-semibold">⏰ {{ timeLeft }}s</span>
          </div>
          <div class="w-full bg-gray-300 rounded-full h-2 mt-2">
            <div 
              class="bg-rose-500 h-2 rounded-full transition-all duration-1000"
              :style="{ width: `${(timeLeft / maxTimePerRound) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Scenario -->
      <div class="bg-white rounded-lg p-6 mb-6 shadow-inner">
        <div class="mb-4">
          <div class="text-sm text-gray-500 mb-2">{{ scenarios[currentScenarioIndex]?.context }}</div>
          <div class="text-lg font-medium text-gray-800">
            "{{ scenarios[currentScenarioIndex]?.dialogue }}"
          </div>
        </div>
        
        <!-- Character emotion/mood indicator -->
        <div class="text-center">
          <span class="text-3xl">{{ scenarios[currentScenarioIndex]?.emotion }}</span>
          <div class="text-sm text-gray-600">{{ scenarios[currentScenarioIndex]?.mood }}</div>
        </div>
      </div>

      <!-- Response Options -->
      <div class="space-y-3 mb-6">
        <button
          v-for="(option, index) in scenarios[currentScenarioIndex]?.options || []"
          :key="index"
          @click="selectResponse(index)"
          :disabled="selectedResponse !== null"
          class="w-full p-4 text-left rounded-lg border-2 transition-all duration-300"
          :class="{
            'border-gray-300 bg-white hover:border-rose-300 hover:bg-rose-50': selectedResponse === null,
            'border-green-500 bg-green-100': selectedResponse === index && option.score > 70,
            'border-yellow-500 bg-yellow-100': selectedResponse === index && option.score >= 40 && option.score <= 70,
            'border-red-500 bg-red-100': selectedResponse === index && option.score < 40,
            'opacity-50': selectedResponse !== null && selectedResponse !== index
          }"
        >
          <div class="flex justify-between items-center">
            <span class="font-medium">{{ option.text }}</span>
            <div v-if="selectedResponse === index" class="flex items-center gap-2">
              <span class="text-sm">{{ option.score }}pts</span>
              <span v-if="option.score > 70">🎯</span>
              <span v-else-if="option.score >= 40">👍</span>
              <span v-else>💥</span>
            </div>
          </div>
          <div v-if="selectedResponse === index && option.result" class="text-sm text-gray-600 mt-2">
            Result: {{ option.result }}
          </div>
        </button>
      </div>

      <!-- Game Status -->
      <div v-if="gameComplete" class="text-center mb-6">
        <div class="text-xl font-bold mb-2" :class="finalScore >= winThreshold ? 'text-green-600' : 'text-red-600'">
          {{ finalScore >= winThreshold ? '🎉 Excellent Communication!' : '😅 Could Use Some Practice!' }}
        </div>
        <div class="text-gray-600">
          Final Score: {{ finalScore }}/{{ maxPossibleScore }} ({{ Math.round((finalScore / maxPossibleScore) * 100) }}%)
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <button 
          v-if="selectedResponse !== null && !gameComplete"
          @click="nextRound"
          class="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
        >
          ➡️ Next Scenario
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

const isActive = computed(() => gameState.ui?.activeMinigame?.type === 'dialogue_choice');
const config = computed(() => gameState.ui?.activeMinigame || {});

// Game state
const currentRound = ref(1);
const totalRounds = ref(5);
const score = ref(0);
const timeLeft = ref(15);
const maxTimePerRound = ref(15);
const selectedResponse = ref<number | null>(null);
const currentScenarioIndex = ref(0);
const gameComplete = ref(false);
const startTime = ref(0);

const finalScore = computed(() => score.value);
const maxPossibleScore = computed(() => totalRounds.value * 100);
const winThreshold = computed(() => Math.floor(maxPossibleScore.value * 0.6)); // 60% to win

interface ResponseOption {
  text: string;
  score: number; // 0-100
  result: string;
}

interface Scenario {
  context: string;
  dialogue: string;
  emotion: string;
  mood: string;
  options: ResponseOption[];
}

const scenarios = ref<Scenario[]>([
  {
    context: "Your friend seems upset about something at work",
    dialogue: "I can't believe my boss gave the promotion to someone else again...",
    emotion: "😤",
    mood: "Frustrated",
    options: [
      { text: "That's terrible! Your boss is obviously playing favorites.", score: 30, result: "Validates feelings but escalates negativity" },
      { text: "I'm sorry to hear that. Want to talk about what happened?", score: 90, result: "Shows empathy and opens communication" },
      { text: "Well, maybe the other person was just more qualified.", score: 10, result: "Dismissive and hurtful" },
      { text: "Have you considered asking for feedback on how to improve?", score: 70, result: "Constructive but might feel premature" }
    ]
  },
  {
    context: "Your romantic partner is stressed about family drama",
    dialogue: "My mom and sister are fighting again, and they both want me to pick sides...",
    emotion: "😰",
    mood: "Anxious",
    options: [
      { text: "Family drama is so exhausting. Just ignore them both.", score: 20, result: "Dismissive of their emotional burden" },
      { text: "That sounds really stressful. How can I support you through this?", score: 95, result: "Perfect supportive response" },
      { text: "You should tell them both to grow up and sort it out themselves.", score: 15, result: "Harsh and not supportive" },
      { text: "Maybe try to stay neutral and encourage them to talk directly?", score: 75, result: "Good advice but doesn't address their stress" }
    ]
  },
  {
    context: "A coworker is excited about their weekend plans",
    dialogue: "I'm so excited! I'm finally going skydiving this weekend!",
    emotion: "🤩",
    mood: "Excited",
    options: [
      { text: "Wow, that's amazing! I'm so happy for you!", score: 95, result: "Matches their enthusiasm perfectly" },
      { text: "That sounds terrifying. Are you sure it's safe?", score: 25, result: "Dampens their excitement with worry" },
      { text: "Cool, I guess. I could never do something like that.", score: 40, result: "Lukewarm response, makes it about you" },
      { text: "That's awesome! You'll have to tell me all about it on Monday!", score: 85, result: "Enthusiastic and shows continued interest" }
    ]
  },
  {
    context: "A friend is sharing a personal accomplishment",
    dialogue: "I finally finished writing my novel! It took me three years, but I did it!",
    emotion: "🎉",
    mood: "Proud",
    options: [
      { text: "That's incredible! I'm so proud of you for sticking with it!", score: 100, result: "Celebrates their achievement and perseverance" },
      { text: "Nice! Now comes the hard part - getting it published.", score: 30, result: "Immediately shifts focus to challenges ahead" },
      { text: "Three years? Wow, that's a long time for one book.", score: 15, result: "Focuses on negative aspect instead of celebrating" },
      { text: "Congratulations! What's it about? I'd love to hear more!", score: 90, result: "Celebrates and shows genuine interest" }
    ]
  },
  {
    context: "Your neighbor apologizes for their dog barking at night",
    dialogue: "I'm so sorry about Rex barking last night. I know it probably woke you up...",
    emotion: "😳",
    mood: "Embarrassed",
    options: [
      { text: "Yes, it did wake me up. You really need to do something about that dog.", score: 20, result: "Confirms their worst fears, not constructive" },
      { text: "Oh, don't worry about it! These things happen. Is Rex okay?", score: 85, result: "Gracious and shows concern for their pet" },
      { text: "Actually, I didn't even notice. No worries at all!", score: 70, result: "Kind but might seem disingenuous" },
      { text: "I appreciate you checking. Maybe some training could help?", score: 75, result: "Acknowledges issue while offering constructive suggestion" }
    ]
  }
]);

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
  totalRounds.value = Math.min(scenarios.value.length, 5);
  const stressLevel = config.value.params?.stressLevel || 'medium';
  
  maxTimePerRound.value = stressLevel === 'easy' ? 20 : stressLevel === 'hard' ? 10 : 15;
  timeLeft.value = maxTimePerRound.value;
  
  startTime.value = Date.now();
  shuffleScenarios();
  startRoundTimer();
}

function shuffleScenarios() {
  // Shuffle scenarios for variety
  for (let i = scenarios.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [scenarios.value[i], scenarios.value[j]] = [scenarios.value[j], scenarios.value[i]];
  }
}

function startRoundTimer() {
  gameTimer = setInterval(() => {
    timeLeft.value--;
    
    if (timeLeft.value <= 0) {
      // Time's up! Force a random selection
      if (selectedResponse.value === null) {
        timeUp();
      }
    }
  }, 1000);
}

function selectResponse(optionIndex: number) {
  if (selectedResponse.value !== null) return;
  
  selectedResponse.value = optionIndex;
  const option = scenarios.value[currentScenarioIndex.value].options[optionIndex];
  score.value += option.score;
  
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function timeUp() {
  // Select the worst option as penalty for running out of time
  const worstOption = scenarios.value[currentScenarioIndex.value].options
    .reduce((worst, option, index) => 
      option.score < scenarios.value[currentScenarioIndex.value].options[worst].score ? index : worst, 0
    );
  
  selectedResponse.value = worstOption;
  score.value += scenarios.value[currentScenarioIndex.value].options[worstOption].score * 0.5; // Half points for timeout
}

function nextRound() {
  currentRound.value++;
  selectedResponse.value = null;
  
  if (currentRound.value > totalRounds.value) {
    gameComplete.value = true;
    return;
  }
  
  currentScenarioIndex.value++;
  timeLeft.value = maxTimePerRound.value;
  startRoundTimer();
}

function finishGame() {
  const successRate = (finalScore.value / maxPossibleScore.value) * 100;
  
  endMinigame({
    success: finalScore.value >= winThreshold.value,
    score: finalScore.value,
    data: {
      successRate,
      roundsCompleted: totalRounds.value,
      averageScore: Math.round(finalScore.value / totalRounds.value),
      stressLevel: config.value.params?.stressLevel
    },
    completionTime: Date.now() - startTime.value
  });
}

function giveUp() {
  endMinigame({
    success: false,
    score: finalScore.value,
    data: { 
      reason: 'gave_up',
      roundsCompleted: currentRound.value - 1,
      successRate: (finalScore.value / maxPossibleScore.value) * 100
    },
    completionTime: Date.now() - startTime.value
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