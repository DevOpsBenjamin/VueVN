<template>
  <div class="h-full flex flex-col bg-black/10">
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Header with Tabs -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div class="flex items-center space-x-4">
            <!-- Back Button -->
            <button
              @click="goBack"
              class="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all duration-200 text-white flex-shrink-0"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            <!-- Location Name -->
            <div class="flex-shrink-0">
              <h1 class="text-white text-xl font-bold">
                {{ isGlobal ? '🌐 Global Resources' : `📍 ${locationName}` }}
              </h1>
            </div>

            <!-- Edit Location Info -->
            <button
              v-if="!isGlobal"
              @click="editLocationInfo"
              class="flex items-center space-x-1 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-sm flex-shrink-0"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>

            <!-- Tabs Navigation -->
            <div class="flex-1 flex items-center justify-center">
              <div class="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  ]"
                >
                  <span class="text-base">{{ tab.icon }}</span>
                  <span>{{ tab.name }}</span>
                  <span v-if="tab.count > 0" class="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                    {{ tab.count }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Dynamic Tab Content -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <!-- Actions Tab -->
          <div v-if="activeTab === 'actions'">
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
                    <th class="px-4 py-3 text-center text-white font-medium text-sm w-40">Manage</th>
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
                        {{ action.unlocked_condition || 'None' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center space-x-2">
                        <button
                          @click="editAction(action.id)"
                          class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button
                          @click="deleteAction(action.id)"
                          class="inline-flex items-center space-x-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/30 text-red-400 text-xs transition-all duration-200"
                        >
                          <span>🗑️</span>
                          <span>Del</span>
                        </button>
                      </div>
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
          </div>

          <!-- Events Tab -->
          <div v-if="activeTab === 'events'">
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
                    <th class="px-4 py-3 text-center text-white font-medium text-sm w-40">Manage</th>
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
                        {{ event.conditions || 'None' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center space-x-2">
                        <button
                          @click="editEvent(event.id)"
                          class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button
                          @click="deleteEvent(event.id)"
                          class="inline-flex items-center space-x-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/30 text-red-400 text-xs transition-all duration-200"
                        >
                          <span>🗑️</span>
                          <span>Del</span>
                        </button>
                      </div>
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
          </div>

          <!-- i18n Tab -->
          <div v-if="activeTab === 'i18n'">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-white text-lg font-semibold flex items-center">
                <span class="mr-2">🌐</span>
                i18n
              </h2>
            </div>
            <div class="overflow-hidden rounded-lg border border-white/10">
              <table class="w-full">
                <thead class="bg-white/5">
                  <tr>
                    <th class="px-4 py-3 text-left text-white font-medium text-sm">Action</th>
                    <th class="px-4 py-3 text-left text-white font-medium text-sm">Key</th>
                    <th class="px-4 py-3 text-left text-white font-medium text-sm">EN</th>
                    <th class="px-4 py-3 text-left text-white font-medium text-sm">FR</th>
                    <th class="px-4 py-3 text-center text-white font-medium text-sm w-32">Manage</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="entry in i18nEntries" :key="entry.action + entry.key" class="hover:bg-white/5 transition-colors">
                    <td class="px-4 py-3 text-white text-sm">{{ entry.action }}</td>
                    <td class="px-4 py-3 text-white text-sm">{{ entry.key }}</td>
                    <td class="px-4 py-3 text-white/70 text-sm">{{ entry.en }}</td>
                    <td class="px-4 py-3 text-sm" :class="entry.fr ? 'text-white/70' : 'text-red-400'">
                      {{ entry.fr || 'Missing' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button
                        @click="openTextFile(entry.file)"
                        class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="i18nEntries.length === 0">
                    <td colspan="5" class="px-4 py-8 text-center text-white/70 text-sm">
                      <div class="flex flex-col items-center space-y-2">
                        <span class="text-2xl opacity-50">🌐</span>
                        <span>No texts found</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Images Tab -->
          <div v-if="activeTab === 'images'">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-white text-lg font-semibold flex items-center">
                <span class="mr-2">🖼️</span>
                Images
              </h2>
              <button
                @click="addNewImage"
                class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg border border-white/20 transition-all duration-200 text-white"
              >
                <span class="text-lg">➕</span>
                <span class="font-medium">Add Image</span>
              </button>
            </div>
            <div class="text-center py-12">
              <div class="text-6xl mb-4">🖼️</div>
              <h3 class="text-white text-xl font-semibold mb-2">Images Management</h3>
              <p class="text-white/70 mb-4">Image management interface coming soon...</p>
            </div>
          </div>

          <!-- Sounds Tab -->
          <div v-if="activeTab === 'sounds'">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-white text-lg font-semibold flex items-center">
                <span class="mr-2">🔊</span>
                Sounds
              </h2>
              <button
                @click="addNewSound"
                class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg border border-white/20 transition-all duration-200 text-white"
              >
                <span class="text-lg">➕</span>
                <span class="font-medium">Add Sound</span>
              </button>
            </div>
            <div class="text-center py-12">
              <div class="text-6xl mb-4">🔊</div>
              <h3 class="text-white text-xl font-semibold mb-2">Sounds Management</h3>
              <p class="text-white/70 mb-4">Sound management interface coming soon...</p>
            </div>
          </div>

        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useEditorState } from '@editor/stores/editorState';
import projectData from '@generate/project';
import texts from '@generate/texts';

const editorState = useEditorState();

// Active tab state
const activeTab = ref('events');

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
    unlocked_condition: actionData.unlocked || null
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
    conditions: eventData.conditions || null
  }));
});

