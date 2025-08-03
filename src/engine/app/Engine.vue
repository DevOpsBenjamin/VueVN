<template>
  <div class="engine-content">
    <!-- Game content will be rendered here -->
    <div class="w-full h-full flex items-center justify-center">
      <slot>
        <span class="text-green-400 font-mono text-lg">Game running</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import {
  Engine as EngineCore,
  gameState as useGameState,
  engineState as useEngineState,
} from '@/generate/engine';

const gameState = useGameState();
const engineState = useEngineState();
</script>

<style scoped>
.engine-content {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  overflow: hidden;
  position: relative; /* Ensure proper positioning context for children */
}
</style>
