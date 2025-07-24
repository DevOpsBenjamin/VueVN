<template>
  <ProjectSelector v-if="isDev && !editorState.project" />
  <ProjectEditor v-else-if="isDev && editorState.project" />
  <div v-else>
    <Main />
  </div>
</template>

<script setup>
import { Main } from '@/generate/components';
import ProjectSelector from '@/editor/ProjectSelector.vue';
import ProjectEditor from '@/editor/ProjectEditor.vue';
import { useEditorState } from '@/editor/stores/editorState';

const isDev = import.meta.env.DEV;
const editorState = useEditorState();
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
