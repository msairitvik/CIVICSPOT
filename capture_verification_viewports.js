const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'frontend', 'public', 'assets', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const testViewports = [
  { name: '01_homepage_hero_1440x900', width: 1440, height: 900 },
  { name: '01_homepage_hero_1382x785', width: 1382, height: 785 },
  { name: '01_homepage_hero_1280x800', width: 1280, height: 800 },
  { name: '01_homepage_hero_1024x768', width: 1024, height: 768 },
  { name: '01_homepage_hero_768x1024', width: 768, height: 1024 },
  { name: '01_homepage_hero', width: 1440, height: 900 }
];

async function captureAllViewports() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  for (const vp of testViewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    console.log(`Capturing ${vp.name} (${vp.width}x${vp.height})...`);
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));

    const outPath = path.join(OUTPUT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
  console.log('All verification viewports captured!');
}

captureAllViewports().catch(console.error);
