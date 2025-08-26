<template>
  <div class="settings-menu">
    <div class="settings-header">
      <h2>⚙️ Settings</h2>
      <button @click="closeSettings" class="close-button">✕</button>
    </div>
    
    <div class="settings-content">
      <LanguageSelector />
      <AudioSettings />
      <TextSettings />
      <GameplaySettings />
    </div>
    
    <div class="settings-footer">
      <button @click="resetToDefaults" class="reset-button">Reset to Defaults</button>
      <button @click="closeSettings" class="apply-button">Apply & Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEngineState } from '@generate/stores';
import LanguageSelector from './components/LanguageSelector.vue';
import AudioSettings from './components/AudioSettings.vue';
import TextSettings from './components/TextSettings.vue';
import GameplaySettings from './components/GameplaySettings.vue';

const engineState = useEngineState();

const emit = defineEmits<{
  close: [];
}>();

function closeSettings() {
  emit('close');
}

function resetToDefaults() {
  engineState.settings = {
    language: 'en',
    soundVolume: 80,
    musicVolume: 60,
    textSpeed: 50,
    autoAdvance: false,
    autoAdvanceDelay: 3000
  };
}
</script>

<style scoped>
.settings-menu {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #444;
  border-radius: 12px;
  width: 500px;
  max-height: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #444;
}

.settings-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #ff4444;
  color: white;
}

.settings-content {
  padding: 25px;
  max-height: 400px;
  overflow-y: auto;
}

.settings-content > * {
  margin-bottom: 25px;
}

.settings-content > *:last-child {
  margin-bottom: 0;
}

.settings-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px 25px;
  border-top: 1px solid #444;
  gap: 15px;
}

.reset-button, .apply-button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button {
  background: #666;
  color: white;
  flex: 1;
}

.reset-button:hover {
  background: #777;
}

.apply-button {
  background: #4a90e2;
  color: white;
  flex: 2;
}

.apply-button:hover {
  background: #357abd;
}

/* Scrollbar styling */
.settings-content::-webkit-scrollbar {
  width: 8px;
}

.settings-content::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>