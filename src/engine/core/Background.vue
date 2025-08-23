<template>
  <div v-if="background" class="absolute inset-0 w-full h-full bg-black z-0">
    <!-- Background image -->
    <img
      :src="background"
      class="object-cover w-full h-full"
      alt="Background"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { engineState as useEngineState } from '@/generate/stores';
const engineState = useEngineState();
const background = computed(() => engineState.background);
</script>
