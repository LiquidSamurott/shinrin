import { createApp } from "vue";
import "./styles.css";
import "katex/dist/katex.min.css";

import App from "./App.vue";

import { createPinia } from "pinia";
import router from "./router";

import { initDatabase } from "./db/database";
import { useSettingsStore } from "./stores/settings";
import { useTheme } from "./composables/useTheme";

await initDatabase();

const app = createApp(App);

const pinia = createPinia();

app.use(pinia);
app.use(router);

const settings = useSettingsStore(pinia);

await settings.initialize();

useTheme();

app.mount("#app");