<template>
  <div class="file-tree">
    <FileTreeNode
      v-for="item in items"
      :key="item.path"
      :item="item"
      :selected-file="selectedFile"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from "vue";
import FileTreeNode from "./FileTreeNode.vue";

interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileItem[];
}

interface Props {
  items: FileItem[];
  selectedFile?: string;
}

defineProps<Props>();

defineEmits<{
  select: [item: FileItem];
}>();
</script>

<style scoped>
.file-tree {
  user-select: none;
}
</style>