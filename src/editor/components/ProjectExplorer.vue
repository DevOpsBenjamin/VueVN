<template>
  <div class="flex-1 overflow-y-auto text-xs">
    <button
      class="w-full text-left px-2 py-1 hover:bg-gray-800"
      @click="createEvent"
    >
      + Add Event
    </button>
    <ul>
      <FileNode
        v-for="item in rootFiles"
        :key="item.path"
        :node="item"
        :selected="editorState.currentFile"
        @select="openFile"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FileNode, { type FileItem } from "./FileNode.vue";
import { useEditorState } from "@/editor/stores/editorState";

const rootFiles = ref<FileItem[]>([]);
const editorState = useEditorState();

async function loadRoot() {
  const res = await fetch("/api/files");
  rootFiles.value = await res.json();
  const first = await findFirstFile();
  if (first) openFile(first.path);
}

onMounted(loadRoot);

async function findFirstFile(dir = ""): Promise<FileItem | null> {
  const res = await fetch(`/api/files?path=${encodeURIComponent(dir)}`);
  const items: FileItem[] = await res.json();
  for (const item of items) {
    if (item.type === "file") return item;
    if (item.type === "directory") {
      const found = await findFirstFile(item.path);
      if (found) return found;
    }
  }
  return null;
}

function openFile(path: string) {
  editorState.selectFile(path);
}

async function createEvent() {
  const name = prompt("Event file path", "events/new-event.ts");
  if (!name) return;

  const templatesRes = await fetch("/api/project/templates");
  const templates = await templatesRes.json();

  await fetch("/api/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: name,
      type: "file",
      template: templates.event,
    }),
  });

  await loadRoot();
  openFile(name);
}
</script>
