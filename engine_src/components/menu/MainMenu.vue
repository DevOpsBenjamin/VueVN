<template>
  <Transition name="fade">
    <div
      v-show="engineState.state === EngineStateEnum.MENU"
      :style="menuBgStyle"
      class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-80 transition-all duration-500"
      :class="{
        'opacity-100': engineState.state === EngineStateEnum.MENU,
        'opacity-0': engineState.state !== EngineStateEnum.MENU,
      }"
    >
      <!-- Main menu panel with responsive height and scroll -->
      <div class="flex flex-col items-center max-w-md w-full px-6 max-h-[calc(100%-4rem)] overflow-y-auto">
        <!-- Title section -->
        <div class="mb-6 lg:mb-8 text-center shrink-0">
          <h1 class="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-wider">
            VueVN
          </h1>
          <div
            class="w-16 sm:w-20 lg:w-24 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded mx-auto mb-2"
          ></div>
          <p class="text-white/60 text-xs sm:text-sm lg:text-base font-mono uppercase tracking-widest">
            Visual Novel Engine
          </p>
        </div>

        <!-- Menu buttons with scrollable footer -->
        <div class="flex flex-col gap-3 lg:gap-4 w-full flex-1 min-h-0">
          <!-- New Game -->
          <button
            @click.stop.prevent="newGame"
            class="group relative overflow-hidden rounded-xl px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 min-h-[40px] sm:min-h-[44px] lg:min-h-[48px] bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            ></div>
            <div class="relative flex items-center justify-between">
              <span>New Game</span>
              <span
                class="text-xl opacity-60 group-hover:opacity-100 transition-all duration-300"
                >🆕</span
              >
            </div>
          </button>

          <!-- Continue Game -->
          <button
            v-if="engineState.initialized"
            @click.stop.prevent="continueGame"
            class="group relative overflow-hidden rounded-xl px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 min-h-[40px] sm:min-h-[44px] lg:min-h-[48px] bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            ></div>
            <div class="relative flex items-center justify-between">
              <span>Continue</span>
              <span
                class="text-xl opacity-60 group-hover:opacity-100 transition-all duration-300"
                >▶️</span
              >
            </div>
          </button>

          <!-- Save Game -->
          <button
            v-if="engineState.initialized"
            @click.stop.prevent="saveGame"
            class="group relative overflow-hidden rounded-xl px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 min-h-[40px] sm:min-h-[44px] lg:min-h-[48px] bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            ></div>
            <div class="relative flex items-center justify-between">
              <span>Save</span>
              <span
                class="text-xl opacity-60 group-hover:opacity-100 transition-all duration-300"
                >💾</span
              >
            </div>
          </button>

          <!-- Load Game -->
          <button
            @click.stop.prevent="loadGame"
            class="group relative overflow-hidden rounded-xl px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 min-h-[40px] sm:min-h-[44px] lg:min-h-[48px] bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            ></div>
            <div class="relative flex items-center justify-between">
              <span>Load</span>
              <span
                class="text-xl opacity-60 group-hover:opacity-100 transition-all duration-300"
                >📂</span
              >
            </div>
          </button>

          <!-- Settings -->
          <button
            @click.stop.prevent="openSettings"
            class="group relative overflow-hidden rounded-xl px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 min-h-[40px] sm:min-h-[44px] lg:min-h-[48px] bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(107,114,128,0.3)]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-slate-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            ></div>
            <div class="relative flex items-center justify-between">
              <span>Settings</span>
              <span
                class="text-xl opacity-60 group-hover:opacity-100 transition-all duration-300"
                >⚙️</span
              >
            </div>
          </button>
          
          <!-- Footer info - now inside scrollable area -->
          <div class="mt-4 lg:mt-6 text-center">
            <p class="text-white/40 text-xs sm:text-sm lg:text-base font-mono">
              Press ESC anytime to return to menu
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { engineState as useEngineState } from '@generate/stores';
import { EngineStateEnum } from '@generate/enums';
import { Engine } from '@generate/engine';
const engineState = useEngineState();

function newGame() {
  const engine = Engine.getInstance();
  if (engine != null) {
    engine.startNewGame();
  }
}

function continueGame() {
  engineState.state = EngineStateEnum.RUNNING;
}

function loadGame() {
  engineState.state = EngineStateEnum.LOAD;
}

function openSettings() {
  engineState.state = EngineStateEnum.SETTING;
}

function saveGame() {
  engineState.state = EngineStateEnum.SAVE;
}

const menuBgStyle = {
  backgroundImage: "url('global/images/menu/main.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
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
