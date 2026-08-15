const fs = require('fs');
const path = require('path');

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

// Clean or create dist directory
console.log('Cleaning dist directory...');
deleteDirSync(distDir);
fs.mkdirSync(distDir, { recursive: true });

// Copy root HTML files
const filesToCopy = ['index.html', 'play-bot.html', 'settings.html'];
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

const imagesSrcDir = path.join(__dirname, '../images');
if (fs.existsSync(imagesSrcDir)) {
  copyDirSync(imagesSrcDir, path.join(distDir, 'images'));
  console.log('Copied images directory to dist/');
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
