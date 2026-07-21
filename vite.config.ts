import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // URLs relativas permitem publicar o mesmo build tanto em
  // https://usuario.github.io/ quanto em https://usuario.github.io/repositorio/.
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
