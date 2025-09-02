<template>
  <div class="mb-6" v-if="availableLanguages.length > 1">
    <h3 class="text-white text-base font-medium mb-3">🌐 {{ tr(ui.language) }}</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      <div
        v-for="lang in availableLanguages"
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        class="flex items-center p-3 bg-black/30 border border-white/20 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-white/10 hover:border-white/30"
        :class="engineState.settings.language === lang.code ? 'bg-blue-600 border-blue-500 text-white' : ''"
      >
        <span class="text-lg mr-2">{{ lang.flag }}</span>
        <span class="flex-1 font-medium">{{ lang.name }}</span>
        <span v-if="engineState.settings.language === lang.code" class="ml-2 text-white font-bold text-sm">✓</span>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { engineState as useEngineState } from '@generate/stores';
import t from '@generate/texts';
import type { Text } from '@generate/types';
import LanguageManager from '@engine/engine/Managers/LanguageManager';

const engineState = useEngineState();

const availableLanguages = computed(() => LanguageManager.getInstance().getLanguageList());

function selectLanguage(languageCode: string) {
  LanguageManager.getInstance().setLanguage(languageCode);
}

// simple translator for heading reuse
const ui = t.global.ui;
function tr(text: string | Text): string {
  return LanguageManager.getInstance().resolveText(text);
}
</script>
