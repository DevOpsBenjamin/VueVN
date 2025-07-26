<template>
  <div class="p-2 bg-gray-800 text-xs text-gray-200 h-full overflow-auto">
    <div class="font-bold text-green-400 mb-2">GAME_STATE:</div>
    <pre>{{ gameState }}</pre>
  </div>
</template>

<script setup>
import { gameState as useGameState } from '@/generate/engine';

const gameState = useGameState();
</script>
