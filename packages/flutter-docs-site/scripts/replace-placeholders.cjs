const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, '../src/app/examples');

const imgMap = [
  '/assets/scenes/scene-office.jpg',
  '/assets/scenes/scene-cafe.jpg',
  '/assets/scenes/scene-hotel-lobby.jpg',
  '/assets/scenes/scene-classroom.jpg',
  '/assets/scenes/scene-store.jpg',
  '/assets/scenes/scene-park.jpg',
  '/assets/scenes/scene-clinic.jpg',
  '/assets/scenes/scene-kitchen.jpg',
  '/assets/scenes/scene-campus.jpg',
  '/assets/people/sa/sa-1-portrait.jpg',
  '/assets/people/ea/ea-2-portrait.jpg',
  '/assets/people/af/af-1-portrait.jpg',
  '/assets/people/am/am-2-portrait.jpg',
];

function getRandomImg(filePath) {
  let list = imgMap;
  if(filePath.includes('vitalink')) list = ['/assets/scenes/scene-clinic.jpg', '/assets/people/ea/ea-1-portrait.jpg', '/assets/people/af/af-2-portrait.jpg'];
  if(filePath.includes('learnhub')) list = ['/assets/scenes/scene-classroom.jpg', '/assets/scenes/scene-campus.jpg'];
  if(filePath.includes('maison')) list = ['/assets/scenes/scene-store.jpg', '/assets/objects/obj-1-product.jpg'];
  if(filePath.includes('grandview')) list = ['/assets/scenes/scene-hotel-lobby.jpg'];
  if(filePath.includes('verve')) list = ['/assets/scenes/scene-park.jpg', '/assets/people/am/am-2-portrait.jpg'];
  if(filePath.includes('kitchen') || filePath.includes('restaurant')) list = ['/assets/scenes/scene-kitchen.jpg'];
  return list[Math.floor(Math.random() * list.length)];
}

const logoReplacements = [
  { text: 'Maison Eclat',  logo: 'MaisonLogo' },
  { text: 'Clear[bB]ank',  logo: 'ClearbankLogo' },
  { text: 'CORTEX',        logo: 'CortexLogo' },
  { text: 'Ember',         logo: 'EmberLogo' },
  { text: 'GRANDVIEW',     logo: 'GrandviewLogo' },
  { text: 'InsightIQ',     logo: 'InsightIqLogo' },
  { text: 'LearnHub',      logo: 'LearnhubLogo' },
  { text: 'momento',       logo: 'MomentoLogo' },
  { text: 'StudioX',       logo: 'StudioXLogo' },
  { text: 'teamspace',     logo: 'TeamspaceLogo' },
  { text: 'VERVE',         logo: 'VerveLogo' },
  { text: 'VitaLink',      logo: 'VitalinkLogo' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Replace placeholder gradient divs heavily
  // Pattern matches:
  // <div className="(anything) bg-gradient-to-(anything) flex items-center justify-center (anything)">
  //   <div ...>
  //     <svg ...>
  //     <span ...>...</span>
  //   </div>
  // </div>
  const placeholderRegex = /<div className="([^"]*bg-gradient-to-[^"]*flex items-center justify-center[^"]*)"[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>\s*<\/div>/g;
  
  content = content.replace(placeholderRegex, (match, classNames) => {
    // Keep outer classnames but remove the background gradients and flex centering
    let newClass = classNames.replace(/bg-gradient-to-[a-z]+|from-[^\s]+|to-[^\s]+|flex|items-center|justify-center|text-center/g, '').trim();
    // make sure overflow-hidden is there so children rounded corners match
    if (!newClass.includes('overflow-hidden')) newClass += ' overflow-hidden';
    
    // Choose specific random image
    const imgSrc = getRandomImg(filePath);
    return `<div className="${newClass}"><img src="${imgSrc}" alt="Gallery Image" className="w-full h-full object-cover" /></div>`;
  });

  // 2. Specialized replacements for SVGs that don't match the heavy nesting, simpler placeholders
  const simplePlaceholder = /<div className="([^"]*bg-gradient-to-[^"]*)"[^>]*>\s*<svg[\s\S]*?<\/svg>\s*<\/div>/g;
  content = content.replace(simplePlaceholder, (match, classNames) => {
    let newClass = classNames.replace(/bg-gradient-to-[a-z]+|from-[^\s]+|to-[^\s]+/g, '').trim();
    if (!newClass.includes('overflow-hidden')) newClass += ' overflow-hidden';
    const imgSrc = getRandomImg(filePath);
    return `<div className="${newClass}"><img src="${imgSrc}" alt="Brand Asset" className="w-full h-full object-cover" /></div>`;
  });

  // 3. Inject logos
  let importedLogos = new Set();
  
  logoReplacements.forEach(({text, logo}) => {
    // Match exactly >Text< or > Text < to aggressively replace plain text logos in navbar usually
    const textRegex = new RegExp(`>\\s*${text}\\s*<`, 'g');
    if (content.match(textRegex)) {
      content = content.replace(textRegex, `><${logo} className="h-5" /><`);
      importedLogos.add(logo);
    }
  });

  // add import if we added logos
  if (importedLogos.size > 0) {
    const importStr = `\nimport { ${Array.from(importedLogos).join(', ')} } from '@/components/logos';\n`;
    // Insert after last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const lineEnd = content.indexOf('\\n', lastImportIndex);
      content = content.slice(0, lineEnd) + importStr + content.slice(lineEnd);
    } else {
      content = importStr + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated placeholders in ${filePath}`);
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
console.log("Done.");
