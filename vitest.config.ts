import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // jsdom pour les tests de composants React
    environment: "jsdom",

    // Setup global — mocks, MSW, jest-dom matchers
    setupFiles: ["./tests/setup.ts"],

    // Inclure les tests dans ces patterns
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "src/**/*.test.ts",     // tests co-localisés si préféré
    ],

    // Exclure les tests E2E (Playwright) et node_modules
    exclude: [
      "tests/e2e/**",
      "node_modules/**",
    ],

    // Couverture de code
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "tests/",
        "src/components/ui/",      // shadcn/ui — pas notre code
        "**/*.config.*",
        "**/*.d.ts",
        "src/db/migrations/",
        "src/db/schema/index.ts",  // fichier de re-export uniquement
        ".claude/",
      ],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },

    // Timeout par défaut (augmenté pour les tests d'intégration DB)
    testTimeout: 10_000,

    // Reporter — verbeux en CI, compact en local
    reporters: process.env.CI ? "verbose" : "default",

    // Désactiver les threads pour les tests DB (évite les conflits de connexion)
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: !!process.env.CI,
      },
    },
  },
});
