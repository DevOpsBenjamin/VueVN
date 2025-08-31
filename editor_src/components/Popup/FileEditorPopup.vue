<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="w-3/4 h-3/4 bg-gray-950 border border-gray-800 rounded flex flex-col shadow-xl">
      <div class="flex-none flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div class="text-purple-400 font-bold text-sm truncate">{{ headerTitle }}</div>
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
            @click="editorState.closeFile()"
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
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { loadMonaco } from '@editor/utils/monacoLoader';
import { useEditorState } from '@editor/stores/editorState';

const editorContainer = ref<HTMLElement | null>(null);
let editorInstance: any = null;
const isSaving = ref(false);
const content = ref('');

const editorState = useEditorState();

const headerTitle = computed(() => editorState.fileToEdit ? `Edit: ${editorState.fileToEdit}` : '');

watch(
  () => editorState.fileToEdit,
  async (newPath) => {
    if (newPath) {
      await loadFile(newPath);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (editorContainer.value) {
    await loadMonaco();
    editorInstance = window.monaco.editor.create(editorContainer.value, {
      value: content.value,
      language: detectLanguage(editorState.fileToEdit || ''),
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
    });
  }
});

onBeforeUnmount(() => {
  if (editorInstance) editorInstance.dispose();
});

function detectLanguage(path: string): string {
  if (path.endsWith('.vue')) return 'vue';
  if (path.endsWith('.json')) return 'json';
  return 'typescript';
}

async function loadFile(path: string) {
  try {
    // Check if we have initial content for a new file
    if (editorState.fileInitialContent) {
      content.value = editorState.fileInitialContent;
      if (editorInstance) {
        editorInstance.setValue(content.value);
        window.monaco.editor.setModelLanguage(editorInstance.getModel(), detectLanguage(path));
      }
      return;
    }
    
    // Load existing file
    const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      // File doesn't exist, start with empty content
      content.value = '';
    } else {
      const data = await res.json();
      content.value = data.content || '';
    }
    
    if (editorInstance) {
      editorInstance.setValue(content.value);
      window.monaco.editor.setModelLanguage(editorInstance.getModel(), detectLanguage(path));
    }
  } catch (err) {
    console.error('Error loading file', err);
    // Fallback to empty content
    content.value = '';
    if (editorInstance) {
      editorInstance.setValue('');
    }
  }
}

async function saveFile() {
  if (!editorState.fileToEdit || isSaving.value) return;
  try {
    isSaving.value = true;
    const body = {
      path: editorState.fileToEdit,
      content: editorInstance ? editorInstance.getValue() : content.value,
    };
    const res = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to save file');
    await new Promise((r) => setTimeout(r, 300));
  } catch (err) {
    console.error('Error saving file', err);
  } finally {
    isSaving.value = false;
  }
}
</script>

