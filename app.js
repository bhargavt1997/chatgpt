const storageKey = "attire-planner-items";
const form = document.getElementById("item-form");
const plannerForm = document.getElementById("planner-form");
const wardrobeGrid = document.getElementById("wardrobe-grid");
const recommendation = document.getElementById("recommendation");
const itemCount = document.getElementById("item-count");
const statCount = document.getElementById("stat-count");
const statShoes = document.getElementById("stat-shoes");
const statLayers = document.getElementById("stat-layers");
const template = document.getElementById("wardrobe-item-template");
const seedDemoButton = document.getElementById("seed-demo-hero");
const clearWardrobeButton = document.getElementById("clear-wardrobe");

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

clearWardrobeButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to clear your entire wardrobe?")) {
        wardrobe = [];
        persistWardrobe();
        renderWardrobe();
    }
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
  statCount.textContent = wardrobe.length;
  statShoes.textContent = wardrobe.filter(i => i.category === 'shoes').length;
  statLayers.textContent = wardrobe.filter(i => i.category === 'outerwear').length;

  if (wardrobe.length === 0) {
    wardrobeGrid.className = "wardrobe-grid empty-state";
    wardrobeGrid.innerHTML = "<p>Your collection is empty. Start adding pieces to see them here.</p>";
    recommendation.className = "recommendation empty-state";
    recommendation.innerHTML = "<p>Ready to plan your next look?</p>";
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
    const removeButton = fragment.querySelector(".icon-btn");

    title.textContent = item.name;
    meta.textContent = `${capitalize(item.category)} • ${capitalize(item.color)}`;
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

  const profile = occasionProfiles[occasion];
  const desiredStyles = new Set([...(profile.style || []), ...(moodStyles[mood] || [])]);

  const picks = {
    main: pickBest(wardrobe.filter((item) => ["dress", "top"].includes(item.category)), { profile, desiredStyles }),
    bottom: pickBest(wardrobe.filter((item) => item.category === "bottom"), { profile, desiredStyles }),
    shoes: pickBest(shoes, { profile, desiredStyles }),
  };

  const useBottom = picks.main?.category !== "dress" && picks.bottom;
  const selected = [picks.main, useBottom ? picks.bottom : null, picks.shoes].filter(Boolean);

  recommendation.className = "recommendation";
  recommendation.innerHTML = `
    <div class="recommendation-card" style="background: #F1F2F6; padding: 24px; border-radius: 20px;">
      <h3 style="margin-top:0">Your ${capitalize(mood)} ${capitalize(occasion)} Look</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 16px;">
        ${selected.map(item => `
          <div style="background: white; padding: 16px; border-radius: 12px; border: 1px solid #DFE6E9;">
            <div style="font-size: 11px; font-weight: 700; color: #E17055; text-transform: uppercase;">${item.category}</div>
            <div style="font-weight: 700; font-size: 15px;">${item.name}</div>
            <div style="font-size: 12px; color: #636E72;">${capitalize(item.style)} • ${capitalize(item.color)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function pickBest(items, context) {
  if (items.length === 0) return null;
  const ranked = [...items].sort((a, b) => scoreItem(b, context) - scoreItem(a, context));
  return ranked[0];
}

function scoreItem(item, context) {
  const styleBonus = context.desiredStyles.has(item.style) ? 2 : 0;
  const formalityScore = 5 - Math.abs(item.formality - context.profile.formality);
  return styleBonus + formalityScore;
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
