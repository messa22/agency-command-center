const STORAGE_KEY = "agency-command-center-v1";

const statuses = [
  ["potentieel", "Potentiële klanten"],
  ["nieuw", "Nieuwe klanten"],
  ["lopend", "Lopende klanten"],
  ["afgerond", "Afgeronde klanten"],
  ["ongeinteresseerd", "Ongeïnteresseerd"]
];

const today = new Date();
const iso = (offset = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const seedData = {
  clients: [
    { id: crypto.randomUUID(), name: "Kapsalon Jones!", contact: "Jones", phone: "0475 66 25 98", address: "Stapelhuisstraat 4/bus 101", city: "Leuven", niche: "Kapsalon", status: "nieuw", owner: "Ayman", priority: "hoog", value: 950, deadline: iso(1), nextAction: "Retro demo tonen en afspraak closen", questions: "Logo, kleuren, echte salonfoto's, gewenste boekingsmethode", notes: "Wil luxe uitstraling maar makkelijk te begrijpen." },
    { id: crypto.randomUUID(), name: "Sam Kebab", contact: "Sam", phone: "", address: "Gasthuisstraat 2", city: "Aarschot", niche: "Kebab", status: "lopend", owner: "Emilio", priority: "hoog", value: 1200, deadline: iso(2), nextAction: "Menu controleren en bestelknop bespreken", questions: "Menu, prijzen, openingsuren, delivery link", notes: "Foodsite moet snel converteren." },
    { id: crypto.randomUUID(), name: "Café Zettanee", contact: "Caro", phone: "0468 23 45 39", address: "Bogaardenstraat 37", city: "Aarschot", niche: "Café", status: "potentieel", owner: "Ayman", priority: "normaal", value: 850, deadline: iso(4), nextAction: "Afspraak bevestigen en sfeerfoto's vragen", questions: "Drankkaart, Instagram, events, openingsuren", notes: "Meer sfeer en routekliks nodig." },
    { id: crypto.randomUUID(), name: "BBQ Damas", contact: "", phone: "0484 30 92 80", address: "Schaluin 107", city: "Aarschot", niche: "Restaurant", status: "afgerond", owner: "Emilio", priority: "normaal", value: 1500, deadline: iso(-2), nextAction: "Onderhoud en TikTok upsell voorstellen", questions: "Nieuwe foto's en menu-updates", notes: "Referentiestijl voor foodklanten." },
    { id: crypto.randomUUID(), name: "Bill Baguette", contact: "", phone: "016 29 74 39", address: "Liersesteenweg 39", city: "Aarschot", niche: "Broodjeszaak", status: "lopend", owner: "Ayman", priority: "normaal", value: 900, deadline: iso(3), nextAction: "Broodjeskaart opvragen", questions: "Volledige kaart, prijzen, foto’s", notes: "Lunchklanten, belknop belangrijk." },
    { id: crypto.randomUUID(), name: "Intercoiff", contact: "", phone: "", address: "", city: "Leuven", niche: "Kapper", status: "ongeinteresseerd", owner: "Emilio", priority: "laag", value: 0, deadline: iso(60), nextAction: "Hercontact over 60 dagen", questions: "Waarom nee?", notes: "Niet pushen, later opnieuw proberen." }
  ],
  tasks: [],
  events: []
};

seedData.tasks = [
  task(seedData.clients[0], "Closen na demo", "Closen", "Ayman", iso(1), "hoog"),
  task(seedData.clients[0], "Specifieke vragen verzamelen: logo/branding", "Menu/logo/branding vragen", "Emilio", iso(1), "hoog"),
  task(seedData.clients[1], "Website afmaken en menu cards checken", "Website afmaken", "Emilio", iso(2), "hoog"),
  task(seedData.clients[2], "TikToks filmen tijdens afspraak", "TikToks filmen", "Ayman", iso(4), "normaal"),
  task(seedData.clients[4], "Lunchkaart en prijzen vragen", "Menu/logo/branding vragen", "Ayman", iso(3), "normaal")
];

seedData.events = [
  event(seedData.clients[0], "Demo tonen Kapsalon Jones", "Ayman", iso(1), "12:00", "Meeting"),
  event(seedData.clients[1], "Menu review Sam Kebab", "Emilio", iso(2), "15:30", "Productie"),
  event(seedData.clients[2], "Afspraak + contentplan", "Ayman", iso(4), "10:30", "Marketing"),
  event(seedData.clients[4], "Broodjeskaart ophalen", "Beide", iso(3), "14:00", "Follow-up")
];

seedData.calls = [
  call(seedData.clients[0], "Ayman", iso(-1), "Afspraak gemaakt"),
  call(seedData.clients[1], "Emilio", iso(-1), "Terugbellen"),
  call(seedData.clients[2], "Ayman", iso(-2), "Afspraak gemaakt"),
  call(seedData.clients[4], "Ayman", iso(-3), "Afspraak gemaakt"),
  call(seedData.clients[5], "Emilio", iso(-4), "Niet geïnteresseerd")
];

function task(client, title, type, owner, due, priority) {
  return { id: crypto.randomUUID(), clientId: client.id, title, type, owner, due, priority, status: "open" };
}

function event(client, title, owner, date, time, type) {
  return { id: crypto.randomUUID(), clientId: client.id, title, owner, date, time, type, duration: 60 };
}

function call(client, owner, date, result) {
  return { id: crypto.randomUUID(), clientId: client.id, owner, date, result };
}

let state = load();
let route = "dashboard";
let query = "";
let ownerFilter = "all";
let priorityFilter = "all";
const routes = ["dashboard", "pipeline", "clients", "analytics", "agenda", "tasks", "research"];
let agendaRange = "week";
let taskMode = "status";
const CALL_TARGET_WEEK = 60;
const cityPositions = {
  leuven: { x: 37, y: 70 },
  aarschot: { x: 58, y: 45 },
  rillaar: { x: 66, y: 39 },
  brussel: { x: 28, y: 84 },
  brussels: { x: 28, y: 84 },
  mechelen: { x: 44, y: 83 },
  tienen: { x: 50, y: 74 }
};

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return structuredClone(seedData);
  }
  try { return migrate(JSON.parse(saved)); } catch {
    return structuredClone(seedData);
  }
}

