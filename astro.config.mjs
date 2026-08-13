import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  output: "static",
  site: "https://www.consulatetimorleste.co.nz",
  vite: {
    plugins: [tailwindcss()],
  },
});
