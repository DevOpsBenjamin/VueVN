<template>
  <div class="space-y-4">
    <h3 class="text-xl font-bold">Player Stats</h3>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75">Energy</div>
        <div class="text-lg font-bold">{{ player.energy }}/100</div>
        <div class="w-full bg-white/20 rounded-full h-2 mt-1">
          <div 
            class="bg-green-500 h-2 rounded-full" 
            :style="{ width: `${player.energy}%` }"
          ></div>
        </div>
      </div>
      
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75">Lust</div>
        <div class="text-lg font-bold">{{ player.lust }}/100</div>
        <div class="w-full bg-white/20 rounded-full h-2 mt-1">
          <div 
            class="bg-red-500 h-2 rounded-full" 
            :style="{ width: `${player.lust}%` }"
          ></div>
        </div>
      </div>
      
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75">Bank Money</div>
        <div class="text-lg font-bold">${{ player.bankMoney }}</div>
      </div>
      
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75">Pocket Money</div>
        <div class="text-lg font-bold">${{ player.pocketMoney }}</div>
      </div>
    </div>
    
    <!-- Daily Activities -->
    <div class="bg-white/10 p-3 rounded">
      <div class="text-sm opacity-75 mb-2">Today's Activities</div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div v-for="(value, key) in player.daily" :key="key" class="flex justify-between">
          <span class="capitalize">{{ key.replace(/([A-Z])/g, ' $1').trim() }}:</span>
          <span :class="value ? 'text-green-400' : 'text-gray-400'">
            {{ value ? '✓' : '✗' }}
          </span>
        </div>
        <div v-if="Object.keys(player.daily).length === 0" class="col-span-2 text-gray-400">
          No activities today
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '@generate/types';

defineProps<{
  player: Player;
}>();
</script>