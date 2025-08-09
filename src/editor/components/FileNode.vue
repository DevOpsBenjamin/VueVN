<template>
  <li>
    <div
      class="px-2 py-1 hover:bg-gray-800 cursor-pointer"
      :class="{ 'bg-gray-800': selected === node.path }"
      :style="{ paddingLeft: depth * 12 + 'px' }"
      @click="onClick"
    >
      <span v-if="node.type === 'directory'">{{ expanded ? "▼" : "▶" }}</span>
      <span>{{ node.name }}</span>
    </div>
    <ul v-if="expanded">
      <FileNode
        v-for="child in children"
        :key="child.path"
        :node="child"
        :selected="selected"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({ name: "FileNode" });

export interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
}

const props = withDefaults(
  defineProps<{
    node: FileItem;
    selected?: string | null;
    depth?: number;
  }>(),
  { depth: 0 },
);

const emit = defineEmits<{ (e: "select", path: string): void }>();

const expanded = ref(false);
const children = ref<FileItem[]>([]);

async function onClick() {
  if (props.node.type === "directory") {
    if (!expanded.value) {
      const res = await fetch(
        `/api/files?path=${encodeURIComponent(props.node.path)}`,
      );
      children.value = await res.json();
    }
    expanded.value = !expanded.value;
  } else {
    emit("select", props.node.path);
  }
}
</script>
