export interface EditorState {
  currentFile: string | null;
  activeModule: string;
  //Popup
  previewVisible: boolean;
  showEnginePopup: boolean;
  showGamePopup: boolean;
}