import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * GitHub Pages deployment — https://mahmunirmoon.github.io/ASTROLOGHI2/
 *
 * base is RELATIVE ("./") on purpose:
 *  - On GitHub Pages every asset resolves against the page URL, so the site
 *    loads correctly from /ASTROLOGHI2/ (CSS, JS, images and the Swiss
 *    Ephemeris WASM binary all resolve under the repository path).
 *  - The same build also works when dist/ is previewed locally or served from
 *    any other path — an absolute base ("/ASTROLOGHI2/") breaks those cases
 *    and produces the blank/white page.
 *  - Routing uses HashRouter, which is fully compatible with relative base
 *    and needs no 404.html rewrite tricks on GitHub Pages.
 */
export default defineConfig({
  base: "./",
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
