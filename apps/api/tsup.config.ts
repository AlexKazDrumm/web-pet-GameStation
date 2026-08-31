import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    seed: 'prisma/seed.ts',
  },
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  minify: false,
  // Bundle the workspace package into the output; keep real deps external.
  noExternal: ['@gamestation/shared'],
});
