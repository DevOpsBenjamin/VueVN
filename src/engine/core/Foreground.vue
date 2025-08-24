<template>
  <div
    v-show="engineState.foreground"
    class="absolute inset-0 w-full h-full pointer-events-none z-30"
  >
    <!-- Foreground image -->
    <img
      :src="engineState.foreground!"
      class="object-contain w-full h-full"
      alt="Foreground"
    />
  </div>
</template>

<script setup lang="ts">
import { engineState as useEngineState } from '@/generate/stores';
const engineState = useEngineState();
</script>