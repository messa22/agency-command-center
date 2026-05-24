const STORE_KEY = "restaurant-template-pro-state-v2";

const defaultDishes = [
  { id: "mix-grill", name: "Mixed Grill Royale", category: "grill", price: 24.9, oldPrice: 28.9, orders: 32, active: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85", description: "Gegrilde kip, steak, groenten, saus en krokante aardappelen." },
  { id: "smash-burger", name: "Smash Burger Menu", category: "lunch", price: 15.5, oldPrice: 0, orders: 28, active: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", description: "Dubbele burger, cheddar, huisgemaakte saus en frieten." },
  { id: "pizza-diavola", name: "Pizza Diavola", category: "pizza", price: 13.9, oldPrice: 16.5, orders: 21, active: true, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85", description: "Pittige salami, mozzarella, tomaat en verse basilicum." },
  { id: "creamy-pasta", name: "Creamy Pasta", category: "lunch", price: 14.5, oldPrice: 0, orders: 18, active: true, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85", description: "Romige saus, parmezaan, champignons en gegrilde kip." },
  { id: "chicken-bowl", name: "Chicken Bowl", category: "grill", price: 16.9, oldPrice: 19.9, orders: 16, active: true, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85", description: "Gegrilde kip, rijst, salade, pikante saus en kruiden." },
  { id: "fresh-salad", name: "Fresh Halloumi Salad", category: "lunch", price: 12.9, oldPrice: 0, orders: 11, active: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", description: "Krokante groenten, halloumi, noten en frisse dressing." },
  { id: "lava-cake", name: "Chocolate Lava Cake", category: "dessert", price: 7.9, oldPrice: 9.5, orders: 14, active: true, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85", description: "Warme chocoladetaart met zachte kern en vanille ijs." },
  { id: "loaded-fries", name: "Loaded Fries", category: "lunch", price: 10.9, oldPrice: 0, orders: 19, active: true, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=85", description: "Frieten met kaas, saus, crispy kip en lente-ui." }
];

const defaultDiscounts = [
  { id: "lunch", title: "Lunch deal", text: "Gratis drankje bij elk lunchmenu tot 15:00.", active: true },
  { id: "family", title: "Familie actie", text: "10% korting vanaf 4 hoofdgerechten.", active: true },
  { id: "student", title: "Student menu", text: "Elke woensdag extra korting op pizza en burger.", active: false }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return {
      dishes: Array.isArray(saved.dishes) ? saved.dishes : clone(defaultDishes),
      discounts: Array.isArray(saved.discounts) ? saved.discounts : clone(defaultDiscounts)
    };
  } catch {
    return { dishes: clone(defaultDishes), discounts: clone(defaultDiscounts) };
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ dishes, discounts }));
}

const state = loadState();
let dishes = state.dishes;
let discounts = state.discounts;
let cart = [];
let activeFilter = "all";
let range = 30;

const euro = (value) => new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 1 }).format(value);
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function renderMenu() {
  const filtered = dishes.filter((dish) => dish.active && (activeFilter === "all" || dish.category === activeFilter));
  $("#menuGrid").innerHTML = filtered.map((dish) => `
    <article class="dish-card">
      <img src="${dish.image}" alt="${dish.name}">
      <div class="dish-body">
        <div class="row">
          <strong>${dish.name}</strong>
          <span>${euro(dish.price)}</span>
        </div>
        <p>${dish.description}</p>
        <div class="dish-meta">
          ${dish.oldPrice ? `<b>${Math.round((1 - dish.price / dish.oldPrice) * 100)}% korting</b>` : `<b>${dish.orders}x besteld</b>`}
          ${dish.oldPrice ? `<em>${euro(dish.oldPrice)}</em>` : ""}
        </div>
        <button class="primary" data-add="${dish.id}">Toevoegen</button>
      </div>
    </article>
  `).join("");
}

function renderDeals() {
  $("#dealCards").innerHTML = discounts.filter((deal) => deal.active).map((deal) => `
    <article>
      <strong>${deal.title}</strong>
      <span>${deal.text}</span>
    </article>
  `).join("") || `<article><strong>Geen actieve korting</strong><span>De eigenaar kan acties in het dashboard aanzetten.</span></article>`;
}

function renderCart() {
  $("#cartItems").innerHTML = cart.map((item) => `
    <div class="cart-row">
      <span>${item.name}</span>
      <strong>${euro(item.price)}</strong>
    </div>
  `).join("") || `<p class="muted">Nog niets gekozen.</p>`;
  $("#cartTotal").textContent = euro(cart.reduce((sum, item) => sum + item.price, 0));
  $("#cart").classList.toggle("open", cart.length > 0);
}

function renderAdmin() {
  const revenue = dishes.reduce((sum, dish) => sum + dish.price * dish.orders, 0);
  const activeDiscounts = discounts.filter((deal) => deal.active).length;
  const available = dishes.filter((dish) => dish.active).length;
  $("#adminMetrics").innerHTML = [
    ["Omzet vandaag", euro(revenue), "demo op basis van bestellingen"],
    ["Bestellingen", dishes.reduce((sum, dish) => sum + dish.orders, 0), "vandaag"],
    ["Actieve kortingen", activeDiscounts, "zichtbaar op website"],
    ["Beschikbare gerechten", available, "in menu"]
  ].map(([label, value, hint]) => `<article><span>${label}</span><strong>${value}</strong><em>${hint}</em></article>`).join("");
  renderRevenueChart();
  $("#discountAdmin").innerHTML = discounts.map((deal) => `
    <label class="toggle-row">
      <span><strong>${deal.title}</strong><em>${deal.text}</em></span>
      <input type="checkbox" data-discount="${deal.id}" ${deal.active ? "checked" : ""}>
    </label>
  `).join("");
  $("#menuAdmin").innerHTML = dishes.map((dish) => `
    <article>
      <img src="${dish.image}" alt="${dish.name}">
      <div>
        <strong>${dish.name}</strong>
        <span>${dish.category} - ${dish.orders} bestellingen</span>
      </div>
      <input type="number" min="0" step="0.5" value="${dish.price}" data-price="${dish.id}">
      <label><input type="checkbox" data-active="${dish.id}" ${dish.active ? "checked" : ""}> Online</label>
    </article>
  `).join("");
}

function renderRevenueChart() {
  const points = Array.from({ length: range === 7 ? 7 : 10 }, (_, index) => {
    const base = range === 7 ? 240 : range === 30 ? 680 : 1600;
    return Math.round(base + index * base * 0.08 + Math.sin(index) * base * 0.12);
  });
  const max = Math.max(...points);
  const width = 420;
  const height = 170;
  const line = points.map((value, index) => {
    const x = 18 + index * ((width - 36) / Math.max(1, points.length - 1));
    const y = height - 24 - (value / max) * 112;
    return `${x},${y}`;
  }).join(" ");
  $("#revenueChart").innerHTML = `
    <strong>${euro(points.at(-1))}</strong>
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <polyline points="${line}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `;
}

function openAdmin() {
  $("#adminShell").classList.add("open");
  $("#adminShell").setAttribute("aria-hidden", "false");
  renderAdmin();
}

function closeAdmin() {
  $("#adminShell").classList.remove("open");
  $("#adminShell").setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    activeFilter = filter.dataset.filter;
    $$("#menuFilters button").forEach((button) => button.classList.toggle("active", button === filter));
    renderMenu();
  }

  const add = event.target.closest("[data-add]");
  if (add) {
    const dish = dishes.find((item) => item.id === add.dataset.add);
    cart.push(dish);
    renderCart();
  }

  if (event.target.id === "closeCart") {
    cart = [];
    renderCart();
  }

  if (event.target.id === "openAdmin") $("#adminLogin").showModal();
  if (event.target.id === "closeAdmin") closeAdmin();

  const rangeButton = event.target.closest("[data-range]");
  if (rangeButton) {
    range = Number(rangeButton.dataset.range);
    $$("#rangeControls button").forEach((button) => button.classList.toggle("active", button === rangeButton));
    renderRevenueChart();
  }
});

document.addEventListener("change", (event) => {
  const discountToggle = event.target.closest("[data-discount]");
  if (discountToggle) {
    discounts.find((deal) => deal.id === discountToggle.dataset.discount).active = discountToggle.checked;
    saveState();
    renderDeals();
    renderAdmin();
  }
  const activeToggle = event.target.closest("[data-active]");
  if (activeToggle) {
    dishes.find((dish) => dish.id === activeToggle.dataset.active).active = activeToggle.checked;
    saveState();
    renderMenu();
    renderAdmin();
  }
  const priceInput = event.target.closest("[data-price]");
  if (priceInput) {
    dishes.find((dish) => dish.id === priceInput.dataset.price).price = Number(priceInput.value || 0);
    saveState();
    renderMenu();
    renderAdmin();
  }
});

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (new FormData(event.currentTarget).get("pin") !== "1234") return;
  $("#adminLogin").close();
  openAdmin();
});

renderMenu();
renderDeals();
renderCart();
renderAdmin();
