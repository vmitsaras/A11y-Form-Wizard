import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    docs: "./src/docs.ts",
    "integrations/a11y-form-validator":
      "./src/integrations/a11y-form-validator.ts"
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  platform: "neutral",
  outDir: "dist"
});
