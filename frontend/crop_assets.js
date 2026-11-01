import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cropHeritage() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  const imgPath = path.resolve('public', 'assets', 'hero-emerald-reference.jpg');
  const base64 = fs.readFileSync(imgPath).toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; background: #000;">
        <canvas id="canvas"></canvas>
        <img id="ref" src="${dataUrl}" style="display: none;" />
        <script>
          const img = document.getElementById('ref');
          img.onload = () => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            const w = img.naturalWidth;
            const h = img.naturalHeight;

            // Heritage palace in the upper right above the Civic Radar card (pure architecture & luminous arcs)
            const cropX = Math.floor(w * 0.54);
            const cropY = Math.floor(h * 0.08);
            const cropW = Math.floor(w * 0.46);
            const cropH = Math.floor(h * 0.315);

            canvas.width = cropW;
            canvas.height = cropH;
            ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            window.__done = true;
          };
        </script>
      </body>
    </html>
  `);

  await page.waitForFunction('window.__done === true', { timeout: 10000 });

  const canvasEl = await page.$('#canvas');
  const outPath = path.resolve('public', 'assets', 'heritage-palace.png');
  await canvasEl.screenshot({ path: outPath });
  console.log('Saved cropped heritage architecture to:', outPath);

  // Crop logo icon only
  await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const cropX = Math.floor(w * 0.025);
    const cropY = Math.floor(h * 0.016);
    const cropW = Math.floor(w * 0.042);
    const cropH = Math.floor(h * 0.048);

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  });

  const iconOutPath = path.resolve('public', 'assets', 'civicspot-icon.png');
  await canvasEl.screenshot({ path: iconOutPath });
  console.log('Saved icon to:', iconOutPath);

  // Also crop the full logo with text
  await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const cropX = Math.floor(w * 0.024);
    const cropY = Math.floor(h * 0.014);
    const cropW = Math.floor(w * 0.16);
    const cropH = Math.floor(h * 0.052);

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  });

  const logoOutPath = path.resolve('public', 'assets', 'civicspot-logo.png');
  await canvasEl.screenshot({ path: logoOutPath });
  console.log('Saved logo to:', logoOutPath);

  await browser.close();
}

cropHeritage().catch(console.error);
