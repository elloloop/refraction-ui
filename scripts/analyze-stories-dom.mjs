import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const ARTIFACT_DIR = '/Users/arun/.gemini/antigravity-cli/brain/58bdfde1-7871-4686-96f2-9c6f0b881017';
const REPORT_PATH = path.join(ARTIFACT_DIR, 'story_analysis.json');

async function analyzeStorybook(baseUrl, framework) {
  console.log(`\nAnalyzing Storybook at ${baseUrl}...`);
  try {
    const res = await fetch(`${baseUrl}/index.json`);
    const data = await res.json();
    const stories = Object.values(data.entries).filter(e => e.type === 'story');
    
    console.log(`Found ${stories.length} stories for ${framework}. Starting analysis...`);
    
    const browser = await chromium.launch({ headless: true });
    const results = [];
    
    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize);
      const promises = batch.map(async (story) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        let analysis = {
          id: story.id,
          title: story.title,
          name: story.name,
          framework,
          status: 'success',
          errorReason: null,
          textLength: 0,
          rootHtmlLength: 0
        };

        let consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        try {
          const url = `${baseUrl}/iframe.html?id=${story.id}&viewMode=story`;
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(500); // Give it a moment to render
          
          const domState = await page.evaluate(() => {
            const root = document.querySelector('#storybook-root');
            const errorDisplay = document.querySelector('.sb-errordisplay');
            return {
              innerText: document.body.innerText.trim(),
              rootHtml: root ? root.innerHTML.trim() : null,
              hasErrorDisplay: !!errorDisplay && window.getComputedStyle(errorDisplay).display !== 'none',
              errorDisplayText: errorDisplay ? errorDisplay.innerText : null
            };
          });

          analysis.textLength = domState.innerText.length;
          analysis.rootHtmlLength = domState.rootHtml ? domState.rootHtml.length : 0;

          if (domState.hasErrorDisplay) {
            analysis.status = 'error';
            analysis.errorReason = 'Storybook Error Overlay: ' + domState.errorDisplayText.split('\n')[0];
          } else if (domState.innerText.includes('Cannot read properties of undefined') || 
                     domState.innerText.includes('Minified React error') ||
                     domState.innerText.includes('Element type is invalid') ||
                     domState.innerText.includes('is not defined')) {
            analysis.status = 'error';
            analysis.errorReason = 'Rendered Exception Text';
          } else if (consoleErrors.some(e => e.includes('TypeError') || e.includes('ReferenceError') || e.includes('Minified React error'))) {
            analysis.status = 'error';
            analysis.errorReason = 'Console Error: ' + consoleErrors.find(e => e.includes('Error')).split('\n')[0];
          } else if (analysis.rootHtmlLength === 0 || domState.rootHtml === '<!--astro:component-->') {
            analysis.status = 'blank';
            analysis.errorReason = 'Empty DOM root';
          }
        } catch (e) {
          analysis.status = 'error';
          analysis.errorReason = `Page Load Failed: ${e.message}`;
        } finally {
          await context.close();
        }
        return analysis;
      });
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      console.log(`Analyzed ${Math.min(i + batchSize, stories.length)} / ${stories.length}`);
    }
    
    await browser.close();
    return results;
  } catch (err) {
    console.error(`Failed to analyze ${baseUrl}: ${err.message}`);
    return [];
  }
}

(async () => {
  const reactResults = await analyzeStorybook('http://localhost:6006', 'react');
  const astroResults = await analyzeStorybook('http://localhost:6008', 'astro');
  
  const allResults = [...reactResults, ...astroResults];
  await fs.writeFile(REPORT_PATH, JSON.stringify(allResults, null, 2));
  console.log(`\nAnalysis saved to: ${REPORT_PATH}`);
  process.exit(0);
})();
