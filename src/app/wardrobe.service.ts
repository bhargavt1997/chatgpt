import { Injectable, signal } from '@angular/core';
import { ColorFamily, PlannerInput, Recommendation, WardrobeItem } from './wardrobe.types';

type OccasionProfile = {
  formality: number;
  style: string[];
  categories: string[];
};

@Injectable({ providedIn: 'root' })
export class WardrobeService {
  private readonly storageKey = 'attire-planner-items';
  private readonly imagePrefix = 'attire-image-';
  private readonly occasionProfiles: Record<string, OccasionProfile> = {
    work: { formality: 4, style: ['classic', 'minimal'], categories: ['dress', 'top', 'bottom', 'outerwear'] },
    brunch: { formality: 2, style: ['casual', 'romantic', 'minimal'], categories: ['dress', 'top', 'bottom'] },
    date: { formality: 4, style: ['romantic', 'glam', 'classic'], categories: ['dress', 'top', 'bottom', 'accessory'] },
    party: { formality: 5, style: ['glam', 'edgy'], categories: ['dress', 'top', 'bottom', 'accessory'] },
    travel: { formality: 2, style: ['casual', 'sporty', 'minimal'], categories: ['top', 'bottom', 'outerwear'] },
    errands: { formality: 1, style: ['casual', 'sporty', 'minimal'], categories: ['top', 'bottom', 'shoes'] }
  };

  private readonly moodStyles: Record<string, string[]> = {
    confident: ['classic', 'glam', 'minimal'],
    playful: ['romantic', 'casual'],
    relaxed: ['casual', 'minimal', 'sporty'],
    bold: ['edgy', 'glam'],
    romantic: ['romantic', 'classic'],
    focused: ['minimal', 'classic']
  };

  private readonly weatherWarmth: Record<string, number> = {
    sunny: 2,
    mild: 3,
    rainy: 4,
    cold: 5,
    hot: 1
  };

  private readonly demoItems: WardrobeItem[] = [
    {
      id: 'demo-1',
      name: 'Ivory wrap dress',
      category: 'dress',
      color: 'white',
      style: 'romantic',
      formality: 4,
      warmth: 2,
      notes: 'Easy polished option for brunches and date nights.',
      imageKey: '/demo-images/demo-1.jpg'
    },
    {
      id: 'demo-2',
      name: 'Tailored black blazer',
      category: 'outerwear',
      color: 'black',
      style: 'classic',
      formality: 5,
      warmth: 4,
      notes: 'Makes casual outfits feel more intentional.',
      imageKey: '/demo-images/demo-2.jpg'
    },
    {
      id: 'demo-3',
      name: 'Wide-leg blue trousers',
      category: 'bottom',
      color: 'blue',
      style: 'minimal',
      formality: 4,
      warmth: 3,
      notes: 'Comfortable enough for work and city days.',
      imageKey: '/demo-images/demo-3.jpg'
    },
    {
      id: 'demo-4',
      name: 'Silk camisole',
      category: 'top',
      color: 'green',
      style: 'glam',
      formality: 4,
      warmth: 1,
      notes: 'Great layering top for dinners.',
      imageKey: '/demo-images/demo-4.jpg'
    },
    {
      id: 'demo-5',
      name: 'White sneakers',
      category: 'shoes',
      color: 'white',
      style: 'casual',
      formality: 1,
      warmth: 2,
      notes: 'For walking-heavy days.',
      imageKey: '/demo-images/demo-5.jpg'
    },
    {
      id: 'demo-6',
      name: 'Black ankle boots',
      category: 'shoes',
      color: 'black',
      style: 'edgy',
      formality: 3,
      warmth: 4,
      notes: 'Best for colder or rainy evenings.',
      imageKey: '/demo-images/demo-6.jpg'
    },
    {
      id: 'demo-7',
      name: 'Gold hoops',
      category: 'accessory',
      color: 'metallic',
      style: 'classic',
      formality: 3,
      warmth: 3,
      notes: 'Instantly finishes a look.',
      imageKey: '/demo-images/demo-7.jpg'
    },
    {
      id: 'demo-8',
      name: 'Structured mini bag',
      category: 'bag',
      color: 'neutral',
      style: 'minimal',
      formality: 3,
      warmth: 3,
      notes: 'Pairs with almost everything.',
      imageKey: '/demo-images/demo-8.jpg'
    }
  ];

