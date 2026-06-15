import { chromium } from '@playwright/test';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:6006/iframe.html?id=components-accordion--default&viewMode=story', { waitUntil: 'networkidle' });
  const val = await page.evaluate(() => {
    const el = document.querySelector('.sb-errordisplay');
    if (!el) return null;
    return {
      hasHiddenAttr: el.hasAttribute('hidden'),
      hiddenProp: el.hidden,
      classList: Array.from(el.classList),
      display: window.getComputedStyle(el).display,
      outerHTML: el.outerHTML
    };
  });
  console.log(val);
  await browser.close();
})();
