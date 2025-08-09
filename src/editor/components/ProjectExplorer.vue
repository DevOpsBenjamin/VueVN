<template>
  <div class="flex-1 overflow-y-auto text-xs">
    <button
      class="w-full text-left px-2 py-1 hover:bg-gray-800"
      @click="openNewFileDialog"
    >
      + New File
    </button>
    <ul v-if="editorState.filetree.length">
      <FileTreeItem
        v-for="node in editorState.filetree"
        :key="node.path"
        :node="node"
        @select="handleSelect"
        @context="handleContext"
        @drop-node="handleDrop"
        @drag-node="handleDrag"
      />
    </ul>

    <div
      v-if="showCreate"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-gray-900 p-4 space-y-2 w-80">
        <div class="text-sm">Select folder:</div>
        <div class="max-h-60 overflow-y-auto border border-gray-700 p-2">
          <ul>
            <FileTreeItem
              v-for="node in editorState.filetree"
              :key="node.path + '-select'"
              :node="node"
              select-mode
              @select="selectDirectory"
            />
          </ul>
        </div>
        <input
          v-model="newFileName"
          class="w-full p-1 text-black"
          placeholder="new-file.ts"
        />
        <div class="flex justify-end space-x-2">
          <button @click="cancelCreate">Cancel</button>
          <button @click="confirmCreate">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FileTreeItem from "./FileTreeItem.vue";
import { useEditorState, type FileNode } from "@/editor/stores/editorState";

const editorState = useEditorState();
const dragging = ref<FileNode | null>(null);
const showCreate = ref(false);
const selectedDir = ref<FileNode | null>(null);
const newFileName = ref("");
const templates = ref<{ event: string; store: string }>({
  event: "",
  store: "",
});

const EDITABLE_FILE_RE = /\.(ts|vue)$/i;

onMounted(async () => {
  await editorState.refreshFileTree();
  if (!editorState.currentFile) {
    const first = findFirstFile(editorState.filetree.value);
    if (first) editorState.selectFile(first.path);
  }
  await loadTemplates();
});

function findFirstFile(nodes: FileNode[]): FileNode | null {
  for (const node of nodes) {
    if (!node.isDirectory && EDITABLE_FILE_RE.test(node.name)) return node;
    if (node.children) {
      const found = findFirstFile(node.children);
      if (found) return found;
    }
  }
  return null;
}

function handleSelect(node: FileNode) {
  if (node.isDirectory) {
    node.expanded = !node.expanded;
  } else if (EDITABLE_FILE_RE.test(node.name)) {
    editorState.selectFile(node.path);
  }
}

function handleDrag(node: FileNode) {
  dragging.value = node;
}

async function handleDrop(target: FileNode) {
  if (!dragging.value || !target.isDirectory) return;
  const oldPath = dragging.value.path;
  const newPath = `${target.path}/${dragging.value.name}`;
  const oldType = getTypeFromPath(oldPath);
  const newType = getTypeFromPath(newPath);
  if (oldType && newType && oldType !== newType) {
    alert("Parent type mismatch");
    return;
  }
  await fetch("/api/rename", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPath, newPath }),
  });
  await editorState.refreshFileTree();
}

function handleContext(node: FileNode, e: MouseEvent) {
  e.preventDefault();
  const action = window.prompt("f: new file, d: new dir");
  if (!action) return;
  if (action === "d") {
    const name = window.prompt("Folder name?");
    if (!name) return;
    createItem(`${node.path}/${name}`, "directory");
  } else if (action === "f") {
    const name = window.prompt("File name?");
    if (!name) return;
    const fullPath = `${node.path}/${name}`;
    const parentType = getTypeFromPath(node.path);
    const fileType = getTypeFromPath(fullPath);
    if (parentType && fileType && parentType !== fileType) {
      alert("Parent type mismatch");
      return;
    }
    createItem(fullPath, "file", getTemplateForPath(fullPath));
  }
}

async function createItem(path: string, type: string, template = "") {
  await fetch("/api/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, type, template }),
  });
  await editorState.refreshFileTree();
}

function getTypeFromPath(path: string) {
  const seg = path.split("/")[0];
  return ["events", "locations", "npcs", "stores"].includes(seg) ? seg : "";
}

function getTemplateForPath(path: string): string {
  const t = getTypeFromPath(path);
  switch (t) {
    case "events":
      return templates.value.event;
    case "stores":
      return templates.value.store;
    case "locations":
      return `import type { Location } from '@/engine/runtime/types';\n\nconst loc: Location = {\n  id: '',\n  name: '',\n  background: ''\n};\n\nexport default loc;\n`;
    case "npcs":
      return `import baseGameState from '@/engine/stores/baseGameState';\nconst { createNPC } = baseGameState;\n\nexport default createNPC({\n  name: '',\n});\n`;
    default:
      return "";
  }
}

async function loadTemplates() {
  const res = await fetch("/api/project/templates");
  templates.value = await res.json();
}

function openNewFileDialog() {
  showCreate.value = true;
  selectedDir.value = null;
  newFileName.value = "";
}

function selectDirectory(node: FileNode) {
  if (node.isDirectory) selectedDir.value = node;
}

function cancelCreate() {
  showCreate.value = false;
}

async function confirmCreate() {
  if (!selectedDir.value || !newFileName.value) return;
  const path = `${selectedDir.value.path}/${newFileName.value}`;
  const parentType = getTypeFromPath(selectedDir.value.path);
  const fileType = getTypeFromPath(path);
  if (parentType && fileType && parentType !== fileType) {
    alert("Parent type mismatch");
    return;
  }
  await createItem(path, "file", getTemplateForPath(path));
  showCreate.value = false;
}
</script>
