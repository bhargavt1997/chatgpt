// Usage Example: How to integrate wardrobe data into your Angular app

import { Component, OnInit } from '@angular/core';
import { WardrobeDataService } from './wardrobe-data.service';
import { WardrobeItem } from './wardrobe.types';

@Component({
  selector: 'app-wardrobe-gallery',
  template: `
    <div class="wardrobe-container">
      <h1>My Wardrobe</h1>

      <!-- Category Summary -->
      <div class="summary">
        <h2>Items by Category</h2>
        <div *ngFor="let entry of categoryCounts | keyvalue">
          {{ entry.key }}: {{ entry.value }}
        </div>
      </div>

      <!-- Wardrobe Items Grid -->
      <div class="items-grid">
        <div *ngFor="let item of wardrobeItems" class="item-card">
          <img
            [src]="getImagePath(item)"
            [alt]="item.name"
            (error)="onImageError($event)"
            class="item-image"
          />
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="category">{{ item.category }}</p>
            <p class="color">{{ item.color }}</p>
            <p class="style">{{ item.style }}</p>
            <div class="warmth">
              <span>Warmth: {{ item.warmth }}/5</span>
              <span>Formality: {{ item.formality }}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }

      .item-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s;
      }

      .item-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .item-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        background: #f0f0f0;
      }

      .item-details {
        padding: 15px;
      }

      .item-details h3 {
        margin: 0 0 10px 0;
        color: #333;
      }

      .item-details p {
        margin: 5px 0;
        font-size: 0.9em;
        color: #666;
      }

      .warmth {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 0.85em;
        color: #999;
      }

      .summary {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
    `
  ]
})
export class WardrobeGalleryComponent implements OnInit {
  wardrobeItems: WardrobeItem[] = [];
  categoryCounts: Record<string, number> = {};

  constructor(private wardrobeDataService: WardrobeDataService) {}

  async ngOnInit() {
    // Load all wardrobe items
    this.wardrobeItems = await this.wardrobeDataService.loadWardrobe();

    // Get category summary
    this.categoryCounts = await this.wardrobeDataService.getCategorySummary();

    console.log('Wardrobe loaded:', this.wardrobeItems.length, 'items');
  }

  getImagePath(item: WardrobeItem): string {
    return this.wardrobeDataService.getImagePath(item);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/demo-images/placeholder.jpg';
  }
}

// ============================================================
// USAGE EXAMPLES IN OTHER COMPONENTS

// Example 1: Filter by warmth for weather
export class WeatherBasedComponent {
  async getWarmOutfitItems(temperature: number) {
    if (temperature < 10) {
      // Cold weather - get warm items
      return await this.wardrobeDataService.getWarmItems(4);
    } else if (temperature > 25) {
      // Hot weather - get cool items
      return await this.wardrobeDataService.getCoolItems(2);
    }
  }
}

// Example 2: Get formal outfit combinations
export class FormalWearComponent {
  async getFormalOutfitSuggestions() {
    const formalItems = await this.wardrobeDataService.getItemsByFormality(4);
    const shoes = await this.wardrobeDataService.getItemsByCategory('shoes');
    const accessories = await this.wardrobeDataService.getItemsByCategory('accessory');

    return {
      tops: formalItems.filter((i) => i.category === 'top'),
      bottoms: formalItems.filter((i) => i.category === 'bottom'),
      shoes: shoes.filter((i) => i.formality >= 4),
      accessories: accessories.filter((i) => i.formality >= 4)
    };
  }
}

// Example 3: Color coordination search
export class ColorCoordinationComponent {
  async getComplementaryOutfit(baseColor: 'red' | 'blue' | 'black') {
    const tops = await this.wardrobeDataService.getComplementaryItems(baseColor, 'top');
    const bottoms = await this.wardrobeDataService.getComplementaryItems(baseColor, 'bottom');
    const shoes = await this.wardrobeDataService.getComplementaryItems(baseColor, 'shoes');

    return { tops, bottoms, shoes };
  }
}

// Example 4: Search functionality
export class SearchComponent {
  async searchWardrobe(searchTerm: string) {
    return await this.wardrobeDataService.searchItems(searchTerm);
  }
}

// Example 5: Integration with Vision Service for analysis
export class VisionAnalysisComponent {
  async analyzeAndEnrich(items: WardrobeItem[]) {
    // First use Vision Service to analyze images
    const visionGuesses = await this.visionService.analyze(this.apiKey, items, (item) =>
      this.wardrobeDataService.getImagePath(item)
    );

    // Then use the enriched data for recommendations
    return visionGuesses;
  }
}
