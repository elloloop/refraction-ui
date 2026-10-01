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

for (const width of [390, 768, 1280]) {
  test(`clipboard image and mixed text stage without send at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const field = page.getByRole('textbox', { name: 'Message input' });
    await field.click();
    await page.keyboard.type('before word after');
    for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowLeft', { delay: 30 });
    for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+ArrowRight', { delay: 30 });
    await expect.poll(() => field.evaluate(node => {
      const input = node as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd];
    })).toEqual([7, 11]);
    // Flutter coalesces text edits for 500ms. Commit the existing draft
    // before asserting that the following paste is a separate undo entry.
    await page.waitForTimeout(600);
    await field.evaluate(node => {
      const data = new DataTransfer();
      const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6ZAAAAABJRU5ErkJggg=='), c => c.charCodeAt(0));
      data.items.add(new File([png], 'fixture.png', { type: 'image/png' }));
      data.setData('text/plain', '🙂');
      node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    });
    await expect(field).toHaveValue('before 🙂 after');
    await expect(page.getByText('clipboard-1.png', { exact: true })).toBeVisible();
    await expect(field).toBeFocused();
    // Let Flutter commit the paste entry before exercising undo and redo.
    await page.waitForTimeout(600);
    await page.keyboard.press('ControlOrMeta+Z');
    await expect(field).toHaveValue('before word after');
    await page.keyboard.press('ControlOrMeta+Shift+Z');
    await expect(field).toHaveValue('before 🙂 after');
    // Image staging does not alter the editor undo stack or submit the fixture.
    await expect(page.getByText('clipboard-1.png', { exact: true })).toBeVisible();
  });
}


test('real browser keyboard paste reads OS clipboard image', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const field = page.getByRole('textbox', { name: 'Message input' });
  await field.click();
  await page.keyboard.type('fixture draft');
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 8;
    const drawing = canvas.getContext('2d')!;
    drawing.fillStyle = '#4499aa'; drawing.fillRect(0, 0, 8, 8);
    const png = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
  });
  await page.keyboard.press('ControlOrMeta+V');
  await expect(page.getByText('clipboard-1.png', { exact: true })).toBeVisible();
  await expect(field).toHaveValue('fixture draft');
  await expect(field).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('clipboard-fixture.png') });
});
