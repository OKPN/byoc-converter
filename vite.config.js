import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/byoc-publisher/" : "/",
  worker: {
    format: "es",
  },
});
