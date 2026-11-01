import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const routes = [
  { name: '01_homepage', url: 'http://127.0.0.1:5173/' },
  { name: '02_explore', url: 'http://127.0.0.1:5173/explore' },
  { name: '03_ai_chat', url: 'http://127.0.0.1:5173/ai-chat' },
  { name: '04_navigation', url: 'http://127.0.0.1:5173/navigation' },
  { name: '05_dashboard', url: 'http://127.0.0.1:5173/dashboard' },
];

async function capture() {
  const outDir = path.resolve('..', 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  for (const route of routes) {
    console.log(`Navigating to ${route.url}...`);
    try {
      await page.goto(route.url, { waitUntil: 'networkidle2', timeout: 15000 });
      // Wait for any animations to settle
      await new Promise(r => setTimeout(r, 1500));
      const filePath = path.join(outDir, `${route.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${filePath}`);
    } catch (err) {
      console.error(`Error capturing ${route.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Finished capturing screenshots.');
}

capture();
