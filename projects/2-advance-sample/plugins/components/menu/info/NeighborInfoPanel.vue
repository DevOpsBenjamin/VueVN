<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold">{{ neighbor.name }}</h3>
      <div class="text-sm bg-white/20 px-2 py-1 rounded">
        {{ relationshipText }}
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-4">
      <!-- Relationship Progress -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Relationship Progress</div>
        <div class="text-lg font-bold mb-1">{{ neighbor.relation }}/100</div>
        <div class="w-full bg-white/20 rounded-full h-3">
          <div 
            class="bg-pink-500 h-3 rounded-full transition-all duration-300" 
            :style="{ width: `${neighbor.relation}%` }"
          ></div>
        </div>
        <div class="text-xs opacity-60 mt-1">
          {{ relationDescription }}
        </div>
      </div>
      
      <!-- Trust Level -->
      <div v-if="'trust' in neighbor" class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Trust Level</div>
        <div class="text-lg font-bold mb-1">{{ neighbor.trust }}/100</div>
        <div class="w-full bg-white/20 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full" 
            :style="{ width: `${neighbor.trust}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Current Relationship Status -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Current Status</div>
        <div class="text-lg capitalize">{{ neighbor.relationship.replace('_', ' ') }}</div>
      </div>
      
      <!-- Neighbor Flags -->
      <div v-if="Object.keys(neighbor.flags).length > 0" class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Recent Interactions</div>
        <div class="space-y-1">
          <div v-for="(value, key) in neighbor.flags" :key="key" class="flex justify-between text-sm">
            <span class="capitalize">{{ formatFlagName(key) }}:</span>
            <span :class="value ? 'text-green-400' : 'text-gray-400'">
              {{ value ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Relationship Tips -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Relationship Tips</div>
        <div class="text-sm">{{ relationshipTips }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Neighbor } from '@generate/types';

const props = defineProps<{
  neighbor: Neighbor;
}>();

const relationshipText = computed(() => {
  if (props.neighbor.relationship) {
    return props.neighbor.relationship.charAt(0).toUpperCase() + 
           props.neighbor.relationship.slice(1).replace('_', ' ');
  }
  
  // Fallback to relation number
  const relation = props.neighbor.relation;
  if (relation >= 80) return 'Close Friend';
  if (relation >= 50) return 'Friend';
  if (relation >= 20) return 'Acquaintance';
  return 'Stranger';
});

const relationDescription = computed(() => {
  const relation = props.neighbor.relation;
  if (relation >= 90) return 'You have an incredibly close bond';
  if (relation >= 80) return 'Very close friends who trust each other';
  if (relation >= 60) return 'Good friends who enjoy spending time together';
  if (relation >= 40) return 'Friendly acquaintances who get along well';
  if (relation >= 20) return 'You know each other but aren\'t close yet';
  if (relation >= 10) return 'Recent acquaintances, still getting to know each other';
  return 'Strangers with minimal interaction';
});

const relationshipTips = computed(() => {
  const status = props.neighbor.relationship || 'stranger';
  
  if (status === 'close_friend') {
    return 'Spend quality time together and be supportive. Late night visits might lead somewhere...';
  } else if (status === 'friend') {
    return 'Help with tasks, have coffee together, and show genuine interest in their life.';
  } else if (status === 'acquaintance') {
    return 'Visit regularly during appropriate hours (8h-17h), be polite and helpful.';
  } else {
    return 'Introduce yourself politely and be respectful of their time and space.';
  }
});

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