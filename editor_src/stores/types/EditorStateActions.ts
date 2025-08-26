import type { EditorState } from '@editor/stores/types/EditorState';

export interface EditorStateActions {
  $reset(this: EditorState): void;
  selectFile(this: EditorState, file: string): void;
}