/* =========================================================================
   Spice Street – QR menu
   -------------------------------------------------------------------------
   One script shared by the landing page, the customer menu and the admin
   dashboard.

   How live updates work
   ---------------------
   • menu-data.json (in this repository) is the single source of truth for
     prices and availability. GitHub Pages serves it next to this file.
   • Every page downloads menu-data.json, caches it in localStorage and
     re-checks it periodically, so customers always see the latest menu.
   • When the admin changes a price or toggles Available / Sold out, the
     change is saved on the device immediately and then committed to
     menu-data.json on GitHub through the GitHub REST API (a fine-grained
     token that the admin pastes once in "GitHub settings"). Changes made
     within a couple of seconds are batched into a single commit. GitHub
     Pages redeploys automatically, and the customer menu updates.
   ========================================================================= */

/* ------------------------------------------------------------------ Theme */
const THEME_KEY = "spice-street-theme-v1";
function applyTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved === "light" ? "light" : "dark";
  document.body.classList.toggle("light", theme === "light");
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
}
function toggleTheme() {
  const next = document.body.classList.contains("light") ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme();
}
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
applyTheme();
window.addEventListener("pageshow", applyTheme);

/* ---------------------------------------------------------------- Catalog */
const CATEGORIES = {
  "Biriyani & Rice": "🍚", "Starters": "🍗", "South Indian": "🥘", "Breads": "🫓",
  "Curries": "🍛", "Pizza": "🍕", "Burgers & Sandwiches": "🍔", "Chinese": "🥡",
  "Pasta": "🍝", "Desserts": "🍰", "Ice Cream": "🍨", "Drinks": "🥤"
};
const DISHES = [
{id:1,name:"Chicken Biriyani",category:"Biriyani & Rice",price:120,description:"Basmati rice, chicken and aromatic spices."},
{id:2,name:"Mutton Biriyani",category:"Biriyani & Rice",price:180,description:"Slow-cooked mutton with fragrant biriyani rice."},
{id:3,name:"Egg Biriyani",category:"Biriyani & Rice",price:110,description:"Fragrant biriyani rice with seasoned boiled egg."},
{id:4,name:"Veg Biriyani",category:"Biriyani & Rice",price:100,description:"Basmati rice cooked with fresh vegetables and spices."},
{id:5,name:"Mushroom Biriyani",category:"Biriyani & Rice",price:120,description:"Aromatic rice with tender mushrooms and herbs."},
{id:6,name:"Jeera Rice",category:"Biriyani & Rice",price:80,description:"Steamed basmati rice tempered with cumin."},
{id:7,name:"Chicken 65",category:"Starters",price:110,description:"Crispy, spicy South Indian chicken starter."},
{id:8,name:"Paneer 65",category:"Starters",price:100,description:"Crispy paneer tossed with Indian spices."},
{id:9,name:"Chicken Lollipop",category:"Starters",price:150,description:"Crispy chicken wings coated in spicy masala."},
{id:10,name:"Gobi 65",category:"Starters",price:90,description:"Crispy cauliflower with chilli and curry leaves."},
{id:11,name:"Mushroom Pepper Fry",category:"Starters",price:100,description:"Mushroom tossed with cracked pepper and onions."},
{id:12,name:"Idli",category:"South Indian",price:40,description:"Soft steamed rice cakes served with chutney and sambar."},
{id:13,name:"Vada",category:"South Indian",price:45,description:"Crispy lentil fritter served with chutney."},
{id:14,name:"Plain Dosa",category:"South Indian",price:55,description:"Golden crispy dosa with chutney and sambar."},
{id:15,name:"Masala Dosa",category:"South Indian",price:80,description:"Crispy dosa filled with seasoned potato masala."},
{id:16,name:"Ghee Roast Dosa",category:"South Indian",price:95,description:"Thin dosa roasted with aromatic ghee."},
{id:17,name:"Pongal",category:"South Indian",price:60,description:"Comforting rice and lentil pongal with ghee."},
{id:18,name:"Veg Meals",category:"South Indian",price:100,description:"Rice, vegetables, sambar, rasam and sides."},
{id:19,name:"Parotta",category:"Breads",price:25,description:"Flaky layered South Indian flatbread."},
{id:20,name:"Egg Parotta",category:"Breads",price:70,description:"Layered parotta tossed with egg and spices."},
{id:21,name:"Chapati",category:"Breads",price:35,description:"Soft whole-wheat flatbread."},
{id:22,name:"Butter Naan",category:"Breads",price:55,description:"Soft naan brushed with butter."},
{id:23,name:"Garlic Naan",category:"Breads",price:65,description:"Tandoor-baked naan with garlic and coriander."},
{id:24,name:"Chicken Curry",category:"Curries",price:130,description:"Homestyle chicken curry with rich spices."},
{id:25,name:"Mutton Curry",category:"Curries",price:180,description:"Tender mutton cooked in a traditional masala."},
{id:26,name:"Fish Curry",category:"Curries",price:150,description:"South Indian fish curry with tangy spices."},
{id:27,name:"Paneer Butter Masala",category:"Curries",price:130,description:"Paneer in a creamy tomato and butter gravy."},
{id:28,name:"Dal Tadka",category:"Curries",price:90,description:"Yellow lentils finished with a fragrant tempering."},
{id:29,name:"Margherita Pizza",category:"Pizza",price:180,description:"Tomato, mozzarella and basil on a crisp base."},
{id:30,name:"Veggie Pizza",category:"Pizza",price:220,description:"Onion, capsicum, corn and tomato with cheese."},
{id:31,name:"Paneer Tikka Pizza",category:"Pizza",price:250,description:"Paneer tikka, onion and capsicum with cheese."},
{id:32,name:"Chicken Tikka Pizza",category:"Pizza",price:280,description:"Chicken tikka, onion and capsicum on a cheesy base."},
{id:33,name:"Cheese Burst Pizza",category:"Pizza",price:260,description:"Loaded cheese pizza with a rich cheese-filled crust."},
{id:34,name:"Classic Veg Burger",category:"Burgers & Sandwiches",price:100,description:"Crispy veg patty with lettuce, tomato and sauce."},
{id:35,name:"Chicken Burger",category:"Burgers & Sandwiches",price:140,description:"Juicy chicken patty with fresh salad and sauce."},
{id:36,name:"Paneer Burger",category:"Burgers & Sandwiches",price:130,description:"Spiced paneer patty with creamy sauce."},
{id:37,name:"Grilled Cheese Sandwich",category:"Burgers & Sandwiches",price:90,description:"Toasted bread with melted cheese and herbs."},
{id:38,name:"Chicken Club Sandwich",category:"Burgers & Sandwiches",price:150,description:"Triple-layer sandwich with chicken, egg and salad."},
{id:39,name:"Veg Hakka Noodles",category:"Chinese",price:120,description:"Wok-tossed noodles with vegetables and sauces."},
{id:40,name:"Chicken Hakka Noodles",category:"Chinese",price:150,description:"Wok-tossed noodles with chicken and vegetables."},
{id:41,name:"Veg Fried Rice",category:"Chinese",price:110,description:"Fragrant fried rice with fresh vegetables."},
{id:42,name:"Chicken Fried Rice",category:"Chinese",price:140,description:"Wok-fried rice with chicken, egg and vegetables."},
{id:43,name:"Gobi Manchurian",category:"Chinese",price:110,description:"Crispy cauliflower in a tangy Manchurian sauce."},
{id:44,name:"White Sauce Pasta",category:"Pasta",price:150,description:"Creamy pasta with herbs and vegetables."},
{id:45,name:"Arrabbiata Pasta",category:"Pasta",price:140,description:"Pasta in a spicy tomato and garlic sauce."},
{id:46,name:"Chicken Alfredo Pasta",category:"Pasta",price:190,description:"Creamy Alfredo pasta with tender chicken."},
{id:47,name:"Pesto Veg Pasta",category:"Pasta",price:170,description:"Pasta tossed with basil pesto and vegetables."},
{id:48,name:"Gulab Jamun",category:"Desserts",price:50,description:"Soft milk-solid dumplings in sugar syrup."},
{id:49,name:"Brownie",category:"Desserts",price:80,description:"Warm chocolate brownie with a rich fudgy center."},
{id:50,name:"Chocolate Cake",category:"Desserts",price:90,description:"Moist chocolate cake with creamy frosting."},
{id:51,name:"Carrot Halwa",category:"Desserts",price:70,description:"Slow-cooked carrot dessert with milk and nuts."},
{id:52,name:"Payasam",category:"Desserts",price:60,description:"Traditional South Indian milk and vermicelli dessert."},
{id:53,name:"Vanilla Ice Cream",category:"Ice Cream",price:60,description:"Classic creamy vanilla scoop."},
{id:54,name:"Chocolate Ice Cream",category:"Ice Cream",price:70,description:"Rich chocolate ice cream scoop."},
{id:55,name:"Mango Ice Cream",category:"Ice Cream",price:70,description:"Creamy seasonal mango ice cream."},
{id:56,name:"Ice Cream Sundae",category:"Ice Cream",price:110,description:"Scoops topped with chocolate sauce and nuts."},
{id:57,name:"Lime Juice",category:"Drinks",price:30,description:"Fresh lime juice served chilled."},
{id:58,name:"Fresh Fruit Juice",category:"Drinks",price:60,description:"Seasonal fresh fruit juice."},
{id:59,name:"Mango Juice",category:"Drinks",price:70,description:"Refreshing mango juice."},
{id:60,name:"Fresh Lime Soda",category:"Drinks",price:40,description:"Chilled lime soda with a refreshing fizz."},
{id:61,name:"Cold Coffee",category:"Drinks",price:90,description:"Chilled creamy coffee drink."},
{id:62,name:"Masala Tea",category:"Drinks",price:30,description:"Hot Indian tea brewed with aromatic spices."}
];
const DISH_BY_ID = new Map(DISHES.map(d => [d.id, d]));

