<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-950">
    <div
      class="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md border border-gray-800"
    >
      <h2 class="text-xl font-bold text-green-400 mb-4 text-center">
        Sélection du projet
      </h2>
      <ul class="mb-6">
        <li
          v-for="project in projects"
          :key="project"
          class="flex items-center justify-between mb-2"
        >
          <span class="text-gray-200">{{ project }}</span>
          <button
            @click="openProject(project)"
            class="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-white"
          >
            Ouvrir
          </button>
        </li>
      </ul>
      <div class="flex gap-2">
        <input
          v-model="newProject"
          placeholder="Nom du projet"
          class="flex-1 px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none"
        />
        <button
          @click="createProject"
          class="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-white"
        >
          Créer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const projects = ref([]);
const newProject = ref('');
import { useEditorState } from '@/editor/stores/editorState';
const editorState = useEditorState();

onMounted(async () => {
  const res = await fetch('/api/projects');
  projects.value = await res.json();
});

async function createProject() {
  if (!newProject.value.trim()) return;
  await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newProject.value.trim() }),
  });
  // Refresh la liste
  const res = await fetch('/api/projects');
  projects.value = await res.json();
  newProject.value = '';
}

function openProject(name) {
  editorState.selectProject(name);
}
</script>
