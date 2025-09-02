<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-white text-lg font-semibold flex items-center">
        <span class="mr-2">📝</span>
        Texts
        <span class="ml-3 text-xs text-white/50">Location: {{ selectedLocation }}</span>
      </h2>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2 text-sm text-white/70">
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="showMissingOnly" class="accent-cyan-500">
            <span>Show missing only</span>
          </label>
        </div>
        <div class="text-xs text-white/50">Languages: {{ langs.join(', ') || 'none' }}</div>
      </div>

      <div class="overflow-hidden rounded-lg border border-white/10">
      <table class="w-full">
        <thead class="bg-white/5">
          <tr>
            <th class="px-4 py-3 text-left text-white font-medium text-sm">Scope</th>
            <th v-for="lang in langs" :key="'h-'+lang" class="px-4 py-3 text-left text-white font-medium text-sm">{{ lang.toUpperCase() }}</th>
            <th class="px-4 py-3 text-left text-white font-medium text-sm w-56">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <TextTreeNode v-for="(n, index) in filteredTree" :key="n.id" :node="n" :langs="langs" :depth="0"
            :is-last="index === filteredTree.length - 1" :parent-branches="[]"
            @toggle-folder="toggleFolder" @open-lang="openLangFromNode"/>
          <tr v-if="filteredTree.length===0">
            <td colspan="5" class="px-4 py-8 text-left text-white/70 text-sm">No texts found for this location.</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useEditorState } from '@editor/stores/editorState';
import t from '@generate/texts';
import projectData from '@generate/project';
import TextTreeNode from './TextTreeNode.vue';

const editorState = useEditorState();
const selectedLocation = computed(() => editorState.selectedLocation || 'global');

const showMissingOnly = ref(false);
const expandedFolders = ref<Set<string>>(new Set());

const langs = computed<string[]>(() => {
  const cfg = projectData.config;
  const list = (cfg.languages || []).map(l => l.code.toLowerCase());
  const defaultIdx = cfg.languages ? cfg.languages.findIndex(l => l.default) : -1;
  if (defaultIdx > -1) {
    return [list[defaultIdx], ...list.filter((_, i) => i !== defaultIdx)];
  }
  return list;
});

type TextNode = any;

const tree = computed<TextNode[]>(() => {
  const root: Record<string, any> = { id: 'root', name: '', type: 'folder', isExpanded: true, children: [] };

  if (selectedLocation.value === 'global') {
    const globalScopes = (t as any).global || {};
    for (const scopeName of Object.keys(globalScopes)) {
      const moduleObj = (globalScopes as any)[scopeName];
      const node = {
        id: `file:global/${scopeName}`,
        name: scopeName,
        type: 'file',
        module: moduleObj,
        path: scopeName,
      };
      root.children.push(node);
    }
    return root.children;
  }

  const loc = selectedLocation.value;
  const locTexts = (t as any).locations?.[loc];
  if (!locTexts) return [];

  function ensureFolder(parent: any, name: string): any {
    const id = parent.id === 'root' ? name : parent.id + '/' + name;
    let f = (parent.children as any[]).find((c) => c.type === 'folder' && c.name === name);
    if (!f) {
      f = { id, name, type: 'folder', isExpanded: expandedFolders.value.has(id), children: [] };
      parent.children.push(f);
    }
    return f;
  }

  for (const [, moduleObj] of Object.entries<any>(locTexts)) {
    const relPath = moduleObj?.__path || '';
    const parts = relPath ? relPath.split('/') : ['(root)'];
    let parent = root;
    for (let i = 0; i < parts.length - 1; i++) {
      parent = ensureFolder(parent, parts[i]);
    }
    const fileName = parts[parts.length - 1];
    const node = {
      id: 'file:' + (relPath || 'root'),
      name: fileName,
      type: 'file',
      module: moduleObj,
      path: relPath,
    };
    parent.children.push(node);
  }

  return root.children;
});

function fileMissing(node: any): boolean {
  const m = node.module || {};
  const keys = Object.keys(m).filter((k) => k !== '__path');
  return langs.value.some((lang) => keys.some((k) => {
    const v = m[k]?.[lang];
    return !(typeof v === 'string' && v.trim().length > 0);
  }));
}

const filteredTree = computed(() => {
  if (!showMissingOnly.value) return tree.value;
  // Filter out files without missing and folders without matching descendants
  function filterNodes(nodes: any[]): any[] {
    const out: any[] = [];
    for (const n of nodes) {
      if (n.type === 'file') {
        if (fileMissing(n)) out.push(n);
      } else {
        const kids = filterNodes(n.children || []);
        if (kids.length > 0) {
          // Preserve the expanded state when filtering
          out.push({ ...n, children: kids, isExpanded: expandedFolders.value.has(n.id) });
        }
      }
    }
    return out;
  }
  return filterNodes(tree.value);
});

function toggleFolder(id: string) {
  if (expandedFolders.value.has(id)) {
    expandedFolders.value.delete(id);
  } else {
    expandedFolders.value.add(id);
  }
}

function openLangFromNode(payload: { path: string; lang: string }) {
  if (selectedLocation.value === 'global') {
    const scope = payload.path;
    const fp = `global/texts/${scope}/${payload.lang}.ts`;
    editorState.openFile(fp);
    return;
  }
  const loc = selectedLocation.value;
  const sub = payload.path ? `/${payload.path}` : '';
  const fp = `locations/${loc}/texts${sub}/${payload.lang}.ts`;
  editorState.openFile(fp);
}

function openLang(scope: string, lang: string) {}
</script>
