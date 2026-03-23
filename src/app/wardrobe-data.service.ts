import { Injectable } from '@angular/core';
import { WardrobeItem, ItemCategory, ColorFamily } from './wardrobe.types';

export interface WardrobeDatabase {
  items: WardrobeItem[];
}

@Injectable({ providedIn: 'root' })
export class WardrobeDataService {
  private wardrobeCache: WardrobeItem[] | null = null;

  constructor() {}

  /**
   * Load the complete wardrobe database from JSON
   */
  async loadWardrobe(): Promise<WardrobeItem[]> {
    if (this.wardrobeCache) {
      return this.wardrobeCache;
    }

    try {
      const response = await fetch('/wardrobe-data.json');
      if (!response.ok) {
        throw new Error(`Failed to load wardrobe data: ${response.status}`);
      }

      const data = (await response.json()) as WardrobeDatabase;
      this.wardrobeCache = data.items;
      return data.items;
    } catch (error) {
      console.error('Error loading wardrobe data:', error);
      return [];
    }
  }

  /**
   * Get full image path for a wardrobe item
   */
  getImagePath(item: WardrobeItem): string {
    if (!item.imageKey) {
      return '/demo-images/placeholder.jpg';
    }
    return `/demo-images/${item.imageKey}`;
  }

  /**
   * Get items filtered by category
   */
  async getItemsByCategory(category: ItemCategory): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    return items.filter((item) => item.category === category);
  }

  /**
   * Get items filtered by color
   */
  async getItemsByColor(color: ColorFamily): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    return items.filter((item) => item.color === color);
  }

  /**
   * Get items by minimum warmth level
   */
  async getWarmItems(minWarmth: number): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    return items.filter((item) => item.warmth >= minWarmth);
  }

  /**
   * Get items by maximum warmth level
   */
  async getCoolItems(maxWarmth: number): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    return items.filter((item) => item.warmth <= maxWarmth);
  }

  /**
   * Get items by formality level
   */
  async getItemsByFormality(minFormality: number): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    return items.filter((item) => item.formality >= minFormality);
  }

  /**
   * Get items by style vibe
   */
  async getItemsByStyle(style: string): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    return items.filter((item) => item.style === style);
  }

  /**
   * Get all colors available in wardrobe
   */
  async getAvailableColors(): Promise<ColorFamily[]> {
    const items = await this.loadWardrobe();
    const colors = new Set<ColorFamily>(items.map((item) => item.color));
    return Array.from(colors);
  }

  /**
   * Get all categories with item count
   */
  async getCategorySummary(): Promise<Record<ItemCategory, number>> {
    const items = await this.loadWardrobe();
    const summary: Record<ItemCategory, number> = {
      dress: 0,
      top: 0,
      bottom: 0,
      shoes: 0,
      accessory: 0,
      outerwear: 0,
      bag: 0
    };

    items.forEach((item) => {
      summary[item.category]++;
    });

    return summary;
  }

  /**
   * Search items by name or notes
   */
  async searchItems(query: string): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    const lowerQuery = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(lowerQuery) || item.notes.toLowerCase().includes(lowerQuery));
  }

  /**
   * Get a single item by ID
   */
  async getItemById(id: string): Promise<WardrobeItem | undefined> {
    const items = await this.loadWardrobe();
    return items.find((item) => item.id === id);
  }

  /**
   * Get random items for suggestions
   */
  async getRandomItems(count: number = 5): Promise<WardrobeItem[]> {
    const items = await this.loadWardrobe();
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get complementary items based on color palette
   */
  async getComplementaryItems(baseColor: ColorFamily, category: ItemCategory): Promise<WardrobeItem[]> {
    const colorPalettes: Record<ColorFamily, ColorFamily[]> = {
      neutral: ['black', 'white', 'metallic'],
      black: ['white', 'neutral', 'metallic'],
      white: ['black', 'neutral', 'metallic'],
      red: ['neutral', 'black', 'white'],
      pink: ['neutral', 'black', 'white'],
      orange: ['neutral', 'black', 'white'],
      yellow: ['neutral', 'black', 'white'],
      green: ['neutral', 'black', 'white'],
      blue: ['neutral', 'black', 'white'],
      purple: ['neutral', 'black', 'white'],
      metallic: ['black', 'white', 'neutral']
    };

    const compatibleColors = colorPalettes[baseColor] || [baseColor];
    const items = await this.loadWardrobe();

    return items.filter((item) => item.category === category && compatibleColors.includes(item.color));
  }
}
