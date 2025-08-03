<template>
  <MainMenu />
  <Loading />
  <Engine />
</template>

<script setup>
import { onMounted } from 'vue';
import { MainMenu, Engine, Loading } from '@/generate/components';
import {
  engineState as useEngineState,
  Engine as EngineCore,
  gameState as useGameState,
} from '@/generate/engine';

const engineState = useEngineState();
const gameState = useGameState();
onMounted(async () => {
  if (!EngineCore.getInstance()) {
    const engine = new EngineCore(gameState, engineState);
    await engine.run();
  }
});
</script>
