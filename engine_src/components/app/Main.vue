<template>
  <div class="engine-container bg-gradient-to-br from-gray-900 via-gray-800 to-black">
    <div class="engine-wrapper" :style="wrapperStyle">
      <slot>
        <Game />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Game } from '@generate/components';

const wrapperStyle = computed(() => ({
  '--aspect-ratio': '2 / 1',
  'background-color': '#1a1a1a', // Dark background for the engine area
  position: 'relative' as const,
  overflow: 'hidden' as const,
  'aspect-ratio': 'var(--aspect-ratio)',
}));
</script>

<style scoped>
.engine-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}

.engine-wrapper {
  position: relative;
  width: 100%;
  max-width: 100vh * 2; /* 2:1 aspect ratio */
  max-height: 100vw / 2; /* Maintain aspect ratio */
  aspect-ratio: var(--aspect-ratio);
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}
</style>
