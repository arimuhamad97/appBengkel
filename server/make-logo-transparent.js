
import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '../public/logo.png');
const OUTPUT_PATH = path.join(__dirname, '../public/logo.png');

async function processImage() {
    try {
        console.log(`Reading image from ${INPUT_PATH}`);
        const image = await Jimp.read(INPUT_PATH);

        // Scan every pixel
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If pixel is black (or very dark), make it transparent
            // threshold for "black": r,g,b < 30
            if (red < 30 && green < 30 && blue < 30) {
                this.bitmap.data[idx + 3] = 0; // Set Alpha to 0 (Transparent)
            }
        });

        await image.writeAsync(OUTPUT_PATH);
        console.log(`Processed image saved to ${OUTPUT_PATH}`);
    } catch (err) {
        console.error("Error processing image:", err);
    }
}

processImage();
