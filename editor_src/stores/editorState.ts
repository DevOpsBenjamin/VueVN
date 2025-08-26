import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditorState = defineStore(
  'editorState',
  () => {
    // Current file being edited (relative path in the project)
    const currentFile = ref<string | null>(null);

    // Preview visibility
    const previewVisible = ref(false);

    // Currently active module component
    const activeModule = ref('dashboard');

    // Popup visibility flags
    const showEnginePopup = ref(false);
    const showGamePopup = ref(false);

    function selectFile(file: string) {
      currentFile.value = file;
    }

    return {
      currentFile,
      previewVisible,
      activeModule,
      showEnginePopup,
      showGamePopup,
      selectFile,
    };
  },
  { persist: true }
);
