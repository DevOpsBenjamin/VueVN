<template>
  <div v-if="gameState.flags.showUserInfo === true"
    @keydown.stop.prevent="onOverlayKey"
    class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
    <!-- Left Column - Character Selection -->
    <div class="w-1/3 pr-4 border-r border-white/20">
      <h3 class="text-lg font-bold mb-3">Characters</h3>
      <div class="space-y-2">
        <!-- Player Info Button -->
        <button
          @click="selectedCharacter = 'player'"
          :class="[
            'w-full text-left p-2 rounded transition-colors',
            selectedCharacter === 'player' 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">👤 You</div>
          <div class="text-sm opacity-75">Player Info</div>
        </button>
        
        <!-- Neighbor Button -->
        <button
          @click="selectedCharacter = 'neighbor'"
          :class="[
            'w-full text-left p-2 rounded transition-colors',
            selectedCharacter === 'neighbor' 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">{{ gameState.neighbor.name }}</div>
          <div class="text-sm opacity-75">
            {{ gameState.neighbor.relationship || 'Neighbor' }}
          </div>
        </button>
        
        <!-- Mother Button -->
        <button
          @click="selectedCharacter = 'mother'"
          :class="[
            'w-full text-left p-2 rounded transition-colors',
            selectedCharacter === 'mother' 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">{{ gameState.mother.name }}</div>
          <div class="text-sm opacity-75">Family</div>
        </button>
      </div>
      
      <!-- Close Button -->
      <button
        @click.stop.prevent="closeUserInfo"
        class="w-full mt-4 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded transition-colors"
      >
        Close
      </button>
    </div>
    
    <!-- Right Column - Dynamic Info Display -->
    <div class="w-2/3 px-4 pl-4">
      <PlayerInfoPanel v-if="selectedCharacter === 'player'" :player="gameState.player" />
      <NeighborInfoPanel v-else-if="selectedCharacter === 'neighbor'" :neighbor="gameState.neighbor" />
      <MotherInfoPanel v-else-if="selectedCharacter === 'mother'" :mother="gameState.mother" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { gameState as useGameState } from '@generate/stores';
import { PlayerInfoPanel, NeighborInfoPanel, MotherInfoPanel } from '@generate/components';

const gameState = useGameState();
const selectedCharacter = ref<'player' | 'neighbor' | 'mother'>('player');

function closeUserInfo() {
  gameState.flags.showUserInfo = false;
}

function onOverlayKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeUserInfo();
  }
}
</script>