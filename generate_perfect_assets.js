const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function generateAssets() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const refPath = path.resolve('frontend', 'public', 'assets', 'hero-emerald-reference.jpg');
  const base64Img = fs.readFileSync(refPath).toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64Img}`;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; background: transparent;">
        <img id="ref" src="${dataUri}" />
        <canvas id="canvas"></canvas>
      </body>
    </html>
  `);

  await page.waitForFunction(() => document.getElementById('ref').complete);

  // 1. HERITAGE PALACE - Mathematical smooth continuous alpha gradient
  await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Crop palace area from reference (1024x580)
    // x: 530 to 1024, y: 40 to 255
    const cropX = 530;
    const cropY = 40;
    const cropW = 494;
    const cropH = 215;

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.clearRect(0, 0, cropW, cropH);

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const imgData = ctx.getImageData(0, 0, cropW, cropH);
    const data = imgData.data;

    const cx = cropW * 0.52;
    const cy = cropH * 0.62;

    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const idx = (y * cropW + x) * 4;

        // Smooth linear edge falloffs
        const fadeLeft = Math.min(1, Math.pow(x / 70, 1.2));
        const fadeTop = Math.min(1, Math.pow(y / 45, 1.2));
        const fadeRight = Math.min(1, Math.pow((cropW - 1 - x) / 50, 1.2));
        const fadeBottom = Math.min(1, Math.pow((cropH - 1 - y) / 35, 1.2));
        const edgeAlpha = fadeLeft * fadeTop * fadeRight * fadeBottom;

        // Radial distance falloff
        const dx = (x - cx) / (cropW * 0.55);
        const dy = (y - cy) / (cropH * 0.55);
        const dist = Math.sqrt(dx * dx + dy * dy);
        let radialAlpha = 1.0;
        if (dist > 0.65) {
          radialAlpha = Math.max(0, 1 - Math.pow((dist - 0.65) / 0.35, 1.3));
        }

        const alpha = Math.max(0, Math.min(1, edgeAlpha * radialAlpha));
        data[idx + 3] = Math.round(data[idx + 3] * alpha);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  });

  const palaceOut = path.resolve('frontend', 'public', 'assets', 'heritage-palace.png');
  const canvasEl = await page.$('#canvas');
  await canvasEl.screenshot({ path: palaceOut, omitBackground: true });
  console.log('Saved smoothly feathered palace:', palaceOut);

  // 2. LEFT FOLIAGE - Transparent background, smooth right edge fade
  await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const cropX = 0;
    const cropY = 345;
    const cropW = 46;
    const cropH = 230;

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.clearRect(0, 0, cropW, cropH);

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const imgData = ctx.getImageData(0, 0, cropW, cropH);
    const data = imgData.data;

    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const idx = (y * cropW + x) * 4;
        const fadeRight = Math.min(1, Math.pow((cropW - 1 - x) / 18, 1.5));
        const fadeTop = Math.min(1, y / 20);
        data[idx + 3] = Math.round(data[idx + 3] * fadeRight * fadeTop);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  });

  const leftFoliageOut = path.resolve('frontend', 'public', 'assets', 'foliage-left.png');
  await canvasEl.screenshot({ path: leftFoliageOut, omitBackground: true });
  console.log('Saved smooth foliage:', leftFoliageOut);

  await browser.close();
  console.log('All assets generated successfully!');
}

generateAssets().catch(console.error);
