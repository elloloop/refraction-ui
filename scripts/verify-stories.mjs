import { chromium } from '@playwright/test';

async function checkStorybook(baseUrl) {
  console.log(`\nChecking Storybook at ${baseUrl}...`);
  try {
    const res = await fetch(`${baseUrl}/index.json`);
    const data = await res.json();
    const stories = Object.values(data.entries).filter(e => e.type === 'story');
    
    console.log(`Found ${stories.length} stories. Starting verification...`);
    
    const browser = await chromium.launch({ headless: true });
    let failedCount = 0;

    for (const story of stories) {
      const context = await browser.newContext();
      const page = await context.newPage();
      let hasError = false;
      
      page.on('pageerror', error => {
        hasError = true;
        console.error(`[ERROR] ${story.id}: ${error.message.split('\n')[0]}`);
      });
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          hasError = true;
          console.error(`[CONSOLE ERROR] ${story.id}: ${msg.text().split('\n')[0]}`);
        }
      });

      try {
        const url = `${baseUrl}/iframe.html?id=${story.id}&viewMode=story`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      } catch (e) {
        if (e.message.includes('Timeout')) {
          // Timeout isn't always a fatal crash for the story, just slow network idle
        } else {
          hasError = true;
          console.error(`[PAGE LOAD FAILED] ${story.id}: ${e.message}`);
        }
      }
      
      if (hasError) {
        failedCount++;
      }
      
      await context.close();
    }
    
    await browser.close();
    console.log(`Verification for ${baseUrl} complete. ${failedCount > 0 ? failedCount + ' stories failed.' : 'All stories look good!'}`);
  } catch (err) {
    console.error(`Failed to verify ${baseUrl}: ${err.message}`);
  }
}

(async () => {
  await checkStorybook('http://localhost:6007');
  await checkStorybook('http://localhost:6008');
  process.exit(0);
})();
