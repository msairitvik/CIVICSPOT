import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cropHeritage() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const imgPath = path.resolve('frontend', 'public', 'assets', 'hero-emerald-reference.jpg').replace(/\\/g, '/');
  
  // Create an HTML page that displays the image and uses an HTML5 Canvas to crop the palace architecture
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; background: #000;">
        <canvas id="canvas"></canvas>
        <img id="ref" src="file:///${imgPath}" style="display: none;" />
        <script>
          const img = document.getElementById('ref');
          img.onload = () => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            // The image width and height
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            console.log('Original image dimensions:', w, h);

            // The heritage palace is in the upper right quadrant:
            // x: roughly 50% to 100% of width
            // y: roughly 8% to 55% of height
            const cropX = Math.floor(w * 0.48);
            const cropY = Math.floor(h * 0.08);
            const cropW = Math.floor(w * 0.52);
            const cropH = Math.floor(h * 0.50);

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
  const outPath = path.resolve('frontend', 'public', 'assets', 'heritage-palace.png');
  await canvasEl.screenshot({ path: outPath });
  console.log('Saved cropped heritage architecture to:', outPath);

  // Also let's crop the glowing logo icon from the top left
  await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    // Logo icon is around top-left (x: 2% to 7%, y: 1.5% to 6%)
    const cropX = Math.floor(w * 0.02);
    const cropY = Math.floor(h * 0.015);
    const cropW = Math.floor(w * 0.12);
    const cropH = Math.floor(h * 0.06);

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  });

  const logoOutPath = path.resolve('frontend', 'public', 'assets', 'civicspot-logo.png');
  await canvasEl.screenshot({ path: logoOutPath });
  console.log('Saved logo to:', logoOutPath);

  await browser.close();
}

cropHeritage().catch(console.error);
