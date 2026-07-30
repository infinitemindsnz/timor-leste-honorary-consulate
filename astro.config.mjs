import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: netlify({ imageCDN: false }),
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  output: "static",
  site: "https://www.consulatetimorleste.co.nz",
  vite: {
    plugins: [tailwindcss()],
  },
});
