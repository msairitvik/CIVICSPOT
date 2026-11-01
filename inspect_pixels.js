const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const refPath = path.resolve('frontend', 'public', 'assets', 'hero-emerald-reference.jpg');
  const base64 = fs.readFileSync(refPath).toString('base64');
  await page.setContent(`<img id="img" src="data:image/jpeg;base64,${base64}" />`);
  await page.waitForFunction(() => document.getElementById('img').complete);
  
  const info = await page.evaluate(() => {
    const img = document.getElementById('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const p1 = ctx.getImageData(550, 50, 1, 1).data;
    const p2 = ctx.getImageData(950, 50, 1, 1).data;
    const p3 = ctx.getImageData(10, 10, 1, 1).data;
    const p4 = ctx.getImageData(10, 350, 1, 1).data;
    const pCenter = ctx.getImageData(760, 180, 1, 1).data;
    return {
      w: img.naturalWidth,
      h: img.naturalHeight,
      p1: Array.from(p1),
      p2: Array.from(p2),
      p3: Array.from(p3),
      p4: Array.from(p4),
      pCenter: Array.from(pCenter)
    };
  });
  console.log('Sampled pixels:', info);
  await browser.close();
})();
