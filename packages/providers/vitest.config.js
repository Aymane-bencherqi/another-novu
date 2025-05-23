import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['node_modules', 'dist'],
    typecheck: {
      tsconfig: './tsconfig.esm.json',
    }
  },
});
