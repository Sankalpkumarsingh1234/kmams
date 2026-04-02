import fs from 'fs';
import path from 'path';

const getCleanUrlConfig = `const API_BASE = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || '') : (import.meta.env.VITE_API_URL || 'http://localhost:3001');`;

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // We find anything like:
  // `${import.meta.env.VITE_API_URL || 'http://localhost:3001 (or deployed backend)'}`
  // `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001 (or deployed backend)'}`}`
  
  const regex = /\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*.*?\}/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, "${API_BASE}");
    
    // add import to top if not present, and declare API_BASE after imports
    if (!content.includes('const API_BASE')) {
        // find last import
        const importsEnd = content.lastIndexOf('import ') > -1 ? content.indexOf('\n', content.lastIndexOf('import ')) : 0;
        
        content = content.slice(0, importsEnd) + '\n\n' + getCleanUrlConfig + '\n' + content.slice(importsEnd);
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
}

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules') walk(full);
    } else if (f.name.endsWith('.jsx') || f.name.endsWith('.js')) {
      cleanFile(full);
    }
  }
}

walk('./src');
console.log('Cleaned up URLs!');
