<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-white text-lg font-semibold flex items-center">
        <span class="mr-2">⚡</span>
        Actions
      </h2>
      <button
        @click="addNewAction"
        class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-lg border border-white/20 transition-all duration-200 text-white"
      >
        <span class="text-lg">➕</span>
        <span class="font-medium">Add Action</span>
      </button>
    </div>
    
    <div class="overflow-hidden rounded-lg border border-white/10">
      <table class="w-full">
        <thead class="bg-white/5">
          <tr>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Action Name</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm">Status</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm">Locked</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm w-8"></th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm">Condition</th>
            <th class="px-4 py-3 text-center text-white font-medium text-sm w-32">Manage</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="action in actionsList" :key="action.id" class="hover:bg-white/5 transition-colors">
            <td class="px-4 py-3">
              <div class="text-white font-medium text-sm">{{ action.name }}</div>
              <div class="text-white/70 text-xs">{{ action.id }}</div>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="action.unlocked ? 'text-green-400' : 'text-gray-400'" class="text-xs font-medium">
                {{ action.unlocked ? 'Unlocked' : 'Locked' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="action.locked ? 'text-red-400' : 'text-green-400'" class="text-lg">
                {{ action.locked ? '🔒' : '🔓' }}
              </span>
            </td>
            <td class="px-2 py-3 text-center">
              <span class="text-lg" v-if="action.unlocked_condition">
                {{ evaluateCondition(action.unlocked_condition) ? '✅' : '❌' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-white/70 text-xs">
                {{ action.unlocked_condition || 'None' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <button
                @click="editAction(action.id)"
                class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
            </td>
          </tr>
          <tr v-if="actionsList.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-white/70 text-sm">
              <div class="flex flex-col items-center space-y-2">
                <span class="text-2xl opacity-50">⚡</span>
                <span>No actions configured yet</span>
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

// Actions list with metadata
const actionsList = computed(() => {
  if (!currentLocationData.value?.actions) return [];
  
  return Object.entries(currentLocationData.value.actions).map(([id, actionData]) => ({
    id,
    name: actionData.name || id.charAt(0).toUpperCase() + id.slice(1),
    unlocked: true, // TODO: Get from game state
    locked: false, // TODO: Get from action config
    unlocked_condition: actionData.unlocked || null
  }));
});

// Action handlers
function addNewAction() {
  // TODO: Implement add action functionality
  console.log('Add new action to:', selectedLocation.value);
}

function editAction(actionId: string) {
  // TODO: Implement edit action functionality
  console.log('Edit action:', actionId, 'in location:', selectedLocation.value);
}

// Condition evaluation function
function evaluateCondition(conditionStr: string): boolean {
  return false;
  /*
  if (!conditionStr || conditionStr.trim() === '') return true;
  
  try {
    // Create a function that takes gameState as parameter and evaluates the condition
    const conditionFunction = new Function('gameState', `return ${conditionStr}`);
    const result = conditionFunction(gameState);
    console.log('Action condition evaluation:', conditionStr, '→', result, 'GameState:', gameState);
    return Boolean(result);
  } catch (error) {
    console.warn('Failed to evaluate action condition:', conditionStr, error);
    return false;
  }
  */
}
</script>