<template>
  <div class="settings-section">
    <h3>🌐 Language</h3>
    <div class="language-options">
      <div 
        v-for="lang in availableLanguages" 
        :key="lang.code"
        class="language-option"
        :class="{ active: engineState.settings.language === lang.code }"
        @click="selectLanguage(lang.code)"
      >
        <span class="language-flag">{{ lang.flag }}</span>
        <span class="language-name">{{ lang.name }}</span>
        <span v-if="engineState.settings.language === lang.code" class="checkmark">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEngineState } from '@generate/stores';

const engineState = useEngineState();

interface Language {
  code: string;
  name: string;
  flag: string;
}

const availableLanguages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

function selectLanguage(languageCode: string) {
  engineState.settings.language = languageCode;
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

.language-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.language-option {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #333;
  border: 2px solid #444;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.language-option:hover {
  background: #3a3a3a;
  border-color: #555;
}

.language-option.active {
  background: #4a90e2;
  border-color: #357abd;
  color: white;
}

.language-flag {
  font-size: 20px;
  margin-right: 10px;
}

.language-name {
  flex: 1;
  font-weight: 500;
}

.checkmark {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
}
</style>