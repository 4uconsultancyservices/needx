import { baseConfig } from '@needx/config/eslint.base.mjs';

export default [
  ...baseConfig,
  {
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    // Wire mappers convert Mongoose's loosely-typed `.toJSON()` output into
    // strongly-typed @needx/types shapes — `any` at that one boundary is a
    // deliberate, contained choice, not a lapse.
    files: ['**/*.mapper.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
