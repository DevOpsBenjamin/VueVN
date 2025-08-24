<template>
  <div ref="gameRoot" class="engine-content">
    <SaveLoadMenu />
    <MainMenu />
    <Loading />
    <Engine />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SaveLoadMenu, MainMenu, Engine, Loading } from '@/generate/components';
import { Engine as EngineCore } from '@/generate/runtime';
import {
  engineState as useEngineState,
  gameState as useGameState,
} from '@/generate/stores';

const engineState = useEngineState();
const gameState = useGameState();
const gameRoot = ref<HTMLElement | null>(null);

onMounted(async () => {
  if (!EngineCore.getInstance()) {
    // Pinia stores are now properly typed as GameStateStore & EngineStateStore
    const engine = new EngineCore(gameState, engineState, gameRoot.value!);
    await engine.run();
  }
});
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