/* ---------------------------------------------------------- Configuration */
// A page may override these before app.js loads: window.SPICE_STREET_CONFIG = {...}
const CONFIG = Object.assign({
  repo: "Megesh123/qr-food-menu",   // GitHub repository that hosts this site
  branch: "main",                   // branch GitHub Pages deploys from
  dataPath: "menu-data.json",       // published menu file inside the repo
  apiBase: "https://api.github.com",
  publishDebounceMs: 2500,          // wait for more clicks before committing
  publishMaxWaitMs: 8000,           // ...but never wait longer than this
  customerPollMs: 60 * 1000,        // how often the customer menu re-checks
  adminPollMs: 30 * 1000,
  liveCheckPollMs: 8 * 1000,        // faster polling right after a publish
  liveCheckMaxMs: 6 * 60 * 1000
}, window.SPICE_STREET_CONFIG || {});

// menu-data.json lives next to app.js, wherever the site is hosted.
const PUBLISHED_MENU_URL = (() => {
  try { return new URL(CONFIG.dataPath, document.currentScript.src).href; }
  catch (e) { return "/" + CONFIG.dataPath; }
})();

const MENU_STATE_KEY = "spice-street-menu-state-v3";      // cached menu (all pages)
const PENDING_KEY = "spice-street-pending-changes-v1";    // admin changes not yet on GitHub
const GITHUB_TOKEN_KEY = "spice-street-github-token-v2";
const GITHUB_USER_KEY = "spice-street-github-user-v1";
const ADMIN_SESSION = "spice-street-admin-session";

