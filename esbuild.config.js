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
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAHfUlEQVR4nO3d3bHbNhiGYTtJ6rT/VVI6SXpJUrtJ+p8q+QMEg0wckgBBAgkI/N4DPA6PAXbY8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zzP8zxfP55b/3M+n/f0d8yP+/f/5+vff7/f3bvv+ft4PPfuf7/+7//r8Xh/c7j98Xg89/7/5+Pxfu79/78f799/c/j+uP/+/6/f/+rxfp+P1//4v1+P93v/P/n+7+v/u//29/9w//W/+/j/fu7/9X/n//L//s/3t/z4uP/+//P/8P/y/8z//z/n/5n/+/l//j/z/yP+nPxUAfyUAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwIAnwI-ORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAABUklEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHCtAUA3o2oP1AAAAAElFTkSuQmCC';

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
