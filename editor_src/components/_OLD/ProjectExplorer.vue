<template>
  <div class="flex-1 overflow-y-auto text-xs">
    <button
      class="w-full text-left px-2 py-1 hover:bg-gray-800"
      @click="createEvent"
    >
      + Add Event
    </button>
    <FileTree
      v-if="tree.length"
      :items="tree"
      :selected-file="editorState.currentFile || undefined"
      @select="handleNode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useEditorState } from "@editor/stores/editorState";
import FileTree from "@editor/components/Tree/FileTree.vue";

interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileItem[];
}

const tree = ref<FileItem[]>([]);
const editorState = useEditorState();
const EDITABLE_FILE_RE = /\.(ts|vue)$/i;

async function loadDir(dir = ""): Promise<FileItem[]> {
  const res = await fetch(`/api/files?path=${encodeURIComponent(dir)}`);
  const items: FileItem[] = await res.json();
  for (const item of items) {
    if (item.type === "directory") {
      item.children = await loadDir(item.path);
    }
  }
  return items;
}

onMounted(async () => {
  tree.value = await loadDir();
  if (!editorState.currentFile) {
    const first = findFirstFile(tree.value);
    if (first) editorState.selectFile(first.path);
  }
});

function findFirstFile(nodes: FileItem[]): FileItem | null {
  for (const node of nodes) {
    if (node.type === "file" && EDITABLE_FILE_RE.test(node.name)) {
      return node;
    }
    if (node.children) {
      const found = findFirstFile(node.children);
      if (found) return found;
    }
  }
  return null;
}

function handleNode(node: FileItem) {
  if (node.type === "file" && EDITABLE_FILE_RE.test(node.name)) {
    editorState.selectFile(node.path);
  }
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

  tree.value = await loadDir();
  editorState.selectFile(name);
}
</script>
