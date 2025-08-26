<template>
  <div
    v-show="engineState.dialogue"
    class="absolute bottom-0 left-0 w-full z-40 pointer-events-auto"
  >
    <!-- Dialogue container - sticks perfectly to bottom -->
    <div class="max-w-3xl mx-auto px-4">
      <div class="dialogue-panel bg-black/30 backdrop-blur-sm border border-white/20 rounded-t-2xl shadow-xl min-h-[160px] flex flex-col">
        
        <!-- Zone 1: Character name section (fixed height, can be null) -->
        <div class="character-zone flex-shrink-0 px-6 pt-4 pb-2">
          <template
            v-if="
              engineState.dialogue &&
              engineState.dialogue.from &&
              engineState.dialogue.from !== 'engine'
            "
          >
            <!-- Character name badge -->
            <div class="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/90 to-purple-600/90 border border-white/20 shadow-lg">
              <div class="w-3 h-3 rounded-full bg-white/80 mr-2 animate-pulse"></div>
              <span class="font-semibold text-white text-sm tracking-wide uppercase">
                {{ engineState.dialogue.from }}
              </span>
            </div>
          </template>
        </div>

        <!-- Zone 2: Text content (flexible height with scroll if needed) -->
        <div class="text-zone flex-grow px-6 py-2 overflow-y-auto max-h-[120px]">
          <div 
            class="text-white text-lg leading-relaxed font-medium whitespace-pre-line"
            v-html="formattedDialogueText"
          />
        </div>

        <!-- Zone 3: Continue indicator (minimal bottom hint) -->
        <div class="continue-zone flex-shrink-0 px-6 py-0.5 border-t border-white/5">
          <div class="flex items-center justify-end text-white/30 text-[10px] animate-pulse">
            <span class="mr-1">Click or press space to continue</span>
            <svg class="w-1.5 h-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>

        <!-- Subtle bottom gradient accent -->
        <div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-b-2xl"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { engineState as useEngineState } from '@generate/stores';

const engineState = useEngineState();

// Convert \n to <br> tags for proper line breaks
const formattedDialogueText = computed(() => {
  if (!engineState.dialogue?.text) return '';
  return engineState.dialogue.text.replace(/\n/g, '<br>');
});
</script>
