<template>
  <div class="flex h-screen">
    <!-- Explorer de fichiers à gauche -->
    <div
      class="w-1/5 h-full border-r border-gray-800 bg-gray-900 flex flex-col"
    >
      <div class="p-2">
        <span class="text-green-400 font-mono text-xs">Explorer</span>
      </div>
      <ProjectExplorer />
    </div>
    <!-- Centre : Monaco Editor + State Inspector -->
    <div class="flex-1 flex flex-col">
      <div class="flex-1 min-h-0">
        <!-- Monaco Editor -->
        <MonacoEditor />
      </div>
      <div class="h-1/3 border-t border-gray-800 bg-gray-950">
        <StateEditorPanel />
      </div>
    </div>
    <!-- Preview runtime flottant -->
    <FloatingGame />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { loadMonaco } from "@editor/utils/monacoLoader.js";
import MonacoEditor from "@editor/components/MonacoEditor.vue";
import StateEditorPanel from "@editor/components/StateEditorPanel.vue";
import FloatingGame from "@editor/components/FloatingGame.vue";
import ProjectExplorer from "@editor/components/ProjectExplorer.vue";

onMounted(async () => {
  await loadMonaco();
});
</script>
