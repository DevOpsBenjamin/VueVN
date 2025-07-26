<template>
  <div class="p-2 bg-gray-800 text-xs text-gray-200 h-full overflow-auto">
    <div class="font-bold text-green-400 mb-2">ENGINE:</div>
    <pre>{{ engineState }}</pre>
  </div>
</template>

<script setup>
import { engineState as useEngineState } from '@/generate/engine';

const engineState = useEngineState();
</script>
