<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold">{{ npc.name }}</h3>
      <div class="text-sm bg-white/20 px-2 py-1 rounded">
        {{ relationshipText }}
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-4">
      <!-- Relationship Progress -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Relationship Progress</div>
        <div class="text-lg font-bold mb-1">{{ npc.relation }}/100</div>
        <div class="w-full bg-white/20 rounded-full h-3">
          <div 
            class="bg-pink-500 h-3 rounded-full transition-all duration-300" 
            :style="{ width: `${npc.relation}%` }"
          ></div>
        </div>
        <div class="text-xs opacity-60 mt-1">
          {{ relationDescription }}
        </div>
      </div>
      
      <!-- Work Schedule (for Barista) -->
      <div v-if="'workSchedule' in npc" class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Work Schedule</div>
        <div class="text-sm">
          <div>Days: {{ formatWorkDays((npc as any).workSchedule.workDays) }}</div>
          <div>Hours: {{ (npc as any).workSchedule.startHour }}:00 - {{ (npc as any).workSchedule.endHour }}:00</div>
        </div>
      </div>
      
      <!-- Current Relationship Status -->
      <div class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Current Status</div>
        <div class="text-lg capitalize">{{ npc.relationship.replace('_', ' ') }}</div>
      </div>
      
      <!-- NPC Flags -->
      <div v-if="Object.keys(npc.flags).length > 0" class="bg-white/10 p-3 rounded">
        <div class="text-sm opacity-75 mb-2">Recent Interactions</div>
        <div class="space-y-1">
          <div v-for="(value, key) in npc.flags" :key="key" class="flex justify-between text-sm">
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
import type { DateableNPC } from '@generate/types';

const props = defineProps<{
  npc: DateableNPC;
  npcType?: 'neighbor' | 'barista';
}>();

const relationshipText = computed(() => {
  return props.npc.relationship.charAt(0).toUpperCase() + 
         props.npc.relationship.slice(1).replace('_', ' ');
});

const relationDescription = computed(() => {
  const relation = props.npc.relation;
  if (relation >= 90) return 'You have an incredibly close bond';
  if (relation >= 80) return 'Very close friends who trust each other';
  if (relation >= 60) return 'Good friends who enjoy spending time together';
  if (relation >= 40) return 'Friendly acquaintances who get along well';
  if (relation >= 20) return 'You know each other but aren\'t close yet';
  if (relation >= 10) return 'Recent acquaintances, still getting to know each other';
  return 'Strangers with minimal interaction';
});

const relationshipTips = computed(() => {
  const status = props.npc.relationship;
  const npcType = props.npcType;
  
  if (status === 'close_friend') {
    if (npcType === 'barista') {
      return 'Flirt boldly and suggest meeting after work. She seems very interested in you.';
    }
    return 'Spend quality time together and be supportive. Late night visits might lead somewhere...';
  } else if (status === 'friend') {
    if (npcType === 'barista') {
      return 'Chat about personal topics, compliment her, and try some light flirting.';
    }
    return 'Help with tasks, have coffee together, and show genuine interest in their life.';
  } else if (status === 'acquaintance') {
    if (npcType === 'barista') {
      return 'Visit during work hours, order coffee, and have friendly conversations.';
    }
    return 'Visit regularly during appropriate hours (8h-17h), be polite and helpful.';
  } else {
    if (npcType === 'barista') {
      return 'Start conversations, introduce yourself, and be a friendly regular customer.';
    }
    return 'Introduce yourself politely and be respectful of their time and space.';
  }
});

function formatWorkDays(workDays: number[]): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return workDays.map(day => dayNames[day]).join(', ');
}

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