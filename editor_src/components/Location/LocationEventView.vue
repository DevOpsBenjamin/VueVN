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
    
    <!-- Add Event Modal -->
    <AddEventModal
      :is-open="showAddModal"
      :selected-location="selectedLocation"
      :is-global="isGlobal"
      @close="showAddModal = false"
      @create="createEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useEditorState } from '@editor/stores/editorState';
import { gameState as useGameState } from '@generate/stores';
import projectData from '@generate/project';
import { GameState } from '@generate/types';
import EventTreeNode from './EventTreeNode.vue';
import AddEventModal from './AddEventModal.vue';

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
const showAddModal = ref(false);

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
  showAddModal.value = true;
}

function createEvent(name: string, path: string, fullPath: string) {
  // Generate empty event template
  const template = generateEventTemplate(name, path);
  
  // Open editor with template content - file will be created when user saves
  editorState.openFileWithContent(fullPath, template);
}

function generateEventTemplate(name: string, path: string): string {
  const eventId = path ? `${path.replace(/\//g, '_')}_${name}` : name;
  
  return `import type { VNEvent, GameState, EngineAPI } from '@generate/types';

export default {
  name: '${name}',
  foreground: 'default.png', // Base foreground image for this event
  
  conditions: (state: GameState) => true, // Runtime conditions for execution
  unlocked: (state: GameState) => true,   // Unlock conditions (story gates)
  locked: (state: GameState) => false,    // Permanent removal conditions
  
  async execute(engine: EngineAPI, state: GameState) {
    // Your event logic here
    await engine.showText('Hello! This is a new event.');
    
    // Available API methods:
    // await engine.showText('Some text', 'Character Name'); // Show text with optional character name
    // await engine.showChoices([
    //   { text: 'Option 1', branch: 'option1' },
    //   { text: 'Option 2', branch: 'option2' }
    // ]); // Show choices and wait for selection
    // await engine.jump('other_event_id'); // Jump to another event
    
    // Non-waiting foreground management:
    // engine.setForeground(['image1.png', 'image2.png']); // Set foreground images
    // engine.addForeground('image.png'); // Add image to foreground
    // engine.replaceForeground('image.png'); // Replace current foreground
    
    // You can access and modify game state:
    // state.flags.${eventId}_completed = true;
    
    // IMPORTANT: Events should ALWAYS finish with an await call!
    // Code after the last await is NOT executed - the event ends at the last await.
  },
  
  // Optional: Choice branches for this event
  // branches: {
  //   option1: {
  //     async execute(engine: EngineAPI, state: GameState) {
  //       await engine.showText('You chose option 1');
  //     }
  //   },
  //   option2: {
  //     async execute(engine: EngineAPI, state: GameState) {
  //       await engine.showText('You chose option 2');
  //     }
  //   }
  // }
} satisfies VNEvent;
`;
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
