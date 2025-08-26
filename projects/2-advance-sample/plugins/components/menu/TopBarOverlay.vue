<template>
  <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-4">
    <div class="w-full flex justify-between items-center pointer-events-auto">
      <div class="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded">
        {{ formattedDate }}
      </div>
      <div class="flex gap-4">
        <button
          class="bg-black/30 backdrop-blur-sm text-white p-2 rounded"
        >
          Inventory
        </button>
        <button
          class="bg-black/30 backdrop-blur-sm text-white p-2 rounded"
        >
          Phone
        </button>
        <button
          @click.stop.prevent="showUserInfo"
          class="bg-black/30 backdrop-blur-sm text-white p-2 rounded"
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
