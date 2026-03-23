# Attire Planner

An Angular 21 wardrobe planning app with a modern editorial UI. Add the clothes you already own, store them in the browser, and generate GPT-powered outfit recommendations based on occasion, mood, weather, and comfort.

## Features

- Built with standalone Angular 21 components and reactive forms
- Save wardrobe items in `localStorage` (images are stored in `sessionStorage`)
- Upload photos for wardrobe pieces
- Load a demo closet to explore the planner quickly
- Generate a coordinated outfit suggestion via OpenAI Chat Completions with palette and styling notes

## Run locally

Install dependencies if needed:

```bash
npm install
```

Start the Angular dev server:

```bash
npm start
```

Then open <http://localhost:4200>.

## Getting GPT recommendations

Enter an OpenAI API key in the “OpenAI API key” field (kept in-memory on the client) and click “Recommend my outfit.” The app sends your wardrobe summary and planner context to the `gpt-4o-mini` chat completions endpoint and returns a JSON-formatted recommendation. Without a key, the recommendation step will not run.
