<template>
  <SaveLoadMenu />
  <MainMenu />
  <Loading />
  <Engine />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { SaveLoadMenu, MainMenu, Engine, Loading } from '@/generate/components';
import { Engine as EngineCore } from '@/generate/runtime';
import {
  engineState as useEngineState,
  gameState as useGameState,
} from '@/generate/stores';

const engineState = useEngineState();
const gameState = useGameState();
onMounted(async () => {
  if (!EngineCore.getInstance()) {
    const engine = new EngineCore(gameState, engineState);
    await engine.run();
  }
});
</script>
