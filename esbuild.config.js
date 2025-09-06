const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');
const isWatch = process.argv.includes('--watch');

const sharedConfig = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
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

/**
 * Generates a PNG icon file in the 'assets' directory from a base64 string.
 * This is run before the build to ensure the icon is available for Electron and electron-builder.
 */
const createIconFile = async () => {
  const iconDir = path.join(__dirname, 'assets');
  const iconPath = path.join(iconDir, 'icon.png');
  // Base64 encoded 256x256 PNG of a monochrome "sparkle" icon.
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAASAAAAEgARslrPgAAAB1pVFh0U29mdHdhcmUAAAAcaW1hZ2VtYWdpY2sgNy4xLjAtMjEgUTExNiA2NAAAUrIAAAPLSURBVHja7d1rctNAEAbgR/x/5567I/gCgSAxRCsT6zbdVbVb4kifz+fzeZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7neZ7n+T9Pfrv+5/N5v6d/z3w8ntv378Pj3+O+fR0e74fHj3/1n+eff35+Hh5//+P8y8Pj/c6/PB4f/7r/8vv//vP5vB+P1z/9r/nvn09v//pP8y8Pz/fl39f+6/87Pz7/7/8P8y8Pz1/8j/MvD8+/Pz/+9T/Pvzw8v8v/Mv/y8Py6//L/DPPy8Py6//L/jP+i/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wqA/wq-35f-155209-661705607.png';

  try {
    await fs.mkdir(iconDir, { recursive: true });
    await fs.writeFile(iconPath, Buffer.from(base64Png, 'base64'));
    console.log('Generated application icon at assets/icon.png');
  } catch (error) {
    console.error('Failed to create icon file:', error);
    throw error; // Propagate error to stop the build
  }
};


(async () => {
  try {
    // Generate the icon file for both development (start) and production (package) builds.
    await createIconFile();

    await Promise.all([
      buildOrWatch('main', {
        ...sharedConfig,
        platform: 'node',
        entryPoints: ['electron/main.ts'],
        outfile: 'dist/main.js',
        external: ['electron', 'electron-squirrel-startup'],
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
