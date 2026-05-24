import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const htmlInputsFrom = (folder, prefix) =>
  Object.fromEntries(
    readdirSync(resolve(__dirname, folder))
      .filter((file) => file.endsWith(".html") && file !== "index.html")
      .map((file) => [`${prefix}-${file.replace(/\.html$/, "")}`, resolve(__dirname, folder, file)]),
  );

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        news: resolve(__dirname, "news/index.html"),
        squad: resolve(__dirname, "squad/index.html"),
        ...htmlInputsFrom("news", "news"),
        ...htmlInputsFrom("squad", "squad"),
      },
    },
  },
});
