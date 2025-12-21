import { defineConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default defineConfig({
  resolve: baseConfig.resolve,
  test: {
    ...baseConfig.test,
    include: ["tests/integration/**/*.test.ts"],
    exclude: ["node_modules/**"],
  },
});
