const storageKey = "attire-planner-items";
const form = document.getElementById("item-form");
const plannerForm = document.getElementById("planner-form");
const wardrobeGrid = document.getElementById("wardrobe-grid");
const recommendation = document.getElementById("recommendation");
const itemCount = document.getElementById("item-count");
const template = document.getElementById("wardrobe-item-template");
const seedDemoButton = document.getElementById("seed-demo");

const occasionProfiles = {
  work: { formality: 4, style: ["classic", "minimal"], categories: ["dress", "top", "bottom", "outerwear"] },
  brunch: { formality: 2, style: ["casual", "romantic", "minimal"], categories: ["dress", "top", "bottom"] },
  date: { formality: 4, style: ["romantic", "glam", "classic"], categories: ["dress", "top", "bottom", "accessory"] },
  party: { formality: 5, style: ["glam", "bold", "edgy"], categories: ["dress", "top", "bottom", "accessory"] },
  travel: { formality: 2, style: ["casual", "sporty", "minimal"], categories: ["top", "bottom", "outerwear"] },
  errands: { formality: 1, style: ["casual", "sporty", "minimal"], categories: ["top", "bottom", "shoes"] },
};

const moodStyles = {
  confident: ["classic", "glam", "minimal"],
  playful: ["romantic", "casual"],
  relaxed: ["casual", "minimal", "sporty"],
  bold: ["edgy", "glam"],
  romantic: ["romantic", "classic"],
  focused: ["minimal", "classic"],
};

const weatherWarmth = {
  sunny: 2,
  mild: 3,
  rainy: 4,
  cold: 5,
  hot: 1,
};

const demoItems = [
  { name: "Ivory wrap dress", category: "dress", color: "white", style: "romantic", formality: 4, warmth: 2, notes: "Easy polished option for brunches and date nights.", image: "" },
  { name: "Tailored black blazer", category: "outerwear", color: "black", style: "classic", formality: 5, warmth: 4, notes: "Makes casual outfits feel more intentional.", image: "" },
  { name: "Wide-leg blue trousers", category: "bottom", color: "blue", style: "minimal", formality: 4, warmth: 3, notes: "Comfortable enough for work and city days.", image: "" },
  { name: "Silk camisole", category: "top", color: "green", style: "glam", formality: 4, warmth: 1, notes: "Great layering top for dinners.", image: "" },
  { name: "White sneakers", category: "shoes", color: "white", style: "casual", formality: 1, warmth: 2, notes: "For walking-heavy days.", image: "" },
  { name: "Black ankle boots", category: "shoes", color: "black", style: "edgy", formality: 3, warmth: 4, notes: "Best for colder or rainy evenings.", image: "" },
  { name: "Gold hoops", category: "accessory", color: "metallic", style: "classic", formality: 3, warmth: 3, notes: "Instantly finishes a look.", image: "" },
  { name: "Structured mini bag", category: "bag", color: "neutral", style: "minimal", formality: 3, warmth: 3, notes: "Pairs with almost everything.", image: "" },
];

let wardrobe = loadWardrobe();
renderWardrobe();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const imageFile = formData.get("image");
  const item = {
    id: crypto.randomUUID(),
    name: formData.get("name").toString().trim(),
    category: formData.get("category"),
    color: formData.get("color"),
    style: formData.get("style"),
    formality: Number(formData.get("formality")),
    warmth: Number(formData.get("warmth")),
    notes: formData.get("notes").toString().trim(),
    image: "",
  };

  if (imageFile && imageFile.size > 0) {
    item.image = await readFileAsDataURL(imageFile);
  }

  wardrobe.unshift(item);
  persistWardrobe();
  renderWardrobe();
  form.reset();
});

plannerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderRecommendation(new FormData(plannerForm));
});

seedDemoButton.addEventListener("click", () => {
  wardrobe = demoItems.map((item) => ({ ...item, id: crypto.randomUUID() }));
  persistWardrobe();
  renderWardrobe();
});

function loadWardrobe() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    return [];
  }
}

function persistWardrobe() {
  localStorage.setItem(storageKey, JSON.stringify(wardrobe));
}

function renderWardrobe() {
  itemCount.textContent = `${wardrobe.length} item${wardrobe.length === 1 ? "" : "s"}`;

  if (wardrobe.length === 0) {
    wardrobeGrid.className = "wardrobe-grid empty-state";
    wardrobeGrid.innerHTML = "<p>Your wardrobe is empty. Add pieces or load the demo closet to get started.</p>";
    recommendation.className = "recommendation empty-state";
    recommendation.innerHTML = "<p>Add at least one clothing piece and one pair of shoes to get a recommendation.</p>";
    return;
  }

  wardrobeGrid.className = "wardrobe-grid";
  wardrobeGrid.innerHTML = "";

  wardrobe.forEach((item) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".item-card");
    const image = fragment.querySelector(".item-image");
    const title = fragment.querySelector("h3");
    const meta = fragment.querySelector(".item-meta");
    const notes = fragment.querySelector(".item-notes");
    const removeButton = fragment.querySelector(".icon-btn");

    title.textContent = item.name;
    meta.textContent = `${capitalize(item.category)} • ${capitalize(item.style)} • ${capitalize(item.color)}`;
    notes.textContent = item.notes || `Formality ${item.formality}/5 • Warmth ${item.warmth}/5`;
    if (item.image) {
      image.style.backgroundImage = `url(${item.image})`;
    }

    removeButton.addEventListener("click", () => {
      wardrobe = wardrobe.filter((wardrobeItem) => wardrobeItem.id !== item.id);
      persistWardrobe();
      renderWardrobe();
    });

    wardrobeGrid.appendChild(card);
  });
}

