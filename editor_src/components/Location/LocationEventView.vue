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
            <th class="px-4 py-3 text-left text-white font-medium text-sm w-32">Status</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Name</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Locked</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Unlocked</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Condition</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm w-40">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <template v-for="(item, index) in eventsTree" :key="item.id">
            <EventTreeNode
              :node="item"
              :depth="0"
              :is-last="index === eventsTree.length - 1"
              :parent-branches="[]"
              @open-editor="openInEditor"
              @toggle-folder="toggleFolder"
            />
          </template>
          <tr v-if="eventsList.length === 0">
            <td colspan="6" class="px-4 py-8 text-left text-white/70 text-sm">
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
import { computed, ref } from 'vue';
import { useEditorState } from '@editor/stores/editorState';
import { gameState as useGameState } from '@generate/stores';
import projectData from '@generate/project';
import { GameState } from '@generate/types';
import EventTreeNode from './EventTreeNode.vue';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'event';
  isExpanded?: boolean;
  children?: TreeNode[];
  event?: any;
  fullPath?: string;
}

const editorState = useEditorState();
const gameState = useGameState();
const expandedFolders = ref<Set<string>>(new Set());

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

// Build tree structure from events
const eventsTree = computed(() => {
  const root: TreeNode[] = [];
  const folderMap = new Map<string, TreeNode>();

  eventsList.value.forEach(event => {
    const pathParts = event.displayPath.split('/');
    let currentLevel = root;
    let currentPath = '';

    // Create folder hierarchy
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderName = pathParts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      
      let folder = currentLevel.find(item => item.name === folderName && item.type === 'folder');
      if (!folder) {
        folder = {
          id: currentPath,
          name: folderName,
          type: 'folder',
          isExpanded: expandedFolders.value.has(currentPath),
          children: []
        };
        currentLevel.push(folder);
        folderMap.set(currentPath, folder);
      }
      currentLevel = folder.children!;
    }

    // Add the event
    const eventName = pathParts[pathParts.length - 1];
    currentLevel.push({
      id: event.id,
      name: eventName,
      type: 'event',
      event: event,
      fullPath: event.displayPath
    });
  });

  return root;
});

// Event handlers
function addNewEvent() {
  console.log('Add new event to:', selectedLocation.value);
}

function openInEditor(filePath: string) {
  editorState.openFile(filePath);
}

function toggleFolder(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId);
  } else {
    expandedFolders.value.add(folderId);
  }
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