  readonly items = signal<WardrobeItem[]>(this.loadItems());

  addItem(item: WardrobeItem, imageDataUrl?: string): void {
    if (imageDataUrl) {
      sessionStorage.setItem(this.imagePrefix + item.id, imageDataUrl);
      item.imageKey = item.id;
    }
    this.items.update((items) => [item, ...items]);
    this.persistItems();
  }

  removeItem(itemId: string): void {
    this.items.update((items) => items.filter((item) => item.id !== itemId));
    sessionStorage.removeItem(this.imagePrefix + itemId);
    this.persistItems();
  }

  async loadDemoCloset(): Promise<void> {
    try {
      // Clear previous items first
      this.items.set([]);
      
      // Load items from wardrobe-data.json
      const response = await fetch('/wardrobe-data.json');
      if (!response.ok) {
        throw new Error(`Failed to load wardrobe data: ${response.status}`);
      }

      const data = (await response.json()) as { items: WardrobeItem[] };
      
      // Assign new IDs and set items
      const loadedItems = data.items.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        imageKey: item.imageKey ? `/demo-images/${item.imageKey}` : undefined
      }));

      this.items.set(loadedItems);
      this.persistItems();
    } catch (error: any) {
      console.error('Error loading demo wardrobe:', error?.message ?? 'Unknown error');
      // Fallback to small demo items if loading fails
      this.items.set(
        this.demoItems.map((item) => ({
          ...item,
          id: crypto.randomUUID()
        }))
      );
      this.persistItems();
    }
  }

  clearAll(): void {
    this.items.set([]);
    this.persistItems();
  }

  selectOutfit(plan: PlannerInput): { selectedItems: WardrobeItem[]; palette: ColorFamily[]; desiredWarmth: number } | null {
    const wardrobe = this.items();
    const shoes = wardrobe.filter((item) => item.category === 'shoes');

    if (shoes.length === 0) {
      return null;
    }

    const profile = this.occasionProfiles[plan.occasion];
    const desiredWarmth = Math.round((this.weatherWarmth[plan.weather] + plan.tempPreference) / 2);
    const desiredStyles = new Set([...(profile.style ?? []), ...(this.moodStyles[plan.mood] ?? [])]);

    // Pick main piece (dress OR top) - STRICTLY from these categories
    const main = this.pickBest(
      wardrobe.filter((item) => ['dress', 'top'].includes(item.category)),
      profile,
      desiredWarmth,
      desiredStyles,
      ['dress', 'top']
    );

    // Build outfit items
    const selectedItems: WardrobeItem[] = [];

    if (!main) {
      return null; // Need at least one clothing piece
    }

    selectedItems.push(main);

    // Add bottom ONLY if main is not a dress (avoid duplicates)
    if (main.category !== 'dress') {
      const bottom = this.pickBest(
        wardrobe.filter((item) => item.category === 'bottom'),
        profile,
        desiredWarmth,
        desiredStyles,
        ['bottom']
      );
      if (bottom) {
        selectedItems.push(bottom);
      }
    }

    // Add shoes (required)
    const shoePick = this.pickBest(
      shoes,
      profile,
      desiredWarmth,
      desiredStyles,
      ['shoes']
    );
    if (shoePick) {
      selectedItems.push(shoePick);
    }

    // Add layer ONLY if warmth is high (cold/rainy weather)
    if (desiredWarmth >= 4) {
      const layer = this.pickBest(
        wardrobe.filter((item) => item.category === 'outerwear'),
        profile,
        desiredWarmth,
        desiredStyles,
        ['outerwear']
      );
      if (layer) {
        selectedItems.push(layer);
      }
    }

    // Add accessory ONLY for formal occasions or specific moods
    if (profile.formality >= 4 || ['playful', 'bold', 'romantic'].includes(plan.mood)) {
      const accessory = this.pickBest(
        wardrobe.filter((item) => ['accessory', 'bag'].includes(item.category)),
        profile,
        desiredWarmth,
        desiredStyles,
        ['accessory', 'bag']
      );
      if (accessory) {
        selectedItems.push(accessory);
      }
    }

    const palette = Array.from(new Set(selectedItems.map((item) => item.color))) as ColorFamily[];
    return { selectedItems, palette, desiredWarmth };
  }

  generateRecommendation(plan: PlannerInput): Recommendation | null {
    const selection = this.selectOutfit(plan);
    if (!selection) {
      return null;
    }

    const profile = this.occasionProfiles[plan.occasion];
    const summary = [
      `A ${this.toTitleCase(plan.mood)} ${this.toTitleCase(plan.occasion)} direction`,
      `with a ${this.describeFormality(profile.formality)} finish`,
      `and warmth tuned to ${selection.desiredWarmth}/5.`
    ].join(' ');

    const reasons = [
      `The silhouette stays close to your ${plan.occasion} formality target without losing the ${plan.mood} mood.`,
      `The ${selection.palette.map((color) => this.toTitleCase(color)).join(', ')} palette keeps the outfit coordinated and intentional.`,
      this.weatherAdvice(plan.weather, selection.selectedItems.some((i) => i.category === 'outerwear'), selection.selectedItems.some((i) => i.category === 'shoes'))
    ];

    if (plan.details.trim()) {
      reasons.push(`Planner note considered: "${plan.details.trim()}".`);
    }

    return {
      headline: `${this.toTitleCase(plan.mood)} ${this.toTitleCase(plan.occasion)} look`,
      summary,
      reasons,
      desiredWarmth: selection.desiredWarmth,
      selectedItems: selection.selectedItems,
      palette: selection.palette
    };
  }

  imageFor(item: WardrobeItem): string {
    if (!item.imageKey) return '';
    if (item.imageKey.startsWith('/demo-images') || item.imageKey.startsWith('http')) {
      return item.imageKey;
    }
    return sessionStorage.getItem(this.imagePrefix + item.imageKey) ?? '';
  }

  private loadItems(): WardrobeItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? (JSON.parse(stored) as WardrobeItem[]) : [];
    } catch {
      return [];
    }
  }

  private persistItems(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
  }

  private pickBest(
    items: WardrobeItem[],
    profile: OccasionProfile,
    desiredWarmth: number,
    desiredStyles: Set<string>,
    allowedCategories: string[]
  ): WardrobeItem | null {
    if (items.length === 0) {
      return null;
    }

    // Filter to only allowed categories
    const filtered = items.filter((item) => allowedCategories.includes(item.category));
    if (filtered.length === 0) {
      return null;
    }

    return [...filtered].sort((first, second) => {
      return this.scoreItem(second, profile, desiredWarmth, desiredStyles) - this.scoreItem(first, profile, desiredWarmth, desiredStyles);
    })[0] ?? null;
  }

  private scoreItem(item: WardrobeItem, profile: OccasionProfile, desiredWarmth: number, desiredStyles: Set<string>): number {
    let score = 0;

    // Style match (weight: 20 points)
    if (desiredStyles.has(item.style)) {
      score += 20;
    }

    // Formality match (weight: 15 points) - closer to profile is better
    const formalityDiff = Math.abs(item.formality - profile.formality);
    score += Math.max(0, 15 - formalityDiff * 3);

    // Warmth match (weight: 10 points) - closer to desired warmth is better
    const warmthDiff = Math.abs(item.warmth - desiredWarmth);
    score += Math.max(0, 10 - warmthDiff * 2);

    return score;
  }

  private describeFormality(value: number): string {
    if (value >= 5) {
      return 'dressy';
    }
    if (value >= 4) {
      return 'polished';
    }
    if (value >= 3) {
      return 'balanced';
    }
    return 'relaxed';
  }

  private weatherAdvice(weather: string, hasLayer: boolean, hasShoes: boolean): string {
    if (weather === 'rainy') {
      return hasLayer
        ? 'The extra layer gives the look more coverage for rainy moments.'
        : 'A light layer would make this look more rain-ready.';
    }
    if (weather === 'cold') {
      return hasLayer
        ? 'A warmer layer helps the outfit stay practical in cooler weather.'
        : 'Add a coat if the temperature drops later in the day.';
    }
    if (weather === 'hot') {
      return 'Lighter pieces are favored so the outfit still feels breathable.';
    }
    if (!hasShoes) {
      return 'Adding a shoe option will make the planner more precise.';
    }
    return 'The mix balances comfort, polish, and the pace of your day.';
  }

  private toTitleCase(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  }
}
