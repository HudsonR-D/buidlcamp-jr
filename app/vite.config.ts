import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so GitHub Pages, Vercel, and local preview all resolve assets.
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules") &&
            /codemirror|lezer|style-mod|crelt|w3c-keyname/.test(id)
          )
            return /@lezer|@codemirror[\\/]lang-/.test(id)
              ? "code-languages"
              : "code-editor";
        },
      },
    },
  },
  server: { host: "127.0.0.1" },
});