function migrate(data) {
  const addressBook = {
    "Kapsalon Jones!": "Stapelhuisstraat 4/bus 101",
    "Sam Kebab": "Gasthuisstraat 2",
    "Café Zettanee": "Bogaardenstraat 37",
    "BBQ Damas": "Schaluin 107",
    "Bill Baguette": "Liersesteenweg 39"
  };
  data.clients = (data.clients || []).map((client) => ({ ...client, address: client.address || addressBook[client.name] || "" }));
  data.tasks ||= [];
  data.events ||= [];
  data.calls ||= [];
  return data;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clientById = (id) => state.clients.find((client) => client.id === id);
const money = (value) => new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(value || 0));
const niceDate = (value) => value ? new Intl.DateTimeFormat("nl-BE", { day: "2-digit", month: "short" }).format(new Date(value)) : "-";

function filteredClients() {
  return state.clients.filter((client) => {
    const haystack = [client.name, client.contact, client.phone, client.city, client.niche, client.owner, client.nextAction, client.notes, client.questions].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesOwner = ownerFilter === "all" || client.owner === ownerFilter || client.owner === "Beide";
    const matchesPriority = priorityFilter === "all" || client.priority === priorityFilter;
    return matchesQuery && matchesOwner && matchesPriority;
  });
}

function setRoute(next, updateHash = true) {
  route = next;
  if (updateHash && location.hash.slice(1) !== next) {
    history.replaceState(null, "", `#${next}`);
  }
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${next}View`).classList.add("active");
  $$(".side-nav button").forEach((button) => button.classList.toggle("active", button.dataset.route === next));
  $("#viewTitle").textContent = {
    dashboard: "Dashboard",
    pipeline: "Pipeline",
    clients: "Klanten",
    analytics: "Analytics",
    agenda: "Agenda",
    tasks: "Taken",
    research: "Workflow"
  }[next];
  render();
}

function render() {
  renderMetrics();
  renderDashboard();
  renderPipeline();
  renderClients();
  renderSelects();
  renderAgenda();
  renderTasks();
  renderAnalytics();
}

function renderMetrics() {
  const totalValue = state.clients.filter((client) => !["afgerond", "ongeinteresseerd"].includes(client.status)).reduce((sum, client) => sum + Number(client.value || 0), 0);
  const openTasks = state.tasks.filter((task) => task.status !== "done").length;
  const dueToday = state.tasks.filter((task) => task.status !== "done" && task.due <= iso()).length;
  const meetings = state.events.filter((event) => event.date >= iso()).length;
  const won = state.clients.filter((client) => client.status === "afgerond").length;
  const metrics = [
    ["Pipeline waarde", money(totalValue), "Open potentiële omzet"],
    ["Open taken", openTasks, `${dueToday} dringend`],
    ["Afspraken", meetings, "komende periode"],
    ["Afgerond", won, "klanten opgeleverd"],
    ["Hitlijst", state.clients.filter((client) => client.priority === "hoog" && client.status !== "afgerond").length, "hoge prioriteit"]
  ];
  $("#metrics").innerHTML = metrics.map(([label, value, hint]) => `<article class="metric"><span>${label}</span><strong>${value}</strong><em>${hint}</em></article>`).join("");
}

function renderDashboard() {
  const actions = state.tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => a.due.localeCompare(b.due) || priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 7);
  $("#todayActions").innerHTML = actions.length ? actions.map(taskHtml).join("") : empty("Geen open taken.");

  const meetings = state.events
    .filter((event) => event.date >= iso())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 6);
  $("#nextMeetings").innerHTML = meetings.length ? meetings.map(eventHtml).join("") : empty("Geen afspraken gepland.");

  const health = filteredClients()
    .filter((client) => !["afgerond", "ongeinteresseerd"].includes(client.status))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 8);
  $("#healthRows").innerHTML = health.map((client) => `
    <div class="health-row">
      <div class="row-top"><strong>${client.name}</strong><span class="pill ${client.priority}">${client.priority}</span></div>
      <div class="muted">${client.nextAction || "Geen volgende actie"} • ${client.owner} • deadline ${niceDate(client.deadline)}</div>
    </div>
  `).join("") || empty("Geen klanten in pipeline.");
}

function renderPipeline() {
  const clients = filteredClients();
  $("#pipelineBoard").innerHTML = statuses.map(([key, label]) => {
    const columnClients = clients.filter((client) => client.status === key);
    return `
      <section class="pipeline-col">
        <div class="col-head"><h3>${label}</h3><span class="pill">${columnClients.length}</span></div>
        ${columnClients.map(clientCardHtml).join("") || empty("Leeg")}
      </section>
    `;
  }).join("");
}

function clientCardHtml(client) {
  return `
    <article class="client-card">
      <div class="row-top"><h4>${client.name}</h4><span class="pill ${client.priority}">${client.priority}</span></div>
      <div class="muted">${client.niche || "-"} • ${client.city || "-"} • ${money(client.value)}</div>
      <div class="client-meta">
        <span class="pill">${client.owner}</span>
        <span class="pill">${client.phone || "geen tel"}</span>
      </div>
      <p class="muted">${client.nextAction || "Geen volgende actie ingesteld"}</p>
      <div class="card-actions">
        <button data-move="${client.id}" data-dir="-1">Terug</button>
        <button data-move="${client.id}" data-dir="1">Volgende</button>
        <button data-quick-task="${client.id}">Taak</button>
        <button data-delete-client="${client.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderClients() {
  $("#clientTable").innerHTML = filteredClients().map((client) => `
    <tr>
      <td><strong>${client.name}</strong><br><span class="muted">${client.contact || "-"} • ${client.city || "-"}</span></td>
      <td><span class="pill">${statusLabel(client.status)}</span></td>
      <td>${client.owner}</td>
      <td>${client.nextAction || "-"}</td>
      <td>${niceDate(client.deadline)}</td>
      <td>${money(client.value)}</td>
      <td><button class="link-btn" data-quick-task="${client.id}">Taak</button></td>
    </tr>
  `).join("") || `<tr><td colspan="7">${empty("Geen klanten gevonden.")}</td></tr>`;
}

