const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/app/components');
const components = fs.readdirSync(componentsDir).filter(c => fs.statSync(path.join(componentsDir, c)).isDirectory());

for (const slug of components) {
  const pagePath = path.join(componentsDir, slug, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Check if FlutterPreview is already imported
    if (!content.includes('FlutterPreview')) {
      // Add import at the top
      content = `import { FlutterPreview } from '@/components/flutter-preview'\n` + content;
      
      // Look for the CodeBlock and insert the FlutterPreview right before it
      const codeBlockIndex = content.indexOf('<CodeBlock');
      if (codeBlockIndex !== -1) {
        const componentPreviewCode = `<FlutterPreview path="/docs/${slug}" />\n        <div className="h-4"></div>\n        `;
        content = content.slice(0, codeBlockIndex) + componentPreviewCode + content.slice(codeBlockIndex);
        fs.writeFileSync(pagePath, content);
        console.log(`Updated ${slug}`);
      }
    }
  }
}
