<template>
  <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-2 sm:p-3 lg:p-4">
    <div class="w-full flex justify-between items-center pointer-events-auto flex-wrap gap-2">
      <div class="bg-black/30 backdrop-blur-sm text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded text-xs sm:text-sm lg:text-base">
        {{ formattedDate }}
      </div>
      <div class="flex gap-1 sm:gap-2 lg:gap-4">
        <button
          class="bg-black/30 backdrop-blur-sm text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px] lg:min-h-[40px]"
        >
          Inventory
        </button>
        <button
          class="bg-black/30 backdrop-blur-sm text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px] lg:min-h-[40px]"
        >
          Phone
        </button>
        <button
          @click.stop.prevent="showUserInfo"
          class="bg-black/30 backdrop-blur-sm text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px] lg:min-h-[40px]"
        >
          👤
        </button>
      </div>
    </div>
  </div>
  <!-- User Info Panel -->
  <UserInfoPanel />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { gameState as useGameState } from '@generate/stores';
import UserInfoPanel from './UserInfoPanel.vue';

const gameState = useGameState();

function showUserInfo() {
  if (gameState.flags.showUserInfo === true) {
    gameState.flags.showUserInfo = false
  } else {
    gameState.flags.showUserInfo = true
  }
}

const formattedDate = computed(() => {
  const { month, day, hour } = gameState.gameTime;
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  return `${m}-${d} ${h}:00`;
});
</script>
