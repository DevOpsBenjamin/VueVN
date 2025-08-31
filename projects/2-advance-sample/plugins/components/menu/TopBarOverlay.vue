<template>
  <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-1" style="height: 10%; font-size: 3cqw;">
    <div class="w-full h-full pointer-events-auto flex justify-between items-center">
      <div class="bg-black/30 backdrop-blur-sm text-white rounded h-full flex items-center" style="padding: 0 2cqh;">
        {{ formattedDate }}
      </div>
      <div class="flex items-center h-full" style="gap: 1cqh;">
        <button
          class="bg-black/30 backdrop-blur-sm text-white rounded hover:bg-white/20 transition-colors h-full flex items-center justify-center"
          style="min-width: 8cqh; padding: 0 1cqh;"
        >
          Inventory
        </button>
        <button
          class="bg-black/30 backdrop-blur-sm text-white rounded hover:bg-white/20 transition-colors h-full flex items-center justify-center"
          style="min-width: 6cqh; padding: 0 1cqh;"
        >
          Phone
        </button>
        <button
          @click.stop.prevent="showUserInfo"
          class="bg-black/30 backdrop-blur-sm text-white rounded hover:bg-white/20 transition-colors h-full flex items-center justify-center"
          style="width: 8cqh; padding: 0 1cqh;"
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
