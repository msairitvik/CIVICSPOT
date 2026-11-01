const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function processAssets() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const refPath = path.resolve('frontend', 'public', 'assets', 'hero-emerald-reference.jpg');
  const base64Img = fs.readFileSync(refPath).toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64Img}`;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; background: #0B1F16;">
        <img id="ref" src="${dataUri}" />
        <canvas id="canvas"></canvas>
      </body>
    </html>
  `);

  await page.waitForFunction(() => {
    const img = document.getElementById('ref');
    return img && img.complete && img.naturalWidth > 0;
  });

  // 1. Process Heritage Palace:
  // Starts at x=540, y=45, w=484, h=210
  await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const cropX = 545;
    const cropY = 45;
    const cropW = 475;
    const cropH = 210;

    canvas.width = cropW;
    canvas.height = cropH;

    ctx.fillStyle = '#0B1F16';
    ctx.fillRect(0, 0, cropW, cropH);

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Left fade
    const leftGrad = ctx.createLinearGradient(0, 0, 50, 0);
    leftGrad.addColorStop(0, '#0B1F16');
    leftGrad.addColorStop(1, 'rgba(11, 31, 22, 0)');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 50, cropH);

    // Top fade
    const topGrad = ctx.createLinearGradient(0, 0, 0, 30);
    topGrad.addColorStop(0, '#0B1F16');
    topGrad.addColorStop(1, 'rgba(11, 31, 22, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, cropW, 30);

    // Right fade
    const rightGrad = ctx.createLinearGradient(cropW - 40, 0, cropW, 0);
    rightGrad.addColorStop(0, 'rgba(11, 31, 22, 0)');
    rightGrad.addColorStop(1, '#0B1F16');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(cropW - 40, 0, 40, cropH);

    // Bottom fade
    const botGrad = ctx.createLinearGradient(0, cropH - 30, 0, cropH);
    botGrad.addColorStop(0, 'rgba(11, 31, 22, 0)');
    botGrad.addColorStop(1, '#0B1F16');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, cropH - 30, cropW, 30);
  });

  const palaceOut = path.resolve('frontend', 'public', 'assets', 'heritage-palace.png');
  const canvasEl = await page.$('#canvas');
  await canvasEl.screenshot({ path: palaceOut });

  // 2. Extract Left Foliage (clean without any card overlap)
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
    ctx.fillStyle = '#0B1F16';
    ctx.fillRect(0, 0, cropW, cropH);
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Soft fade into #0B1F16 on the inner edge (right)
    const grad = ctx.createLinearGradient(cropW - 12, 0, cropW, 0);
    grad.addColorStop(0, 'rgba(11, 31, 22, 0)');
    grad.addColorStop(1, '#0B1F16');
    ctx.fillStyle = grad;
    ctx.fillRect(cropW - 12, 0, 12, cropH);
  });
  const leftFoliageOut = path.resolve('frontend', 'public', 'assets', 'foliage-left.png');
  await canvasEl.screenshot({ path: leftFoliageOut });

  // 3. Extract Right Foliage (clean without any card overlap)
  await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const cropX = 960;
    const cropY = 360;
    const cropW = 64;
    const cropH = 215;

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.fillStyle = '#0B1F16';
    ctx.fillRect(0, 0, cropW, cropH);
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Soft fade into #0B1F16 on the inner edge (left)
    const grad = ctx.createLinearGradient(0, 0, 14, 0);
    grad.addColorStop(0, '#0B1F16');
    grad.addColorStop(1, 'rgba(11, 31, 22, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 14, cropH);
  });
  const rightFoliageOut = path.resolve('frontend', 'public', 'assets', 'foliage-right.png');
  await canvasEl.screenshot({ path: rightFoliageOut });

  await browser.close();
  console.log('Clean assets complete!');
}

processAssets().catch(console.error);
