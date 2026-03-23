import { Injectable } from '@angular/core';
import { WardrobeItem } from './wardrobe.types';

export interface VisionGuess {
  id: string;
  category?: string;
  color?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class VisionService {
  async analyze(apiKey: string, items: WardrobeItem[], imageFetcher: (item: WardrobeItem) => string | Promise<string>): Promise<VisionGuess[]> {
    const withImagesPromises = items.map(async (item) => {
      const src = await Promise.resolve(imageFetcher(item));
      return { item, src };
    });

    const withImages = (await Promise.all(withImagesPromises))
      .filter((entry) => !!entry.src)
      .slice(0, 4);

    if (withImages.length === 0) {
      return [];
    }

    const content = withImages.flatMap(({ item, src }) => [
      { type: 'text', text: `Item ${item.id}: ${item.name}` },
      { type: 'image_url', image_url: { url: src } }
    ]);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a stylist. For each image, return JSON with an array "items" where each item has: id, category (one of dress, top, bottom, shoes, accessory, outerwear, bag), color (short plain word), notes (short issue if labeling seems wrong or unclear). If unsure, leave field empty.'
          },
          {
            role: 'user',
            content
          }
        ]
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Vision analysis failed: ${response.status} ${detail}`);
    }

    const data = await response.json();
    const parsed = JSON.parse((data.choices?.[0]?.message?.content as string) ?? '{}') as {
      items?: VisionGuess[];
    };

    return parsed.items ?? [];
  }
}
