<template>
  <div class="settings-section">
    <h3>🔊 Audio</h3>
    
    <!-- Sound Volume -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">🔊</span>
        Sound Effects
      </label>
      <div class="slider-container">
        <input 
          type="range" 
          v-model="engineState.settings.soundVolume"
          min="0" 
          max="100" 
          step="5"
          class="volume-slider"
        />
        <span class="volume-value">{{ engineState.settings.soundVolume }}%</span>
      </div>
    </div>

    <!-- Music Volume -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">🎵</span>
        Background Music
      </label>
      <div class="slider-container">
        <input 
          type="range" 
          v-model="engineState.settings.musicVolume"
          min="0" 
          max="100" 
          step="5"
          class="volume-slider"
        />
        <span class="volume-value">{{ engineState.settings.musicVolume }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { engineState as useEngineState } from '@generate/stores';

const engineState = useEngineState();
</script>

<style scoped>
.settings-section {
  margin-bottom: 25px;
}

.settings-section h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #333;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #ddd;
  min-width: 150px;
}

.setting-icon {
  margin-right: 8px;
  font-size: 16px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.volume-slider {
  width: 150px;
  height: 6px;
  background: #333;
  border-radius: 3px;
  outline: none;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  background: #357abd;
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  background: #357abd;
}

.volume-value {
  color: #4a90e2;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
  font-size: 14px;
}
</style>