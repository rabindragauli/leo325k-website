import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Admin modules are never imported by public code (docs/07): server actions in them could be
  // reached through a public page's action ids.
  {
    files: [
      "src/app/(public)/**",
      "src/components/public/**",
      "src/components/layout/**",
      "src/server/queries/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/admin-internal", "@/app/admin-internal/*"],
              message: "Admin modules are never imported by public code.",
            },
            {
              group: ["@/server/admin", "@/server/admin/*"],
              message: "Admin modules are never imported by public code.",
            },
            {
              group: ["@/components/admin", "@/components/admin/*"],
              message: "Admin modules are never imported by public code.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build kit (reference only) and cPanel startup file
    "design/**",
    "starter/**",
    "assets/**",
    "deploy/**",
    "app.js",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
