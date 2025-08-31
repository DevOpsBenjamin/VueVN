<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-white text-lg font-semibold flex items-center">
        <span class="mr-2">📅</span>
        Events
      </h2>
      <button
        @click="addNewEvent"
        class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg border border-white/20 transition-all duration-200 text-white"
      >
        <span class="text-lg">➕</span>
        <span class="font-medium">Add Event</span>
      </button>
    </div>
    
    <div class="overflow-hidden rounded-lg border border-white/10">
      <table class="w-full">
        <thead class="bg-white/5">
          <tr>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Event Name</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm">Status</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm">Locked</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm w-8"></th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm">Condition</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm w-32">Manage</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="event in eventsList" :key="event.id" class="hover:bg-white/5 transition-colors">
            <td class="px-4 py-3">
              <div class="text-white font-medium text-sm">{{ event.name }}</div>
              <div class="text-white/70 text-xs">{{ event.id }}</div>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="event.unlocked ? 'text-green-400' : 'text-gray-400'" class="text-xs font-medium">
                {{ event.unlocked ? 'Unlocked' : 'Locked' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="event.locked ? 'text-red-400' : 'text-green-400'" class="text-lg">
                {{ event.locked ? '🔒' : '🔓' }}
              </span>
            </td>
            <td class="px-2 py-3 text-center">
              <span class="text-lg" v-if="event.conditions">
                {{ evaluateCondition(event.conditions) ? '✅' : '❌' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-white/70 text-xs">
                {{ event.conditions || 'None' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <button
                @click="editEvent(event.id)"
                class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
            </td>
          </tr>
          <tr v-if="eventsList.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-white/70 text-sm">
              <div class="flex flex-col items-center space-y-2">
                <span class="text-2xl opacity-50">📅</span>
                <span>No events configured yet</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorState } from '@editor/stores/editorState';
import { useGameState } from '@engine/stores/gameState';
import projectData from '@generate/project';
import { GameState } from '@generate/types';

const editorState = useEditorState();
const gameState = useGameState();

// Computed properties
const selectedLocation = computed(() => editorState.selectedLocation || 'global');
const isGlobal = computed(() => selectedLocation.value === 'global');

// Get current location data
const currentLocationData = computed(() => {
  if (isGlobal.value) {
    return projectData.global;
  }
  return projectData.locations[selectedLocation.value];
});

// Events list with metadata
const eventsList = computed(() => {
  if (!currentLocationData.value?.events) return [];
  
  return Object.entries(currentLocationData.value.events).map(([id, eventData]) => ({
    id,
    name: eventData.name || id.charAt(0).toUpperCase() + id.slice(1),
    unlocked: true, // TODO: Get from game state
    locked: false, // TODO: Get from event config
    conditions: eventData.conditions || null
  }));
});

// Event handlers
function addNewEvent() {
  // TODO: Implement add event functionality
  console.log('Add new event to:', selectedLocation.value);
}

function editEvent(eventId: string) {
  // TODO: Implement edit event functionality
  console.log('Edit event:', eventId, 'in location:', selectedLocation.value);
}

// Condition evaluation function
function evaluateCondition(condition_func: (state: GameState) => boolean): boolean {
  if (condition_func(gameState.$state) == true) {
    return true;
  }
  return false;
  /*
  if (!conditionStr || conditionStr.trim() === '') return true;
  
  try {
    // Create a function that takes gameState as parameter and evaluates the condition
    const conditionFunction = new Function('gameState', `return ${conditionStr}`);
    const result = conditionFunction(gameState);
    console.log('Event condition evaluation:', conditionStr, '→', result, 'GameState:', gameState);
    return Boolean(result);
  } catch (error) {
    console.warn('Failed to evaluate event condition:', conditionStr, error);
    */
}
</script>