<template>
  <div
    class="h-full w-full flex flex-col bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800"
  >
    <div
      class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700"
    >
      <span class="font-mono text-green-400 text-sm">{{
        currentFileName
      }}</span>
      <div class="space-x-2">
        <button
          class="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-white disabled:opacity-50"
          :disabled="!currentFile"
          @click="run"
        >
          Preview
        </button>
        <button
          class="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-white disabled:opacity-50"
          :disabled="!currentFile"
          @click="save"
        >
          Save
        </button>
      </div>
    </div>
    <div class="flex-1 relative">
      <div ref="editorContainer" class="absolute inset-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { loadMonaco } from "@/editor/utils/monacoLoader.js";
import { registerEventTypes } from "@/editor/utils/eventTypes";
import { verifyEvent } from "@/editor/utils/verifyEvent";
import { useEditorState } from "@/editor/stores/editorState";

const editorContainer = ref<HTMLDivElement | null>(null);
let editorInstance: any = null;

const editorState = useEditorState();
const currentFile = computed(() => editorState.currentFile);
const currentFileName = computed(
  () => currentFile.value?.split("/").pop() ?? "No file selected",
);

async function loadFile(path: string) {
  const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
  const data = await res.json();
  editorInstance?.setValue(data.content);
}

function save() {
  if (!editorInstance || !currentFile.value) return;
  const code = editorInstance.getValue();
  if (!verifyEvent(code)) return;
  fetch("/api/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: currentFile.value, content: code }),
  });
}

function run() {
  if (!currentFile.value) return;
  editorState.previewVisible = true;
  console.debug("Run event", currentFile.value);
}

onMounted(async () => {
  await loadMonaco();
  registerEventTypes();
  editorInstance = window.monaco.editor.create(editorContainer.value!, {
    value: "",
    language: "typescript",
    theme: "vs-dark",
    automaticLayout: true,
  });
});

watch(currentFile, (file) => {
  if (file) loadFile(file);
});
</script>
