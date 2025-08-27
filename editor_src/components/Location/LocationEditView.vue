<template>
  <div class="h-full flex flex-col bg-black/10">
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Header -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div class="flex items-center space-x-3">
            <button
              @click="goBack"
              class="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all duration-200 text-white"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <div class="flex-1">
              <h1 class="text-white text-2xl font-bold">
                {{ isGlobal ? '🌐 Global Events & Actions' : `📍 ${locationName}` }}
              </h1>
              <p class="text-white/70 text-sm">
                {{ isGlobal ? 'System-wide events and actions' : `Edit location: ${selectedLocation}` }}
              </p>
            </div>
          </div>
        </section>

        <!-- Actions Table -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
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
                  <td class="px-4 py-3 text-center">
                    <span class="text-white/70 text-xs">
                      {{ action.condition || 'None' }}
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
                  <td colspan="5" class="px-4 py-8 text-center text-white/70 text-sm">
                    <div class="flex flex-col items-center space-y-2">
                      <span class="text-2xl opacity-50">⚡</span>
                      <span>No actions configured yet</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Events Table -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
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
                  <td class="px-4 py-3 text-center">
                    <span class="text-white/70 text-xs">
                      {{ event.condition || 'None' }}
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
                  <td colspan="5" class="px-4 py-8 text-center text-white/70 text-sm">
                    <div class="flex flex-col items-center space-y-2">
                      <span class="text-2xl opacity-50">📅</span>
                      <span>No events configured yet</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorState } from '@editor/stores/editorState';
import projectData from '@generate/project';

const editorState = useEditorState();

// Computed properties
const selectedLocation = computed(() => editorState.selectedLocation || 'global');
const isGlobal = computed(() => selectedLocation.value === 'global');
const locationName = computed(() => {
  if (isGlobal.value) return 'Global';
  const location = projectData.locations[selectedLocation.value];
  return location?.info?.name || selectedLocation.value;
});

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
    condition: actionData.condition || null
  }));
});

// Events list with metadata
const eventsList = computed(() => {
  if (!currentLocationData.value?.events) return [];
  
  return Object.entries(currentLocationData.value.events).map(([id, eventData]) => ({
    id,
    name: eventData.name || id.charAt(0).toUpperCase() + id.slice(1),
    unlocked: true, // TODO: Get from game state
    locked: false, // TODO: Get from event config
    condition: eventData.condition || null
  }));
});

// Go back to location manager
function goBack() {
  editorState.activeModule = 'locationManager';
  editorState.selectedLocation = null;
}

// Action handlers
function addNewAction() {
  // TODO: Implement add action functionality
  console.log('Add new action to:', selectedLocation.value);
}

function editAction(actionId: string) {
  // TODO: Implement edit action functionality
  console.log('Edit action:', actionId, 'in location:', selectedLocation.value);
}

function addNewEvent() {
  // TODO: Implement add event functionality
  console.log('Add new event to:', selectedLocation.value);
}

function editEvent(eventId: string) {
  // TODO: Implement edit event functionality
  console.log('Edit event:', eventId, 'in location:', selectedLocation.value);
}
</script>