<template>
  <Main />
</template>

<script setup lang="ts">
import { Main } from '@generate/components';
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
