<template>
  <div class="space-y-3">
    <h3 class="text-lg font-bold mb-3">Player Stats</h3>
    
    <div class="space-y-2">
      <!-- Energy & Lust Stats with Progress Bars -->
      <div class="bg-white/10 p-2 rounded">
        <div class="text-xs opacity-75 mb-1">Energy</div>
        <div class="text-base font-bold mb-1">{{ player.energy }}/100</div>
        <div class="w-full bg-white/20 rounded h-2">
          <div 
            class="bg-green-500 h-2 rounded transition-all duration-200" 
            :style="{ width: `${player.energy}%` }"
          ></div>
        </div>
      </div>
      
      <div class="bg-white/10 p-2 rounded">
        <div class="text-xs opacity-75 mb-1">Lust</div>
        <div class="text-base font-bold mb-1">{{ player.lust }}/100</div>
        <div class="w-full bg-white/20 rounded h-2">
          <div 
            class="bg-red-500 h-2 rounded transition-all duration-200" 
            :style="{ width: `${player.lust}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Money Stats -->
      <div class="bg-white/10 p-2 rounded">
        <div class="text-xs opacity-75 mb-1">Bank Money</div>
        <div class="text-base font-bold">${{ player.bankMoney.toLocaleString() }}</div>
      </div>
      
      <div class="bg-white/10 p-2 rounded">
        <div class="text-xs opacity-75 mb-1">Pocket Money</div>
        <div class="text-base font-bold">${{ player.pocketMoney }}</div>
      </div>
    </div>
    
    <!-- Daily Activities -->
    <div class="bg-white/10 p-2 rounded">
      <div class="text-xs opacity-75 mb-2">Today's Activities</div>
      <div class="space-y-1 text-xs">
        <div v-for="(value, key) in player.daily" :key="key" class="flex justify-between">
          <span class="capitalize">{{ key.replace(/([A-Z])/g, ' $1').trim() }}:</span>
          <span :class="value ? 'text-green-400' : 'text-gray-400'">
            {{ value ? '✓' : '✗' }}
          </span>
        </div>
        <div v-if="Object.keys(player.daily).length === 0" class="text-gray-400 text-center py-1">
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