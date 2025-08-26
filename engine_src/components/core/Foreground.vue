<template>
  <div
    v-show="engineState.foreground != null && engineState.foreground.length > 0"
    class="absolute inset-0 w-full h-full pointer-events-none z-30"
  >
    <!-- Foreground image -->
    <img
      :src="engineState.foreground?.[0]"
      class="object-contain w-full h-full"
      alt="Foreground"
    />
  </div>
</template>

<script setup lang="ts">
import { engineState as useEngineState } from '@generate/stores';
const engineState = useEngineState();
</script>