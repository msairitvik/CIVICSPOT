const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'frontend', 'public', 'assets', 'screenshots');

async function captureHero() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  const viewports = [
    { name: '01_homepage_hero_1440x900', width: 1440, height: 900 },
    { name: '01_homepage_hero_1382x785', width: 1382, height: 785 },
    { name: '01_homepage_hero', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    console.log(`Capturing ${vp.name}...`);
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));

    const outPath = path.join(OUTPUT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
  console.log('Capture hero complete!');
}

captureHero().catch(console.error);
