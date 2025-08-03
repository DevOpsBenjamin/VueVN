<template>
  <div
    v-show="engineState.dialogue"
    class="absolute bottom-0 left-0 w-full z-40 pointer-events-auto"
  >
    <div
      class="bg-black bg-opacity-70 text-white p-4 rounded-t-lg max-w-3xl mx-auto mb-4 shadow-lg"
    >
      <template
        v-if="
          engineState.dialogue &&
          engineState.dialogue.from &&
          engineState.dialogue.from !== 'engine'
        "
      >
        <span class="block font-bold text-blue-300 mb-1"
          >{{ engineState.dialogue.from }}:</span
        >
      </template>
      <span>{{ engineState.dialogue ? engineState.dialogue.text : '' }}</span>
    </div>
  </div>
</template>

<script setup>
import { engineState as useEngineState } from '@/generate/engine';
const engineState = useEngineState();
</script>

<style scoped>
.z-40 {
  z-index: 40;
}
</style>
