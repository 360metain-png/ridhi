const fs = require('fs');
const path = require('path');

const ROOT = '/home/runner/workspace/artifacts';
const EXT = ['.ts', '.tsx'];

function maskLine(line) {
  let result = line;
  // +91 98765 43210
  result = result.replace(/\+91\s?\d{5}\s?\d{5}/g, '+91 XXXXX XXXXX');
  // +919876543210
  result = result.replace(/\+91\d{10}/g, '+91 XXXXXX XXXXX');
  // 98765-43210
  result = result.replace(/\d{5}-\d{5}/g, 'XXXXX-XXXXX');
  // +91 98765${43210 + i} template literals
  result = result.replace(/\+91\s?98765\$\{[^}]+\}/g, '+91 XXXXX${"XXXXX"}');
  // +91 9876543210 (no spaces)
  result = result.replace(/\+91\s?98765\d{5}/g, '+91 XXXXX XXXXX');
  return result;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'static-build', '.next', 'dist'].includes(entry.name)) continue;
      walk(full, files);
    } else if (entry.isFile() && EXT.includes(path.extname(full))) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(ROOT);
let modified = 0;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  let changed = false;
  const newLines = lines.map(line => {
    const masked = maskLine(line);
    if (masked !== line) changed = true;
    return masked;
  });
  if (changed) {
    fs.writeFileSync(f, newLines.join('\n'), 'utf8');
    modified++;
  }
}

console.log(`Modified ${modified} files`);

// Verify
let remaining = 0;
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/\+91\s?\d{5}\s?\d{5}/.test(lines[i]) || /\+91\d{10}/.test(lines[i]) || /\d{5}-\d{5}/.test(lines[i]) || /\+91\s?98765/.test(lines[i])) {
      // Skip if it's already masked
      if (/XXXXX/.test(lines[i])) continue;
      console.log(`REMAINING: ${f}:${i+1}: ${lines[i].trim().slice(0, 120)}`);
      remaining++;
    }
  }
}
console.log(`Remaining unmasked lines: ${remaining}`);
