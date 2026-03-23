import { Injectable } from '@angular/core';
import { PlannerInput, Recommendation, WardrobeItem } from './wardrobe.types';

type ChatChoice = {
  message: { content?: string };
};

@Injectable({ providedIn: 'root' })
export class GptService {
  async recommend(apiKey: string, items: WardrobeItem[], plan: PlannerInput): Promise<Recommendation> {
    const prompt = this.buildPrompt(items, plan);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a wardrobe stylist. Return concise JSON only. Avoid markdown. Provide 3 reasons and a warmth score 1-5.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${detail}`);
    }

    const data = await response.json();
    const choice = (data.choices?.[0] as ChatChoice | undefined)?.message?.content;
    if (!choice) {
      throw new Error('No recommendation returned.');
    }

    const parsed = JSON.parse(choice) as {
      headline: string;
      summary: string;
      desiredWarmth: number;
      palette: string[];
      reasons: string[];
      items: { name: string; category: string; style: string; color: string }[];
    };

    return {
      headline: parsed.headline,
      summary: parsed.summary,
      reasons: parsed.reasons,
      desiredWarmth: parsed.desiredWarmth,
      palette: parsed.palette as any,
      selectedItems: this.attachItems(parsed.items, items)
    };
  }

  private attachItems(
    picks: { name: string; category: string }[],
    items: WardrobeItem[]
  ): WardrobeItem[] {
    return picks
      .map((pick) => items.find((item) => item.name === pick.name && item.category === pick.category))
      .filter((item): item is WardrobeItem => Boolean(item));
  }

  private buildPrompt(items: WardrobeItem[], plan: PlannerInput): string {
    const wardrobeSummary = items
      .slice(0, 30)
      .map(
        (item) =>
          `${item.name} (category: ${item.category}, style: ${item.style}, color: ${item.color}, formality: ${item.formality}, warmth: ${item.warmth})`
      )
      .join('\n');

    return [
      `Occasion: ${plan.occasion}`,
      `Mood: ${plan.mood}`,
      `Weather: ${plan.weather}`,
      `Temperature preference (1 cooler - 5 warmer): ${plan.tempPreference}`,
      plan.details ? `Extra context: ${plan.details}` : '',
      'Wardrobe items:',
      wardrobeSummary,
      'Return JSON with keys: headline, summary, desiredWarmth, palette (array of colors), reasons (array of 3 strings), items (array of picked items with name and category).'
    ]
      .filter(Boolean)
      .join('\n');
  }

  private buildImagePrompt(rec: Recommendation): string {
    const items = rec.selectedItems
      .map(
        (i) =>
          `${i.name} (${i.category}, color ${i.color}, style ${i.style}, formality ${i.formality}/5, warmth ${i.warmth}/5)`
      )
      .join('; ');

    return [
      `Create a realistic outfit visual that combines: ${items}.`,
      `Overall vibe: ${rec.summary}.`,
      `Show the pieces together as a styled flat-lay on a neutral backdrop, well-lit, crisp 4k studio photo, no text.`
    ].join(' ');
  }
}
