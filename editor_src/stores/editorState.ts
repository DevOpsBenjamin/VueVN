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
    }
  } satisfies EditorStateActions,
  persist: true
});

export default useEditorState;