function renderRecommendation(formData) {
  const clothingItems = wardrobe.filter((item) => ["dress", "top", "bottom", "outerwear"].includes(item.category));
  const shoes = wardrobe.filter((item) => item.category === "shoes");

  if (clothingItems.length === 0 || shoes.length === 0) {
    recommendation.className = "recommendation empty-state";
    recommendation.innerHTML = "<p>Add at least one clothing piece and one pair of shoes to get a recommendation.</p>";
    return;
  }

  const occasion = formData.get("occasion").toString();
  const mood = formData.get("mood").toString();
  const weather = formData.get("weather").toString();
  const tempPreference = Number(formData.get("tempPreference"));
  const details = formData.get("details").toString().trim();

  const profile = occasionProfiles[occasion];
  const desiredWarmth = Math.round((weatherWarmth[weather] + tempPreference) / 2);
  const desiredStyles = new Set([...(profile.style || []), ...(moodStyles[mood] || [])]);

  const picks = {
    main: pickBest(wardrobe.filter((item) => ["dress", "top"].includes(item.category)), { profile, desiredWarmth, desiredStyles }),
    bottom: pickBest(wardrobe.filter((item) => item.category === "bottom"), { profile, desiredWarmth, desiredStyles }),
    layer: pickBest(wardrobe.filter((item) => item.category === "outerwear"), { profile, desiredWarmth, desiredStyles }, true),
    shoes: pickBest(shoes, { profile, desiredWarmth, desiredStyles }),
    accessory: pickBest(wardrobe.filter((item) => ["accessory", "bag"].includes(item.category)), { profile, desiredWarmth, desiredStyles }, true),
  };

  const useBottom = picks.main?.category !== "dress" && picks.bottom;
  const selected = [picks.main, useBottom ? picks.bottom : null, picks.layer, picks.shoes, picks.accessory].filter(Boolean);
  const palette = selected.map((item) => item.color).filter(Boolean);

  recommendation.className = "recommendation";
  recommendation.innerHTML = `
    <div class="recommendation-card">
      <div class="recommendation-header">
        <div>
          <p class="eyebrow">Recommended outfit</p>
          <h3>${headlineForPlan(occasion, mood)}</h3>
        </div>
        <span class="badge">Warmth target ${desiredWarmth}/5</span>
      </div>
      <p class="recommendation-copy">
        This outfit leans ${Array.from(desiredStyles).slice(0, 2).join(" and ")} with a ${describeFormality(profile.formality)} finish. ${details ? `Extra note considered: “${escapeHtml(details)}”.` : ""}
      </p>
      <div class="recommendation-grid">
        ${selected
          .map(
            (item) => `
              <article class="pick-card">
                <strong>${capitalize(item.category)}</strong>
                <h4>${escapeHtml(item.name)}</h4>
                <p>${capitalize(item.style)} • ${capitalize(item.color)} • Formality ${item.formality}/5</p>
              </article>
            `,
          )
          .join("")}
      </div>
      <div class="recommendation-list">
        <h4>Why this works</h4>
        <ul>
          <li>The pieces stay close to your target formality for a ${occasion} day.</li>
          <li>The palette of ${palette.map(capitalize).join(", ")} keeps the outfit coordinated.</li>
          <li>${weatherAdvice(weather, picks)}</li>
        </ul>
      </div>
    </div>
  `;
}

function pickBest(items, context, optional = false) {
  if (items.length === 0) {
    return optional ? null : null;
  }

  const ranked = [...items].sort((a, b) => scoreItem(b, context) - scoreItem(a, context));
  return ranked[0] ?? null;
}

function scoreItem(item, context) {
  const styleBonus = context.desiredStyles.has(item.style) ? 2 : 0;
  const formalityScore = 5 - Math.abs(item.formality - context.profile.formality);
  const warmthScore = 5 - Math.abs(item.warmth - context.desiredWarmth);
  const categoryBonus = context.profile.categories.includes(item.category) ? 1 : 0;
  return styleBonus + formalityScore + warmthScore + categoryBonus;
}

function headlineForPlan(occasion, mood) {
  return `${capitalize(mood)} ${capitalize(occasion)} look`;
}

function describeFormality(value) {
  if (value >= 5) return "dressy";
  if (value >= 4) return "polished";
  if (value >= 3) return "balanced";
  return "relaxed";
}

function weatherAdvice(weather, picks) {
  if (weather === "rainy") {
    return picks.layer ? "Your added layer gives the outfit more protection for rainy moments." : "Consider adding a lightweight layer if rain starts.";
  }
  if (weather === "cold") {
    return picks.layer ? "The recommendation includes a warmer piece to keep the look practical." : "You may want to add a coat for extra warmth.";
  }
  if (weather === "hot") {
    return "Lighter pieces are prioritized so the outfit still feels breathable.";
  }
  return "The mix balances comfort, style, and the pace of your day.";
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
