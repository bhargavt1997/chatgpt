export type ItemCategory =
  | 'dress'
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'accessory'
  | 'outerwear'
  | 'bag';

export type ColorFamily =
  | 'neutral'
  | 'black'
  | 'white'
  | 'red'
  | 'pink'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'metallic';

export type StyleVibe =
  | 'classic'
  | 'casual'
  | 'romantic'
  | 'edgy'
  | 'sporty'
  | 'minimal'
  | 'glam';

export type Occasion = 'work' | 'brunch' | 'date' | 'party' | 'travel' | 'errands';
export type Mood = 'confident' | 'playful' | 'relaxed' | 'bold' | 'romantic' | 'focused';
export type Weather = 'sunny' | 'mild' | 'rainy' | 'cold' | 'hot';

export interface WardrobeItem {
  id: string;
  name: string;
  category: ItemCategory;
  color: ColorFamily;
  style: StyleVibe;
  formality: number;
  warmth: number;
  notes: string;
  imageKey?: string;
}

export interface PlannerInput {
  occasion: Occasion;
  mood: Mood;
  weather: Weather;
  tempPreference: number;
  details: string;
}

export interface Recommendation {
  headline: string;
  summary: string;
  reasons: string[];
  desiredWarmth: number;
  selectedItems: WardrobeItem[];
  palette: ColorFamily[];
}
