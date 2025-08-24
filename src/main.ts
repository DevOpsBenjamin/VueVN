import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./index.css";
import { Engine } from "@/generate/runtime";
import {
  engineState as useEngineState,
  gameState as useGameState,
} from '@/generate/stores';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Create Engine instance before mounting so components can access it
const engineState = useEngineState();
const gameState = useGameState();

// Create temporary gameRoot - will be replaced when Game.vue mounts
const tempGameRoot = document.createElement('div');
const engine = new Engine(gameState, engineState, tempGameRoot);

app.mount("#app");
