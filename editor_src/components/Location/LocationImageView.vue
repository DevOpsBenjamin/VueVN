<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-white text-lg font-semibold flex items-center">
        <span class="mr-2">🖼️</span>
        Images
        <span class="ml-3 text-xs text-white/50">Location: {{ selectedLocation }}</span>
      </h2>
      <div class="flex items-center gap-2">
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onPickFiles">
        <button @click="fileInput?.click()" class="flex items-center space-x-2 px-3 py-1 bg-purple-600/30 hover:bg-purple-600/40 rounded border border-white/20 text-white text-sm">
          <span>➕</span><span>Upload</span>
        </button>
        <button @click="refresh" class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded border border-white/10 text-sm">Refresh</button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-9">
        <div class="flex items-center justify-between mb-2 text-sm text-white/70">
          <div class="flex items-center gap-2">
            <span class="text-white/50">/assets/images</span>
            <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
              <span>/</span>
              <button class="hover:underline" @click="cd(breadcrumbs.slice(0, idx+1).join('/'))">{{ crumb }}</button>
            </template>
          </div>
          <button @click="mkdir" class="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded border border-white/10">New Folder</button>
        </div>
        <div class="border-2 border-dashed border-white/10 rounded-lg p-4 min-h-[50vh]"
             @dragover.prevent
             @drop.prevent="onDrop">
          <div v-if="loading" class="text-sm text-white/60">Loading...</div>
          <div v-else class="grid grid-cols-6 gap-3">
            <!-- directories -->
            <div v-for="d in dirs" :key="d.path" class="border border-white/10 rounded p-2 hover:bg-white/5 cursor-pointer" @dblclick="cd(relFromImages(d.path))">
              <div class="text-4xl mb-2">📁</div>
              <div class="text-xs text-white/80 truncate" :title="d.name">{{ d.name }}</div>
            </div>
            <div v-for="img in images" :key="img.path" class="group relative border border-white/10 rounded overflow-hidden">
              <img :src="'/' + img.path" class="w-full h-24 object-cover" @click="select(img)">
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button @click.stop="copy(img.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Copy</button>
                <button @click.stop="rename(img.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Rename</button>
                <button @click.stop="remove(img.path)" class="px-2 py-0.5 text-xs bg-red-500/40 rounded">Delete</button>
              </div>
            </div>
            <div v-if="images.length===0 && dirs.length===0" class="text-white/60 text-sm">Empty folder. Drop files here to upload.</div>
          </div>
        </div>
      </div>
      <div class="col-span-3">
        <div class="p-4 border border-white/10 rounded bg-black/10" v-if="selected">
          <div class="text-sm font-semibold">Preview</div>
          <div class="text-xs text-white/60 mb-2">{{ selected.path }}</div>
          <img :src="'/' + selected.path" class="w-full rounded border border-white/10 mb-3" />
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-white/60">Name</div><div>{{ selected.name }}</div>
            <div class="text-white/60">Size</div><div>{{ formatSize(selected.size) }}</div>
            <div class="text-white/60">Modified</div><div>{{ formatDate(selected.modified) }}</div>
          </div>
        </div>
        <div v-else class="text-white/60 text-sm p-4 border border-white/10 rounded bg-black/10">Select an image to preview</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useEditorState } from '@editor/stores/editorState';

type Asset = { name: string; path: string; size: number; modified: string };

const editorState = useEditorState();
const selectedLocation = computed(() => editorState.selectedLocation || 'global');
const images = reactive<Asset[]>([]);
const currentDir = ref<string>(''); // relative under assets/images
const loading = ref(false);
const selected = ref<Asset | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

function select(a: Asset) { selected.value = a; }

async function refresh() {
  loading.value = true;
  try {
    const base = 'assets/images';
    const path = currentDir.value ? `${base}/${currentDir.value}` : base;
    const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      // Auto-create default folder for selected location
      if (res.status === 404 && currentDir.value) {
        await fetch('/api/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, type: 'directory' })
        });
        return refresh();
      }
      throw new Error('Failed to list');
    }
    const data = await res.json();
    const dirsData = (data as any[]).filter(i => i.type === 'directory');
    const files = (data as any[]).filter(i => i.type === 'file' && /\.(png|jpg|jpeg|gif|webp)$/i.test(i.name))
      .map(i => ({ name: i.name, path: i.path, size: i.size, modified: i.modified }));
    images.splice(0, images.length, ...files);
    dirs.splice(0, dirs.length, ...dirsData);
    if (selected.value) {
      const found = images.find(x => x.path === selected.value!.path);
      selected.value = found || null;
    }
  } finally {
    loading.value = false;
  }
}

function formatSize(n: number) {
  if (!n && n !== 0) return '-';
  const units = ['B','KB','MB','GB'];
  let i = 0; let v = n;
  while (v >= 1024 && i < units.length-1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${units[i]}`;
}
function formatDate(s: string) { try { return new Date(s).toLocaleString(); } catch { return s; } }

async function onPickFiles(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  await uploadFiles(input.files);
  input.value = '';
}
async function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  await uploadFiles(files);
}
async function uploadFiles(files: FileList | File[]) {
  for (const f of Array.from(files)) {
    const form = new FormData();
    form.append('file', f, f.name);
    if (currentDir.value) form.append('dest', currentDir.value);
    await fetch('/api/assets/upload', { method: 'POST', body: form });
  }
  await refresh();
}
async function remove(path: string) {
  if (!confirm('Delete this file?')) return;
  const res = await fetch(`/api/delete?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
  if (res.ok) await refresh();
}
async function rename(oldPath: string) {
  const base = oldPath.split('/');
  const current = base[base.length-1];
  const next = prompt('New name', current);
  if (!next || next === current) return;
  const newPath = base.slice(0,-1).concat(next).join('/');
  const res = await fetch('/api/rename', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPath, newPath })
  });
  if (res.ok) await refresh();
}
async function copy(text: string) { try { await navigator.clipboard.writeText(text); } catch {} }

onMounted(refresh);

// Initialize default folder to selected location
onMounted(() => {
  if (selectedLocation.value && !currentDir.value) {
    currentDir.value = selectedLocation.value;
    refresh();
  }
});

// Navigation helpers
const breadcrumbs = computed(() => (currentDir.value ? currentDir.value.split('/') : []));
const dirs = reactive<any[]>([]);
function relFromImages(p: string): string { return p.replace(/^assets\/images\/?/, ''); }
function cd(dir: string) { currentDir.value = dir; refresh(); }
async function mkdir() {
  const name = prompt('New folder name');
  if (!name) return;
  const base = 'assets/images';
  const path = currentDir.value ? `${base}/${currentDir.value}/${name}` : `${base}/${name}`;
  await fetch('/api/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, type: 'directory' })
  });
  await refresh();
}
</script>

<style scoped>
.min-h-\[50vh\] { min-height: 50vh; }
</style>
