import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';
import globals from 'globals';

// 素の no-unused-vars は TS の型宣言を解釈できず、`declare global` 内の
// 関数型の引数名などを未使用変数として誤検知するため、TS 版に委ねる。
// `_` 始まりは意図的な未使用として許可する。
const unusedVarsRules = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
};

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...unusedVarsRules,
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  ...astroPlugin.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...unusedVarsRules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // eslint-plugin-astro の processor が生成する <script> の仮想ファイル。
    // 検出結果は .astro 側にまとめて報告されるが、設定はこの仮想ファイル名で
    // 解決されるため、上の `**/*.astro` とは別に指定する必要がある。
    files: ['**/*.astro/*.js', '**/*.astro/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...unusedVarsRules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
