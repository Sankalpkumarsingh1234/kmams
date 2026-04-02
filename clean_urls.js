import fs from 'fs';
import path from 'path';

// Force API_BASE/API_URL to be strictly empty in production mode, overriding anything the user might have accidentally set in Vercel environment variables!
const getCleanUrlConfig = `const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');`;

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix API_BASE
  if (content.includes('const API_BASE = import.meta.env.PROD')) {
    content = content.replace(/const API_BASE = import\.meta\.env\.PROD .*/g, getCleanUrlConfig);
    changed = true;
  }
  
  // Fix API_URL in client.js specifically
  if (content.includes('const API_URL = import.meta.env.PROD')) {
    content = content.replace(/const API_URL = import\.meta\.env\.PROD[\s\S]*?'http:\/\/localhost:3001'\);/g, `const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');`);
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
console.log('Forced production relative URLs!');