function renderSelects() {
  const options = `<option value="none">Nog geen klant / losse afspraak</option>` + state.clients.map((client) => `<option value="${client.id}">${client.name}</option>`).join("");
  $("#eventClient").innerHTML = options;
  $("#taskClient").innerHTML = state.clients.map((client) => `<option value="${client.id}">${client.name}</option>`).join("");
  if ($("#callClient")) $("#callClient").innerHTML = state.clients.map((client) => `<option value="${client.id}">${client.name}</option>`).join("");
  const callDate = $("#callForm input[name='date']");
  if (callDate && !callDate.value) callDate.value = iso();
}

function renderAgenda() {
  const events = state.events
    .filter((event) => [event.title, clientById(event.clientId)?.name, event.owner, event.type].join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const rangeEvents = events.filter((event) => inAgendaRange(event.date, agendaRange));
  $("#agendaSummary").innerHTML = agendaSummaryHtml(rangeEvents);
  $("#calendarOverview").innerHTML = calendarOverviewHtml(rangeEvents);
  $("#agendaList").innerHTML = rangeEvents.map(eventHtml).join("") || empty("Geen afspraken in deze periode.");
}

function renderTasks() {
  const tasks = state.tasks
    .filter((task) => [task.title, task.type, task.owner, clientById(task.clientId)?.name].join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.status === "done") - (b.status === "done") || a.due.localeCompare(b.due) || priorityRank(a.priority) - priorityRank(b.priority));
  $("#taskSummary").innerHTML = taskSummaryHtml(tasks);
  $("#taskBoard").innerHTML = taskBoardHtml(tasks);
}

function taskHtml(task) {
  const client = clientById(task.clientId);
  return `
    <article class="task-row ${task.status}">
      <div class="row-top">
        <div><strong>${task.title}</strong><div class="muted">${client?.name || "Onbekend"} • ${task.type} • ${task.owner}</div></div>
        <span class="pill ${task.priority}">${task.priority}</span>
      </div>
      <div class="muted">Deadline ${niceDate(task.due)} • status ${task.status}</div>
      <div class="task-actions">
        <button data-task-status="${task.id}" data-status="open">Open</button>
        <button data-task-status="${task.id}" data-status="doing">Mee bezig</button>
        <button data-task-status="${task.id}" data-status="done">Klaar</button>
        <button data-delete-task="${task.id}">Delete</button>
      </div>
    </article>
  `;
}

