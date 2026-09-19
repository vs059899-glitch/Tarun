import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

/**
 * Hostinger Node.js Application Startup File
 */

// Force production environment
process.env.NODE_ENV = 'production';

// Crash guards to keep LiteSpeed / Passenger worker alive
process.on('uncaughtException', (err) => {
  console.error('[Hostinger Worker] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Hostinger Worker] Unhandled Rejection:', reason);
});

let currentDir = process.cwd();
try {
  const __filename = fileURLToPath(import.meta.url);
  currentDir = path.dirname(__filename);
} catch (e) {
  // ignore
}

const candidateBundlePaths = [
  path.join(currentDir, 'dist', 'server.cjs'),
  path.join(process.cwd(), 'dist', 'server.cjs'),
  path.join(currentDir, 'server.cjs'),
  path.join(process.cwd(), 'server.cjs')
];

const bundlePath = candidateBundlePaths.find(p => fs.existsSync(p));

if (bundlePath) {
  console.log(`[Hostinger] Loading production server from: ${bundlePath}`);
  await import(bundlePath);
} else {
  console.warn('[Hostinger] dist/server.cjs not found. Starting fallback listener on PORT to prevent 503.');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Resa AI Assistant - Setup Notice</title></head>
      <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; line-height: 1.6;">
        <h2 style="color: #4338ca;">Resa AI Assistant Backend is Online</h2>
        <p>Hostinger Node.js application is active.</p>
        <p>Please ensure the <code>dist/</code> directory is uploaded or run <code>npm run build</code> in Hostinger.</p>
      </body>
      </html>
    `);
  });

  const rawPort = process.env.PORT;
  if (rawPort && isNaN(Number(rawPort))) {
    server.listen(rawPort);
  } else {
    server.listen(Number(rawPort) || 3000);
  }
}
