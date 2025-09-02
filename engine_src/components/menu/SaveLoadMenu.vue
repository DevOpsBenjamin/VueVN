<template>
  <Transition name="fade">
    <div
      v-show="
        engineState.state === EngineStateEnum.SAVE ||
        engineState.state === EngineStateEnum.LOAD
      "
      :style="menuBgStyle"
      class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-90 transition-all duration-500"
      :class="{
        'opacity-100':
          engineState.state === EngineStateEnum.SAVE ||
          engineState.state === EngineStateEnum.LOAD,
        'opacity-0':
          engineState.state !== EngineStateEnum.SAVE &&
          engineState.state !== EngineStateEnum.LOAD,
      }"
    >
      <!-- Main panel with glass morphism -->
      <div class="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl w-[calc(100%-2rem)] h-[calc(100%-2rem)] flex flex-col shadow-2xl">
        <!-- Header with gradient -->
        <div class="p-6 pb-4 text-center border-b border-white/10">
          <h2 class="text-2xl font-bold text-white mb-2 tracking-wide">
            {{ mode === 'save' ? tr(ui.save_game) : tr(ui.load_game) }}
          </h2>
          <div class="w-16 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded mx-auto"></div>
        </div>

        <!-- Save slots grid -->
        <div class="flex-1 overflow-y-auto p-4 min-h-0">
          <div class="grid grid-cols-2 lg:grid-cols-4 grid-rows-4 lg:grid-rows-2 gap-4 w-full h-full">
            <div
              v-for="slot in visibleSlots"
              :key="slot"
              class="group relative overflow-hidden rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <!-- Slot content -->
              <div class="p-3 flex flex-col h-full">
                <!-- Slot header -->
                <div class="mb-2">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-white/60 text-[10px] font-mono uppercase tracking-wider">{{ tr(ui.slot) }} {{ slot }}</span>
                    <div v-if="saves[slot]" class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  </div>
                  <h3 class="text-white font-medium text-sm truncate leading-tight">
                    {{ saves[slot]?.name || tr(ui.empty_slot) }}
                  </h3>
                </div>

                <!-- Timestamp -->
                <div class="mb-0 flex-grow">
                  <span v-if="saves[slot]" class="text-white/40 text-[10px] font-mono leading-tight">
                    {{ formatDate(saves[slot].timestamp) }}
                  </span>
                  <span v-else class="p-0 text-white/20 text-[10px] italic">{{ tr(ui.no_save_data) }}</span>
                </div>

                <!-- Action section -->
                <div class="space-y-1 mt-auto">
                  <template v-if="mode === 'save'">
                    <!-- Save name input -->
                    <input
                      v-model="saveNames[slot]"
                      :placeholder="tr(ui.save_name_placeholder)"
                      class="w-full px-3 py-1.5 text-xs rounded-md bg-black/30 border border-white/20 text-white placeholder-white/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 focus:outline-none transition-all duration-300"
                      @keydown="handleInputKeydown"
                      @keyup.stop
                      @keypress.stop
                    />
                    <!-- Save button -->
                    <button
                      @click="save(slot)"
                      class="w-full px-3 py-2 text-xs bg-gradient-to-r from-green-600/90 to-emerald-600/90 hover:from-green-500/90 hover:to-emerald-500/90 text-white rounded-md font-medium transition-all duration-300 hover:scale-[1.02] border border-green-500/20"
                    >
                      💾 {{ tr(ui.save) }}
                    </button>
                  </template>
                  <template v-else>
                    <!-- Load button -->
                    <button
                      :disabled="!saves[slot]"
                      @click="load(slot)"
                      class="w-full px-3 py-2 text-xs bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500/90 hover:to-purple-500/90 disabled:from-gray-600/30 disabled:to-gray-500/30 text-white rounded-md font-medium transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 border border-blue-500/20 disabled:border-gray-500/10"
                    >
                      {{ saves[slot] ? `📂 ${tr(ui.load)}` : tr(ui.empty) }}
                    </button>
                  </template>
                </div>
              </div>

              <!-- Hover gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-lg"></div>
            </div>
          </div>
        </div>

        <!-- Navigation controls -->
        <div class="p-3 border-t border-white/10 flex items-center justify-center">
          <div class="flex items-center gap-2 flex-wrap justify-center">
            <button
              @click="prevPage"
              :disabled="page === 0"
              class="flex items-center px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 disabled:border-white/10 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              <span class="mr-1">⬅️</span>
              {{ tr(ui.prev) }}
            </button>

            <!-- Page indicator -->
            <div class="px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white/80 font-mono text-sm">
              {{ page + 1 }} / {{ Math.ceil(maxSlots / slotsPerPage) }}
            </div>

            <button
              @click="nextPage"
              :disabled="(page + 1) * slotsPerPage >= maxSlots"
              class="flex items-center px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 disabled:border-white/10 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {{ tr(ui.next) }}
              <span class="ml-1">➡️</span>
            </button>
          </div>
          
          <!-- Close hint -->
          <div class="text-white/30 text-xs text-center mt-2">{{ tr(ui.esc_to_close) }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import t from '@generate/texts';
import type { Text } from '@generate/types';
import LanguageManager from '@engine/engine/Managers/LanguageManager';
import { engineState as useEngineState } from "@generate/stores";
import { EngineStateEnum } from '@generate/enums';
import { Engine } from '@generate/engine';
import type { SaveData } from '@generate/types';

const engineState = useEngineState();
import projectData from "@generate/project";
const slotsPerPage = 8;
const maxSlots = 24;
const page = ref(0);
const saves = ref<SaveData[]>([]);
const saveNames = ref<string[]>([]);

const mode = computed(() => {
  if (engineState.state === EngineStateEnum.SAVE) return "save";
  if (engineState.state === EngineStateEnum.LOAD) return "load";
  return "save"; // fallback
});

const visibleSlots = computed(() => {
  const start = page.value * slotsPerPage + 1;
  return Array.from({ length: slotsPerPage }, (_, i) => start + i).filter(
    (n) => n <= maxSlots,
  );
});

function formatDate(timestamp: string) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString();
}

