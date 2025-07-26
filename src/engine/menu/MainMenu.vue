<template>
  <Transition name="fade">
    <div
      v-show="engineState.state === ENGINE_STATES.MENU"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50 transition-opacity duration-300"
      :class="{
        'opacity-100': engineState.state === ENGINE_STATES.MENU,
        'opacity-0': engineState.state !== ENGINE_STATES.MENU,
      }"
    >
      <div
        class="flex flex-col gap-4 bg-gray-900 bg-opacity-90 p-8 rounded-lg border border-gray-800 min-w-[250px] shadow-xl"
      >
        <span
          class="text-green-400 font-mono text-2xl text-center mb-2 tracking-wider"
        >
          MENU
        </span>

        <button
          class="px-6 py-3 bg-green-700 hover:bg-green-600 text-white rounded font-mono font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
          @click="newGame"
        >
          New Game
        </button>

        <button
          v-if="engineState.initialized"
          class="px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded font-mono font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
          @click="continueGame"
        >
          Continue
        </button>

        <button
          class="px-6 py-3 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-mono font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
          @click="loadGame"
        >
          Load
        </button>

        <button
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
          @click="openSettings"
        >
          Settings
        </button>

        <button
          v-if="engineState.initialized"
          class="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded font-mono font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
          @click="saveGame"
        >
          Save
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { engineState as useEngineState } from '@/generate/engine';
import { ENGINE_STATES } from '../stores/engineStateEnum';

const engineState = useEngineState();

function newGame() {
  engineState.state = ENGINE_STATES.LOADING;
}

function continueGame() {
  // Implement continue game logic
}

function loadGame() {
  // Implement load game logic
}

function openSettings() {
  // Implement settings logic
}

function saveGame() {
  // Implement save game logic
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
