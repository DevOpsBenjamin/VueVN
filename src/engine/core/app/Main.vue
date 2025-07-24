<template>
  <div class="engine-container">
    <div class="engine-wrapper" :style="wrapperStyle">
      <slot>
        <Game />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Game } from '@/generate/components';

const wrapperStyle = computed(() => ({
  '--aspect-ratio': '2 / 1',
  'background-color': '#1a1a1a', // Dark background for the engine area
  'position': 'relative',
  'overflow': 'hidden',
  'width': '100%',
  'height': '100%',
  'max-width': '100%',
  'margin': '0 auto',
  'aspect-ratio': 'var(--aspect-ratio)'
}));
</script>

<style scoped>
.engine-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}

.engine-wrapper {
  position: relative;
  width: 100%;
  max-width: var(--max-width, 100%);
  margin: 0 auto;
  aspect-ratio: var(--aspect-ratio);
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}
</style>