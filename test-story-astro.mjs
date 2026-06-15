import { chromium } from '@playwright/test';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  try {
    await page.goto('http://localhost:6008/iframe.html?id=astro-ai--default&viewMode=story', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
  } finally {
    await browser.close();
  }
})();