function taskSummaryHtml(tasks) {
  const open = tasks.filter((task) => task.status === "open").length;
  const doing = tasks.filter((task) => task.status === "doing").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const urgent = tasks.filter((task) => task.status !== "done" && task.priority === "hoog").length;
  const overdue = tasks.filter((task) => task.status !== "done" && task.due < iso()).length;
  return [
    ["Open", open],
    ["Mee bezig", doing],
    ["Klaar", done],
    ["Hoog", urgent],
    ["Te laat", overdue]
  ].map(([label, value]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join("");
}

function taskBoardHtml(tasks) {
  const groups = taskMode === "priority"
    ? [["hoog", "Hoog"], ["normaal", "Normaal"], ["laag", "Laag"]]
    : [["open", "Te doen"], ["doing", "Mee bezig"], ["done", "Klaar"]];
  return groups.map(([key, label]) => {
    const groupTasks = tasks.filter((task) => taskMode === "priority" ? task.priority === key : task.status === key);
    return `
      <section class="task-col">
        <div class="col-head"><h3>${label}</h3><span class="pill">${groupTasks.length}</span></div>
        ${groupTasks.map(taskHtml).join("") || empty("Leeg")}
      </section>
    `;
  }).join("");
}

function inAgendaRange(dateString, range) {
  const date = new Date(`${dateString}T00:00:00`);
  const now = new Date(`${iso()}T00:00:00`);
  const end = new Date(now);
  if (range === "week") end.setDate(now.getDate() + 7);
  if (range === "month") end.setMonth(now.getMonth() + 1);
  if (range === "quarter") end.setMonth(now.getMonth() + 3);
  if (range === "year") end.setFullYear(now.getFullYear() + 1);
  return date >= now && date < end;
}

function agendaSummaryHtml(events) {
  const owners = countBy(events, "owner");
  const ownerLine = Object.entries(owners).map(([owner, count]) => `${owner}: ${count}`).join(" • ") || "Geen eigenaar";
  const clientCount = new Set(events.map((event) => event.clientId).filter((id) => id !== "none")).size;
  const loose = events.filter((event) => event.clientId === "none").length;
  return `
    <article><strong>${events.length}</strong><span>Afspraken</span></article>
    <article><strong>${clientCount}</strong><span>Klanten</span></article>
    <article><strong>${loose}</strong><span>Nog geen klant</span></article>
    <article class="wide"><strong>${ownerLine}</strong><span>Verdeling</span></article>
  `;
}

function calendarOverviewHtml(events) {
  if (agendaRange === "week") {
    return `<div class="week-grid">${dateBuckets(7).map(({ date, label }) => dayCard(date, label, events)).join("")}</div>`;
  }
  if (agendaRange === "month") {
    return `<div class="month-grid">${dateBuckets(31).map(({ date, label }) => dayCard(date, label, events)).join("")}</div>`;
  }
  if (agendaRange === "quarter") {
    return `<div class="period-grid">${monthBuckets(3).map((bucket) => monthCard(bucket, events)).join("")}</div>`;
  }
  return `<div class="year-grid">${monthBuckets(12).map((bucket) => monthCard(bucket, events)).join("")}</div>`;
}

function dateBuckets(days) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(`${iso(index)}T00:00:00`);
    return {
      date: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("nl-BE", { weekday: "short", day: "2-digit", month: "short" }).format(date)
    };
  });
}

function monthBuckets(count) {
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(today.getFullYear(), today.getMonth() + index, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + index + 1, 1);
    return {
      start,
      end,
      label: new Intl.DateTimeFormat("nl-BE", { month: "long", year: "numeric" }).format(start)
    };
  });
}

function dayCard(date, label, events) {
  const dayEvents = events.filter((event) => event.date === date);
  return `
    <article class="calendar-card ${dayEvents.length ? "has-events" : ""}">
      <strong>${label}</strong>
      <span>${dayEvents.length} afspraken</span>
      ${dayEvents.slice(0, 3).map((event) => `<em>${event.time} ${event.title}</em>`).join("")}
    </article>
  `;
}

function monthCard(bucket, events) {
  const monthEvents = events.filter((event) => {
    const date = new Date(`${event.date}T00:00:00`);
    return date >= bucket.start && date < bucket.end;
  });
  const clientCount = new Set(monthEvents.map((event) => event.clientId).filter((id) => id !== "none")).size;
  return `
    <article class="calendar-card month-card ${monthEvents.length ? "has-events" : ""}">
      <strong>${bucket.label}</strong>
      <span>${monthEvents.length} afspraken • ${clientCount} klanten</span>
      ${monthEvents.slice(0, 4).map((event) => `<em>${niceDate(event.date)} ${event.time} ${event.title}</em>`).join("")}
    </article>
  `;
}

function eventHtml(event) {
  const client = clientById(event.clientId);
  return `
    <article class="agenda-row meeting">
      <div class="row-top"><strong>${event.title}</strong><span class="pill">${event.owner}</span></div>
      <div class="muted">${niceDate(event.date)} om ${event.time} • ${event.type} • ${client?.name || "Onbekend"}</div>
      <div class="task-actions"><button data-delete-event="${event.id}">Delete</button></div>
    </article>
  `;
}

function statusLabel(key) {
  return statuses.find(([status]) => status === key)?.[1] || key;
}

