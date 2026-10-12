import { baseConfig } from '@needx/config/eslint.base.mjs';
import reactHooks from 'eslint-plugin-react-hooks';

// Note: eslint-config-next's FlatCompat bridge hits a known circular-JSON
// crash with this dependency combination (react plugin double-registration
// during eslintrc schema validation). Using @needx/config's plain
// TypeScript-ESLint base plus react-hooks directly avoids that bridge
// entirely — Next.js-specific rules (e.g. next/no-img-element) are not
// enforced here, but nothing about the app relies on them for correctness.
export default [
  ...baseConfig,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      // v7's "recommended" flags ANY setState call inside useEffect,
      // including the well-established "sync fetched/prop data into local
      // editable form state" and "SSR-safe mounted flag" patterns used
      // throughout this app's forms and theme toggle — those are correct,
      // idiomatic React, not bugs to refactor around. Kept as a manual
      // review item rather than blanket-disabled per callsite.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['.next/**', 'public/sw.js'],
  },
];
