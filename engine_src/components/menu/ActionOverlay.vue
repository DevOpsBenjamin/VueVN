<template>
  <div
    v-if="accessibleActions.length > 0"
    class="absolute top-0 left-0 w-full h-full z-10 pointer-events-none flex items-end justify-start p-2"
  >
    <div class="flex gap-2 pointer-events-auto h-[20%] items-center">
      <button
        v-for="action in accessibleActions"
        :key="action.id"
        @click.stop.prevent="executeAction(action.id)"
        class="group relative overflow-hidden transition-colors duration-200 ease-out transform hover:scale-110 hover:-translate-y-2 focus:outline-none border-none rounded-full h-full aspect-square"
        :title="action.name"
      >
        <!-- Circle background with glass morphism - green on hover -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full group-hover:bg-green-600/60 group-focus:bg-green-600/60 group-hover:border-white/40 group-focus:border-white/40 transition-colors duration-200"></div>
        
        <!-- Inner glow ring -->
        <div class="absolute inset-2 rounded-full border border-white/10 group-hover:border-white/30 transition-colors duration-200"></div>
        
        <!-- Action name text -->
        <div class="relative w-full h-full flex items-center justify-center">
          <span class="text-white font-medium text-center leading-none group-hover:text-white transition-colors duration-300 drop-shadow-lg overflow-hidden text-ellipsis whitespace-nowrap max-w-full block" style="font-size: 2.5cqw;">
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
import { ref, onMounted, computed } from 'vue';
import { Engine } from "@generate/engine";
import { gameState as useGameState } from '@generate/stores';
import type { VNAction } from '@generate/types';

const gameState = useGameState();
const accessibleActions = ref<VNAction[]>([]);

// Circle sizes are now handled with responsive CSS classes

const updateAccessibleActions = () => {
  const engine = Engine.getInstance();
  if (engine == null) {
    console.error("Engine get error");
    return;
  }
  
  try {
    accessibleActions.value = engine.actionManager.getAccessibleActions();
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
  updateAccessibleActions();
  
  // Register for updates when engine recalculates actions
  const engine = Engine.getInstance();
  if (engine) {
    engine.actionManager.setUpdateCallback(updateAccessibleActions);
  }
});
</script>
