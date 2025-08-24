<template>
  <ProjectEditor v-if="isDev" />
  <Main v-else />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { Main } from '@/generate/components';

const isDev = import.meta.env.DEV;

// Dynamic import for editor (only loaded in dev)
const ProjectEditor = isDev
  ? defineAsyncComponent(() => import('@/editor/ProjectEditor.vue'))
  : null;
</script>

<style>
/* Global styles */
:root {
  --color-bg: #1a1a1a;
  --color-text: #e0e0e0;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