function renderAnalytics() {
  if (!$("#analyticsMetrics")) return;
  const activeClients = state.clients.filter((client) => client.status !== "ongeinteresseerd");
  const newClients = state.clients.filter((client) => client.status === "nieuw").length;
  const returningClients = state.clients.filter((client) => client.status === "afgerond" && /onderhoud|upsell|review|maand|update/i.test(`${client.nextAction} ${client.notes}`)).length;
  const closedClients = state.clients.filter((client) => client.status === "afgerond").length;
  const closeRate = state.clients.length ? Math.round((closedClients / state.clients.length) * 100) : 0;
  const closedRevenue = revenueFor((client) => client.status === "afgerond");
  const openPipeline = revenueFor((client) => !["afgerond", "ongeinteresseerd"].includes(client.status));
  const forecast30 = revenueFor((client) => !["afgerond", "ongeinteresseerd"].includes(client.status) && isWithinDays(client.deadline, 30));
  const averageDeal = closedClients ? Math.round(closedRevenue / closedClients) : Math.round(openPipeline / Math.max(1, activeClients.length));
  const callsThisWeek = callsInCurrentWeek().length;
  const bestNiche = bestCloseNiche();
  const routeStops = upcomingMeetingStops();
  const routeUrl = buildRouteUrl(routeStops);

  $("#analyticsMetrics").innerHTML = [
    ["Gesloten omzet", money(closedRevenue), `${closedClients} klanten betaald/afgerond`],
    ["Open pipeline", money(openPipeline), "nog te closen waarde"],
    ["Forecast 30d", money(forecast30), "deals met deadline binnen 30 dagen"],
    ["Gem. deal", money(averageDeal), "richtprijs per klant"],
    ["Calls deze week", callsThisWeek, `${CALL_TARGET_WEEK} target`]
  ].map(([label, value, hint]) => `<article class="metric"><span>${label}</span><strong>${value}</strong><em>${hint}</em></article>`).join("");

  const growth = renderRevenueTrend();
  $("#growthBadge").textContent = growth >= 0 ? `+${growth}%` : `${growth}%`;
  $("#growthBadge").className = `pill ${growth >= 0 ? "laag" : "hoog"}`;
  renderSalesPulse(closeRate, bestNiche, newClients, returningClients);
  renderEfficiencyChart();
  renderProfitWarnings({ callsThisWeek, closeRate, openPipeline, closedRevenue, forecast30, bestNiche });
  renderBarList("#cityChart", countBy(activeClients, "city"), activeClients.length || 1);
  renderBarList("#serviceChart", countServices(), state.tasks.length || 1);
  renderMeetingMap(routeStops);
  $("#routeLink").href = routeUrl;
  $("#routeLink").classList.toggle("disabled", !routeStops.length);
  $("#routeList").innerHTML = routeStops.length ? routeStops.map((stop, index) => `
    <div class="route-stop">
      <span>${index + 1}</span>
      <div><strong>${stop.client?.name || stop.title}</strong><em>${stop.client ? "Al klant/record" : "Nog geen klant"} • ${stop.event.date} ${stop.event.time} • ${stop.place}</em></div>
    </div>
  `).join("") : empty("Geen route-stops.");
  renderCloseInsights();
  renderLocalAiInsights();
}

function revenueFor(predicate) {
  return state.clients.filter(predicate).reduce((sum, client) => sum + Number(client.value || 0), 0);
}

function monthKey(dateString) {
  const date = new Date(`${dateString || iso()}T00:00:00`);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("nl-BE", { month: "short" }).format(new Date(year, month - 1, 1));
}

