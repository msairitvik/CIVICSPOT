const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'frontend', 'public', 'assets', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pagesToCapture = [
  { name: '01_homepage_hero', url: 'http://localhost:5173/', fullPage: false },
  { name: '01_homepage_full', url: 'http://localhost:5173/', fullPage: true },
  { name: '02_explore_facilities', url: 'http://localhost:5173/explore', fullPage: false },
  { name: '03_report_issue', url: 'http://localhost:5173/report', fullPage: false },
  { name: '04_civic_ai_chat', url: 'http://localhost:5173/ai-chat', fullPage: false },
  { name: '05_government_schemes', url: 'http://localhost:5173/schemes', fullPage: false },
  { name: '06_analytics_dashboard', url: 'http://localhost:5173/analytics', fullPage: false },
  { name: '07_smart_navigation', url: 'http://localhost:5173/navigation', fullPage: false },
  { name: '08_homepage_mobile', url: 'http://localhost:5173/', width: 375, height: 812, fullPage: false },
  { name: '09_explore_mobile', url: 'http://localhost:5173/explore', width: 375, height: 812, fullPage: false }
];

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  for (const p of pagesToCapture) {
    const width = p.width || 1440;
    const height = p.height || 900;
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    
    try {
      console.log(`Capturing ${p.name} from ${p.url}...`);
      await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 15000 });
      // wait extra 1.5 seconds for leaflet map and animations to stabilize
      await new Promise(r => setTimeout(r, 1500));

      const outPath = path.join(OUTPUT_DIR, `${p.name}.png`);
      await page.screenshot({ path: outPath, fullPage: p.fullPage });
      console.log(`Saved: ${outPath}`);
    } catch (err) {
      console.error(`Error capturing ${p.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Capture complete!');
}

capture();
