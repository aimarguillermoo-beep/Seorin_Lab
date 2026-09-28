import Jimp from 'jimp';
import path from 'path';

(async () => {
  const imagePath = "C:/Users/guill/.gemini/antigravity/brain/773a47ec-09b0-4d5f-a967-6af3dcf909bb/.user_uploaded/media_1790634191976.jpg";
  const outPath = "./app/icon.png";
  
  const image = await Jimp.read(imagePath);
  
  // Make it square
  image.cover(512, 512); // crop to 512x512 from center
  
  // Make circle mask
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  for(let y = 0; y < height; y++) {
    for(let x = 0; x < width; x++) {
      const cx = x - width / 2 + 0.5;
      const cy = y - height / 2 + 0.5;
      const r = Math.sqrt(cx * cx + cy * cy);
      const rMax = width / 2;
      
      if (r > rMax) {
        image.setPixelColor(0x00000000, x, y);
      } else if (r > rMax - 1) {
        // smooth edge slightly
        const alpha = Math.floor((rMax - r) * 255);
        const color = image.getPixelColor(x, y);
        const r_val = (color >> 24) & 255;
        const g_val = (color >> 16) & 255;
        const b_val = (color >> 8) & 255;
        image.setPixelColor(Jimp.rgbaToInt(r_val, g_val, b_val, alpha), x, y);
      }
    }
  }
  
  await image.writeAsync(outPath);
  console.log("Icon generated successfully!");
})();
