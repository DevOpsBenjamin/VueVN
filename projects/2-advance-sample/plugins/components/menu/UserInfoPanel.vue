<template>
  <div v-if="gameState.flags.showUserInfo === true"
    @keydown.stop.prevent="onOverlayKey"
    class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10 p-2 sm:p-4">
    <div class="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col lg:flex-row shadow-2xl overflow-hidden">
      <!-- Left Column - Character Selection -->
      <div class="w-full lg:w-1/5 p-3 lg:p-4 border-b lg:border-b-0 lg:border-r border-white/20 overflow-y-auto">
        <h3 class="text-base sm:text-lg font-bold mb-2 lg:mb-3 text-white">Characters</h3>
        <div class="space-y-1 lg:space-y-2">
        <!-- Player Info Button -->
        <button
          @click="selectedCharacter = 'player'"
          :class="[
            'w-full text-left p-2 lg:p-3 rounded transition-colors text-xs sm:text-sm lg:text-base',
            selectedCharacter === 'player' 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">👤 You</div>
          <div class="text-xs sm:text-sm opacity-75">Player Info</div>
        </button>
        
        <!-- Neighbor Button -->
        <button
          @click="selectedCharacter = 'neighbor'"
          :class="[
            'w-full text-left p-2 lg:p-3 rounded transition-colors text-xs sm:text-sm lg:text-base',
            selectedCharacter === 'neighbor' 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">{{ gameState.neighbor.name }}</div>
          <div class="text-xs sm:text-sm opacity-75">
            {{ gameState.neighbor.relationship || 'Neighbor' }}
          </div>
        </button>
        
        <!-- Barista Button -->
        <button
          @click="selectedCharacter = 'barista'"
          :class="[
            'w-full text-left p-2 lg:p-3 rounded transition-colors text-xs sm:text-sm lg:text-base',
            selectedCharacter === 'barista' 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">{{ gameState.barista.name }}</div>
          <div class="text-xs sm:text-sm opacity-75">
            {{ gameState.barista.relationship || 'Barista' }}
          </div>
        </button>
        
        <!-- Mother Button -->
        <button
          @click="selectedCharacter = 'mother'"
          :class="[
            'w-full text-left p-2 lg:p-3 rounded transition-colors text-xs sm:text-sm lg:text-base',
            selectedCharacter === 'mother' 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">{{ gameState.mother.name }}</div>
          <div class="text-xs sm:text-sm opacity-75">Family</div>
        </button>
      </div>
      
        <!-- Close Button -->
        <button
          @click.stop.prevent="closeUserInfo"
          class="w-full mt-2 lg:mt-4 bg-red-600/80 hover:bg-red-600 text-white p-2 lg:p-3 rounded transition-colors text-xs sm:text-sm lg:text-base"
        >
          Close
        </button>
      </div>
      
      <!-- Right Column - Dynamic Info Display -->
      <div class="flex-1 p-3 lg:p-4 overflow-y-auto">
        <PlayerInfoPanel v-if="selectedCharacter === 'player'" :player="gameState.player" />
        <DateableNPCInfoPanel v-else-if="selectedCharacter === 'neighbor'" :npc="gameState.neighbor" npc-type="neighbor" />
        <DateableNPCInfoPanel v-else-if="selectedCharacter === 'barista'" :npc="gameState.barista" npc-type="barista" />
        <MotherInfoPanel v-else-if="selectedCharacter === 'mother'" :mother="gameState.mother" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { gameState as useGameState } from '@generate/stores';
import { PlayerInfoPanel, MotherInfoPanel, DateableNPCInfoPanel } from '@generate/components';

const gameState = useGameState();
const selectedCharacter = ref<'player' | 'neighbor' | 'barista' | 'mother'>('player');

function closeUserInfo() {
  gameState.flags.showUserInfo = false;
}

function onOverlayKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeUserInfo();
  }
}
</script>