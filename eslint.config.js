const eslint = require("@eslint/js");
const eslintConfigGoogle = require("eslint-config-google");
const eslintConfigPrettier = require("eslint-config-prettier");
const eslintConfigJSDoc = require("eslint-plugin-jsdoc");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const tseslint = require("typescript-eslint");
const globals = require("globals");

module.exports = [
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigJSDoc.configs["flat/recommended"],
  eslintConfigGoogle,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    ignores: ["lib/**/*", "coverage/**/*"],
  },
  {
    rules: {
      "jsdoc/newline-after-description": "off",
      "jsdoc/require-jsdoc": ["warn", { publicOnly: true }],
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",

      "@typescript-eslint/no-require-imports": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unused-expressions": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unused-vars": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/prefer-includes": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/prefer-optional-chain": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/prefer-promise-reject-errors": "warn", // TODO(bkendall): remove allow to error.

      "no-unused-vars": "off", // Turned off in favor of @typescript-eslint/no-unused-vars.
      "require-atomic-updates": "off", // This rule is so noisy and isn't useful: https://github.com/eslint/eslint/issues/11899
      "require-jsdoc": "off", // This rule is deprecated and superseded by jsdoc/require-jsdoc.
      "valid-jsdoc": "off", // This is deprecated but included in recommended configs.
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
      parserOptions: {
        ecmaVersion: "es2020",
        projectService: {
          project: "./tsconfig.json",
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-argument": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-assignment": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-call": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-member-access": "warn", // TODO(bkendall): remove allow to error.
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-this-alias": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-argument": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-assignment": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-call": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-member-access": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-unsafe-return": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/no-var-requires": "warn", // TODO(bkendall): remove allow to error.
      "@typescript-eslint/unbound-method": "warn", // TODO(bkendall): remove allow to error.
    },
  },
];