function lastMonthKeys(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (count - 1 - index), 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

function isWithinDays(dateString, days) {
  if (!dateString) return false;
  const start = new Date(`${iso()}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + days);
  const date = new Date(`${dateString}T00:00:00`);
  return date >= start && date <= end;
}

function renderRevenueTrend() {
  const keys = lastMonthKeys(6);
  const rows = keys.map((key) => {
    const closed = state.clients
      .filter((client) => client.status === "afgerond" && monthKey(client.deadline) === key)
      .reduce((sum, client) => sum + Number(client.value || 0), 0);
    const pipeline = state.clients
      .filter((client) => !["afgerond", "ongeinteresseerd"].includes(client.status) && monthKey(client.deadline) === key)
      .reduce((sum, client) => sum + Number(client.value || 0), 0);
    return { key, closed, pipeline, total: closed + pipeline };
  });
  const max = Math.max(1, ...rows.map((row) => row.total));
  const current = rows.at(-1)?.total || 0;
  const previous = rows.at(-2)?.total || 0;
  const growth = previous ? Math.round(((current - previous) / previous) * 100) : (current ? 100 : 0);
  $("#revenueTrend").innerHTML = `
    <div class="chart-bars">
      ${rows.map((row) => `
        <article>
          <div class="bar-stack" title="${money(row.total)}">
            <span class="bar closed" style="height:${Math.max(4, Math.round((row.closed / max) * 160))}px"></span>
            <span class="bar pipeline" style="height:${Math.max(4, Math.round((row.pipeline / max) * 160))}px"></span>
          </div>
          <strong>${monthLabel(row.key)}</strong>
          <em>${money(row.total)}</em>
        </article>
      `).join("")}
    </div>
    <div class="chart-legend"><span><i class="closed"></i>Gesloten</span><span><i class="pipeline"></i>Pipeline</span></div>
  `;
  return growth;
}

function callsInCurrentWeek() {
  const start = new Date(`${iso()}T00:00:00`);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return (state.calls || []).filter((item) => {
    const date = new Date(`${item.date}T00:00:00`);
    return date >= start && date < end;
  });
}

function renderSalesPulse(closeRate, bestNiche, newClients, returningClients) {
  const calls = callsInCurrentWeek();
  const meetingsThisWeek = state.events.filter((event) => isWithinDays(event.date, 7)).length;
  const callProgress = Math.min(100, Math.round((calls.length / CALL_TARGET_WEEK) * 100));
  const appointmentRate = calls.length ? Math.round((meetingsThisWeek / calls.length) * 100) : 0;
  const lastCalls = [...(state.calls || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  $("#salesPulse").innerHTML = `
    <div class="progress-card">
      <div><strong>${calls.length}/${CALL_TARGET_WEEK}</strong><span>calls deze week</span></div>
      <i><b style="width:${callProgress}%"></b></i>
      <em>${calls.length < CALL_TARGET_WEEK ? "Te weinig bellen voor consistente groei." : "Beltempo zit goed."}</em>
    </div>
    <div class="pulse-grid">
      <article><strong>${meetingsThisWeek}</strong><span>afspraken 7d</span></article>
      <article><strong>${appointmentRate}%</strong><span>call naar afspraak</span></article>
      <article><strong>${closeRate}%</strong><span>close rate</span></article>
      <article><strong>${bestNiche.label}</strong><span>beste niche</span></article>
      <article><strong>${newClients}</strong><span>nieuwe klanten</span></article>
      <article><strong>${returningClients}</strong><span>retournerend</span></article>
    </div>
  `;
  $("#callHistory").innerHTML = lastCalls.map(callHtml).join("") || empty("Nog geen calls gelogd.");
}

function callHtml(item) {
  const client = clientById(item.clientId);
  return `<div class="call-row"><strong>${client?.name || "Onbekend"}</strong><span>${niceDate(item.date)} • ${item.owner} • ${item.result}</span></div>`;
}

function clientWorkScore(client) {
  const tasks = state.tasks.filter((task) => task.clientId === client.id).length;
  const events = state.events.filter((event) => event.clientId === client.id).length;
  const calls = (state.calls || []).filter((item) => item.clientId === client.id).length;
  return tasks * 1.5 + events * 2 + calls * 0.35;
}

function renderEfficiencyChart() {
  const rows = state.clients
    .filter((client) => client.status !== "ongeinteresseerd")
    .map((client) => {
      const work = clientWorkScore(client);
      const value = Number(client.value || 0);
      const hourly = Math.round(value / Math.max(1, work));
      return { client, work, value, hourly };
    })
    .sort((a, b) => a.hourly - b.hourly);
  const maxValue = Math.max(1, ...rows.map((row) => row.value));
  $("#efficiencyChart").innerHTML = rows.map((row) => `
    <article class="efficiency-row ${row.hourly < 350 && row.work > 2 ? "warning" : ""}">
      <div>
        <strong>${row.client.name}</strong>
        <span>${money(row.value)} waarde • ${row.work.toFixed(1)} werkpunten • ${money(row.hourly)}/punt</span>
      </div>
      <i><b style="width:${Math.max(6, Math.round((row.value / maxValue) * 100))}%"></b></i>
    </article>
  `).join("") || empty("Geen klantdata.");
}

function renderProfitWarnings({ callsThisWeek, closeRate, openPipeline, closedRevenue, forecast30, bestNiche }) {
  const lowValueWork = state.clients
    .filter((client) => client.status !== "ongeinteresseerd")
    .map((client) => ({ client, work: clientWorkScore(client), value: Number(client.value || 0) }))
    .filter((item) => item.work > 3 && item.value < 1000)
    .sort((a, b) => b.work - a.work);
  const warnings = [];
  if (callsThisWeek < CALL_TARGET_WEEK) warnings.push(["Te weinig bellen", `Nog ${CALL_TARGET_WEEK - callsThisWeek} calls nodig deze week. Zonder genoeg belvolume droogt de agenda op.`]);
  if (forecast30 < 2500) warnings.push(["Forecast is dun", `${money(forecast30)} verwacht binnen 30 dagen. Zet meer leads naar afspraak of verhoog prijs.`]);
  if (lowValueWork.length) warnings.push(["Te veel werk voor lage waarde", `${lowValueWork[0].client.name} vraagt ${lowValueWork[0].work.toFixed(1)} werkpunten voor ${money(lowValueWork[0].value)}.`]);
  if (closeRate < 25) warnings.push(["Close rate te laag", `${closeRate}% close. Verkoopgesprek en demo moeten scherper of leads beter kwalificeren.`]);
  if (openPipeline > closedRevenue * 2 && closedRevenue > 0) warnings.push(["Veel geld blijft open", `${money(openPipeline)} open pipeline tegenover ${money(closedRevenue)} gesloten. Focus op closen, niet alleen nieuwe demos.`]);
  warnings.push(["Beste focus nu", `Niche ${bestNiche.label}: ${bestNiche.hint}. Bouw daar meer vergelijkbare voorbeelden voor.`]);
  $("#profitWarnings").innerHTML = warnings.map(([title, text]) => `<div class="insight"><strong>${title}</strong><span>${text}</span></div>`).join("");
}

function renderBarList(selector, items, total) {
  const rows = Object.entries(items).sort((a, b) => b[1] - a[1]);
  document.querySelector(selector).innerHTML = rows.length ? rows.map(([label, count]) => {
    const width = Math.max(8, Math.round((count / total) * 100));
    return `<div class="bar-row"><div><strong>${label || "Onbekend"}</strong><span>${count}</span></div><i style="width:${width}%"></i></div>`;
  }).join("") : empty("Geen data.");
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "Onbekend";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function countServices() {
  return state.tasks.reduce((acc, task) => {
    acc[task.type] = (acc[task.type] || 0) + 1;
    return acc;
  }, {});
}

function bestCloseNiche() {
  const grouped = {};
  state.clients.forEach((client) => {
    const niche = client.niche || "Onbekend";
    grouped[niche] ||= { total: 0, closed: 0, value: 0 };
    grouped[niche].total += 1;
    grouped[niche].value += Number(client.value || 0);
    if (client.status === "afgerond") grouped[niche].closed += 1;
  });
  const ranked = Object.entries(grouped).sort((a, b) => (b[1].closed / b[1].total) - (a[1].closed / a[1].total) || b[1].value - a[1].value);
  if (!ranked.length) return { label: "-", hint: "geen data" };
  const [label, data] = ranked[0];
  return { label, hint: `${data.closed}/${data.total} gesloten` };
}

function upcomingMeetingStops() {
  return state.events
    .filter((event) => event.date >= iso())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .map((event) => {
      const client = clientById(event.clientId);
      const place = client ? [client.address, client.city].filter(Boolean).join(", ") : event.title;
      return { event, client, title: event.title, place: place || "Leuven" };
    });
}

function buildRouteUrl(stops) {
  if (!stops.length) return "https://www.google.com/maps";
  const destination = encodeURIComponent(stops.at(-1).place);
  const waypoints = stops.slice(0, -1).map((stop) => encodeURIComponent(stop.place)).join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("Leuven")}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}`;
}

function renderMeetingMap(stops) {
  const pins = stops.map((stop, index) => {
    const key = (stop.client?.city || "leuven").toLowerCase();
    const pos = cityPositions[key] || { x: 48 + (index * 7) % 30, y: 48 + (index * 9) % 30 };
    const status = stop.client ? statusLabel(stop.client.status) : "Nog geen klant";
    return `<button class="map-pin ${stop.client ? "known" : "unknown"}" style="left:${pos.x}%;top:${pos.y}%;" title="${stop.title}"><span>${index + 1}</span><strong>${stop.client?.name || stop.title}</strong><em>${status}</em></button>`;
  }).join("");
  $("#meetingMap").innerHTML = `<div class="map-label">Leuven / Aarschot regio</div>${pins || `<div class="muted map-empty">Geen afspraken op de map.</div>`}`;
}

function renderCloseInsights() {
  const grouped = {};
  state.clients.forEach((client) => {
    const niche = client.niche || "Onbekend";
    grouped[niche] ||= { total: 0, closed: 0, openValue: 0 };
    grouped[niche].total += 1;
    if (client.status === "afgerond") grouped[niche].closed += 1;
    if (!["afgerond", "ongeinteresseerd"].includes(client.status)) grouped[niche].openValue += Number(client.value || 0);
  });
  $("#closeInsights").innerHTML = Object.entries(grouped).sort((a, b) => b[1].closed - a[1].closed || b[1].openValue - a[1].openValue).map(([niche, data]) => {
    const rate = Math.round((data.closed / data.total) * 100);
    return `<div class="insight"><strong>${niche}</strong><span>${rate}% close • ${data.closed}/${data.total} gesloten • ${money(data.openValue)} open pipeline</span></div>`;
  }).join("") || empty("Nog geen close-data.");
}

function renderLocalAiInsights() {
  const urgent = state.tasks.filter((task) => task.status !== "done" && task.priority === "hoog").length;
  const missingQuestions = state.clients.filter((client) => !client.questions || client.questions.length < 12).length;
  const stale = state.clients.filter((client) => !["afgerond", "ongeinteresseerd"].includes(client.status) && client.deadline && client.deadline < iso()).length;
  const best = bestCloseNiche();
  $("#localAiInsights").innerHTML = [
    [`${urgent} high-priority taken`, urgent ? "Vandaag eerst oplossen of eigenaar herverdelen." : "Geen hoge prioriteit open."],
    [`${missingQuestions} records met weinig briefing`, "Vraag menu/logo/branding/foto's voordat productie vastloopt."],
    [`${stale} klanten over deadline`, stale ? "Plan follow-up of zet status correct." : "Geen over-deadline records."],
    [`Beste niche nu: ${best.label}`, best.hint]
  ].map(([title, text]) => `<div class="insight"><strong>${title}</strong><span>${text}</span></div>`).join("");
}

function priorityRank(priority) {
  return { hoog: 0, normaal: 1, laag: 2 }[priority] ?? 3;
}

function empty(text) {
  return `<div class="muted">${text}</div>`;
}

function moveClient(id, dir) {
  const client = clientById(id);
  const current = statuses.findIndex(([key]) => key === client.status);
  const next = Math.max(0, Math.min(statuses.length - 1, current + Number(dir)));
  client.status = statuses[next][0];
  save();
  render();
}

function download(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const rows = [["Bedrijf", "Status", "Eigenaar", "Telefoon", "Stad", "Niche", "Volgende actie", "Deadline", "Waarde"]];
  state.clients.forEach((client) => rows.push([client.name, statusLabel(client.status), client.owner, client.phone, client.city, client.niche, client.nextAction, client.deadline, client.value]));
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  download("agency-klanten.csv", csv, "text/csv");
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) setRoute(routeButton.dataset.route);

  const moveButton = event.target.closest("[data-move]");
  if (moveButton) moveClient(moveButton.dataset.move, moveButton.dataset.dir);

  const quickTask = event.target.closest("[data-quick-task]");
  if (quickTask) {
    setRoute("tasks");
    $("#taskClient").value = quickTask.dataset.quickTask;
    $("#taskForm input[name='title']").focus();
  }

  const taskStatus = event.target.closest("[data-task-status]");
  if (taskStatus) {
    const item = state.tasks.find((task) => task.id === taskStatus.dataset.taskStatus);
    item.status = taskStatus.dataset.status;
    save();
    render();
  }

  const deleteTask = event.target.closest("[data-delete-task]");
  if (deleteTask) {
    state.tasks = state.tasks.filter((task) => task.id !== deleteTask.dataset.deleteTask);
    save();
    render();
  }

  const deleteEvent = event.target.closest("[data-delete-event]");
  if (deleteEvent) {
    state.events = state.events.filter((item) => item.id !== deleteEvent.dataset.deleteEvent);
    save();
    render();
  }

  const deleteClient = event.target.closest("[data-delete-client]");
  if (deleteClient && confirm("Klant verwijderen?")) {
    state.clients = state.clients.filter((client) => client.id !== deleteClient.dataset.deleteClient);
    state.tasks = state.tasks.filter((task) => task.clientId !== deleteClient.dataset.deleteClient);
    state.events = state.events.filter((item) => item.clientId !== deleteClient.dataset.deleteClient);
    save();
    render();
  }

  const agendaButton = event.target.closest("[data-agenda-range]");
  if (agendaButton) {
    agendaRange = agendaButton.dataset.agendaRange;
    $$("#agendaRangeControls button").forEach((button) => button.classList.toggle("active", button === agendaButton));
    renderAgenda();
  }

  const taskModeButton = event.target.closest("[data-task-mode]");
  if (taskModeButton) {
    taskMode = taskModeButton.dataset.taskMode;
    $$("#taskModeControls button").forEach((button) => button.classList.toggle("active", button === taskModeButton));
    renderTasks();
  }
});

