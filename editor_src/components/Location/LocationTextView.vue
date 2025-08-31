<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-white text-lg font-semibold flex items-center">
        <span class="mr-2">📝</span>
        Texts
      </h2>
      <button
        @click="addNewText"
        class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg border border-white/20 transition-all duration-200 text-white"
      >
        <span class="text-lg">➕</span>
        <span class="font-medium">Add Text</span>
      </button>
    </div>
    <div class="text-center py-12">
      <div class="text-6xl mb-4">📝</div>
      <h3 class="text-white text-xl font-semibold mb-2">Texts Management</h3>
      <p class="text-white/70 mb-4">Text management interface coming soon...</p>
      <p class="text-white/50 text-sm">Location: {{ selectedLocation }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorState } from '@editor/stores/editorState';

const editorState = useEditorState();

// Computed properties
const selectedLocation = computed(() => editorState.selectedLocation || 'global');

// Asset handlers
function addNewText() {
  console.log('Add new text to:', selectedLocation.value);
}
</script>