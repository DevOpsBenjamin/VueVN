<template>
  <div class="flex-1 overflow-y-auto text-xs">
    <button
      class="w-full text-left px-2 py-1 hover:bg-gray-800"
      @click="createEvent"
    >
      + Add Event
    </button>
    <BaseTree
      v-if="tree.length"
      :value="tree"
      :text-key="'name'"
      :children-key="'children'"
      :indent="12"
      default-open
    >
      <template #default="{ stat }">
        <div
          class="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-800"
          :class="{
            'bg-gray-800': editorState.currentFile === stat.data.path,
          }"
          @click="handleNode(stat.data)"
        >
          <OpenIcon
            v-if="stat.data.type === 'directory'"
            :stat="stat"
            class="mr-1"
          />
          <span class="truncate">{{ stat.data.name }}</span>
        </div>
      </template>
    </BaseTree>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { BaseTree, OpenIcon } from "@he-tree/vue";
import "@he-tree/vue/style/default.css";
import { useEditorState } from "@/editor/stores/editorState";

interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileItem[];
}

const tree = ref<FileItem[]>([]);
const editorState = useEditorState();

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
  const first = findFirstFile(tree.value);
  if (first) editorState.selectFile(first.path);
});

function findFirstFile(nodes: FileItem[]): FileItem | null {
  for (const node of nodes) {
    if (node.type === "file" && /\.(ts|vue)$/i.test(node.name)) {
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
  if (node.type === "file") editorState.selectFile(node.path);
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
