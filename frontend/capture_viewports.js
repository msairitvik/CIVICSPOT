import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: '1440px', width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: '1280px', width: 1280, height: 800, deviceScaleFactor: 1 },
  { name: '768px', width: 768, height: 1024, deviceScaleFactor: 1 },
  { name: '375px', width: 375, height: 812, deviceScaleFactor: 1 },
];

const targets = [
  { id: 'homepage', url: 'http://127.0.0.1:5173/' },
  { id: 'explore', url: 'http://127.0.0.1:5173/explore' },
  { id: 'aichat', url: 'http://127.0.0.1:5173/ai-chat' },
  { id: 'navigation', url: 'http://127.0.0.1:5173/navigation' },
  { id: 'dashboard', url: 'http://127.0.0.1:5173/dashboard' },
];

async function capture() {
  const outDir = path.resolve('..', 'screenshots', 'responsive');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    await page.setViewport(vp);
    for (const t of targets) {
      const filename = `${t.id}_${vp.name}.png`;
      const filePath = path.join(outDir, filename);
      console.log(`Capturing ${filename}...`);
      try {
        await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: filePath, fullPage: false });
      } catch (err) {
        console.error(`Failed ${filename}:`, err.message);
      }
    }
  }

  // Also capture a full-page desktop screenshot for homepage
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'homepage_fullpage_1440px.png'), fullPage: true });

  await browser.close();
  console.log('Finished capturing responsive viewports.');
}

capture();
