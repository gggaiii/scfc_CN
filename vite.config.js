import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        news: resolve(__dirname, "news/index.html"),
        article: resolve(__dirname, "news/article.html"),
        squad: resolve(__dirname, "squad/index.html"),
        player: resolve(__dirname, "squad/player.html"),
      },
    },
  },
});
