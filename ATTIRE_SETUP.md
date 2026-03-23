# 🎨 Attire Demo Images Setup Guide

This guide helps you populate the wardrobe demo images for the Attire POC application.

## 📋 What's Included

- **`wardrobe-data.json`** - Complete wardrobe inventory with 29+ items across categories:
  - Shirts/Tops (6 items)
  - Bottoms (6 items)
  - Shoes (6 items)
  - Accessories (6 items)
  - Outerwear (3 items)
  - Bags (2 items)

- **`download-images.js`** - Automated image downloader using Unsplash API

## 🚀 Quick Start

### Step 1: Get Unsplash API Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Sign up for a free account
3. Create a new application
4. Copy your **Access Key**

### Step 2: Download Images

Run the downloader script:

```bash
node download-images.js YOUR_UNSPLASH_API_KEY
```

Or set environment variable:

```bash
export UNSPLASH_ACCESS_KEY=YOUR_KEY
node download-images.js
```

This will download all 29 images to `public/demo-images/` organized by category:
- `shirts/`
- `bottoms/`
- `shoes/`
- `accessories/`
- `outerwear/`
- `bags/`

## 📁 Directory Structure

```
public/demo-images/
├── shirts/
│   ├── white-button-up.jpg
│   ├── navy-tee.jpg
│   ├── striped-summer-top.jpg
│   ├── black-turtleneck.jpg
│   ├── floral-blouse.jpg
│   └── wool-sweater.jpg
├── bottoms/
│   ├── black-skinny-jeans.jpg
│   ├── light-denim-jeans.jpg
│   ├── white-linen-pants.jpg
│   ├── gray-trousers.jpg
│   ├── black-midi-skirt.jpg
│   └── denim-shorts.jpg
├── shoes/
│   ├── white-sneakers.jpg
│   ├── black-loafers.jpg
│   ├── strappy-heels.jpg
│   ├── brown-ankle-boots.jpg
│   ├── flip-flops.jpg
│   └── running-shoes.jpg
├── accessories/
│   ├── black-belt.jpg
│   ├── gold-necklace.jpg
│   ├── silk-scarf.jpg
│   ├── aviator-sunglasses.jpg
│   ├── wool-beanie.jpg
│   └── watch.jpg
├── outerwear/
│   ├── denim-jacket.jpg
│   ├── blazer.jpg
│   └── winter-coat.jpg
└── bags/
    ├── black-handbag.jpg
    └── canvas-backpack.jpg
```

## 🎯 Wardrobe Item Properties

Each item in `wardrobe-data.json` includes:

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Display name
  category: ItemCategory;  // Top, bottom, shoes, accessory, outerwear, bag
  color: ColorFamily;      // Color classification
  style: StyleVibe;        // Fashion style (classic, casual, romantic, etc.)
  formality: number;       // 0-5 (0=casual, 5=formal)
  warmth: number;          // 0-5 (0=none, 5=very warm)
  notes: string;           // Item description
  imageKey: string;        // Path to demo image
}
```

## 🎨 Color Categories

- **Neutral** - Beige, gray, tan
- **Black** - Pure black
- **White** - Pure white
- **Red** - Red tones
- **Pink** - Pink tones
- **Orange** - Orange tones
- **Yellow** - Yellow tones
- **Green** - Green tones
- **Blue** - Blue tones
- **Purple** - Purple tones
- **Metallic** - Gold, silver

## 🎭 Style Vibes

- **Classic** - Timeless, professional
- **Casual** - Relaxed, everyday
- **Romantic** - Feminine, delicate
- **Edgy** - Bold, trendy
- **Sporty** - Athletic, active
- **Minimal** - Simple, clean
- **Glam** - Glamorous, statement

## 📸 Using Custom Images

If you prefer to use your own images:

1. Add images to the appropriate subdirectory under `public/demo-images/`
2. Update the `imageKey` paths in `wardrobe-data.json` to match your filenames
3. Supported formats: JPG, PNG, WebP

## 🔧 Integration with Angular App

To load the wardrobe data in your app:

```typescript
// In your component or service
async loadWardrobe() {
  const response = await fetch('/wardrobe-data.json');
  const data = await response.json();
  return data.items as WardrobeItem[];
}

// Image path helper
getImagePath(item: WardrobeItem): string {
  return `/demo-images/${item.imageKey}`;
}
```

## 🐛 Troubleshooting

### Rate Limit Error
If you get rate limit errors:
- Wait 1 hour (Unsplash free tier: 50 requests/hour)
- Or upgrade to Production account for higher limits

### Missing Downloaded Images
- Check that all subdirectories are created
- Verify Unsplash API key is correct
- Check internet connection

### Image Quality
Downloaded images are optimized at:
- Width: 400px
- Height: 500px
- Perfect for demo and mobile preview

## 📝 Notes

- Downloaded images are free to use under Unsplash License
- Attribution appreciated but not required
- Images are stored locally in your repository
- Consider adding `public/demo-images/` to version control or use `.gitignore` if file sizes are large

## 🎓 Next Steps

1. Download images using the script
2. Test image loading in your app
3. Adjust item properties as needed for recommendations
4. Run your wardrobe recommendation engine!
