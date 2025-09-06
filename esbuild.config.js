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
 * Generates an SVG icon file in the 'assets' directory.
 * This is run before the build to ensure the icon is available for Electron and electron-builder.
 */
const createIconFile = async () => {
  const iconDir = path.join(__dirname, 'assets');
  const iconPath = path.join(iconDir, 'icon.svg');
  // A simple, monochrome "sparkle" icon representing prompt creativity.
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 1.912 5.813a2 2 0 0 1 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 1-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 1-1.275-1.275L3 12l5.813-1.912a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>`;

  try {
    await fs.mkdir(iconDir, { recursive: true });
    await fs.writeFile(iconPath, svgContent, 'utf-8');
    console.log('Generated application icon at assets/icon.svg');
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