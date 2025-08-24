<template>
  <div
    v-if="accessibleActions.length > 0"
    class="absolute top-0 left-0 w-full h-full z-10 pointer-events-none flex items-end justify-start p-4"
  >
    <!-- Action navigation circles -->
    <div class="flex flex-wrap gap-6 justify-center items-center pointer-events-auto">
      <button
        v-for="action in accessibleActions"
        :key="action.id"
        @click.stop.prevent="executeAction(action.id)"
        class="action-circle group relative overflow-hidden transition-all duration-300 ease-out transform hover:scale-110 hover:-translate-y-2"
        :style="{ width: circleSize + 'px', height: circleSize + 'px' }"
        :title="action.name"
      >
        <!-- Circle background with glass morphism -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full group-hover:bg-black/40 group-hover:border-white/40 transition-all duration-300"></div>
        
        <!-- Glow effect on hover -->
        <div class="absolute inset-0 rounded-full group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300"></div>
        
        <!-- Inner glow ring -->
        <div class="absolute inset-2 rounded-full border border-white/10 group-hover:border-white/30 transition-all duration-300"></div>
        
        <!-- Action name text -->
        <div class="relative w-full h-full flex items-center justify-center p-2">
          <span class="text-white font-semibold text-center text-sm leading-tight group-hover:text-white transition-colors duration-300 drop-shadow-lg">
            {{ action.name }}
          </span>
        </div>
        
        <!-- Subtle gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-full pointer-events-none"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { Engine } from "@/generate/runtime";
import { gameState as useGameState } from '@/generate/stores';
import type { Action } from '@/generate/types';

const gameState = useGameState();
const accessibleActions = ref<Action[]>([]);

// Calculate circle size as 1/8 of gameRoot size (same as locations)
const circleSize = computed(() => {
  const engine = Engine.getInstance();  
  if (engine == null) {
    console.warn("Engine get error");
    return 120;
  }
  return engine.getGameSize();
});

const updateAccessibleActions = () => {
  const engine = Engine.getInstance();
  if (engine == null) {
    console.error("Engine get error");
    return;
  }
  
  try {
    accessibleActions.value = engine.actionManager.getAccessibleActions(gameState);
  } catch (error) {
    console.error('[ActionOverlay] Error updating accessible actions:', error);
    accessibleActions.value = [];
  }
};

const executeAction = (actionId: string) => {
  const engine = Engine.getInstance();
  if (engine == null) {
    console.error("Engine get error");
    return;
  }  
  
  try {
    engine.actionManager.executeAction(actionId, gameState);
  } catch (error) {
    console.error('[ActionOverlay] Error executing action:', error);
  }
  
  // Resolve the action waiter to continue the game loop
  engine.navigationManager.actionManager.resolve();
};

onMounted(() => {
  // Watch for time changes to update available actions
  watch(
    () => gameState.gameTime,
    updateAccessibleActions,
    { immediate: true, deep: true }
  );
});
</script>