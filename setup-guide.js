#!/usr/bin/env node

/**
 * ATTIRE POC - Image Setup and Integration Guide
 * 
 * Quick Start Instructions
 */

const fs = require('fs');
const path = require('path');

const SETUP_STEPS = `
╔════════════════════════════════════════════════════════════════╗
║           🎨 ATTIRE POC - IMAGE SETUP GUIDE 🎨                ║
╚════════════════════════════════════════════════════════════════╝

✅ SETUP COMPLETE! Here's what was created:

📁 FILES CREATED:
  ✓ public/wardrobe-data.json         - 29 wardrobe items
  ✓ public/demo-images/               - Directory structure
  ✓ download-images.js                - Image downloader script
  ✓ src/app/wardrobe-data.service.ts  - Angular service
  ✓ ATTIRE_SETUP.md                   - Full documentation
  ✓ INTEGRATION_EXAMPLES.ts           - Code examples

📂 DIRECTORY STRUCTURE:
  ✓ public/demo-images/
    ├── shirts/          (6 items)
    ├── bottoms/         (6 items)
    ├── shoes/           (6 items)
    ├── accessories/     (6 items)
    ├── outerwear/       (3 items)
    └── bags/            (2 items)

════════════════════════════════════════════════════════════════

🚀 NEXT STEPS:

1. GET UNSPLASH API KEY:
   → Go to https://unsplash.com/developers
   → Create free account and app
   → Copy your Access Key

2. DOWNLOAD IMAGES:
   → Run: node download-images.js YOUR_API_KEY
   → Or: export UNSPLASH_ACCESS_KEY=YOUR_KEY && node download-images.js

3. INTEGRATE INTO YOUR APP:
   → Import WardrobeDataService in your components
   → Use getImagePath() for image URLs
   → Call loadWardrobe() to get all items

════════════════════════════════════════════════════════════════

📚 WARDROBE DATA STRUCTURE:

Each item includes:
  • id              - Unique identifier (e.g., "shirt-001")
  • name            - Display name
  • category        - Type (top, bottom, shoes, accessory, etc.)
  • color           - Color classification
  • style           - Fashion style (classic, casual, romantic, edgy, sporty, minimal, glam)
  • formality       - Level 0-5 (0=casual, 5=formal)
  • warmth          - Level 0-5 (0=none, 5=very warm)
  • notes           - Description
  • imageKey        - Image path (e.g., "shirts/white-button-up.jpg")

════════════════════════════════════════════════════════════════

🛠️ SERVICE METHODS:

// Load all items
const items = await wardrobeDataService.loadWardrobe();

// Filter by category
const tops = await wardrobeDataService.getItemsByCategory('top');

// Filter by warmth (for weather)
const warmItems = await wardrobeDataService.getWarmItems(4);
const coolItems = await wardrobeDataService.getCoolItems(2);

// Filter by formality
const formalItems = await wardrobeDataService.getItemsByFormality(4);

// Search items
const results = await wardrobeDataService.searchItems('blue');

// Get image path
const imgPath = wardrobeDataService.getImagePath(item);

// Get complementary colors
const shoes = await wardrobeDataService.getComplementaryItems('black', 'shoes');

// Get category summary
const counts = await wardrobeDataService.getCategorySummary();

// Get random items
const random = await wardrobeDataService.getRandomItems(5);

════════════════════════════════════════════════════════════════

📊 INCLUDED WARDROBE ITEMS:

SHIRTS/TOPS (6):
  • White Button-Up Shirt (formality: 4, warmth: 2)
  • Navy Blue Casual Tee (formality: 1, warmth: 1)
  • Striped Summer Top (formality: 2, warmth: 1)
  • Black Turtleneck (formality: 3, warmth: 4)
  • Floral Blouse (formality: 2, warmth: 2)
  • Wool Sweater (formality: 2, warmth: 5)

BOTTOMS (6):
  • Black Skinny Jeans (formality: 2, warmth: 3)
  • Light Denim Jeans (formality: 1, warmth: 2)
  • White Linen Pants (formality: 3, warmth: 1)
  • Gray Trousers (formality: 5, warmth: 2)
  • Black Midi Skirt (formality: 4, warmth: 2)
  • Denim Shorts (formality: 1, warmth: 1)

SHOES (6):
  • White Sneakers (formality: 1, warmth: 1)
  • Black Leather Loafers (formality: 4, warmth: 1)
  • Strappy Heels (formality: 5, warmth: 1)
  • Brown Ankle Boots (formality: 2, warmth: 4)
  • Flip Flops (formality: 0, warmth: 0)
  • Running Shoes (formality: 0, warmth: 1)

ACCESSORIES (6):
  • Black Leather Belt (formality: 3, warmth: 0)
  • Gold Necklace (formality: 4, warmth: 0)
  • Silk Scarf (formality: 3, warmth: 2)
  • Aviator Sunglasses (formality: 1, warmth: 0)
  • Wool Beanie (formality: 0, warmth: 4)
  • Watch (formality: 4, warmth: 0)

OUTERWEAR (3):
  • Denim Jacket (formality: 1, warmth: 3)
  • Blazer (formality: 5, warmth: 2)
  • Winter Coat (formality: 2, warmth: 5)

BAGS (2):
  • Black Leather Handbag (formality: 4, warmth: 0)
  • Canvas Backpack (formality: 1, warmth: 0)

════════════════════════════════════════════════════════════════

🎯 RECOMMENDATIONS ENGINE INTEGRATION:

Your app already has:
  ✓ GptService - Uses OpenAI to recommend outfits
  ✓ VisionService - Analyzes images to categorize items

Now with WardrobeDataService you can:
  ✓ Load pre-made wardrobe for testing
  ✓ Filter by weather/occasion/mood
  ✓ Get color-coordinated suggestions
  ✓ Build complete outfit combinations

Example: Weather-based outfit recommendation
  const temp = 5; // Cold day
  const warmItems = await wardrobeDataService.getWarmItems(4);
  const recommendation = await gptService.recommend(apiKey, warmItems, {
    occasion: 'work',
    mood: 'focused',
    weather: 'cold',
    tempPreference: temp,
    details: 'Need warm professional outfit'
  });

════════════════════════════════════════════════════════════════

📚 VISUAL PATTERN RECOMMENDATION:

The system uses color theory and fashion principles:

1. COLOR COORDINATION:
   • Base color from bottom (most visible)
   • Complementary tops and shoes from palette
   • Metallic accessories to add sparkle

2. WARMTH MATCHING:
   • Cold weather (< 10°C) → formality + warmth items
   • Mild weather (10-20°C) → balanced pieces
   • Warm weather (> 20°C) → light, cool pieces

3. FORMALITY LEVELS:
   • Casual (0-1): Weekend, errands, relaxed vibes
   • Business Casual (2-3): Office, meetings
   • Formal (4-5): Events, presentations, parties

4. STYLE COORDINATION:
   • Match style vibes across outfit
   • Classic with Classic, Casual with Casual, etc.
   • Mix carefully for intentional contrast

════════════════════════════════════════════════════════════════

🐛 TROUBLESHOOTING:

Q: Images not loading?
A: Run node download-images.js with valid Unsplash API key

Q: How to use custom images?
A: Place images in demo-images/ and update imageKey in wardrobe-data.json

Q: Rate limit errors?
A: Unsplash free tier = 50 requests/hour. Wait or use your own images.

Q: How to add more items?
A: Edit public/wardrobe-data.json and follow the same structure

════════════════════════════════════════════════════════════════

📖 DOCUMENTATION:
  • ATTIRE_SETUP.md - Complete setup guide
  • INTEGRATION_EXAMPLES.ts - Code examples
  • This file - Quick reference

════════════════════════════════════════════════════════════════

Happy Styling! 🎨✨
`;

console.log(SETUP_STEPS);

// Check if demo-images directory exists
const demoImagesPath = path.join(__dirname, 'public', 'demo-images');
if (fs.existsSync(demoImagesPath)) {
  console.log('✓ Demo images directory structure ready');
  console.log('  Run: node download-images.js YOUR_UNSPLASH_API_KEY\n');
} else {
  console.log('⚠ Demo images directory not found. Run setup script first.\n');
}
