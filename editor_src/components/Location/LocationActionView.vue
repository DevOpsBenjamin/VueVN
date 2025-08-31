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
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Name</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Condition</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm w-40">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="action in actionsList" :key="action.id" class="hover:bg-white/5 transition-colors align-top">
            <td class="px-4 py-3">
              <div class="text-white font-medium text-sm flex items-center gap-2">
                <span>{{ action.unlockedResult ? '✅' : '❌' }}</span>
                <span>{{ action.displayPath }}</span>
              </div>
              <div class="text-white/60 text-xs">{{ action.id }}</div>
            </td>
            <td class="px-4 py-3 text-left">
              <div class="text-xs text-white whitespace-pre-wrap break-words">
                <span class="mr-2">{{ action.unlockedResult ? '✅' : '❌' }}</span>
                |
                <span class="ml-2 opacity-80">{{ action.unlockedText }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-left">
              <div class="flex items-center gap-2">
                <button
                  @click="openInEditor(action.filePath)"
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
          <tr v-if="actionsList.length === 0">
            <td colspan="3" class="px-4 py-8 text-left text-white/70 text-sm">
              <div class="flex flex-col space-y-2">
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
import { gameState as useGameState } from '@generate/stores';
import projectData from '@generate/project';
import type { GameState } from '@generate/types';

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
  if (!currentLocationData.value?.actions) return [] as Array<any>;

  return Object.entries(currentLocationData.value.actions).map(([id, actionData]) => {
    const relPath = currentLocationData.value?.actionsPaths?.[id] ?? id;
    const displayPath = relPath;
    const filePath = (isGlobal.value
      ? `global/actions/${relPath}`
      : `locations/${selectedLocation.value}/actions/${relPath}`) + '.ts';

    const unlockedResult = safeEval(actionData.unlocked, gameState.$state);

    return {
      id,
      displayPath,
      filePath,
      unlockedResult,
      unlockedText: fnText(actionData.unlocked),
    };
  });
});

// Action handlers
function addNewAction() {
  // TODO: Implement add action functionality
  console.log('Add new action to:', selectedLocation.value);
}

function openInEditor(filePath: string) {
  editorState.openFile(filePath);
}

// Condition evaluation function
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
