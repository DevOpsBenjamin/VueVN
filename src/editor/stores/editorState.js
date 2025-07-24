import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditorState = defineStore('editorState', () => {
  // Current file being edited (relative path in the project)
  const currentFile = ref(null);

  // Preview visibility
  const previewVisible = ref(false);

  function selectFile(file) {
    currentFile.value = file;
  }

  return {
    currentFile,
    previewVisible,
    selectFile,
  };
});
