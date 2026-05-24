const STORE_KEY = "restaurant-template-pro-state-v3";

const defaultDishes = [
  { id: "durum-shish", name: "Dürüm shish tawook", category: "wraps", price: 9.68, oldPrice: 0, orders: 42, active: true, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85", description: "Gemarineerde kipspies, looksaus, sla en augurk in geroosterd Arabisch brood." },
  { id: "tawook-schotel", name: "Shish Tawook schotel", category: "schotels", price: 18.15, oldPrice: 0, orders: 35, active: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85", description: "Kip van de grill met friet, groentesalade en huisgemaakte saus." },
  { id: "wings", name: "Krokante Chicken Wings", category: "schotels", price: 10, oldPrice: 0, orders: 33, active: true, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=900&q=85", description: "Acht goudbruine wings met Belgische frieten en sweet chili dip." },
  { id: "family-bulgur", name: "Familie BBQ bulgur", category: "bbq", price: 45.37, oldPrice: 49.9, orders: 18, active: true, image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=900&q=85", description: "Acht spiesen gegrild vlees en kip met bulgur, friet en salade voor twee personen." },
  { id: "family-mezze", name: "Familie BBQ mezze", category: "bbq", price: 45.37, oldPrice: 0, orders: 16, active: true, image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=900&q=85", description: "Acht spiesen met hummus, moutabal, muhammara, groentesalade en friet." },
  { id: "crispy-burger", name: "Crispy kipburger", category: "burger", price: 7.26, oldPrice: 0, orders: 29, active: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", description: "Krokante kipburger met sla, tomaat en saus in een zacht broodje." },
  { id: "beef-burger", name: "Classic Beef Burger", category: "burger", price: 7.26, oldPrice: 0, orders: 24, active: true, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85", description: "Runderburger op brioche met cheddar, verse groenten en huisgemaakte saus." },
  { id: "durum-shoarma", name: "Dürüm shoarma", category: "wraps", price: 7.26, oldPrice: 0, orders: 27, active: true, image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=900&q=85", description: "Dun gesneden gemarineerde kip, looksaus en augurken in krokant brood." },
  { id: "falafel", name: "Dürüm falafel", category: "wraps", price: 7.26, oldPrice: 0, orders: 19, active: true, image: "https://images.unsplash.com/photo-1593001874117-c99c800e3ebc?auto=format&fit=crop&w=900&q=85", description: "Knapperige falafel, tahini, Arabische salade en augurk." },
  { id: "tiramisu", name: "Tiramisu speculoos caramel", category: "dessert", price: 6.05, oldPrice: 0, orders: 14, active: true, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85", description: "Romige tiramisu met speculoos, karamel en kruimels." }
];

const defaultDiscounts = [
  { id: "delivery", title: "Gratis levering", text: "Gratis levering vanaf €15 bestelling.", active: true },
  { id: "family", title: "Familie BBQ", text: "Acht spiesen voor twee personen vanaf €45,37.", active: true },
  { id: "student", title: "Burger + drink", text: "Snelle actie voor studenten en lunchpauzes.", active: false }
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
