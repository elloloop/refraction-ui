const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3003/flutter/theme-generator', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/Users/arun/.gemini/antigravity/brain/1e7f5a05-bd7c-4be1-a495-676d39d27bb2/theme_generator_preview.png' });
  await browser.close();
})();
