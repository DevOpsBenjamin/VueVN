<template>
  <div class="settings-section">
    <h3>🎮 Gameplay</h3>
    
    <!-- Skip Unread Text -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">⏩</span>
        Skip Unread Text
      </label>
      <div class="toggle-container">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="skipUnread"
          />
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">
          {{ skipUnread ? 'On' : 'Off' }}
        </span>
      </div>
    </div>

    <!-- Quick Save Slots -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">💾</span>
        Quick Save Slots
      </label>
      <div class="number-selector">
        <button 
          @click="decrementSaveSlots"
          class="number-button"
          :disabled="quickSaveSlots <= 1"
        >
          -
        </button>
        <span class="number-value">{{ quickSaveSlots }}</span>
        <button 
          @click="incrementSaveSlots"
          class="number-button"
          :disabled="quickSaveSlots >= 10"
        >
          +
        </button>
      </div>
    </div>

    <!-- Screenshot on Save -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">📸</span>
        Screenshot on Save
      </label>
      <div class="toggle-container">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="screenshotOnSave"
          />
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">
          {{ screenshotOnSave ? 'On' : 'Off' }}
        </span>
      </div>
    </div>

    <!-- Confirm on Exit -->
    <div class="setting-row">
      <label class="setting-label">
        <span class="setting-icon">🚪</span>
        Confirm on Exit
      </label>
      <div class="toggle-container">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="confirmOnExit"
          />
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">
          {{ confirmOnExit ? 'On' : 'Off' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// These would be part of extended settings in the future
const skipUnread = ref(false);
const quickSaveSlots = ref(5);
const screenshotOnSave = ref(true);
const confirmOnExit = ref(true);

function incrementSaveSlots() {
  if (quickSaveSlots.value < 10) {
    quickSaveSlots.value++;
  }
}

function decrementSaveSlots() {
  if (quickSaveSlots.value > 1) {
    quickSaveSlots.value--;
  }
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

.number-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.number-button {
  width: 30px;
  height: 30px;
  background: #4a90e2;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-button:hover:not(:disabled) {
  background: #357abd;
}

.number-button:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.number-value {
  color: #4a90e2;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
  font-size: 16px;
}
</style>