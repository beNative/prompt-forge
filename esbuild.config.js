const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');
const isWatch = process.argv.includes('--watch');

const sharedConfig = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  absWorkingDir: __dirname,
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.mjs', '.cjs', '.js', '.json'],
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
};

const buildOrWatch = async (name, config) => {
  const context = await esbuild.context(config);
  if (isWatch) {
    await context.watch();
    console.log(`Watching for changes in ${name}...`);
  } else {
    await context.rebuild();
    await context.dispose();
    console.log(`Built ${name} successfully.`);
  }
};

(async () => {
  try {
    await Promise.all([
      buildOrWatch('main', {
        ...sharedConfig,
        platform: 'node',
        entryPoints: ['electron/main.ts'],
        outfile: 'dist/main.js',
        external: ['electron'],
      }),
      buildOrWatch('preload', {
        ...sharedConfig,
        platform: 'node',
        entryPoints: ['electron/preload.ts'],
        outfile: 'dist/preload.js',
        external: ['electron'],
      }),
      buildOrWatch('renderer', {
        ...sharedConfig,
        platform: 'browser',
        entryPoints: ['index.tsx'],
        outfile: 'dist/renderer.js',
        format: 'esm',
      }),
    ]);
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
})();

