import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'hostinger-deployment');

console.log('🚀 Building production files for Hostinger...');

// 1. Run production build
try {
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error('❌ Build failed. Please fix errors before packaging.');
  process.exit(1);
}

// 2. Prepare output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 3. Copy essential files
const filesToCopy = [
  'app.js',
  'server.js',
  'index.js',
  'ecosystem.config.cjs',
  '.htaccess',
  '.env.example',
  'HOSTINGER_DEPLOYMENT_GUIDE.md'
];

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(outDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// 4. Copy dist directory and root assets
const srcDist = path.join(rootDir, 'dist');
const destDist = path.join(outDir, 'dist');
fs.cpSync(srcDist, destDist, { recursive: true });

// Copy dist contents directly to outDir root so index.html is available immediately
fs.cpSync(srcDist, outDir, { recursive: true });

// 5. Generate lean production package.json for Hostinger
const pkgRaw = fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8');
const pkg = JSON.parse(pkgRaw);

const prodPkg = {
  name: pkg.name || 'resa-ai-assistant',
  version: pkg.version || '1.0.0',
  private: true,
  type: 'module',
  scripts: {
    start: 'node app.js',
    'start:bundle': 'node dist/server.cjs'
  },
  dependencies: pkg.dependencies
};

fs.writeFileSync(
  path.join(outDir, 'package.json'),
  JSON.stringify(prodPkg, null, 2),
  'utf-8'
);

// 6. Create static public_html folder for Shared Hosting option
const publicHtmlDir = path.join(outDir, 'public_html');
fs.cpSync(srcDist, publicHtmlDir, { recursive: true });

// 7. Create ready-to-upload ZIP archive
try {
  execSync(`python3 -c "import shutil; shutil.make_archive('hostinger-deployment', 'zip', 'hostinger-deployment')"`, {
    cwd: rootDir,
    stdio: 'ignore'
  });
  console.log('📦 Created: hostinger-deployment.zip (Upload this directly to Hostinger File Manager)');
} catch (e) {
  // zip creation optional
}

console.log('✅ Hostinger deployment package ready!');
console.log(`📁 Package location: ${outDir}`);
console.log('📄 See HOSTINGER_DEPLOYMENT_GUIDE.md inside the package for deployment steps.');
