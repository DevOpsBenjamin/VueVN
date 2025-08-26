import { createApp } from 'vue';
import { createPinia } from 'pinia';
// @ts-ignore - no types available
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from '@editor/App.vue';
import '@editor/index.css';
import { Engine } from '@generate/engine';
import {
  engineState as useEngineState,
  gameState as useGameState,
} from '@generate/stores';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Create Engine instance before mounting so components can access it
const engineState = useEngineState();
const gameState = useGameState();

// Create temporary gameRoot - will be replaced when Game.vue mounts
const tempGameRoot = document.createElement('div');
const engine = new Engine(gameState, engineState, tempGameRoot);
console.log(`Init engine at location: ${engine.gameState.location_id}`);

app.mount('#app');
