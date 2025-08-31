<template>
  <Transition name="fade">
    <div
      v-show="engineState.state === EngineStateEnum.SETTING"
      class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-90 transition-all duration-500"
    >
      <!-- Main panel with glass morphism -->
      <div class="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <!-- Header with gradient -->
        <div class="p-6 pb-4 flex justify-between items-center border-b border-white/10">
          <div class="text-center flex-1">
            <h2 class="text-2xl font-bold text-white mb-2 tracking-wide">⚙️ Settings</h2>
            <div class="w-16 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded mx-auto"></div>
          </div>
          <button 
            @click="closeSettings" 
            class="ml-4 bg-transparent border-none text-white/60 hover:text-red-400 text-xl cursor-pointer p-2 rounded-md transition-all duration-200 hover:bg-red-500/10"
          >
            ✕
          </button>
        </div>
        
        <!-- Settings content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <LanguageSelector />
          <AudioSettings />
          <TextSettings />
          <GameplaySettings />
        </div>
        
        <!-- Footer buttons -->
        <div class="p-4 border-t border-white/10 flex items-center justify-center gap-4">
          <button 
            @click="resetToDefaults" 
            class="flex-1 px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
          >
            Reset to Defaults
          </button>
          <button 
            @click="closeSettings" 
            class="flex-[2] px-4 py-2 bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500/90 hover:to-purple-500/90 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.02] border border-blue-500/20"
          >
            Apply & Close
          </button>
        </div>
        
        <!-- Close hint -->
        <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/30 text-xs">
          Press ESC to close
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {LanguageSelector, AudioSettings, TextSettings, GameplaySettings} from '@generate/components'
import { engineState as useEngineState } from "@generate/stores";
import { EngineStateEnum } from '@generate/enums';

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
/* Custom scrollbar styling for the settings content */
.overflow-y-auto::-webkit-scrollbar {
  @apply w-2;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-black/20 rounded;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-white/20 rounded;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-white/30;
}
</style>