<template>
  <div class="engine-content">
    <!-- Layered VN components -->
    <Background />
    <LocationOverlay />
    <Drawing />
    <Foreground />
    <Dialogue />
    <Choice />
    <Custom />
  </div>
</template>

<script setup lang="ts">
import {
  Background,
  LocationOverlay,
  Drawing,
  Foreground,
  Dialogue,
  Choice,
  Custom
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
