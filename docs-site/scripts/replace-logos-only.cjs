const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, '../src/app/examples');

const logoReplacements = [
  { text: 'Maison Eclat',  logo: 'MaisonLogo' },
  { text: 'Clear[bB]ank',  logo: 'ClearbankLogo' },
  { text: 'Cortex',        logo: 'CortexLogo' },
  { text: 'Ember',         logo: 'EmberLogo' },
  { text: 'Grandview',     logo: 'GrandviewLogo' },
  { text: 'InsightIQ',     logo: 'InsightIqLogo' },
  { text: 'LearnHub',      logo: 'LearnhubLogo' },
  { text: 'Momento',       logo: 'MomentoLogo' },
  { text: 'StudioX',       logo: 'StudioXLogo' },
  { text: 'Teamspace',     logo: 'TeamspaceLogo' },
  { text: 'Verve',         logo: 'VerveLogo' },
  { text: 'Vitalink',      logo: 'VitalinkLogo' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  let importedLogos = new Set();
  
  logoReplacements.forEach(({text, logo}) => {
    // Match exactly >Text< or > Text <, or >\nText\n<
    const textRegex = new RegExp(`>\\s*${text}\\s*<`, 'gi');
    if (content.match(textRegex)) {
      content = content.replace(textRegex, `><${logo} className="h-6 w-auto" /><`);
      importedLogos.add(logo);
    }
  });

  if (importedLogos.size > 0) {
    const importStr = `\nimport { ${Array.from(importedLogos).join(', ')} } from '@/components/logos';\n`;
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const lineEnd = content.indexOf('\n', lastImportIndex);
      // check if it's already imported
      if(!content.includes(`@/components/logos`)) {
        content = content.slice(0, lineEnd) + importStr + content.slice(lineEnd);
      }
    } else {
      content = importStr + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated logos in ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

traverse(examplesDir);
console.log("Done logos.");
