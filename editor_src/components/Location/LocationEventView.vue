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
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Name</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Locked</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Unlocked</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Condition</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm w-40">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="event in eventsList" :key="event.id" class="hover:bg-white/5 transition-colors align-top">
            <td class="px-4 py-3">
              <div class="text-white font-medium text-sm flex items-center gap-2">
                <span>{{ event.lockedResult ? '🔒' : (event.availableNow ? '✅' : '❌') }}</span>
                <span>{{ event.displayPath }}</span>
              </div>
              <div class="text-white/60 text-xs">{{ event.id }}</div>
            </td>
            <td class="px-4 py-3 text-left">
              <div class="text-xs text-white whitespace-pre-wrap break-words">
                <template v-if="event.lockedResult">
                  <span class="mr-2">🔒</span>
                  |
                  <span class="ml-2 opacity-80">{{ event.lockedText }}</span>
                </template>
                <template v-else>
                  <span class="mr-2">⬜</span>
                  |
                  <span class="ml-2 opacity-80">{{ event.lockedText }}</span>
                </template>
              </div>
            </td>
            <td class="px-4 py-3 text-left">
              <div class="text-xs text-white whitespace-pre-wrap break-words">
                <span class="mr-2">{{ event.unlockedResult ? '✅' : '❌' }}</span>
                |
                <span class="ml-2 opacity-80">{{ event.unlockedText }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-left">
              <div class="text-xs text-white whitespace-pre-wrap break-words">
                <span class="mr-2">{{ event.conditionResult ? '✅' : '❌' }}</span>
                |
                <span class="ml-2 opacity-80">{{ event.conditionText }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-left">
              <div class="flex items-center gap-2">
                <button
                  @click="openInEditor(event.filePath)"
                  class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
                >
                  <span>✏️</span>
                  <span>Edit</span>
                </button>
                <button
                  disabled
                  class="inline-flex items-center space-x-1 px-2 py-1 bg-white/10 rounded border border-white/10 text-white/40 text-xs cursor-not-allowed"
                  title="Delete (coming soon)"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="eventsList.length === 0">
            <td colspan="5" class="px-4 py-8 text-left text-white/70 text-sm">
              <div class="flex flex-col space-y-2">
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
import { gameState as useGameState } from '@generate/stores';
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
  if (!currentLocationData.value?.events) return [] as Array<any>;

  return Object.entries(currentLocationData.value.events).map(([id, eventData]) => {
    const relPath = currentLocationData.value?.eventsPaths?.[id] ?? id;
    const pathPrefix = isGlobal.value
      ? `@project/global/events/`
      : `@project/locations/${selectedLocation.value}/events/`;
    const path = pathPrefix + relPath;
    const filePath = (isGlobal.value
      ? `global/events/${relPath}`
      : `locations/${selectedLocation.value}/events/${relPath}`) + '.ts';

    const lockedResult = safeEval(eventData.locked, gameState.$state);
    const unlockedResult = safeEval(eventData.unlocked, gameState.$state);
    const conditionResult = safeEval(eventData.conditions, gameState.$state);

    return {
      id,
      path,
      displayPath: relPath,
      filePath,
      availableNow: unlockedResult && conditionResult && !lockedResult,
      lockedResult,
      unlockedResult,
      conditionResult,
      lockedText: fnText(eventData.locked),
      unlockedText: fnText(eventData.unlocked),
      conditionText: fnText(eventData.conditions),
    };
  });
});

// Event handlers
function addNewEvent() {
  // TODO: Implement add event functionality
  console.log('Add new event to:', selectedLocation.value);
}

function openInEditor(filePath: string) {
  editorState.openFile(filePath);
}

function safeEval(fn: (state: GameState) => boolean, state: GameState): boolean {
  try {
    return !!fn?.(state);
  } catch {
    return false;
  }
}

function fnText(fn: Function | undefined): string {
  try {
    const s = fn?.toString() ?? 'None';
    return s.replace(/\s+/g, ' ').trim();
  } catch {
    return 'None';
  }
}
</script>
