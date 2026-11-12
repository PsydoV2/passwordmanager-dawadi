import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Formatierung übernimmt Prettier – ESLint prüft nur Fehler und Regeln.
  prettier,
  {
    // MVC-Trennung: Views (app/, components/) dürfen aus dem Model nur Typen importieren.
    // Daten und Logik kommen ausschließlich über die Controller-Hooks in src/controller/.
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/model/*"],
              allowTypeImports: true,
              message: "Views greifen nicht direkt auf das Model zu – bitte über einen Hook aus src/controller/ gehen.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "next-env.d.ts", "public/sw.js"]),
]);