// i18n entries for this location
const i18nEntries = computed(() => {
  const result: { action: string; key: string; en: string; fr: string | null; file: string }[] = [];
  if (isGlobal.value) {
    return result;
  }
  const locTexts = (texts as any).locations?.[selectedLocation.value];
  if (!locTexts) return result;
  for (const [action, actionTexts] of Object.entries(locTexts)) {
    for (const [key, value] of Object.entries(actionTexts as any)) {
      const textObj = value as any;
      result.push({
        action,
        key,
        en: textObj.en,
        fr: textObj.fr,
        file: `locations/${selectedLocation.value}/texts/${action}/fr.ts`
      });
    }
  }
  return result;
});

// Tabs configuration
const tabs = computed(() => [
  {
    id: 'events',
    name: 'Events',
    icon: '📅',
    count: eventsList.value.length
  },
  {
    id: 'actions',
    name: 'Actions',
    icon: '⚡',
    count: actionsList.value.length
  },
  {
    id: 'i18n',
    name: 'i18n',
    icon: '🌐',
    count: i18nEntries.value.length
  },
  {
    id: 'images',
    name: 'Images',
    icon: '🖼️',
    count: 0 // TODO: Get from assets
  },
  {
    id: 'sounds',
    name: 'Sounds',
    icon: '🔊',
    count: 0 // TODO: Get from assets
  }
]);

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
  const base = isGlobal.value ? 'global/actions' : `locations/${selectedLocation.value}/actions`;
  editorState.openTextFile(`${base}/${actionId}.ts`);
}

async function deleteAction(actionId: string) {
  const base = isGlobal.value ? 'global/actions' : `locations/${selectedLocation.value}/actions`;
  await fetch(`/api/delete?path=${encodeURIComponent(`${base}/${actionId}.ts`)}`, { method: 'DELETE' });
  if (isGlobal.value) {
    delete (projectData as any).global.actions[actionId];
  } else {
    delete (projectData as any).locations[selectedLocation.value].actions[actionId];
  }
}

function addNewEvent() {
  // TODO: Implement add event functionality
  console.log('Add new event to:', selectedLocation.value);
}

function editEvent(eventId: string) {
  const base = isGlobal.value ? 'global/events' : `locations/${selectedLocation.value}/events`;
  editorState.openTextFile(`${base}/${eventId}.ts`);
}

async function deleteEvent(eventId: string) {
  const base = isGlobal.value ? 'global/events' : `locations/${selectedLocation.value}/events`;
  await fetch(`/api/delete?path=${encodeURIComponent(`${base}/${eventId}.ts`)}`, { method: 'DELETE' });
  if (isGlobal.value) {
    delete (projectData as any).global.events[eventId];
  } else {
    delete (projectData as any).locations[selectedLocation.value].events[eventId];
  }
}

// Asset handlers (placeholder)
function addNewImage() {
  console.log('Add new image to:', selectedLocation.value);
}

function addNewSound() {
  console.log('Add new sound to:', selectedLocation.value);
}

function openTextFile(path: string) {
  editorState.openTextFile(path);
}

function editLocationInfo() {
  if (isGlobal.value) return;
  editorState.openTextFile(`locations/${selectedLocation.value}/info.ts`);
}
</script>