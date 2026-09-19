import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Hostinger Node.js Application Startup File
 *
 * In Hostinger hPanel (Web Hosting / Cloud Hosting):
 * 1. Navigate to "Advanced" -> "Node.js"
 * 2. Set Application root: / (or domains/yourdomain.com/public_html)
 * 3. Set Application startup file: app.js
 * 4. Choose Node.js version: 18.x, 20.x, or 22.x
 * 5. Run "npm run build" to generate dist/
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundlePath = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(bundlePath)) {
  console.error('================================================================');
  console.error('⚠️  Resa AI Assistant: Production bundle not found at:');
  console.error(`   ${bundlePath}`);
  console.error('');
  console.error('👉 Please run the build command first:');
  console.error('   npm run build');
  console.error('   (Or in Hostinger hPanel: Click "NPM Script" -> Select "build" -> Run)');
  console.error('================================================================');
  process.exit(1);
}

// Boot the bundled production server
await import('./dist/server.cjs');
