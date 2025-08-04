<template>
  <div id="game-root" class="engine-content">
    <!-- Layered VN components -->
    <Background />
    <Drawing />
    <LocationOverlay />
    <Foreground />
    <Dialogue />
    <Choice />
  </div>
</template>

<script setup>
import {
  Background,
  LocationOverlay,
  Drawing,
  Foreground,
  Dialogue,
  Choice,
} from '@/generate/components';
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
