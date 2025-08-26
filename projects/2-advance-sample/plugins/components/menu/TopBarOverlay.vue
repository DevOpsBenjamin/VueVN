<template>
  <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-4">
    <div class="w-full flex justify-between items-center pointer-events-auto">
      <div class="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded">
        {{ formattedDate }}
      </div>
      <div class="flex gap-2">
        <button
          class="bg-black/30 backdrop-blur-sm text-white px-3 py-2 rounded"
        >
          Inventory
        </button>
        <button
          class="bg-black/30 backdrop-blur-sm text-white px-3 py-2 rounded"
        >
          Phone
        </button>
        <button
          @click="showUserInfo = !showUserInfo"
          class="bg-black/30 backdrop-blur-sm text-white px-3 py-2 rounded"
        >
          👤
        </button>
      </div>
      
      <!-- User Info Panel -->
      <div 
        v-if="showUserInfo"
        class="absolute top-16 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg w-96 max-h-96 overflow-y-auto"
      >
        <UserInfoPanel @close="showUserInfo = false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { gameState as useGameState } from '@generate/stores';
import UserInfoPanel from './UserInfoPanel.vue';

const gameState = useGameState();
const showUserInfo = ref(false);

const formattedDate = computed(() => {
  const { year, month, day, hour } = gameState.gameTime;
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  return `${m}-${d} ${h}:00`;
});
</script>
