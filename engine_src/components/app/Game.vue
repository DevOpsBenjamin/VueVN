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
import { SaveLoadMenu, MainMenu, Engine, Loading } from '@generate/components';
import { Engine as EngineCore } from '@generate/engine';

const gameRoot = ref<HTMLElement | null>(null);

onMounted(async () => {
  const engine = EngineCore.getInstance();
  if (engine) {
    // Update the gameRoot reference to the actual DOM element
    engine.setRootHTML(gameRoot.value!);
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