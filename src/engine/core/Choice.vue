<template>
  <div
    v-if="engineState.choices && engineState.choices.length"
    class="absolute bottom-20 left-0 w-full z-50 pointer-events-auto"
  >
    <!-- Choice container with glass morphism background -->
    <div class="flex flex-col items-center space-y-3 max-w-3xl mx-auto px-6">
      <div class="choice-panel bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6 w-full">
        <div class="flex flex-col space-y-3">
          <button
            v-for="(choice, index) in engineState.choices"
            :key="choice.id"
            @click="select(choice.id)"
            class="choice-button group relative overflow-hidden rounded-xl px-6 py-4 text-left transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1"
            :class="`choice-${index + 1}`"
          >
            <!-- Button background with gradient -->
            <div class="absolute inset-0 bg-gradient-to-r from-slate-800/90 to-slate-700/90 group-hover:from-blue-600/90 group-hover:to-purple-600/90 transition-all duration-300"></div>
            
            <!-- Border glow effect -->
            <div class="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300"></div>
            
            <!-- Choice number indicator -->
            <div class="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-sm font-semibold text-white/70 group-hover:text-white transition-all duration-300">
              {{ index + 1 }}
            </div>
            
            <!-- Choice text -->
            <div class="relative pl-12 pr-4 py-1">
              <span class="text-white font-medium text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                {{ choice.text }}
              </span>
            </div>
            
            <!-- Hover arrow -->
            <div class="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Helper text -->
      <div class="text-center text-white/60 text-sm">
        Press 1-{{ engineState.choices.length }} or click to choose
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Engine from "@/engine/runtime/Engine";
import { engineState as useEngineState } from "@/generate/stores";

const engineState = useEngineState();

function select(id: string): void {
  Engine.getInstance()?.resolveAwaiter(id);
}

function handleKeyPress(event: KeyboardEvent): void {
  if (!engineState.choices || engineState.choices.length === 0) return;
  
  const key = event.key;
  const choiceIndex = parseInt(key) - 1;
  
  if (choiceIndex >= 0 && choiceIndex < engineState.choices.length) {
    event.preventDefault();
    event.stopPropagation(); // Prevent engine from handling this key
    select(engineState.choices[choiceIndex].id);
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>
