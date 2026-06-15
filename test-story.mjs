import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  try {
    await page.goto('http://localhost:6006/iframe.html?id=components-accordion--default&viewMode=story', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log(html);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