// Keys used by earlier versions of this app. The published file is now the
// source of truth, so stale copies are simply dropped.
["spice-street-availability-v2", "spice-street-prices-v1", "spice-street-github-token-v1"]
  .forEach(k => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {} });

/* ---------------------------------------------------------- Small helpers */
const $ = id => document.getElementById(id);
function readJSON(storage, key, fallback) {
  try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}
function writeJSON(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function parseTime(iso) { const t = Date.parse(iso || ""); return Number.isFinite(t) ? t : 0; }
function formatTime(iso) {
  const t = parseTime(iso);
  if (!t) return "";
  return new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function base64ToUtf8(b64) {
  const bin = atob(String(b64).replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* --------------------------------------------------------- Menu state */
// state = { updatedAt: ISO string, availability: {id: bool}, prices: {id: number} }
function defaultState() {
  const availability = {}, prices = {};
  DISHES.forEach(d => { availability[d.id] = true; prices[d.id] = d.price; });
  return { updatedAt: "", availability, prices };
}
function normalizeState(raw) {
  const state = defaultState();
  if (!raw || typeof raw !== "object") return state;
  DISHES.forEach(d => {
    if (raw.availability && typeof raw.availability[d.id] === "boolean") state.availability[d.id] = raw.availability[d.id];
    const p = raw.prices ? Number(raw.prices[d.id]) : NaN;
    if (Number.isFinite(p) && p >= 0) state.prices[d.id] = p;
  });
  state.updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : "";
  return state;
}
function stateFromItems(items, updatedAt) {
  const state = defaultState();
  (items || []).forEach(item => {
    const id = Number(item && item.id);
    if (!DISH_BY_ID.has(id)) return;
    if (typeof item.available === "boolean") state.availability[id] = item.available;
    const p = Number(item.price);
    if (Number.isFinite(p) && p >= 0) state.prices[id] = p;
  });
  state.updatedAt = typeof updatedAt === "string" ? updatedAt : "";
  return state;
}
function itemsFromState(state) {
  return DISHES.map(d => ({
    id: d.id, name: d.name, category: d.category,
    price: state.prices[d.id], description: d.description,
    available: state.availability[d.id]
  }));
}
// patch = { [id]: { available?: bool, price?: number } }
function applyPatch(state, patch) {
  const next = normalizeState(state);
  Object.keys(patch || {}).forEach(key => {
    const id = Number(key), change = patch[key];
    if (!DISH_BY_ID.has(id) || !change) return;
    if (typeof change.available === "boolean") next.availability[id] = change.available;
    if (Number.isFinite(change.price) && change.price >= 0) next.prices[id] = change.price;
  });
  return next;
}
function mergePatches(older, newer) {
  const out = {};
  [older, newer].forEach(p => Object.keys(p || {}).forEach(id => { out[id] = Object.assign({}, out[id] || {}, p[id]); }));
  return out;
}
function hasLocalState() { try { return localStorage.getItem(MENU_STATE_KEY) !== null; } catch (e) { return false; } }
function loadState() { return normalizeState(readJSON(localStorage, MENU_STATE_KEY, null)); }
function saveState(state) { writeJSON(localStorage, MENU_STATE_KEY, state); }

/* ------------------------------------------------------------- Rendering */
function renderCustomer() {
  const menu = $("menu");
  if (!menu) return;
  const state = loadState();
  const groups = {};
  DISHES.forEach(d => { (groups[d.category] = groups[d.category] || []).push(d); });
  let html = "";
  Object.entries(groups).forEach(([category, dishes]) => {
    html += '<section class="category-section"><div class="category-heading"><div class="category-icon">' + (CATEGORIES[category] || "🍽️") +
      '</div><div><h2>' + esc(category) + '</h2><p>' + dishes.length + ' items</p></div></div><div class="menu-grid">';
    dishes.forEach(d => {
      const on = state.availability[d.id];
      html += '<article class="menu-card ' + (on ? "" : "sold") + '"><div><div class="category">' + esc(category) +
        '</div><div class="dish-name">' + esc(d.name) + '</div><div class="description">' + esc(d.description) +
        '</div><div class="price">₹' + state.prices[d.id] + '</div></div><div class="badge ' + (on ? "on" : "off") + '">' +
        (on ? "✓ Available" : "✕ Sold out") + '</div></article>';
    });
    html += "</div></section>";
  });
  menu.innerHTML = html;
  const updated = $("menuUpdated");
  if (updated) updated.textContent = state.updatedAt ? "Menu updated " + formatTime(state.updatedAt) : "";
}

const adminLogin = $("adminLogin");
const adminApp = $("adminApp");
const IS_ADMIN = Boolean(adminApp);
function adminVisible() { return IS_ADMIN && !adminApp.hidden; }

function buildAdminList(state) {
  let html = "", lastCategory = "";
  DISHES.forEach(d => {
    const icon = CATEGORIES[d.category] || "🍽️";
    if (lastCategory !== d.category) {
      html += '<div class="admin-category">' + icon + " " + esc(d.category) + "</div>";
      lastCategory = d.category;
    }
    html += '<div class="admin-row" data-row="' + d.id + '"><div class="admin-info"><div class="admin-food-icon">' + icon +
      '</div><div><strong>' + esc(d.name) + '</strong>' +
      '<form class="price-editor" data-price-form="' + d.id + '" autocomplete="off"><span>₹</span>' +
      '<input class="price-input" type="number" inputmode="numeric" min="0" step="1" value="' + state.prices[d.id] +
      '" data-price-id="' + d.id + '" data-saved="' + state.prices[d.id] + '" aria-label="Price for ' + esc(d.name) + '">' +
      '<button class="price-save" type="submit">Save</button></form></div></div>' +
      '<button class="toggle" type="button" data-id="' + d.id + '"></button></div>';
  });
  return html;
}
// Builds the list once, then updates rows in place so that a price the admin
// is still typing is never wiped by a re-render or a background sync.
function renderAdmin() {
  const list = $("adminMenu");
  if (!list || !adminVisible()) return;
  const state = loadState();
  const available = DISHES.filter(d => state.availability[d.id]).length;
  $("availableCount").textContent = available;
  $("soldOutCount").textContent = DISHES.length - available;
  if (!list.querySelector(".admin-row")) list.innerHTML = buildAdminList(state);
  DISHES.forEach(d => {
    const row = list.querySelector('[data-row="' + d.id + '"]');
    if (!row) return;
    const on = state.availability[d.id];
    const btn = row.querySelector(".toggle");
    btn.className = "toggle " + (on ? "on" : "off");
    btn.textContent = on ? "AVAILABLE" : "SOLD OUT";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    const input = row.querySelector(".price-input");
    const saved = String(state.prices[d.id]);
    if (input.dataset.saved !== saved) {
      if (input.value === input.dataset.saved) input.value = saved; // untouched → show the new saved price
      input.dataset.saved = saved;
    }
  });
  renderSyncStatus();
}
function renderAll() { renderCustomer(); renderAdmin(); }

/* ------------------------------------------------------- Published menu */
let lastRemoteUpdatedAt = "";
let lastFetchAt = 0;
let syncInFlight = null;

async function fetchPublishedMenu() {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 8000) : null;
  try {
    const url = PUBLISHED_MENU_URL + (PUBLISHED_MENU_URL.includes("?") ? "&" : "?") + "v=" + Date.now();
    const res = await fetch(url, { cache: "no-store", signal: controller ? controller.signal : undefined });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.items)) throw new Error("Invalid menu data");
    return data;
  } catch (e) {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Pulls menu-data.json and applies it when it is newer than what we have.
// Never overwrites admin changes that are still waiting to be published.
function syncFromPublished({ force = false } = {}) {
  if (syncInFlight) return syncInFlight;
  syncInFlight = (async () => {
    lastFetchAt = Date.now();
    const remote = await fetchPublishedMenu();
    if (!remote) return null;
    lastRemoteUpdatedAt = remote.updatedAt || "";
    const local = loadState();
    const remoteTime = parseTime(remote.updatedAt);
    const dirty = IS_ADMIN && publisher.isDirty();
    if (!dirty && (force || !local.updatedAt || remoteTime > parseTime(local.updatedAt))) {
      saveState(stateFromItems(remote.items, remote.updatedAt));
      renderAll();
    }
    if (IS_ADMIN) publisher.onRemoteSeen(remoteTime);
    return remote;
  })().finally(() => { syncInFlight = null; });
  return syncInFlight;
}

function pollInterval() {
  if (IS_ADMIN && publisher.status === "published" && Date.now() - publisher.publishedAt < CONFIG.liveCheckMaxMs) return CONFIG.liveCheckPollMs;
  return IS_ADMIN ? CONFIG.adminPollMs : CONFIG.customerPollMs;
}
function startPolling() {
  setInterval(() => {
    if (document.hidden) return;
    if (Date.now() - lastFetchAt >= pollInterval()) syncFromPublished();
  }, 2000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - lastFetchAt > 10 * 1000) syncFromPublished();
  });
  window.addEventListener("online", () => { syncFromPublished(); if (IS_ADMIN) publisher.schedule(); });
  window.addEventListener("offline", () => { if (IS_ADMIN) renderSyncStatus(); });
}

/* ------------------------------------------------------- GitHub client */
class PublishError extends Error {
  constructor(message, { status = 0, retryable = false, auth = false } = {}) {
    super(message);
    this.status = status; this.retryable = retryable; this.auth = auth;
  }
}
function getToken() { try { return localStorage.getItem(GITHUB_TOKEN_KEY) || ""; } catch (e) { return ""; } }
function setToken(token, login) {
  try {
    if (token) { localStorage.setItem(GITHUB_TOKEN_KEY, token); if (login) localStorage.setItem(GITHUB_USER_KEY, login); }
    else { localStorage.removeItem(GITHUB_TOKEN_KEY); localStorage.removeItem(GITHUB_USER_KEY); }
  } catch (e) {}
}
function getGitHubUser() { try { return localStorage.getItem(GITHUB_USER_KEY) || ""; } catch (e) { return ""; } }
function authHeaders(token) {
  return { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
}
function contentsUrl() { return CONFIG.apiBase + "/repos/" + CONFIG.repo + "/contents/" + CONFIG.dataPath; }

async function githubError(res) {
  let message = "";
  try { const body = await res.json(); message = body && body.message ? body.message : ""; } catch (e) {}
  const status = res.status;
  if (status === 401) return new PublishError("GitHub rejected the token (expired or revoked). Connect GitHub again.", { status, auth: true });
  if (status === 403 && /rate limit/i.test(message)) return new PublishError("GitHub API rate limit reached. Try again in a few minutes.", { status, retryable: true });
  if (status === 403) return new PublishError("The token is not allowed to write to " + CONFIG.repo + ". Edit the token: Repository permissions → Contents → Read and write.", { status, auth: true });
  if (status === 404) return new PublishError("The token has no access to " + CONFIG.repo + ". Edit the token: Repository access → Only select repositories → " + CONFIG.repo.split("/")[1] + ".", { status, auth: true });
  if (status === 409) return new PublishError("GitHub reported a conflicting update. Retrying…", { status, retryable: true });
  if (status >= 500) return new PublishError("GitHub is having trouble (HTTP " + status + "). Will retry.", { status, retryable: true });
  return new PublishError(message || ("GitHub error (HTTP " + status + ")"), { status });
}
async function ghFetch(url, token, options = {}) {
  let res;
  try {
    res = await fetch(url, Object.assign({ cache: "no-store" }, options, { headers: Object.assign(authHeaders(token), options.headers || {}) }));
  } catch (e) {
    throw new PublishError("Could not reach GitHub. Check the internet connection.", { retryable: true });
  }
  if (!res.ok) throw await githubError(res);
  return res;
}
// Checks that the token is valid and can see the repository. Write access is
// confirmed by the first publish (a clear error is shown if it is missing).
async function verifyToken(token) {
  let login = "";
  try {
    const user = await (await ghFetch(CONFIG.apiBase + "/user", token)).json();
    login = user.login || "";
  } catch (err) {
    if (err.status === 401 || err.retryable) throw err; // invalid token / no network
    // other token types (e.g. GitHub App tokens) cannot call /user – fine.
  }
  // A fine-grained token without access to the repository gets a 404 here.
  await ghFetch(CONFIG.apiBase + "/repos/" + CONFIG.repo, token);
  return login;
}
async function fetchRepoMenuFile(token) {
  const res = await ghFetch(contentsUrl() + "?ref=" + encodeURIComponent(CONFIG.branch), token).catch(err => {
    if (err.status === 404) return null; // first publish: file does not exist yet
    throw err;
  });
  if (!res) return { sha: "", data: null };
  const file = await res.json();
  let data = null;
  try { data = JSON.parse(base64ToUtf8(file.content)); } catch (e) { data = null; }
  return { sha: file.sha || "", data: data && Array.isArray(data.items) ? data : null };
}
function describeChange(id, change) {
  const dish = DISH_BY_ID.get(Number(id));
  const parts = [];
  if (typeof change.available === "boolean") parts.push(change.available ? "available" : "sold out");
  if (Number.isFinite(change.price)) parts.push("price ₹" + change.price);
  return (dish ? dish.name : "Item " + id) + " → " + parts.join(", ");
}
function commitMessage(batch) {
  const ids = Object.keys(batch);
  if (ids.length === 0) return "menu: update menu data";
  if (ids.length <= 3) return "menu: " + ids.map(id => describeChange(id, batch[id])).join("; ");
  const availability = ids.filter(id => typeof batch[id].available === "boolean").length;
  const prices = ids.filter(id => Number.isFinite(batch[id].price)).length;
  const details = [];
  if (availability) details.push(availability + " availability");
  if (prices) details.push(prices + " price" + (prices === 1 ? "" : "s"));
  return "menu: update " + ids.length + " items (" + details.join(", ") + ")";
}

// Commits `batch` on top of whatever is currently on GitHub (so two phones
// editing at the same time do not overwrite each other) and returns the
// state that is now published.
async function publishToGitHub(token, batch, { onAttempt } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (onAttempt) onAttempt(attempt);
    const remote = await fetchRepoMenuFile(token);
    const base = remote.data ? stateFromItems(remote.data.items, remote.data.updatedAt) : loadState();
    const next = applyPatch(base, batch);
    const remoteTime = remote.data ? parseTime(remote.data.updatedAt) : 0;
    next.updatedAt = new Date(Math.max(Date.now(), remoteTime + 1000)).toISOString();
    const payload = { version: 1, updatedAt: next.updatedAt, items: itemsFromState(next) };
    const body = { message: commitMessage(batch), content: utf8ToBase64(JSON.stringify(payload, null, 2) + "\n"), branch: CONFIG.branch };
    if (remote.sha) body.sha = remote.sha;
    try {
      const res = await ghFetch(contentsUrl(), token, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await res.json().catch(() => ({}));
      return { state: next, commitSha: result && result.commit ? result.commit.sha : "", commitUrl: result && result.commit ? result.commit.html_url : "" };
    } catch (err) {
      lastError = err;
      if (err.status === 409 || err.status === 422) continue; // someone else committed in between → re-read and retry
      throw err;
    }
  }
  throw lastError || new PublishError("Could not publish after several attempts.", { retryable: true });
}

/* ------------------------------------------------------------ Publisher */
// Batches admin changes and commits them to GitHub automatically.
const publisher = {
  pending: readJSON(localStorage, PENDING_KEY, {}) || {},
  status: "idle",       // idle | disconnected | offline | pending | publishing | published | live | error
  detail: "",
  inFlight: false,
  rerun: false,
  timer: null,
  maxTimer: null,
  retryTimer: null,
  retryCount: 0,
  publishedAt: 0,       // Date.now() of the last successful commit
  lastPublishedUpdatedAt: "",
  lastCommitUrl: "",

  hasPending() { return Object.keys(this.pending).length > 0; },
  pendingCount() { return Object.keys(this.pending).length; },
  isDirty() { return this.inFlight || this.hasPending(); },
  persistPending() { writeJSON(localStorage, PENDING_KEY, this.pending); },
  addPending(patch) { this.pending = mergePatches(this.pending, patch); this.persistPending(); },
  discardPending() {
    this.pending = {}; this.persistPending();
    clearTimeout(this.timer); clearTimeout(this.maxTimer); clearTimeout(this.retryTimer);
    this.timer = this.maxTimer = this.retryTimer = null;
    this.setStatus("idle");
    // Forget the local copy's timestamp so the next successful read of the
    // published menu (even an identical one) replaces the discarded edits.
    const state = loadState(); state.updatedAt = ""; saveState(state);
    syncFromPublished({ force: true });
  },
  setStatus(status, detail) {
    this.status = status; this.detail = detail || "";
    renderSyncStatus();
  },

  // Called after every admin change.
  schedule() {
    if (!IS_ADMIN || !this.hasPending()) return;
    if (!getToken()) { this.setStatus("disconnected"); openSyncSettings(); return; }
    if (navigator.onLine === false) { this.setStatus("offline"); return; }
    if (this.inFlight) { this.rerun = true; return; }
    this.setStatus("pending");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.publishNow(), CONFIG.publishDebounceMs);
    if (!this.maxTimer) this.maxTimer = setTimeout(() => this.publishNow(), CONFIG.publishMaxWaitMs);
  },

  async publishNow() {
    clearTimeout(this.timer); clearTimeout(this.maxTimer); clearTimeout(this.retryTimer);
    this.timer = this.maxTimer = this.retryTimer = null;
    if (this.inFlight) { this.rerun = true; return; }
    if (!this.hasPending()) return;
    const token = getToken();
    if (!token) { this.setStatus("disconnected"); openSyncSettings(); return; }
    if (navigator.onLine === false) { this.setStatus("offline"); return; }

    const batch = this.pending;
    this.pending = {}; this.persistPending();
    this.inFlight = true;
    this.setStatus("publishing");
    try {
      const result = await publishToGitHub(token, batch, {
        onAttempt: n => { if (n > 0) this.setStatus("publishing", "Someone else just updated the menu – merging and retrying…"); }
      });
      // The published state is now the truth; keep any clicks made meanwhile on top.
      const merged = applyPatch(result.state, this.pending);
      merged.updatedAt = result.state.updatedAt;
      saveState(merged);
      this.retryCount = 0;
      this.publishedAt = Date.now();
      this.lastPublishedUpdatedAt = result.state.updatedAt;
      this.lastCommitUrl = result.commitUrl || "";
      this.inFlight = false;
      this.setStatus("published");
      renderAll();
      lastFetchAt = 0; // start checking for the redeploy straight away
    } catch (err) {
      this.pending = mergePatches(batch, this.pending); // put the batch back, newer clicks win
      this.persistPending();
      this.inFlight = false;
      if (err.auth) {
        setToken("");
        this.setStatus("disconnected", err.message);
        openSyncSettings(err.message, "err");
      } else {
        this.setStatus("error", err.message || "Could not publish to GitHub.");
        if (err.retryable && this.retryCount < 6) {
          const delay = Math.min(2 * 60 * 1000, 5000 * Math.pow(2, this.retryCount++));
          this.retryTimer = setTimeout(() => this.publishNow(), delay);
        }
      }
      return;
    }
    if (this.rerun || this.hasPending()) { this.rerun = false; this.schedule(); }
  },

  onRemoteSeen(remoteTime) {
    if (this.status === "published" && this.lastPublishedUpdatedAt && remoteTime >= parseTime(this.lastPublishedUpdatedAt)) {
      this.setStatus("live");
    } else if (this.status === "published") {
      renderSyncStatus();
    }
  }
};

/* ------------------------------------------------------- Admin actions */
function recordChange(patch) {
  const state = applyPatch(loadState(), patch);
  saveState(state);
  publisher.addPending(patch);
  renderAll();
  publisher.schedule();
}
function setAvailability(id, available) {
  const state = loadState();
  if (state.availability[id] === available) return;
  recordChange({ [id]: { available } });
}
function setPrice(id, price) {
  const value = Math.round(Number(price));
  if (!Number.isFinite(value) || value < 0) return false;
  const state = loadState();
  if (state.prices[id] === value) return true;
  recordChange({ [id]: { price: value } });
  return true;
}
function resetAllAvailable() {
  const state = loadState();
  const patch = {};
  DISHES.forEach(d => { if (!state.availability[d.id]) patch[d.id] = { available: true }; });
  if (Object.keys(patch).length) recordChange(patch);
}

/* --------------------------------------------------------- Sync panel UI */
function openSyncSettings(message, kind) {
  const panel = $("syncSettings");
  if (!panel) return;
  panel.hidden = false;
  const btn = $("syncSettingsBtn");
  if (btn) btn.setAttribute("aria-expanded", "true");
  if (message !== undefined) setTokenMessage(message, kind);
}
function toggleSyncSettings() {
  const panel = $("syncSettings");
  if (!panel) return;
  panel.hidden = !panel.hidden;
  const btn = $("syncSettingsBtn");
  if (btn) btn.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
}
function setTokenMessage(text, kind) {
  const el = $("tokenMessage");
  if (!el) return;
  el.textContent = text || "";
  el.className = "sync-message" + (kind ? " " + kind : "");
}
function renderSyncStatus() {
  const title = $("syncTitle"), detail = $("syncDetail"), dot = $("syncDot");
  if (!title || !detail || !dot) return;
  const token = getToken();
  const user = getGitHubUser();
  const pending = publisher.pendingCount();
  const who = user ? " as @" + user : "";
  const repoLink = '<a href="https://github.com/' + esc(CONFIG.repo) + '" target="_blank" rel="noopener">' + esc(CONFIG.repo) + "</a>";
  let status = publisher.status;
  if (!token) status = "disconnected";
  else if (status === "idle" && pending) status = "pending";
  else if (status === "offline" && navigator.onLine !== false) status = "pending";
  else if (navigator.onLine === false && (pending || status === "pending")) status = "offline";

  let tone = "ok", head = "", body = "";
  switch (status) {
    case "disconnected":
      tone = "off";
      head = "GitHub not connected";
      body = pending
        ? pending + " change" + (pending === 1 ? "" : "s") + " saved on this device only. Connect GitHub to publish " + (pending === 1 ? "it" : "them") + " to the customer menu."
        : "Connect GitHub so price and availability changes publish to the customer menu automatically.";
      if (publisher.detail) body = esc(publisher.detail) + " " + body;
      break;
    case "offline":
      tone = "busy";
      head = "You're offline";
      body = pending + " change" + (pending === 1 ? "" : "s") + " saved on this device. " + (pending === 1 ? "It" : "They") + " will publish automatically when the connection is back.";
      break;
    case "pending":
      tone = "busy";
      head = "Saving…";
      body = "Publishing to GitHub in a moment.";
      break;
    case "publishing":
      tone = "busy";
      head = "Publishing to GitHub…";
      body = publisher.detail ? esc(publisher.detail) : "Committing " + esc(CONFIG.dataPath) + " to " + repoLink + ".";
      break;
    case "published": {
      const waited = Date.now() - publisher.publishedAt;
      head = "Published to GitHub ✓";
      body = waited > CONFIG.liveCheckMaxMs
        ? "The commit is on GitHub but the site has not redeployed yet. GitHub Pages may be delayed – check the repository's Pages/Actions status."
        : "Customer menu goes live in about a minute (GitHub Pages is redeploying)…";
      if (publisher.lastCommitUrl) body += ' <a href="' + esc(publisher.lastCommitUrl) + '" target="_blank" rel="noopener">View commit ↗</a>';
      break;
    }
    case "live":
      head = "Live on the customer menu ✓";
      body = "All changes published" + (publisher.lastPublishedUpdatedAt ? " · " + formatTime(publisher.lastPublishedUpdatedAt) : "") + ". Connected" + esc(who) + ".";
      break;
    case "error":
      tone = "err";
      head = "Publish failed";
      body = esc(publisher.detail || "Could not publish to GitHub.") + (publisher.retryTimer ? " Retrying automatically…" : "");
      break;
    default:
      head = "Connected to GitHub" + who;
      body = "Price and availability changes publish automatically to " + repoLink + ".";
  }
  dot.className = "sync-dot " + tone;
  title.textContent = head;
  detail.innerHTML = body;
  const retry = $("syncRetryBtn");
  if (retry) retry.hidden = !(status === "error" || (status === "offline" && navigator.onLine !== false));
  const disconnect = $("disconnectBtn");
  if (disconnect) disconnect.hidden = !token;
  const discard = $("discardBtn");
  if (discard) discard.hidden = !pending;
  const connect = $("connectBtn");
  if (connect) connect.textContent = token ? "Replace token" : "Connect";
}

async function connectGitHub(token) {
  token = String(token || "").trim();
  if (!token) { setTokenMessage("Paste a token first.", "err"); return; }
  const connectBtn = $("connectBtn");
  if (connectBtn) connectBtn.disabled = true;
  setTokenMessage("Checking token…");
  try {
    const login = await verifyToken(token);
    setToken(token, login);
    const input = $("tokenInput");
    if (input) input.value = "";
    setTokenMessage("Connected" + (login ? " as @" + login : "") + ". Changes will now publish automatically.", "ok");
    publisher.setStatus("idle");
    if (publisher.hasPending()) publisher.schedule();
    else setTimeout(() => { const panel = $("syncSettings"); if (panel) { panel.hidden = true; const b = $("syncSettingsBtn"); if (b) b.setAttribute("aria-expanded", "false"); } }, 1500);
  } catch (err) {
    setTokenMessage(err.message || "Could not verify the token.", "err");
  } finally {
    if (connectBtn) connectBtn.disabled = false;
    renderSyncStatus();
  }
}
function disconnectGitHub() {
  setToken("");
  setTokenMessage("Disconnected. Changes stay on this device until you connect again.");
  publisher.setStatus("disconnected");
}

/* -------------------------------------------------------- Admin wiring */
function initAdmin() {
  const loginForm = $("loginForm");
  if (loginForm) {
    if (sessionStorage.getItem(ADMIN_SESSION) === "true") { adminLogin.hidden = true; adminApp.hidden = false; }
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const u = $("loginUsername").value.trim();
      const p = $("loginPassword").value;
      const error = $("loginError");
      if (u === "admin" && p === "admin") {
        sessionStorage.setItem(ADMIN_SESSION, "true");
        adminLogin.hidden = true; adminApp.hidden = false; error.textContent = "";
        renderAdmin();
        afterAdminVisible();
      } else error.textContent = "Incorrect username or password.";
    });
  }

  const list = $("adminMenu");
  if (list) {
    list.addEventListener("click", e => {
      const btn = e.target.closest(".toggle");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      setAvailability(id, !loadState().availability[id]);
    });
    list.addEventListener("submit", e => {
      const form = e.target.closest(".price-editor");
      if (!form) return;
      e.preventDefault();
      const id = Number(form.dataset.priceForm);
      const input = form.querySelector(".price-input");
      if (!setPrice(id, input.value)) { input.value = loadState().prices[id]; return; }
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    });
  }

  const resetBtn = $("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", () => { if (confirm("Reset all dishes to available?")) resetAllAvailable(); });

  const settingsBtn = $("syncSettingsBtn");
  if (settingsBtn) settingsBtn.addEventListener("click", toggleSyncSettings);
  const retryBtn = $("syncRetryBtn");
  if (retryBtn) retryBtn.addEventListener("click", () => { publisher.retryCount = 0; publisher.publishNow(); });
  const tokenForm = $("tokenForm");
  if (tokenForm) tokenForm.addEventListener("submit", e => { e.preventDefault(); connectGitHub($("tokenInput").value); });
  const disconnectBtn = $("disconnectBtn");
  if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectGitHub);
  const discardBtn = $("discardBtn");
  if (discardBtn) discardBtn.addEventListener("click", () => {
    if (confirm("Discard the unpublished changes on this device and reload the published menu?")) publisher.discardPending();
  });

  window.addEventListener("beforeunload", e => {
    if (publisher.isDirty() && getToken()) { e.preventDefault(); e.returnValue = ""; }
  });

  if (adminVisible()) afterAdminVisible();
}

