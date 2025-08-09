import { defineStore } from "pinia";
import { ref } from "vue";

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  expanded?: boolean;
}

async function loadDir(dir = ""): Promise<FileNode[]> {
  const res = await fetch(`/api/files?path=${encodeURIComponent(dir)}`);
  const items: Array<{ name: string; type: string; path: string }> =
    await res.json();
  const nodes: FileNode[] = [];
  for (const item of items) {
    const node: FileNode = {
      name: item.name,
      path: item.path,
      isDirectory: item.type === "directory",
    };
    if (node.isDirectory) {
      node.expanded = false;
      node.children = await loadDir(item.path);
    }
    nodes.push(node);
  }
  return nodes;
}

export const useEditorState = defineStore("editorState", () => {
  const currentFile = ref<string | null>(null);
  const previewVisible = ref(false);
  const filetree = ref<FileNode[]>([]);

  async function refreshFileTree() {
    filetree.value = await loadDir();
  }

  function selectFile(file: string | null) {
    currentFile.value = file;
  }

  return {
    currentFile,
    previewVisible,
    filetree,
    selectFile,
    refreshFileTree,
  };
});
