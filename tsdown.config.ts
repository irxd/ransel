import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: "src/cli.ts",
    platform: "node",
    format: "cjs",
    fixedExtension: true,
    target: "node18",
    dts: false, 
    outDir: "dist",
  },
])
