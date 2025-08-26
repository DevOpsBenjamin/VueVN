<template>
  <div class="settings-section">
    <h3>📝 Text & Display</h3>
    
    <!-- Text Speed -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">⚡</span>
        Text Speed
      </label>
      <div class="slider-container">
        <input 
          type="range" 
          v-model="engineState.settings.textSpeed"
          min="10" 
          max="100" 
          step="10"
          class="speed-slider"
        />
        <span class="speed-value">{{ getSpeedLabel() }}</span>
      </div>
    </div>

    <!-- Auto Advance -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">⏭️</span>
        Auto Advance
      </label>
      <div class="toggle-container">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="engineState.settings.autoAdvance"
          />
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">
          {{ engineState.settings.autoAdvance ? 'On' : 'Off' }}
        </span>
      </div>
    </div>

    <!-- Auto Advance Delay -->
    <div 
      v-if="engineState.settings.autoAdvance" 
      class="setting-row sub-setting"
    >
      <label class="setting-label">
        <span class="setting-icon">⏲️</span>
        Auto Delay
      </label>
      <div class="slider-container">
        <input 
          type="range" 
          v-model="engineState.settings.autoAdvanceDelay"
          min="1000" 
          max="8000" 
          step="500"
          class="delay-slider"
        />
        <span class="delay-value">{{ (engineState.settings.autoAdvanceDelay / 1000).toFixed(1) }}s</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { engineState as useEngineState } from '@generate/stores';

const engineState = useEngineState();

function getSpeedLabel(): string {
  const speed = engineState.settings.textSpeed;
  if (speed <= 20) return 'Very Slow';
  if (speed <= 40) return 'Slow';
  if (speed <= 60) return 'Normal';
  if (speed <= 80) return 'Fast';
  return 'Very Fast';
}
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

.sub-setting {
  padding-left: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 3px solid #4a90e2;
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

.speed-slider, .delay-slider {
  width: 150px;
  height: 6px;
  background: #333;
  border-radius: 3px;
  outline: none;
  appearance: none;
}

.speed-slider::-webkit-slider-thumb, .delay-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.speed-slider::-webkit-slider-thumb:hover, .delay-slider::-webkit-slider-thumb:hover {
  background: #357abd;
}

.speed-value, .delay-value {
  color: #4a90e2;
  font-weight: 600;
  min-width: 80px;
  text-align: right;
  font-size: 14px;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #333;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #4a90e2;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  color: #ddd;
  font-weight: 500;
  min-width: 30px;
}
</style>