import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditorState = defineStore('editorState', () => {
  // Projet courant (null = aucun projet sélectionné)
  const project = ref(null);
  // Fichier courant (chemin relatif dans le projet)
  const currentFile = ref(null);
  const previewVisible = ref(false);

  function selectProject(name) {
    project.value = name;
    currentFile.value = null;
  }

  function selectFile(file) {
    currentFile.value = file;
  }

  function exitProject() {
    project.value = null;
    currentFile.value = null;
  }

  return {
    project,
    currentFile,
    selectProject,
    selectFile,
    exitProject,
  };
});
