import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

await mkdir('codex/ekran', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', e => console.log('PAGEERROR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await page.goto('http://localhost:3060');
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'codex/ekran/ilk-390.png' });
console.log(await page.locator('h1').textContent());
console.log('overflow', await page.evaluate(() => document.documentElement.scrollWidth));
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: 'codex/ekran/ilk-1440.png' });
await browser.close();
