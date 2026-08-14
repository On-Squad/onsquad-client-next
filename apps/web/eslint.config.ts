import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'public/**', '.next/**', 'out/**', 'build/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    extends: ['js/recommended'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        __DEV__: true,
        __LOCAL__: true,
        SharedWorkerGlobalScope: 'readonly',
        PropType: 'readonly',
        ArrayType: 'readonly',
      },
    },
    plugins: {
      js,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'none',
        },
      ],
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'comma-dangle': 'off',
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      semi: 'warn',
    },
  },
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    ...pluginReact.configs.flat.recommended,
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  // FSD 의존 방향 강제. 규칙 설명은 .claude/context/fsd.md 가 아니라 여기가 단일 출처다.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      // 없으면 `@/…` 별칭이 미해석(isUnknown)으로 빠져 규칙이 조용히 통과한다.
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'pages', pattern: 'src/pages/*', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*', capture: ['slice'] },
        { type: 'features', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['slice'] },
        { type: 'shared', pattern: 'src/shared' },
      ],
    },
    rules: {
      // 빼면 no-unknown-* 가 preset 기본값으로 되살아나 에러가 쏟아진다.
      ...boundaries.configs.recommended.rules,
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message: 'FSD 의존 방향 위반: {{from.type}} → {{to.type}}',
          policies: [
            // ① 하위 레이어만 import (app → pages → widgets → features → entities → shared)
            {
              from: { element: { type: 'app' } },
              allow: {
                to: { element: { types: { anyOf: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] } } },
              },
            },
            {
              from: { element: { type: 'pages' } },
              allow: { to: { element: { types: { anyOf: ['widgets', 'features', 'entities', 'shared'] } } } },
            },
            {
              from: { element: { type: 'widgets' } },
              allow: { to: { element: { types: { anyOf: ['features', 'entities', 'shared'] } } } },
            },
            {
              from: { element: { type: 'features' } },
              allow: { to: { element: { types: { anyOf: ['entities', 'shared'] } } } },
            },
            {
              from: { element: { type: 'entities' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            // ② 같은 레이어는 자기 슬라이스만 — slice 가 일치할 때만 허용(형제는 차단)
            {
              from: { element: { type: 'pages' } },
              allow: { to: { element: { type: 'pages', captured: { slice: '{{from.slice}}' } } } },
            },
            {
              from: { element: { type: 'widgets' } },
              allow: { to: { element: { type: 'widgets', captured: { slice: '{{from.slice}}' } } } },
            },
            {
              from: { element: { type: 'features' } },
              allow: { to: { element: { type: 'features', captured: { slice: '{{from.slice}}' } } } },
            },
            {
              from: { element: { type: 'entities' } },
              allow: { to: { element: { type: 'entities', captured: { slice: '{{from.slice}}' } } } },
            },
          ],
        },
      ],
    },
  },
]);
