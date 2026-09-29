import { expect, test } from '@playwright/test';

for (const width of [390, 768, 1280]) {
  for (const rtl of [false, true]) {
    test(`continuous editing ${width}px ${rtl ? 'RTL' : 'LTR'}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`/?rtl=${rtl}`);
      const field = page.getByRole('textbox', { name: 'Message input' });
      await field.waitFor();
      await field.click();
      // Save the actual DOM node, not a locator which silently resolves a
      // replacement. A retained locator alone cannot catch a detached editor.
      const original = await field.elementHandle();
      await field.evaluate(node => {
        (window as unknown as { composerBlurs: number }).composerBlurs = 0;
        node.addEventListener('blur', () => {
          (window as unknown as { composerBlurs: number }).composerBlurs++;
        });
      });
      const message = 'A long message that wraps while keeping the keyboard open. '.repeat(9);
      // No fill/focus after startup: they conceal focus loss between characters.
      await page.keyboard.type(message, { delay: 5 });
      await expect(field).toHaveValue(message);
      await expect(field).toBeFocused();
      await page.keyboard.insertText('🙂 é 👨‍👩‍👧‍👦');
      await expect(field).toHaveValue(`${message}🙂 é 👨‍👩‍👧‍👦`);
      await page.keyboard.press('Shift+Enter');
      await page.keyboard.type('congr');
      // Reproduce replacement of the partial word, using the focused engine
      // input. Desktop selection+insert is not an iOS prediction-bar test.
      for (let i = 0; i < 5; i++) await page.keyboard.press('Shift+ArrowLeft');
      await page.keyboard.insertText('congratulations');
      await page.keyboard.type(' and continue');
      await expect(field).toHaveValue(`${message}🙂 é 👨‍👩‍👧‍👦\ncongratulations and continue`);
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('fresh draft');
      await expect(field).toHaveValue('fresh draft');
      await expect(field).toBeFocused();
      expect(await original!.evaluate(node => node.isConnected)).toBe(true);
      expect(await page.evaluate(() =>
        (window as unknown as { composerBlurs: number }).composerBlurs)).toBe(0);
      expect(errors).toEqual([]);
    });
  }
}
