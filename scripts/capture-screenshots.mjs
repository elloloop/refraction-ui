import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const ARTIFACT_DIR = '/Users/arun/.gemini/antigravity-cli/brain/58bdfde1-7871-4686-96f2-9c6f0b881017';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function captureStorybook(baseUrl, prefix) {
  console.log(`\nCapturing Storybook at ${baseUrl}...`);
  try {
    const res = await fetch(`${baseUrl}/index.json`);
    const data = await res.json();
    const stories = Object.values(data.entries).filter(e => e.type === 'story');
    
    console.log(`Found ${stories.length} stories for ${prefix}. Starting capture...`);
    
    const browser = await chromium.launch({ headless: true });
    
    // Process in batches of 10 to speed up
    const batchSize = 10;
    const markdownLines = [];
    
    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize);
      const promises = batch.map(async (story) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const filename = `${prefix}-${story.id}.png`;
        const filepath = path.join(SCREENSHOTS_DIR, filename);
        
        try {
          const url = `${baseUrl}/iframe.html?id=${story.id}&viewMode=story`;
          await page.goto(url, { waitUntil: 'networkidle', timeout: 8000 });
          // Wait a bit extra for animations/fonts
          await page.waitForTimeout(500);
          await page.screenshot({ path: filepath, fullPage: true });
          
          return `### ${story.title} - ${story.name}\n![${story.id}](${filepath})\n`;
        } catch (e) {
          console.error(`[ERROR] Failed to capture ${story.id}: ${e.message}`);
          return `### ${story.title} - ${story.name}\n**Failed to load:** ${e.message}\n`;
        } finally {
          await context.close();
        }
      });
      
      const results = await Promise.all(promises);
      markdownLines.push(...results);
      console.log(`Captured ${Math.min(i + batchSize, stories.length)} / ${stories.length}`);
    }
    
    await browser.close();
    return markdownLines.join('\n');
  } catch (err) {
    console.error(`Failed to capture ${baseUrl}: ${err.message}`);
    return `Failed to capture ${baseUrl}: ${err.message}`;
  }
}

(async () => {
  await ensureDir(SCREENSHOTS_DIR);
  
  const reactMarkdown = await captureStorybook('http://localhost:6007', 'react');
  const astroMarkdown = await captureStorybook('http://localhost:6008', 'astro');
  
  const reportPath = path.join(ARTIFACT_DIR, 'storybook_visual_report.md');
  const reportContent = `# Storybook Visual Report\n\n## Astro Components\n${astroMarkdown}\n\n## React Components\n${reactMarkdown}`;
  
  await fs.writeFile(reportPath, reportContent);
  console.log(`\nReport generated at: ${reportPath}`);
  process.exit(0);
})();
