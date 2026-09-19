/**
 * Hostinger Node.js Entry Point: server.js
 * 
 * 100% Top-Level-Await-Free CommonJS implementation.
 * Compatible with all Node.js versions (14+, 16+, 18+, 20+, 22+)
 * and Phusion Passenger on Hostinger / LiteSpeed / cPanel.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Force production environment
process.env.NODE_ENV = 'production';

// Safety crash guards to keep the Hostinger worker process alive
process.on('uncaughtException', function (err) {
  console.error('[Hostinger] Uncaught Exception:', err);
});
process.on('unhandledRejection', function (reason) {
  console.error('[Hostinger] Unhandled Rejection:', reason);
});

// Candidate paths for compiled production bundle
const candidateBundlePaths = [
  path.join(__dirname, 'dist', 'server.cjs'),
  path.join(process.cwd(), 'dist', 'server.cjs'),
  path.join(__dirname, 'server.cjs'),
  path.join(process.cwd(), 'server.cjs')
];

let bundlePath = null;
for (let i = 0; i < candidateBundlePaths.length; i++) {
  if (fs.existsSync(candidateBundlePaths[i])) {
    bundlePath = candidateBundlePaths[i];
    break;
  }
}

if (bundlePath) {
  console.log('[Hostinger] Starting Resa AI Assistant from: ' + bundlePath);
  // Synchronous CommonJS require - NO top-level await
  require(bundlePath);
} else {
  console.warn('[Hostinger] dist/server.cjs not found. Starting fallback listener on PORT.');
  const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      '<!DOCTYPE html><html><head><title>Resa AI Assistant</title></head>' +
      '<body style="font-family:system-ui,sans-serif;max-width:600px;margin:50px auto;padding:20px;line-height:1.6;">' +
      '<h2 style="color:#4338ca;">Resa AI Assistant Backend is Online</h2>' +
      '<p>Hostinger Node.js application is active (Port: ' + (process.env.PORT || 3000) + ').</p>' +
      '<p>The precompiled bundle <code>dist/server.cjs</code> was not found in this folder.</p>' +
      '<p><strong>Quick Fix:</strong> Upload the <code>dist/</code> folder or run <code>npm run build</code> in Hostinger hPanel.</p>' +
      '</body></html>'
    );
  });

  const rawPort = process.env.PORT || 3000;
  if (isNaN(Number(rawPort))) {
    server.listen(rawPort);
  } else {
    server.listen(Number(rawPort));
  }
}
