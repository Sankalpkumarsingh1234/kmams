import fs from 'fs';
import path from 'path';

const searchStr = /http:\/\/localhost:3001/g;
const replaceStr = "`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`";

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("http://localhost:3001")) {
    
    // First, handle template literals where it's used directly
    content = content.replace(/`http:\/\/localhost:3001(.*?)(?=`)/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}$1");
    
    // Handle double quotes
    content = content.replace(/"http:\/\/localhost:3001(.*?)"/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}$1`");

    // Handle single quotes
    content = content.replace(/'http:\/\/localhost:3001(.*?)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}$1`");

    // Fix OnboardingScreen where the string is just normal localhost reference without URL
    content = content.replace(/localhost:3001/g, "localhost:3001 (or deployed backend)");

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

processDir('./src');
console.log('All API URLs replaced!');
