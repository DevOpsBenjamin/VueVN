<template>
  <div class="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
    <!-- Header Component -->
    <Header />

    <!-- Main Content Area -->
    <main class="flex-1 overflow-hidden">
      <!-- Dashboard -->
      <Dashboard v-if="editorState.activeModule === 'dashboard'" />
      
      <!-- Project Editor -->
      <ProjectEditor v-else-if="editorState.activeModule === 'projectEditor'" />
      
      <!-- Asset Manager -->
      <AssetManager v-else-if="editorState.activeModule === 'assetManager'" />
      
      <!-- Location Manager -->
      <LocationManager v-else-if="editorState.activeModule === 'locationManager'" />
      
      <!-- Localization Manager -->
      <LocalizationManager v-else-if="editorState.activeModule === 'localizationManager'" />
    </main>

    <!-- Floating Game Preview -->
    <FloatingGame />
    
    <!-- State Popups -->
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
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  width: 100vw;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Smooth transitions for all interactive elements */
button, .transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glass effect utilities */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
</style>

