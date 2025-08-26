<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold">{{ mother.name }}</h3>
      <div class="text-sm bg-white/20 px-2 py-1 rounded">
        Family
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-4">
      <!-- Family Bond -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Family Bond</div>
        <div class="text-lg font-bold mb-1">Strong</div>
        <div class="w-full bg-white/20 rounded-full h-3">
          <div class="bg-yellow-500 h-3 rounded-full transition-all duration-300 w-full"></div>
        </div>
        <div class="text-xs opacity-60 mt-1">
          Your loving mother who cares deeply about you
        </div>
      </div>
      
      <!-- Mother-specific flags/interactions -->
      <div v-if="Object.keys(mother.flags).length > 0" class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Recent Interactions</div>
        <div class="space-y-1">
          <div v-for="(value, key) in mother.flags" :key="key" class="flex justify-between text-sm">
            <span class="capitalize">{{ formatFlagName(key) }}:</span>
            <span :class="value ? 'text-green-400' : 'text-gray-400'">
              {{ value ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Mother's Schedule/Availability -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Typical Schedule</div>
        <div class="text-sm space-y-1">
          <div>🌅 Morning: Usually in the kitchen</div>
          <div>☀️ Afternoon: Around the house</div>
          <div>🌙 Evening: In her room or living room</div>
        </div>
      </div>
      
      <!-- Relationship Tips -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Relationship Tips</div>
        <div class="text-sm">
          Spend quality time together, help around the house, and show you care about family. 
          Your mother appreciates when you check in on her and share what's happening in your life.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mother } from '@generate/types';

defineProps<{
  mother: Mother;
}>();

function formatFlagName(flagName: string): string {
  return flagName.replace(/([A-Z])/g, ' $1')
                .replace(/_/g, ' ')
                .trim()
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
}
</script>