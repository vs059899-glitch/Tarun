import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

/**
 * Hostinger Node.js Application Startup File
 *
 * In Hostinger hPanel:
 * 1. Set Application startup file: app.js
 * 2. Choose Node.js version: 18.x, 20.x, or 22.x
 */

// Force production environment so Vite dev server is never spawned on Hostinger
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Process crash guards to keep Passenger alive
process.on('uncaughtException', (err) => {
  console.error('[Hostinger Worker] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Hostinger Worker] Unhandled Rejection:', reason);
});

let currentDir = process.cwd();
try {
  const __filename = fileURLToPath(import.meta.url);
  currentDir = path.dirname(__filename);
} catch (e) {
  // fallback if executed in non-standard context
}

const candidateBundlePaths = [
  path.join(currentDir, 'dist', 'server.cjs'),
  path.join(process.cwd(), 'dist', 'server.cjs'),
  path.join(currentDir, 'server.cjs'),
  path.join(process.cwd(), 'server.cjs')
];

const bundlePath = candidateBundlePaths.find(p => fs.existsSync(p));

if (bundlePath) {
  console.log(`[Hostinger] Starting Resa production server from: ${bundlePath}`);
  await import(bundlePath);

  // If Hostinger Passenger passed a custom socket or port other than 3000, forward traffic to port 3000
  const hostingerPort = process.env.PORT;
  if (hostingerPort && hostingerPort !== '3000') {
    const proxy = http.createServer((req, res) => {
      const options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: req.url,
        method: req.method,
        headers: req.headers
      };
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });
      proxyReq.on('error', () => {
        res.writeHead(502);
        res.end('Resa server is initializing...');
      });
      req.pipe(proxyReq, { end: true });
    });

    if (isNaN(Number(hostingerPort))) {
      proxy.listen(hostingerPort);
      console.log(`[Hostinger] Proxy listening on socket: ${hostingerPort}`);
    } else {
      proxy.listen(Number(hostingerPort));
      console.log(`[Hostinger] Proxy listening on port: ${hostingerPort}`);
    }
  }
} else {
  console.warn('[Hostinger] dist/server.cjs not found yet. Starting safety fallback listener on PORT to prevent 503 error.');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Resa AI Assistant - Setup Notice</title></head>
      <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; line-height: 1.6;">
        <h2 style="color: #4338ca;">Resa AI Assistant Backend is Active</h2>
        <p>Hostinger Node.js server is online and connected (Port: ${process.env.PORT || 3000}).</p>
        <p>The compiled production bundle <code>dist/server.cjs</code> was not found in the application directory.</p>
        <p><strong>To resolve this:</strong></p>
        <ol>
          <li>Ensure the <code>dist/</code> folder was uploaded to Hostinger, OR</li>
          <li>In Hostinger hPanel under <strong>Node.js</strong>, click <strong>NPM Script</strong> → Select <strong>build</strong> → Run.</li>
        </ol>
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
