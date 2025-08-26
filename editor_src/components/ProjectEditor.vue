<template>
  <div class="flex h-screen">
    <!-- File explorer on the left -->
    <div
      class="w-1/5 h-full border-r border-gray-800 bg-gray-900 flex flex-col"
    >
      <div class="p-2">
        <span class="text-green-400 font-mono text-xs">Explorer</span>
      </div>
      <ProjectExplorer />
    </div>
    <!-- Center: Monaco Editor -->
    <div class="flex-1 min-h-0">
      <MonacoEditor />
    </div>
    <!-- Floating runtime preview -->
    <FloatingGame />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { loadMonaco } from "@editor/utils/monacoLoader.js";
import MonacoEditor from "@editor/components/MonacoEditor.vue";
import FloatingGame from "@editor/components/FloatingGame.vue";
import ProjectExplorer from "@editor/components/ProjectExplorer.vue";

onMounted(async () => {
  await loadMonaco();
});
</script>
