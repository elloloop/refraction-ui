const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'docs-site/src/app/components');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      if (file === 'page.tsx') {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walkDir(targetDir);
let changedCount = 0;

const regex = /<CodeBlock\s+code=\{usageCode\}\s*\/>/g;
const replacement = `<CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />`;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (regex.test(content)) {
    const updatedContent = content.replace(regex, replacement);
    fs.writeFileSync(file, updatedContent, 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Total files updated: ${changedCount}`);