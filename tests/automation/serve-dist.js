#!/usr/bin/env node
/**
 * Lightweight static file server used by the instrumentation demo.
 * Serves the compiled renderer bundle alongside index.html so that
 * headless browsers (Playwright, etc.) can exercise UI automation hooks.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const indexFile = path.join(rootDir, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const port = parseInt(process.env.PORT || '4173', 10);

function resolveFilePath(urlPath) {
  const normalized = decodeURIComponent(urlPath.split('?')[0]);
  if (normalized === '/' || normalized === '') {
    return indexFile;
  }

  const filePath = path.join(rootDir, normalized.replace(/^\/+/, ''));
  if (filePath.startsWith(distDir)) {
    return filePath;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  const distCandidate = path.join(distDir, normalized.replace(/^\/+/, ''));
  if (fs.existsSync(distCandidate) && fs.statSync(distCandidate).isFile()) {
    return distCandidate;
  }

  return indexFile;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const filePath = resolveFilePath(req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Failed to read ${filePath}: ${err.message}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Automation demo server running at http://127.0.0.1:${port}`);
  console.log('Press Ctrl+C to stop.');
});
