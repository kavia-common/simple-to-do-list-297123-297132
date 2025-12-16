import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/**
 * Flat config for ESLint 8+.
 * Note: CRA also ships its own ESLint via react-scripts; this config is additive for editors/CI.
 */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        document: true,
        window: true,
        test: true,
        expect: true,
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "React|App" }],
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: { react: pluginReact },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
    },
  },
];
