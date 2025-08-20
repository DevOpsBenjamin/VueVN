import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export const useEditorState = defineStore('editorState', () => {
  // Current file being edited (relative path in the project)
  const currentFile: Ref<string | null> = ref(null);

  // Preview visibility
  const previewVisible: Ref<boolean> = ref(false);

  function selectFile(file: string) {
    currentFile.value = file;
  }

  return {
    currentFile,
    previewVisible,
    selectFile,
  };
});