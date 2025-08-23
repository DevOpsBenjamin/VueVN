<template>
  <div
    v-show="engineState.state === EngineStateEnum.LOADING"
    class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-100 z-[100]"
  >
    <div
      class="w-12 h-12 border-4 border-green-400 border-t-gray-900 rounded-full animate-spin mb-4"
    ></div>
    <span class="text-green-400 font-mono text-lg tracking-wide"
      >Loading...</span
    >
  </div>
</template>

<script setup>
import { engineState as useEngineState } from '@/generate/stores';
import { EngineStateEnum } from '@/generate/enums';

const engineState = useEngineState();
</script>
