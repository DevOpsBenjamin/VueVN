<template>
  <Transition name="fade">
    <div
      v-show="engineState.state === EngineStateEnum.SETTING"
      class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-90 transition-all duration-500"
    >
      <!-- Main panel with glass morphism - responsive layout -->
      <div class="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl w-[calc(100%-2rem)] h-[calc(100%-2rem)] flex flex-col lg:flex-row shadow-2xl">
        <!-- Left sidebar with header and footer - responsive width -->
        <div class="flex flex-col w-full lg:w-1/5 border-b lg:border-b-0 lg:border-r border-white/10">
          <!-- Header -->
          <div class="p-3 pb-2 border-b border-white/10">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="font-bold text-white mb-1 tracking-wide" style="font-size: 2.5cqw;">⚙️ {{ tr(ui.settings) }}</h2>
                <div class="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
              </div>
              <button 
                @click="closeSettings" 
                class="bg-transparent border-none text-white/60 hover:text-red-400 text-lg cursor-pointer p-1 rounded-md transition-all duration-200 hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
          </div>
          
          <!-- Navigation/Categories (optional for future) -->
          <div class="flex-1 p-2">
            <div class="space-y-1 text-white/60 text-xs">
              <div class="font-medium text-white/80">{{ tr(ui.categories) }}</div>
              <div class="pl-1 space-y-1">
                <div v-if="langOptionsCount > 1" class="text-white">• {{ tr(ui.language) }}</div>
                <div class="text-white">• {{ tr(ui.audio) }}</div>
                <div class="text-white">• {{ tr(ui.text) }}</div>
                <div class="text-white">• {{ tr(ui.gameplay) }}</div>
              </div>
            </div>
          </div>
          
          <!-- Footer buttons -->
          <div class="p-2 border-t border-white/10 space-y-2">
            <button 
              @click="resetToDefaults" 
              class="w-full px-2 py-1 bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white rounded text-xs font-medium transition-all duration-300 hover:scale-[1.02]"
            >
              {{ tr(ui.reset) }}
            </button>
            <button 
              @click="closeSettings" 
              class="w-full px-2 py-1 bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500/90 hover:to-purple-500/90 text-white rounded text-xs font-medium transition-all duration-300 hover:scale-[1.02] border border-blue-500/20"
            >
              {{ tr(ui.apply) }}
            </button>
            <div class="text-white/30 text-xs text-center mt-1">
              {{ tr(ui.esc_to_close) }}
            </div>
          </div>
        </div>
        
        <!-- Right content area -->
        <div class="flex-1 flex flex-col">
          <!-- Settings content in responsive grid layout -->
          <div class="flex-1 overflow-y-auto p-4 min-h-0">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
              <div class="space-y-4 min-h-0">
                <LanguageSelector />
                <AudioSettings />
              </div>
              <div class="space-y-4 min-h-0">
                <TextSettings />
                <GameplaySettings />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {LanguageSelector, AudioSettings, TextSettings, GameplaySettings} from '@generate/components'
import { engineState as useEngineState } from "@generate/stores";
import { EngineStateEnum } from '@generate/enums';
import t from '@generate/texts';
import type { Text } from '@generate/types';
import LanguageManager from '@engine/engine/Managers/LanguageManager';

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

// Typed UI texts + translator
const ui = t.global.ui;
function tr(text: string | Text): string {
  return LanguageManager.getInstance().resolveText(text);
}

// Language options count for conditional UI
const langOptionsCount = LanguageManager.getInstance().getLanguageCodes().length;
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
