import fs from 'fs';
import path from 'path';

const userUploadsDir = 'C:\\Users\\Sai Ritvik\\.gemini\\antigravity\\brain\\2ea84679-f547-4226-8c43-fd7c3842f929\\.user_uploaded';
const targetDir = path.resolve('frontend', 'public', 'assets');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = [
  { src: 'media_1793512939829_b0f592a8.jpg', dest: 'hero-emerald-reference.jpg' },
  { src: 'media_1793513362017_24ded512.jpg', dest: 'ui-showcase-collage.jpg' },
  { src: 'media_1793513374537_00850d5a.png', dest: 'previous-screenshot.png' },
];

for (const f of files) {
  const srcPath = path.join(userUploadsDir, f.src);
  const destPath = path.join(targetDir, f.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${f.src} -> ${destPath} (${fs.statSync(destPath).size} bytes)`);
  } else {
    console.log(`Missing ${srcPath}`);
  }
}
