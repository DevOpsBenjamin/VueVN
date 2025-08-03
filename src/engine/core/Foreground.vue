<template>
  <div
    v-if="foreground"
    class="absolute inset-0 w-full h-full pointer-events-none z-30"
  >
    <!-- Foreground image -->
    <img
      :src="foreground"
      class="object-contain w-full h-full"
      alt="Foreground"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { engineState as useEngineState } from '@/generate/engine';
const engineState = useEngineState();
const foreground = computed(() => engineState.foreground);
</script>

<style scoped>
.z-30 {
  z-index: 30;
}
</style>
