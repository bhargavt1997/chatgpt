import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WardrobeService } from './wardrobe.service';
import { ColorFamily, ItemCategory, Mood, Occasion, PlannerInput, Recommendation, StyleVibe, WardrobeItem, Weather } from './wardrobe.types';
import { VisionService, VisionGuess } from './vision.service';
import { GptService } from './gpt.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly wardrobeService = inject(WardrobeService);
  private readonly gptService = inject(GptService);
  private readonly visionService = inject(VisionService);

  readonly categoryOptions: ItemCategory[] = ['dress', 'top', 'bottom', 'shoes', 'accessory', 'outerwear', 'bag'];
  readonly colorOptions: ColorFamily[] = ['neutral', 'black', 'white', 'red', 'pink', 'orange', 'yellow', 'green', 'blue', 'purple', 'metallic'];
  readonly styleOptions: StyleVibe[] = ['classic', 'casual', 'romantic', 'edgy', 'sporty', 'minimal', 'glam'];
  readonly occasionOptions: Occasion[] = ['work', 'brunch', 'date', 'party', 'travel', 'errands'];
  readonly moodOptions: Mood[] = ['confident', 'playful', 'relaxed', 'bold', 'romantic', 'focused'];
  readonly weatherOptions: Weather[] = ['sunny', 'mild', 'rainy', 'cold', 'hot'];

  readonly itemForm = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    category: this.fb.control<ItemCategory>('dress'),
    color: this.fb.control<ColorFamily>('neutral'),
    style: this.fb.control<StyleVibe>('classic'),
    formality: this.fb.control(3),
    warmth: this.fb.control(3),
    notes: this.fb.control('')
  });

  readonly plannerForm = this.fb.group({
    occasion: this.fb.control<Occasion>('work'),
    mood: this.fb.control<Mood>('confident'),
    weather: this.fb.control<Weather>('mild'),
    tempPreference: this.fb.control(3),
    details: this.fb.control(''),
    apiKey: this.fb.control('', Validators.required)
  });

  readonly recommendation = signal<Recommendation | null>(null);
  readonly recommendationError = signal('');
  readonly isLoading = signal(false);
  readonly imageData = signal<string>('');
  readonly imageError = signal('');
  readonly visionNotes = signal<string[]>([]);
  readonly selectedImageName = signal('No image selected');
  readonly heroStats = computed(() => {
    const items = this.wardrobeService.items();
    return {
      total: items.length,
      shoes: items.filter((item) => item.category === 'shoes').length,
      layers: items.filter((item) => item.category === 'outerwear').length
    };
  });

  private selectedImageFile: File | null = null;

  async addItem(): Promise<void> {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const raw = this.itemForm.getRawValue();
    const item: WardrobeItem = {
      id: crypto.randomUUID(),
      name: raw.name.trim(),
      category: raw.category,
      color: raw.color,
      style: raw.style,
      formality: raw.formality,
      warmth: raw.warmth,
      notes: raw.notes.trim(),
      imageKey: undefined
    };

    const imageDataUrl = this.selectedImageFile ? await this.readFileAsDataUrl(this.selectedImageFile) : undefined;

    this.wardrobeService.addItem(item, imageDataUrl);
    this.itemForm.reset({
      name: '',
      category: 'dress',
      color: 'neutral',
      style: 'classic',
      formality: 3,
      warmth: 3,
      notes: ''
    });
    this.selectedImageFile = null;
    this.selectedImageName.set('No image selected');
  }

  async buildRecommendation(): Promise<void> {
    const rawPlan = this.plannerForm.getRawValue();
    const apiKey = rawPlan.apiKey.trim();
    if (!apiKey) {
      this.recommendationError.set('Enter your OpenAI API key to generate a recommendation.');
      return;
    }
    const { apiKey: _drop, ...plan } = rawPlan;

    const items = this.wardrobeService.items();
    const hasClothes = items.some((i) => ['dress', 'top', 'bottom', 'outerwear'].includes(i.category));
    const hasShoes = items.some((i) => i.category === 'shoes');
    if (!hasClothes || !hasShoes) {
      this.recommendationError.set('Add at least one clothing piece and one pair of shoes first.');
      return;
    }

    this.recommendationError.set('');
    this.recommendation.set(null);
    this.isLoading.set(true);
    this.imageData.set('');
    this.imageError.set('');
    this.visionNotes.set([]);
    try {
      const rec = await this.gptService.recommend(apiKey, items, plan as PlannerInput);
      const selection = this.wardrobeService.selectOutfit(plan as PlannerInput);
      if (!selection) {
        this.recommendationError.set('Need at least one clothing item and one pair of shoes to build a look.');
        return;
      }
      const adjusted = await this.applyVisionCorrections(apiKey, selection.selectedItems);
      rec.selectedItems = adjusted;
      rec.palette = Array.from(new Set(adjusted.map((i) => i.color))) as any;
      rec.desiredWarmth = selection.desiredWarmth;
      this.recommendation.set(rec);
      await this.composeLookImage(rec);
    } catch (error: any) {
      this.recommendationError.set(error?.message ?? 'Unable to fetch recommendation.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async composeLookImage(rec: Recommendation): Promise<void> {
    this.imageError.set('');
    this.imageData.set('');

    const withPhotos = rec.selectedItems
      .map((item) => ({ item, src: this.imageFor(item) }))
      .filter((entry) => !!entry.src);

    if (withPhotos.length === 0) {
      this.imageError.set('No photos found for the selected pieces. Add images to wardrobe items to see a combined view.');
      return;
    }

    try {
      const composed = await this.buildCollage(withPhotos.map((p) => p.src));
      this.imageData.set(composed);
    } catch (error: any) {
      this.imageError.set(error?.message ?? 'Unable to compose outfit image from your photos.');
    }
  }

  removeItem(itemId: string): void {
    this.wardrobeService.removeItem(itemId);
    if (this.wardrobeService.items().length === 0) {
      this.recommendation.set(null);
    }
  }

  async loadDemoCloset(): Promise<void> {
    await this.wardrobeService.loadDemoCloset();
  }

  clearCloset(): void {
    this.wardrobeService.clearAll();
    this.recommendation.set(null);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImageFile = file;
    this.selectedImageName.set(file?.name ?? 'No image selected');
  }

  controlValue(control: FormControl<number>): number {
    return control.value;
  }

  categoryLabel(value: string): string {
    if (value === 'date') {
      return 'Date night';
    }
    return this.titleCase(value);
  }

  imageFor(item: WardrobeItem): string {
    return this.wardrobeService.imageFor(item);
  }

  private async getImageAsDataUrl(item: WardrobeItem): Promise<string> {
    const imagePath = this.imageFor(item);
    if (!imagePath) return '';

    // Already a data URL, return as-is
    if (imagePath.startsWith('data:image')) {
      return imagePath;
    }

    // Convert local path to data URL
    if (imagePath.startsWith('/demo-images')) {
      try {
        const response = await fetch(imagePath);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        
        const blob = await response.blob();
        const reader = new FileReader();
        
        return new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error converting image to data URL:', error);
        return '';
      }
    }

    return imagePath;
  }

  private async applyVisionCorrections(apiKey: string, items: WardrobeItem[]): Promise<WardrobeItem[]> {
    try {
      // Run vision on items with images (both user-uploaded and demo images)
      const itemsWithImages = items.filter((item) => {
        const src = this.imageFor(item);
        return !!src;
      });

      if (itemsWithImages.length === 0) {
        this.visionNotes.set(['Vision skipped because no images were detected.']);
        return items;
      }

      const guesses = await this.visionService.analyze(apiKey, itemsWithImages, (item) => this.getImageAsDataUrl(item));
      if (!guesses.length) {
        return items;
      }

      const notes: string[] = [];
      const updated = items.map((item) => {
        const guess = guesses.find((g) => g.id === item.id);
        if (!guess) return item;

        let changed = false;
        const next: WardrobeItem = { ...item };
        if (guess.category && guess.category !== item.category) {
          notes.push(`${item.name}: vision suggests category "${guess.category}" instead of "${item.category}".`);
          next.category = guess.category as any;
          changed = true;
        }
        if (guess.color && guess.color !== item.color) {
          notes.push(`${item.name}: vision suggests color "${guess.color}" instead of "${item.color}".`);
          next.color = guess.color as any;
          changed = true;
        }
        if (guess.notes) {
          notes.push(`${item.name}: ${guess.notes}`);
        }
        return changed ? next : next;
      });

      this.visionNotes.set(notes);
      return updated;
    } catch (error: any) {
      this.visionNotes.set([error?.message ?? 'Vision check failed. Using provided tags.']);
      return items;
    }
  }

  private async buildCollage(sources: string[]): Promise<string> {
    const maxCols = 2;
    const cell = 512;
    const cols = Math.min(maxCols, sources.length);
    const rows = Math.ceil(sources.length / cols);
    const canvas = document.createElement('canvas');
    canvas.width = cols * cell;
    canvas.height = rows * cell;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not supported in this browser.');
    }
    ctx.fillStyle = '#f4efe7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const images = await Promise.all(
      sources.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
          })
      )
    );

    images.forEach((img, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cell;
      const y = row * cell;

      const scale = Math.min(cell / img.width, cell / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = x + (cell - drawW) / 2;
      const offsetY = y + (cell - drawH) / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(x + 12, y + 12, cell - 24, cell - 24);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    });

    return canvas.toDataURL('image/png');
  }

  colorSwatch(color: ColorFamily): string {
    const palette: Record<ColorFamily, string> = {
      neutral: '#cbb69f',
      black: '#23201e',
      white: '#f5f0e7',
      red: '#b84a43',
      pink: '#d58ca9',
      orange: '#d97c43',
      yellow: '#d5b75f',
      green: '#577d62',
      blue: '#5473a8',
      purple: '#7d67a7',
      metallic: '#c4a36c'
    };

    return palette[color];
  }

  trackItem(_index: number, item: WardrobeItem): string {
    return item.id;
  }

  private async readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() ?? '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private titleCase(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  }
}
