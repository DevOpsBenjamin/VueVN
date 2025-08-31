import { defineStore } from 'pinia';
import type { EditorState } from '@editor/stores/types/EditorState'
import type { EditorStateActions } from '@editor/stores/types/EditorStateActions'

function createEditorState(): EditorState
{
  return {
    currentFile: null,
    activeModule: 'dashboard',
    selectedLocation: null,
    activeLocationTab: 'events',
    previewVisible: false,
    showEnginePopup: false,
    showGamePopup: false,
    showFilePopup: false,
    fileToEdit: null,
  }
}

export const useEditorState = defineStore('editorState', {
  state: (): EditorState => (createEditorState()),
  actions: {
    $reset(): void {
      Object.assign(this, createEditorState());
    },
    selectFile(file: string): void {
      this.currentFile = file;
    },
    openFile(file: string): void {
      this.fileToEdit = file;
      this.showFilePopup = true;
    },
    closeFile(): void {
      this.showFilePopup = false;
      this.fileToEdit = null;
    }
  } satisfies EditorStateActions,
  persist: true
});

export default useEditorState;
