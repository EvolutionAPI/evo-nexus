import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || "/";

// Resolve version: APP_VERSION env > pyproject.toml > "dev"
function resolveVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;
  try {
    const pyproject = fs.readFileSync(path.resolve(__dirname, "../pyproject.toml"), "utf-8");
    const match = pyproject.match(/^version\s*=\s*"([^"]+)"/m);
    if (match) return match[1];
  } catch {}
  return "dev";
}

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(resolveVersion()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "public/assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
  },
  preview: {
    port,
    host: "0.0.0.0",
  },
});