// Runs once the dashboard is on screen: verify the saved token quietly and
// publish anything that is still waiting from a previous visit.
let adminStarted = false;
function afterAdminVisible() {
  if (adminStarted) return;
  adminStarted = true;
  const token = getToken();
  if (!token) { publisher.setStatus("disconnected"); openSyncSettings(); return; }
  publisher.setStatus("idle");
  if (publisher.hasPending()) publisher.schedule();
  else {
    verifyToken(token).then(login => { if (login) setToken(token, login); renderSyncStatus(); }).catch(err => {
      if (err.auth) { setToken(""); publisher.setStatus("disconnected", err.message); openSyncSettings(err.message, "err"); }
    });
  }
}

/* ------------------------------------------------------------------ Boot */
window.addEventListener("storage", e => {
  if (e.key === THEME_KEY) applyTheme();
  if (e.key === MENU_STATE_KEY || e.key === null) renderAll();
  if (IS_ADMIN && (e.key === PENDING_KEY || e.key === GITHUB_TOKEN_KEY || e.key === GITHUB_USER_KEY)) {
    if (e.key === PENDING_KEY) publisher.pending = readJSON(localStorage, PENDING_KEY, {}) || {};
    renderSyncStatus();
  }
});

async function boot() {
  const hasMenuPage = Boolean($("menu")) || IS_ADMIN;
  if (IS_ADMIN) initAdmin();
  if (!hasMenuPage) return;
  const haveLocal = hasLocalState();
  if (haveLocal) renderAll();
  await syncFromPublished();        // first-time visitors wait for the real menu
  if (!haveLocal) renderAll();       // (falls back to the built-in catalog if offline)
  startPolling();
}
boot();

// Handy for debugging from the browser console.
window.SpiceStreetMenu = {
  config: CONFIG, dishes: DISHES, loadState, syncFromPublished, publisher,
  setAvailability, setPrice, resetAllAvailable, connectGitHub, disconnectGitHub,
  publishToGitHub, verifyToken, commitMessage, applyPatch, stateFromItems, itemsFromState
};
