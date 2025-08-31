<template>
  <!-- Dynamic minigame loading based on active type -->
  <CookingMinigame v-if="activeMinigameType === 'cooking'" />
  <LockpickingMinigame v-else-if="activeMinigameType === 'lockpicking'" />
  <RhythmMinigame v-else-if="activeMinigameType === 'rhythm'" />
  <MemoryMinigame v-else-if="activeMinigameType === 'memory'" />
  <DialogueChoiceMinigame v-else-if="activeMinigameType === 'dialogue_choice'" />
  
  <!-- Generic fallback for unknown minigames -->
  <GenericMinigame v-else-if="activeMinigameType" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameState } from '@generate/stores';

// Minigame components
import CookingMinigame from './minigames/CookingMinigame.vue';
import LockpickingMinigame from './minigames/LockpickingMinigame.vue';
import RhythmMinigame from './minigames/RhythmMinigame.vue';
import MemoryMinigame from './minigames/MemoryMinigame.vue';
import DialogueChoiceMinigame from './minigames/DialogueChoiceMinigame.vue';
import GenericMinigame from './minigames/GenericMinigame.vue';

const gameState = useGameState();

const activeMinigameType = computed(() => {
  return gameState.ui?.activeMinigame?.type || null;
});
</script>