function loadSaves() {
  saves.value = [];
  for (let i = 1; i <= maxSlots; i++) {
    const raw = localStorage.getItem(`Save_${projectData.project_id}_${i}`);
    if (raw) {
      try {
        const data: SaveData = JSON.parse(raw);
        saves.value[i] = data;
        saveNames.value[i] = data.name || "";
      } catch {}
    } else {
      saveNames.value[i] = "";
    }
  }
}

function save(slot: number) {
  console.log(`Saving to slot ${slot}`);  
  const engine = Engine.getInstance();
  const name = saveNames.value[slot] || `Slot ${slot}`;
  if (engine != null) {
    engine.saveGame(slot, name);
  }
  loadSaves();
}

function load(slot: number) {
  const engine = Engine.getInstance();
  if (engine != null) {
    engine.loadGame(slot);
  }
}

function prevPage() {
  if (page.value > 0) page.value--;
}
function nextPage() {
  if ((page.value + 1) * slotsPerPage < maxSlots) page.value++;
}

function handleInputKeydown(event: KeyboardEvent) {
  // Allow ESC to bubble up to close the menu
  if (event.key === 'Escape') {
    return;
  }
  // Stop all other keys from triggering navigation
  event.stopPropagation();
}

onMounted(loadSaves);

const menuBgStyle = {
  backgroundImage: "url('assets/images/background/menu.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

// Typed UI text access + translator
const ui = t.global.ui;
function tr(text: string | Text): string {
  return LanguageManager.getInstance().resolveText(text);
}
</script>

<style scoped>
input:disabled {
  opacity: 0.5;
}
</style>
