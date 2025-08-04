<template>
  <Transition name="fade">
    <div
      v-show="
        engineState.state === ENGINE_STATES.SAVE ||
        engineState.state === ENGINE_STATES.LOAD
      "
      :style="menuBgStyle"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50 transition-opacity duration-300"
      :class="{
        'opacity-100':
          engineState.state === ENGINE_STATES.SAVE ||
          engineState.state === ENGINE_STATES.LOAD,
        'opacity-0':
          engineState.state !== ENGINE_STATES.SAVE &&
          engineState.state !== ENGINE_STATES.LOAD,
      }"
    >
      <div
        class="bg-gray-900 text-white rounded-lg w-full max-w-3xl p-4 flex flex-col items-center"
      >
        <h2 class="text-xl font-bold mb-4 text-center">
          {{ mode === 'save' ? 'Save Game' : 'Load Game' }}
        </h2>
        <div class="grid grid-cols-4 grid-rows-2 gap-4 mb-6">
          <div
            v-for="slot in visibleSlots"
            :key="slot"
            class="bg-gray-800 rounded shadow p-2 flex flex-col items-center"
          >
            <div
              class="w-full h-24 bg-gray-700 flex items-center justify-center mb-2 rounded"
            >
              <img
                v-if="saves[slot] && saves[slot].screenshot"
                :src="saves[slot].screenshot"
                class="object-cover w-full h-full rounded"
              />
              <span v-else class="text-gray-400">No Screenshot</span>
            </div>
            <div class="w-full text-center mb-1">
              <span class="font-semibold">
                {{ saves[slot]?.name || `Slot ${slot}` }}
              </span>
            </div>
            <div class="w-full text-xs text-gray-400 mb-2 text-center">
              <span v-if="saves[slot]">{{
                formatDate(saves[slot].timestamp)
              }}</span>
            </div>
            <div class="w-full flex flex-col items-center">
              <template v-if="mode === 'save'">
                <input
                  v-model="saveNames[slot]"
                  placeholder="Save name..."
                  class="mb-1 px-2 py-1 rounded bg-gray-700 text-white w-full text-sm"
                />
                <button
                  @click="save(slot)"
                  class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm w-full"
                >
                  Save
                </button>
              </template>
              <template v-else>
                <button
                  :disabled="!saves[slot]"
                  @click="load(slot)"
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm w-full disabled:opacity-50"
                >
                  Load
                </button>
              </template>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center w-full">
          <div class="flex justify-between items-center w-full mb-2">
            <button
              @click="prevPage"
              :disabled="page === 0"
              class="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {{ page + 1 }}</span>
            <button
              @click="nextPage"
              :disabled="(page + 1) * slotsPerPage >= maxSlots"
              class="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  engineState as useEngineState,
  engineStateEnum as ENGINE_STATES,
} from '@/generate/stores';
const engineState = useEngineState();
import { PROJECT_ID } from '@/generate/components';

const slotsPerPage = 8;
const maxSlots = 24;
const page = ref(0);
const saves = ref({});
const saveNames = ref({});

const mode = computed(() => {
  if (engineState.state === ENGINE_STATES.SAVE) return 'save';
  if (engineState.state === ENGINE_STATES.LOAD) return 'load';
  return 'save'; // fallback
});

const visibleSlots = computed(() => {
  const start = page.value * slotsPerPage + 1;
  return Array.from({ length: slotsPerPage }, (_, i) => start + i).filter(
    (n) => n <= maxSlots
  );
});

function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString();
}

function loadSaves() {
  saves.value = {};
  for (let i = 1; i <= maxSlots; i++) {
    const raw = localStorage.getItem(`Save_${PROJECT_ID}_${i}`);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        saves.value[i] = data;
        saveNames.value[i] = data.name || '';
      } catch {}
    } else {
      saveNames.value[i] = '';
    }
  }
}

function save(slot) {
  console.log(`Saving to slot ${slot}`);
  console.log(`engine: ${window.__VN_ENGINE__}`);
  const name = saveNames.value[slot] || `Slot ${slot}`;
  window.__VN_ENGINE__.saveGame(slot, name);
  loadSaves();
}

function load(slot) {
  window.__VN_ENGINE__.loadGame(slot);
}

function prevPage() {
  if (page.value > 0) page.value--;
}
function nextPage() {
  if ((page.value + 1) * slotsPerPage < maxSlots) page.value++;
}

onMounted(loadSaves);

const menuBgStyle = {
  backgroundImage: "url('assets/images/background/menu.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
</script>

<style scoped>
input:disabled {
  opacity: 0.5;
}
</style>
