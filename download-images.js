#!/usr/bin/env node

/**
 * Image Downloader Script for Attire Demo
 * Downloads free images from Unsplash API
 * Usage: node download-images.js [UNSPLASH_ACCESS_KEY]
 * 
 * Get your free API key from: https://unsplash.com/developers
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const UNSPLASH_API_KEY = process.argv[2] || process.env.UNSPLASH_ACCESS_KEY;
const IMAGES_DIR = path.join(__dirname, 'public', 'demo-images');

// Image search queries mapped to wardrobe items
const IMAGE_QUERIES = {
  'shirts/white-button-up.jpg': { query: 'white button up shirt professional', count: 1 },
  'shirts/navy-tee.jpg': { query: 'navy blue casual t-shirt', count: 1 },
  'shirts/striped-summer-top.jpg': { query: 'striped summer top woman', count: 1 },
  'shirts/black-turtleneck.jpg': { query: 'black turtleneck warm', count: 1 },
  'shirts/floral-blouse.jpg': { query: 'floral blouse pink feminine', count: 1 },
  'shirts/wool-sweater.jpg': { query: 'wool sweater cozy neutral', count: 1 },
  'bottoms/black-skinny-jeans.jpg': { query: 'black skinny jeans woman', count: 1 },
  'bottoms/light-denim-jeans.jpg': { query: 'light blue denim jeans', count: 1 },
  'bottoms/white-linen-pants.jpg': { query: 'white linen pants woman', count: 1 },
  'bottoms/gray-trousers.jpg': { query: 'gray trousers professional work', count: 1 },
  'bottoms/black-midi-skirt.jpg': { query: 'black midi skirt elegant', count: 1 },
  'bottoms/denim-shorts.jpg': { query: 'denim shorts summer casual', count: 1 },
  'shoes/white-sneakers.jpg': { query: 'white sneakers casual shoes', count: 1 },
  'shoes/black-loafers.jpg': { query: 'black leather loafers professional', count: 1 },
  'shoes/strappy-heels.jpg': { query: 'black strappy heels formal', count: 1 },
  'shoes/brown-ankle-boots.jpg': { query: 'brown ankle boots fall', count: 1 },
  'shoes/flip-flops.jpg': { query: 'flip flops summer sandals', count: 1 },
  'shoes/running-shoes.jpg': { query: 'blue running shoes athletic', count: 1 },
  'accessories/black-belt.jpg': { query: 'black leather belt classic', count: 1 },
  'accessories/gold-necklace.jpg': { query: 'gold necklace elegant jewelry', count: 1 },
  'accessories/silk-scarf.jpg': { query: 'pink silk scarf woman', count: 1 },
  'accessories/aviator-sunglasses.jpg': { query: 'aviator sunglasses cool', count: 1 },
  'accessories/wool-beanie.jpg': { query: 'black wool beanie winter', count: 1 },
  'accessories/watch.jpg': { query: 'wristwatch metallic fashion', count: 1 },
  'outerwear/denim-jacket.jpg': { query: 'blue denim jacket casual', count: 1 },
  'outerwear/blazer.jpg': { query: 'blazer neutral professional woman', count: 1 },
  'outerwear/winter-coat.jpg': { query: 'black winter coat woman', count: 1 },
  'bags/black-handbag.jpg': { query: 'black leather handbag classic', count: 1 },
  'bags/canvas-backpack.jpg': { query: 'canvas backpack beige casual', count: 1 }
};

// Helper function to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
}

// Helper function to fetch from Unsplash API
function fetchUnsplash(query) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://api.unsplash.com/photos/random');
    url.searchParams.append('query', query);
    url.searchParams.append('client_id', UNSPLASH_API_KEY);
    url.searchParams.append('w', '400');
    url.searchParams.append('h', '500');

    https.get(url.toString(), (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.urls && json.urls.regular) {
            resolve(json.urls.regular);
          } else if (json.errors) {
            reject(new Error(json.errors[0]));
          } else {
            reject(new Error('Invalid response from Unsplash'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Main download function
async function downloadAllImages() {
  if (!UNSPLASH_API_KEY) {
    console.error('❌ Error: UNSPLASH_ACCESS_KEY not provided');
    console.error('Usage: node download-images.js YOUR_UNSPLASH_API_KEY');
    console.error('\nGet your free API key from: https://unsplash.com/developers');
    process.exit(1);
  }

  console.log('🎨 Starting Attire Demo Images Download\n');

  // Ensure base directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const entries = Object.entries(IMAGE_QUERIES);
  let downloaded = 0;
  let failed = 0;

  for (const [filepath, config] of entries) {
    try {
      const fullPath = path.join(IMAGES_DIR, filepath);
      
      // Skip if already exists
      if (fs.existsSync(fullPath)) {
        console.log(`✓ Already exists: ${filepath}`);
        continue;
      }

      console.log(`⏳ Downloading: ${filepath}`);
      const imageUrl = await fetchUnsplash(config.query);
      await downloadImage(imageUrl, fullPath);
      console.log(`✓ Downloaded: ${filepath}`);
      downloaded++;
      
      // Rate limiting - Unsplash allows 50 requests/hour for free tier
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`✗ Failed to download ${filepath}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✓ Successfully downloaded: ${downloaded}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`📁 Images saved to: ${IMAGES_DIR}`);
}

// Run the download
downloadAllImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
