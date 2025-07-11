import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "src/app/test*/**/*",
      "src/app/test/**/*",
      "src/tests/**/*",
      "src/lib/database/**/*",
      "src/pages/**/*",
      "src/app/system-docs/**/*",
      "src/contexts/**/*",
      "src/types/**/*",
      "scripts/test-*.js"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-require-imports": "off", // Allow require() in test scripts
    },
  },
  {
    files: ["src/components/**/*", "src/hooks/**/*", "src/lib/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
      "react-hooks/exhaustive-deps": "warn", // Change from error to warning
      "import/no-anonymous-default-export": "warn", // Change from error to warning
    },
  },
];

export default eslintConfig;
