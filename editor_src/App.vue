<template>
  <div class="h-screen flex flex-col">
    <Header />
    <div class="flex-1 overflow-hidden">
      <Dashboard v-if="editorState.activeModule === 'dashboard'" />
      <ProjectEditor v-else-if="editorState.activeModule === 'projectEditor'" />
      <AssetManager v-else-if="editorState.activeModule === 'assetManager'" />
      <LocationManager v-else-if="editorState.activeModule === 'locationManager'" />
      <LocalizationManager v-else-if="editorState.activeModule === 'localizationManager'" />
    </div>
    <!-- Floating runtime preview -->
    <FloatingGame />
    <EngineStatePopup v-if="editorState.showEnginePopup" />
    <GameStatePopup v-if="editorState.showGamePopup" />
  </div>
</template>

<script setup lang="ts">
import Header from '@editor/components/Header.vue';
import Dashboard from '@editor/components/Dashboard.vue';
import ProjectEditor from '@editor/components/ProjectEditor.vue';
import AssetManager from '@editor/components/Asset/AssetManager.vue';
import LocationManager from '@editor/components/Location/LocationManager.vue';
import LocalizationManager from '@editor/components/Localization/LocalizationManager.vue';
import EngineStatePopup from '@editor/components/Popup/EngineStatePopup.vue';
import GameStatePopup from '@editor/components/Popup/GameStatePopup.vue';
import FloatingGame from "@editor/components/Popup/FloatingGame.vue";
import { useEditorState } from '@editor/stores/editorState';

const editorState = useEditorState();
</script>

<style>
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

