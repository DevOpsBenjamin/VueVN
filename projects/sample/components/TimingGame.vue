<template>
  <div v-if="gameActive" class="timing-game-overlay">
    <div class="timing-game-container">
      <h2>Timing Challenge</h2>
      <p>Click when the needle hits the green zone!</p>
      
      <div class="circle-container">
        <svg width="200" height="200" class="timing-circle">
          <!-- Background circle -->
          <circle cx="100" cy="100" r="80" fill="none" stroke="#ddd" stroke-width="4"/>
          
          <!-- Red zone (0-50 degrees) -->
          <path :d="redZonePath" fill="none" stroke="red" stroke-width="12" />
          
          <!-- Orange zone (50-70 degrees) -->  
          <path :d="orangeZonePath" fill="none" stroke="orange" stroke-width="12" />
          
          <!-- Green zone (70-110 degrees) -->
          <path :d="greenZonePath" fill="none" stroke="green" stroke-width="12" />
          
          <!-- Needle -->
          <line 
            x1="100" 
            y1="100" 
            :x2="needleX" 
            :y2="needleY" 
            stroke="black" 
            stroke-width="3"
          />
          <circle cx="100" cy="100" r="5" fill="black" />
        </svg>
      </div>
      
      <div class="game-info">
        <p>Difficulty: {{ difficulty }}</p>
        <p>Potential Reward: {{ reward }} money</p>
      </div>
      
      <button @click="stopGame" class="stop-button">STOP!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  difficulty?: number;
  reward?: number;
}

const props = withDefaults(defineProps<Props>(), {
  difficulty: 1,
  reward: 100
});

const gameActive = ref(true);
const angle = ref(0);
const speed = ref(2 + (props.difficulty * 0.5));
let gameLoop: number | null = null;

// Emit result when game finishes
const emit = defineEmits<{
  gameResult: [result: { bonus: number; zone: string; reward: number; angle: number }]
}>();

// Calculate needle position
const needleX = computed(() => 100 + 70 * Math.cos((angle.value - 90) * Math.PI / 180));
const needleY = computed(() => 100 + 70 * Math.sin((angle.value - 90) * Math.PI / 180));

// Zone paths for SVG arcs
const redZonePath = computed(() => createArcPath(0, 50));
const orangeZonePath = computed(() => createArcPath(50, 70));
const greenZonePath = computed(() => createArcPath(70, 110));

function createArcPath(startAngle: number, endAngle: number): string {
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
  const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
  const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
  const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
}

function startGame() {
  gameLoop = setInterval(() => {
    angle.value = (angle.value + speed.value) % 360;
  }, 16); // 60fps
}

function stopGame() {
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
  
  gameActive.value = false;
  
  // Calculate result based on angle
  const result = calculateResult();
  emit('gameResult', result);
}

function calculateResult() {
  let zone = 'red';
  let bonus = 0.5;
  
  const zones = {
    green: { start: 70, end: 110, bonus: 1.5 },
    orange: { start: 50, end: 70, bonus: 1.0 },
    red: { start: 0, end: 50, bonus: 0.5 }
  };
  
  for (const [zoneName, zoneData] of Object.entries(zones)) {
    if (angle.value >= zoneData.start && angle.value <= zoneData.end) {
      zone = zoneName;
      bonus = zoneData.bonus;
      break;
    }
  }
  
  const finalReward = Math.floor(props.reward * bonus);
  return { bonus, zone, reward: finalReward, angle: angle.value };
}

onMounted(() => {
  startGame();
});

onUnmounted(() => {
  if (gameLoop) {
    clearInterval(gameLoop);
  }
});
</script>

<style scoped>
.timing-game-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.timing-game-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.circle-container {
  margin: 1rem 0;
}

.timing-circle {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1));
}

.game-info {
  margin: 1rem 0;
  color: #666;
}

.stop-button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.stop-button:hover {
  background: #cc3333;
}

h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

p {
  margin: 0.5rem 0;
}
</style>