<template>
  <div
    v-if="engineState.choices && engineState.choices.length"
    class="absolute bottom-24 left-0 w-full z-50 pointer-events-auto"
  >
    <div class="flex flex-col items-center space-y-2 max-w-2xl mx-auto">
      <button
        v-for="choice in engineState.choices"
        :key="choice.id"
        @click="select(choice.id)"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
      >
        {{ choice.text }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Engine from "@/engine/runtime/Engine";
import { engineState as useEngineState } from "@/generate/stores";

const engineState = useEngineState();

function select(id: string): void {
  Engine.getInstance()?.resolveAwaiter(id);
}
</script>

<style scoped>
.z-50 {
  z-index: 50;
}
</style>
