<template>
  <div
    class="h-full w-full flex flex-col bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800"
  >
    <div
      class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700"
    >
      <span class="font-mono text-green-400 text-sm">Event Editor</span>
      <button
        class="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-white"
        @click="save"
      >
        Save
      </button>
    </div>
    <div class="flex-1 relative">
      <div ref="editorContainer" class="absolute inset-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from "vue";
import { loadMonaco } from "@/editor/utils/monacoLoader.js";
import { registerEventTypes } from "@/editor/utils/eventTypes";
import { useEventsStore } from "@/editor/stores/events";
import { storeToRefs } from "pinia";

const eventsStore = useEventsStore();
const { currentEvent } = storeToRefs(eventsStore);

let editorInstance: any = null;
const editorContainer = ref<HTMLDivElement | null>(null);

function save() {
  if (!editorInstance) return;
  eventsStore.updateCurrentEventCode(editorInstance.getValue());
  eventsStore.saveCurrentEvent();
}

onMounted(async () => {
  await loadMonaco();
  registerEventTypes();
  editorInstance = window.monaco.editor.create(editorContainer.value!, {
    value: currentEvent.value?.code || "",
    language: "typescript",
    theme: "vs-dark",
    automaticLayout: true,
  });

  editorInstance.onDidChangeModelContent(() => {
    eventsStore.updateCurrentEventCode(editorInstance.getValue());
  });

  watch(
    currentEvent,
    (evt) => {
      const value = evt?.code || "";
      if (editorInstance.getValue() !== value) {
        editorInstance.setValue(value);
      }
    },
    { immediate: true },
  );
});

onBeforeUnmount(() => {
  if (editorInstance) editorInstance.dispose();
});
</script>

<style scoped>
.h-full {
  height: 100%;
}
.w-full {
  width: 100%;
}
</style>
