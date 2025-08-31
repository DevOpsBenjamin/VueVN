<template>
  <div class="h-full flex flex-col text-gray-100">
    <div class="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/20">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-bold">Assets</h2>
        <div class="flex items-center gap-2">
          <button v-for="c in categories" :key="c.key"
                  @click="active = c.key"
                  :class="['px-3 py-1 rounded text-sm', active===c.key ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10']">
            {{ c.label }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input ref="fileInput" type="file" multiple class="hidden" @change="onPickFiles">
        <button @click="fileInput?.click()" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/40 rounded text-sm">Upload</button>
        <button @click="refresh" class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm">Refresh</button>
      </div>
    </div>

    <div class="flex-1 min-h-0 grid grid-cols-12 gap-0">
      <div class="col-span-9 p-4">
        <div class="border-2 border-dashed border-white/10 rounded-lg p-4 min-h-[60vh]"
             @dragover.prevent
             @drop.prevent="onDrop">
          <div v-if="loading" class="text-sm text-white/60">Loading...</div>
          <div v-else>
            <!-- Images grid -->
            <div v-if="active==='images'" class="grid grid-cols-6 gap-3">
              <div v-for="img in assets.images" :key="img.path" class="group relative border border-white/10 rounded overflow-hidden">
                <img :src="'/' + img.path" class="w-full h-24 object-cover" @click="select(img)">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button @click.stop="copy(img.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Copy</button>
                  <button @click.stop="rename(img.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Rename</button>
                  <button @click.stop="remove(img.path)" class="px-2 py-0.5 text-xs bg-red-500/40 rounded">Delete</button>
                </div>
              </div>
              <div v-if="assets.images.length===0" class="text-white/60 text-sm">No images. Drop files here to upload.</div>
            </div>

            <!-- Sounds list -->
            <div v-else-if="active==='sounds'" class="space-y-2">
              <div v-for="snd in assets.sounds" :key="snd.path" class="flex items-center justify-between border border-white/10 rounded px-3 py-2">
                <div class="flex items-center gap-3">
                  <span>🔊</span>
                  <div>
                    <div class="text-sm">{{ snd.name }}</div>
                    <div class="text-xs text-white/50">{{ snd.path }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <audio :src="'/' + snd.path" controls class="h-6"></audio>
                  <button @click="copy(snd.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Copy</button>
                  <button @click="rename(snd.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Rename</button>
                  <button @click="remove(snd.path)" class="px-2 py-0.5 text-xs bg-red-500/40 rounded">Delete</button>
                </div>
              </div>
              <div v-if="assets.sounds.length===0" class="text-white/60 text-sm">No sounds. Drop files here to upload.</div>
            </div>

            <!-- Videos/Misc simple list -->
            <div v-else class="space-y-2">
              <div v-for="f in otherList" :key="f.path" class="flex items-center justify-between border border-white/10 rounded px-3 py-2">
                <div>
                  <div class="text-sm">{{ f.name }}</div>
                  <div class="text-xs text-white/50">{{ f.path }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button @click="copy(f.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Copy</button>
                  <button @click="rename(f.path)" class="px-2 py-0.5 text-xs bg-white/20 rounded">Rename</button>
                  <button @click="remove(f.path)" class="px-2 py-0.5 text-xs bg-red-500/40 rounded">Delete</button>
                </div>
              </div>
              <div v-if="otherList.length===0" class="text-white/60 text-sm">No files. Drop files here to upload.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-3 p-4 border-l border-white/10 bg-black/10">
        <div v-if="selected" class="space-y-3">
          <div class="text-sm font-semibold">Details</div>
          <div class="text-xs text-white/60">{{ selected.path }}</div>
          <div v-if="active==='images'">
            <img :src="'/' + selected.path" class="w-full rounded border border-white/10" />
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-white/60">Name</div>
            <div>{{ selected.name }}</div>
            <div class="text-white/60">Size</div>
            <div>{{ formatSize(selected.size) }}</div>
            <div class="text-white/60">Modified</div>
            <div>{{ formatDate(selected.modified) }}</div>
          </div>
        </div>
        <div v-else class="text-white/60 text-sm">Select an asset to preview</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';

type Asset = { name: string; path: string; size: number; modified: string };
type AssetMap = { images: Asset[]; sounds: Asset[]; videos: Asset[]; misc: Asset[] };

const assets = reactive<AssetMap>({ images: [], sounds: [], videos: [], misc: [] });
const loading = ref(false);
const selected = ref<Asset | null>(null);
const active = ref<'images' | 'sounds' | 'videos' | 'misc'>('images');
const fileInput = ref<HTMLInputElement | null>(null);

const categories = [
  { key: 'images', label: 'Images' },
  { key: 'sounds', label: 'Sounds' },
  { key: 'videos', label: 'Videos' },
  { key: 'misc', label: 'Misc' },
] as const;

const otherList = computed(() => (active.value === 'videos' ? assets.videos : assets.misc));

function select(a: Asset) { selected.value = a; }

async function refresh() {
  loading.value = true;
  try {
    const res = await fetch('/api/assets/list');
    const data = await res.json();
    assets.images = data.images || [];
    assets.sounds = data.sounds || [];
    assets.videos = data.videos || [];
    assets.misc = data.misc || [];
    if (selected.value) {
      // Try to keep selection
      const found = [...assets.images, ...assets.sounds, ...assets.videos, ...assets.misc].find(x => x.path === selected.value!.path);
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

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

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
    // Basic multipart: single file per request
    form.append('file', f, f.name);
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPath, newPath })
  });
  if (res.ok) await refresh();
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
}

onMounted(refresh);
</script>

<style scoped>
.min-h-\[60vh\] { min-height: 60vh; }
</style>
