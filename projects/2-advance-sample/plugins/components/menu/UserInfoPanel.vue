<template>
  <div class="flex h-full">
    <!-- Left Column - NPC List -->
    <div class="w-1/3 pr-4 border-r border-white/20">
      <h3 class="text-lg font-bold mb-3">Characters</h3>
      <div class="space-y-2">
        <button
          v-for="npc in npcs"
          :key="npc.id"
          @click="selectedNPC = npc"
          :class="[
            'w-full text-left p-2 rounded transition-colors',
            selectedNPC?.id === npc.id 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">{{ npc.name }}</div>
          <div class="text-sm opacity-75">
            {{ getRelationshipText(npc) }}
          </div>
        </button>
        
        <!-- Player Info Button -->
        <button
          @click="selectedNPC = null"
          :class="[
            'w-full text-left p-2 rounded transition-colors',
            selectedNPC === null 
              ? 'bg-white/20 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          ]"
        >
          <div class="font-medium">👤 You</div>
          <div class="text-sm opacity-75">Player Info</div>
        </button>
      </div>
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="w-full mt-4 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded transition-colors"
      >
        Close
      </button>
    </div>
    
    <!-- Right Column - Info Display -->
    <div class="w-2/3 pl-4">
      <!-- Player Info -->
      <div v-if="!selectedNPC" class="space-y-4">
        <h3 class="text-xl font-bold">Player Stats</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75">Energy</div>
            <div class="text-lg font-bold">{{ gameState.player.energy }}/100</div>
            <div class="w-full bg-white/20 rounded-full h-2 mt-1">
              <div 
                class="bg-green-500 h-2 rounded-full" 
                :style="{ width: `${gameState.player.energy}%` }"
              ></div>
            </div>
          </div>
          
          <div class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75">Lust</div>
            <div class="text-lg font-bold">{{ gameState.player.lust }}/100</div>
            <div class="w-full bg-white/20 rounded-full h-2 mt-1">
              <div 
                class="bg-red-500 h-2 rounded-full" 
                :style="{ width: `${gameState.player.lust}%` }"
              ></div>
            </div>
          </div>
          
          <div class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75">Bank Money</div>
            <div class="text-lg font-bold">${{ gameState.player.bankMoney }}</div>
          </div>
          
          <div class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75">Pocket Money</div>
            <div class="text-lg font-bold">${{ gameState.player.pocketMoney }}</div>
          </div>
        </div>
        
        <!-- Daily Activities -->
        <div class="bg-white/10 p-3 rounded">
          <div class="text-sm opacity-75 mb-2">Today's Activities</div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div v-for="(value, key) in gameState.player.daily" :key="key" class="flex justify-between">
              <span class="capitalize">{{ key.replace(/([A-Z])/g, ' $1').trim() }}:</span>
              <span :class="value ? 'text-green-400' : 'text-gray-400'">
                {{ value ? '✓' : '✗' }}
              </span>
            </div>
            <div v-if="Object.keys(gameState.player.daily).length === 0" class="col-span-2 text-gray-400">
              No activities today
            </div>
          </div>
        </div>
      </div>
      
      <!-- NPC Info -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold">{{ selectedNPC.name }}</h3>
          <div class="text-sm bg-white/20 px-2 py-1 rounded">
            {{ getRelationshipText(selectedNPC) }}
          </div>
        </div>
        
        <div class="grid grid-cols-1 gap-4">
          <!-- Relationship Progress -->
          <div class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75 mb-2">Relationship Progress</div>
            <div class="text-lg font-bold mb-1">{{ selectedNPC.relation }}/100</div>
            <div class="w-full bg-white/20 rounded-full h-3">
              <div 
                class="bg-pink-500 h-3 rounded-full transition-all duration-300" 
                :style="{ width: `${selectedNPC.relation}%` }"
              ></div>
            </div>
            <div class="text-xs opacity-60 mt-1">
              {{ getRelationDescription(selectedNPC) }}
            </div>
          </div>
          
          <!-- Trust Level (if available) -->
          <div v-if="'trust' in selectedNPC" class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75 mb-2">Trust Level</div>
            <div class="text-lg font-bold mb-1">{{ selectedNPC.trust }}/100</div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div 
                class="bg-blue-500 h-2 rounded-full" 
                :style="{ width: `${selectedNPC.trust}%` }"
              ></div>
            </div>
          </div>
          
          <!-- Last Interaction -->
          <div v-if="selectedNPC.lastInteraction" class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75">Last Interaction</div>
            <div class="capitalize">{{ selectedNPC.lastInteraction.replace('_', ' ') }}</div>
          </div>
          
          <!-- Favorite Topics (if available) -->
          <div v-if="'favoriteTopics' in selectedNPC && selectedNPC.favoriteTopics?.length" class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75 mb-2">Favorite Topics</div>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="topic in selectedNPC.favoriteTopics" 
                :key="topic"
                class="bg-white/20 px-2 py-1 rounded text-xs"
              >
                {{ topic }}
              </span>
            </div>
          </div>
          
          <!-- Relationship Tips -->
          <div class="bg-white/10 p-3 rounded">
            <div class="text-sm opacity-75 mb-2">Relationship Tips</div>
            <div class="text-sm">
              {{ getRelationshipTips(selectedNPC) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { gameState as useGameState } from '@/generate/stores';

defineEmits(['close']);

const gameState = useGameState();
const selectedNPC = ref(null as any);

const npcs = computed(() => {
  return [
    gameState.neighbor,
    gameState.mother
  ].filter(Boolean);
});

function getRelationshipText(npc: any) {
  if ('relationshipStatus' in npc) {
    const status = npc.relationshipStatus;
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
  
  // Fallback to relation number
  if (npc.relation >= 80) return 'Close Friend';
  if (npc.relation >= 50) return 'Friend';
  if (npc.relation >= 20) return 'Acquaintance';
  return 'Stranger';
}

function getRelationDescription(npc: any) {
  const relation = npc.relation;
  if (relation >= 90) return 'You have an incredibly close bond';
  if (relation >= 80) return 'Very close friends who trust each other';
  if (relation >= 60) return 'Good friends who enjoy spending time together';
  if (relation >= 40) return 'Friendly acquaintances who get along well';
  if (relation >= 20) return 'You know each other but aren\'t close yet';
  if (relation >= 10) return 'Recent acquaintances, still getting to know each other';
  return 'Strangers with minimal interaction';
}

function getRelationshipTips(npc: any) {
  const relation = npc.relation;
  const status = npc.relationshipStatus || 'stranger';
  
  if (npc.id === 'neighbor') {
    if (status === 'close_friend') {
      return 'Spend quality time together and be supportive. Late night visits might lead somewhere...';
    } else if (status === 'friend') {
      return 'Help with tasks, have coffee together, and show genuine interest in their life.';
    } else if (status === 'acquaintance') {
      return 'Visit regularly during appropriate hours (8h-17h), be polite and helpful.';
    } else {
      return 'Introduce yourself politely and be respectful of their time and space.';
    }
  }
  
  if (npc.id === 'mother') {
    return 'Spend time together and show you care about family.';
  }
  
  return 'Build trust through consistent positive interactions.';
}
</script>