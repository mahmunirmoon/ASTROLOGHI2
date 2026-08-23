import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * GitHub Pages base-path configuration.
 *
 * The site is deployed to https://mahmunirmoon.github.io/ASTROLOGHI2/
 * - When built on GitHub Actions (automated deployment) the base is exactly
 *   "/ASTROLOGHI2/" so all CSS/JS/asset/WASM URLs are absolute under the repo path.
 * - For manual local builds the base is relative ("./") which also resolves
 *   correctly when the dist folder is served from the /ASTROLOGHI2/ sub-path
 *   (and keeps local preview/dev serving working from any root).
 */
const repoBase = "/ASTROLOGHI2/";

export default defineConfig({
  base: repoBase,
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