$("#globalSearch").addEventListener("input", (event) => {
  query = event.target.value.trim();
  render();
});

$("#ownerFilter").addEventListener("change", (event) => {
  ownerFilter = event.target.value;
  render();
});

$("#priorityFilter").addEventListener("change", (event) => {
  priorityFilter = event.target.value;
  render();
});

$("#clearFilters").addEventListener("click", () => {
  ownerFilter = "all";
  priorityFilter = "all";
  $("#ownerFilter").value = "all";
  $("#priorityFilter").value = "all";
  render();
});

$("#openClientModal").addEventListener("click", () => $("#clientModal").showModal());
$("#closeClientModal").addEventListener("click", () => $("#clientModal").close());

$("#clientForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.clients.unshift({ id: crypto.randomUUID(), ...data, value: Number(data.value || 0) });
  save();
  event.currentTarget.reset();
  $("#clientModal").close();
  render();
});

$("#taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.tasks.unshift({ id: crypto.randomUUID(), ...data, status: "open" });
  save();
  event.currentTarget.reset();
  render();
});

$("#eventForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.events.push({ id: crypto.randomUUID(), ...data, duration: 60 });
  save();
  event.currentTarget.reset();
  render();
});

$("#callForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.calls.unshift({ id: crypto.randomUUID(), ...data });
  save();
  event.currentTarget.reset();
  render();
});

$("#exportJsonBtn").addEventListener("click", () => download("agency-command-center-backup.json", JSON.stringify(state, null, 2)));
$("#exportCsvBtn").addEventListener("click", exportCsv);

$("#importJsonInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const imported = JSON.parse(await file.text());
  if (!imported.clients || !imported.tasks || !imported.events) {
    alert("Ongeldig bestand.");
    return;
  }
  state = migrate(imported);
  save();
  render();
});

$("#resetDemoBtn").addEventListener("click", () => {
  if (!confirm("Demo data resetten? Je huidige lokale data wordt overschreven.")) return;
  state = structuredClone(seedData);
  save();
  render();
});

render();

window.addEventListener("hashchange", () => {
  const next = location.hash.slice(1);
  if (routes.includes(next)) {
    setRoute(next, false);
  }
});

const initialRoute = location.hash.slice(1);
if (routes.includes(initialRoute)) {
  setRoute(initialRoute, false);
}
