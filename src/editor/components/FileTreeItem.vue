<template>
  <li>
    <div
      class="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-800"
      :class="{ 'bg-gray-800': !selectMode && isSelected }"
      :draggable="!selectMode"
      @dragstart="!selectMode && dragStart()"
      @dragover.prevent="!selectMode && node.isDirectory"
      @drop="!selectMode && drop()"
      @contextmenu.prevent="!selectMode && contextMenu($event)"
      @click="handleClick"
    >
      <span v-if="node.isDirectory" @click.stop="toggle">
        {{ node.expanded ? "▼" : "▶" }}
      </span>
      <span class="truncate ml-1">{{ node.name }}</span>
    </div>
    <ul v-if="node.isDirectory && node.expanded" class="ml-4">
      <FileTreeItem
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :select-mode="selectMode"
        @select="(n) => $emit('select', n)"
        @context="(n, e) => $emit('context', n, e)"
        @drop-node="(n) => $emit('drop-node', n)"
        @drag-node="(n) => $emit('drag-node', n)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FileNode } from "@/editor/stores/editorState";
import { useEditorState } from "@/editor/stores/editorState";

const props = defineProps<{ node: FileNode; selectMode?: boolean }>();
const emit = defineEmits(["select", "context", "drop-node", "drag-node"]);
const editorState = useEditorState();

const isSelected = computed(() => editorState.currentFile === props.node.path);

function toggle() {
  if (props.node.isDirectory) props.node.expanded = !props.node.expanded;
}

function handleClick(e: MouseEvent) {
  emit("select", props.node);
}

function contextMenu(e: MouseEvent) {
  emit("context", props.node, e);
}

function dragStart() {
  emit("drag-node", props.node);
}

function drop() {
  emit("drop-node", props.node);
}
</script>
