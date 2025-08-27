<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="w-2/3 h-2/3 bg-gray-950 border border-gray-800 rounded flex flex-col">
      <div class="flex-none flex items-center justify-between px-2 py-1 bg-gray-900 border-b border-gray-800">
        <div class="text-purple-400 font-bold truncate">{{ filePath }}</div>
        <div class="space-x-2">
          <button
            @click="saveFile"
            :disabled="isSaving"
            :class="[
              'px-3 py-1 rounded text-xs shadow transition-all duration-200',
              isSaving
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-purple-700 hover:bg-purple-600 text-white'
            ]"
          >
            <span v-if="isSaving" class="flex items-center space-x-1">
              <div class="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </span>
            <span v-else>Save</span>
          </button>
          <button
            @click="editorState.showTextPopup = false"
            class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs shadow"
          >
            Close
          </button>
        </div>
      </div>
      <div ref="editorContainer" class="flex-1 min-h-0"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { loadMonaco } from '@editor/utils/monacoLoader';
import { useEditorState } from '@editor/stores/editorState';

const editorContainer = ref<HTMLElement | null>(null);
let editorInstance: any = null;
const editorState = useEditorState();
const isSaving = ref(false);

const filePath = computed(() => editorState.textFilePath || '');

async function loadFile() {
  if (!filePath.value) return;
  const res = await fetch('/api/file?path=' + encodeURIComponent(filePath.value));
  const data = await res.json();
  if (editorInstance) {
    editorInstance.setValue(data.content);
  }
}

onMounted(async () => {
  await loadMonaco();
  if (editorContainer.value) {
    editorInstance = window.monaco.editor.create(editorContainer.value, {
      value: '',
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
    });
  }
  await loadFile();
});

onBeforeUnmount(() => {
  if (editorInstance) editorInstance.dispose();
});

async function saveFile() {
  if (isSaving.value || !filePath.value) return;
  try {
    isSaving.value = true;
    const value = editorInstance.getValue();
    await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath.value, content: value })
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

