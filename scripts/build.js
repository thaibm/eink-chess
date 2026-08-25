const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from local .env file...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && trimmed.indexOf('#') !== 0) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    }
  });
}

const distDir = path.join(__dirname, '../dist');

// Helper to delete directory recursively
function deleteDirSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

// Regenerate the discovery documents that must stay in sync with the files they
// point at (agent-skill digests, sitemap lastmod) before anything is copied.
console.log('Regenerating SEO / agent discovery documents...');
require('./build-seo.js');

// Clean or create dist directory
console.log('Cleaning dist directory...');
deleteDirSync(distDir);
fs.mkdirSync(distDir, { recursive: true });

// Copy root HTML files
// Note: vercel.json is deliberately absent — Vercel reads it from the repository
// root, not from the output directory, so copying it into dist/ has no effect.
const filesToCopy = ['index.html', 'play-bot.html', 'play-bot-v2.html', 'analysis.html', 'puzzles.html', 'settings.html', 'stats.html', 'chess-old.html', 'puzzles-old.html', 'robots.txt', 'sitemap.xml'];
filesToCopy.forEach((file) => {
  const src = path.join(__dirname, '..', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
    console.log(`Copied ${file} to dist/`);
  }
});

// Helper to copy directory recursively
function copyDirSync(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const items = fs.readdirSync(srcDir);
  items.forEach((item) => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Copy css, js and images directories
console.log('Copying css, js and images assets...');
copyDirSync(path.join(__dirname, '../css'), path.join(distDir, 'css'));
copyDirSync(path.join(__dirname, '../js'), path.join(distDir, 'js'));

// Copy agent-discovery directories: markdown page representations, API docs,
// and the /.well-known/ documents (api-catalog, ai-catalog.json, agent-skills).
console.log('Copying agent discovery documents...');
['md', 'docs', '.well-known'].forEach((dir) => {
  const src = path.join(__dirname, '..', dir);
  if (fs.existsSync(src)) {
    copyDirSync(src, path.join(distDir, dir));
    console.log(`Copied ${dir}/ to dist/`);
  } else {
    console.warn(`Warning: ${dir}/ not found — skipping`);
  }
});

const imagesSrcDir = path.join(__dirname, '../images');
if (fs.existsSync(imagesSrcDir)) {
  copyDirSync(imagesSrcDir, path.join(distDir, 'images'));
  console.log('Copied images directory to dist/');
}

// Copy puzzle data (folders + manifest.js)
const puzzlesSrcDir = path.join(__dirname, '../data/puzzles');
if (fs.existsSync(puzzlesSrcDir)) {
  copyDirSync(puzzlesSrcDir, path.join(distDir, 'data/puzzles'));
  console.log('Copied data/puzzles directory to dist/');
}


// Inject Environment Variables into dist/js/chess-backend.js
const backendJsPath = path.join(distDir, 'js/chess-backend.js');
if (fs.existsSync(backendJsPath)) {
  console.log('Injecting environment variables into dist/js/chess-backend.js...');
  let content = fs.readFileSync(backendJsPath, 'utf8');

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

  // Match and replace placeholder patterns
  content = content.replace('%%SUPABASE_URL%%', supabaseUrl);
  content = content.replace('%%SUPABASE_ANON_KEY%%', supabaseAnonKey);

  fs.writeFileSync(backendJsPath, content, 'utf8');
  console.log('Successfully injected Supabase URL & Anon Key.');
} else {
  console.error('Error: dist/js/chess-backend.js not found!');
  process.exit(1);
}

console.log('Build completed successfully!');
