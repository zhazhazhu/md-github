import Vue from "@vitejs/plugin-vue";
import Jsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
import Unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Jsx(),
    Unocss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ["vue", "vue-router", "@vueuse/core"],
      dts: "./types/auto-imports.d.ts",
    }),
    Components({
      resolvers: [IconsResolver(), ElementPlusResolver()],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "./types/components.d.ts",
    }),
    Icons(),
  ],
  resolve: {
    alias: [{ find: "~/", replacement: `${resolve(__dirname, "src")}/` }],
  },
  server: {
    host: true,
  },
});
