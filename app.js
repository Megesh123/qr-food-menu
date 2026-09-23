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
{id:1,name:"Chicken Biriyani",category:"Biriyani & Rice",price:120,description:"Basmati rice, chicken and aromatic spices.",veg:false},
{id:2,name:"Mutton Biriyani",category:"Biriyani & Rice",price:180,description:"Slow-cooked mutton with fragrant biriyani rice.",veg:false},
{id:3,name:"Egg Biriyani",category:"Biriyani & Rice",price:110,description:"Fragrant biriyani rice with seasoned boiled egg.",veg:false},
{id:4,name:"Veg Biriyani",category:"Biriyani & Rice",price:100,description:"Basmati rice cooked with fresh vegetables and spices.",veg:true},
{id:5,name:"Mushroom Biriyani",category:"Biriyani & Rice",price:120,description:"Aromatic rice with tender mushrooms and herbs.",veg:true},
{id:6,name:"Jeera Rice",category:"Biriyani & Rice",price:80,description:"Steamed basmati rice tempered with cumin.",veg:true},
{id:7,name:"Chicken 65",category:"Starters",price:110,description:"Crispy, spicy South Indian chicken starter.",veg:false},
{id:8,name:"Paneer 65",category:"Starters",price:100,description:"Crispy paneer tossed with Indian spices.",veg:true},
{id:9,name:"Chicken Lollipop",category:"Starters",price:150,description:"Crispy chicken wings coated in spicy masala.",veg:false},
{id:10,name:"Gobi 65",category:"Starters",price:90,description:"Crispy cauliflower with chilli and curry leaves.",veg:true},
{id:11,name:"Mushroom Pepper Fry",category:"Starters",price:100,description:"Mushroom tossed with cracked pepper and onions.",veg:true},
{id:12,name:"Idli",category:"South Indian",price:40,description:"Soft steamed rice cakes served with chutney and sambar.",veg:true},
{id:13,name:"Vada",category:"South Indian",price:45,description:"Crispy lentil fritter served with chutney.",veg:true},
{id:14,name:"Plain Dosa",category:"South Indian",price:55,description:"Golden crispy dosa with chutney and sambar.",veg:true},
{id:15,name:"Masala Dosa",category:"South Indian",price:80,description:"Crispy dosa filled with seasoned potato masala.",veg:true},
{id:16,name:"Ghee Roast Dosa",category:"South Indian",price:95,description:"Thin dosa roasted with aromatic ghee.",veg:true},
{id:17,name:"Pongal",category:"South Indian",price:60,description:"Comforting rice and lentil pongal with ghee.",veg:true},
{id:18,name:"Veg Meals",category:"South Indian",price:100,description:"Rice, vegetables, sambar, rasam and sides.",veg:true},
{id:19,name:"Parotta",category:"Breads",price:25,description:"Flaky layered South Indian flatbread.",veg:true},
{id:20,name:"Egg Parotta",category:"Breads",price:70,description:"Layered parotta tossed with egg and spices.",veg:false},
{id:21,name:"Chapati",category:"Breads",price:35,description:"Soft whole-wheat flatbread.",veg:true},
{id:22,name:"Butter Naan",category:"Breads",price:55,description:"Soft naan brushed with butter.",veg:true},
{id:23,name:"Garlic Naan",category:"Breads",price:65,description:"Tandoor-baked naan with garlic and coriander.",veg:true},
{id:24,name:"Chicken Curry",category:"Curries",price:130,description:"Homestyle chicken curry with rich spices.",veg:false},
{id:25,name:"Mutton Curry",category:"Curries",price:180,description:"Tender mutton cooked in a traditional masala.",veg:false},
{id:26,name:"Fish Curry",category:"Curries",price:150,description:"South Indian fish curry with tangy spices.",veg:false},
{id:27,name:"Paneer Butter Masala",category:"Curries",price:130,description:"Paneer in a creamy tomato and butter gravy.",veg:true},
{id:28,name:"Dal Tadka",category:"Curries",price:90,description:"Yellow lentils finished with a fragrant tempering.",veg:true},
{id:29,name:"Margherita Pizza",category:"Pizza",price:180,description:"Tomato, mozzarella and basil on a crisp base.",veg:true},
{id:30,name:"Veggie Pizza",category:"Pizza",price:220,description:"Onion, capsicum, corn and tomato with cheese.",veg:true},
{id:31,name:"Paneer Tikka Pizza",category:"Pizza",price:250,description:"Paneer tikka, onion and capsicum with cheese.",veg:true},
{id:32,name:"Chicken Tikka Pizza",category:"Pizza",price:280,description:"Chicken tikka, onion and capsicum on a cheesy base.",veg:false},
{id:33,name:"Cheese Burst Pizza",category:"Pizza",price:260,description:"Loaded cheese pizza with a rich cheese-filled crust.",veg:true},
{id:34,name:"Classic Veg Burger",category:"Burgers & Sandwiches",price:100,description:"Crispy veg patty with lettuce, tomato and sauce.",veg:true},
{id:35,name:"Chicken Burger",category:"Burgers & Sandwiches",price:140,description:"Juicy chicken patty with fresh salad and sauce.",veg:false},
{id:36,name:"Paneer Burger",category:"Burgers & Sandwiches",price:130,description:"Spiced paneer patty with creamy sauce.",veg:true},
{id:37,name:"Grilled Cheese Sandwich",category:"Burgers & Sandwiches",price:90,description:"Toasted bread with melted cheese and herbs.",veg:true},
{id:38,name:"Chicken Club Sandwich",category:"Burgers & Sandwiches",price:150,description:"Triple-layer sandwich with chicken, egg and salad.",veg:false},
{id:39,name:"Veg Hakka Noodles",category:"Chinese",price:120,description:"Wok-tossed noodles with vegetables and sauces.",veg:true},
{id:40,name:"Chicken Hakka Noodles",category:"Chinese",price:150,description:"Wok-tossed noodles with chicken and vegetables.",veg:false},
{id:41,name:"Veg Fried Rice",category:"Chinese",price:110,description:"Fragrant fried rice with fresh vegetables.",veg:true},
{id:42,name:"Chicken Fried Rice",category:"Chinese",price:140,description:"Wok-fried rice with chicken, egg and vegetables.",veg:false},
{id:43,name:"Gobi Manchurian",category:"Chinese",price:110,description:"Crispy cauliflower in a tangy Manchurian sauce.",veg:true},
{id:44,name:"White Sauce Pasta",category:"Pasta",price:150,description:"Creamy pasta with herbs and vegetables.",veg:true},
{id:45,name:"Arrabbiata Pasta",category:"Pasta",price:140,description:"Pasta in a spicy tomato and garlic sauce.",veg:true},
{id:46,name:"Chicken Alfredo Pasta",category:"Pasta",price:190,description:"Creamy Alfredo pasta with tender chicken.",veg:false},
{id:47,name:"Pesto Veg Pasta",category:"Pasta",price:170,description:"Pasta tossed with basil pesto and vegetables.",veg:true},
{id:48,name:"Gulab Jamun",category:"Desserts",price:50,description:"Soft milk-solid dumplings in sugar syrup.",veg:true},
{id:49,name:"Brownie",category:"Desserts",price:80,description:"Warm chocolate brownie with a rich fudgy center.",veg:true},
{id:50,name:"Chocolate Cake",category:"Desserts",price:90,description:"Moist chocolate cake with creamy frosting.",veg:true},
{id:51,name:"Carrot Halwa",category:"Desserts",price:70,description:"Slow-cooked carrot dessert with milk and nuts.",veg:true},
{id:52,name:"Payasam",category:"Desserts",price:60,description:"Traditional South Indian milk and vermicelli dessert.",veg:true},
{id:53,name:"Vanilla Ice Cream",category:"Ice Cream",price:60,description:"Classic creamy vanilla scoop.",veg:true},
{id:54,name:"Chocolate Ice Cream",category:"Ice Cream",price:70,description:"Rich chocolate ice cream scoop.",veg:true},
{id:55,name:"Mango Ice Cream",category:"Ice Cream",price:70,description:"Creamy seasonal mango ice cream.",veg:true},
{id:56,name:"Ice Cream Sundae",category:"Ice Cream",price:110,description:"Scoops topped with chocolate sauce and nuts.",veg:true},
{id:57,name:"Lime Juice",category:"Drinks",price:30,description:"Fresh lime juice served chilled.",veg:true},
{id:58,name:"Fresh Fruit Juice",category:"Drinks",price:60,description:"Seasonal fresh fruit juice.",veg:true},
{id:59,name:"Mango Juice",category:"Drinks",price:70,description:"Refreshing mango juice.",veg:true},
{id:60,name:"Fresh Lime Soda",category:"Drinks",price:40,description:"Chilled lime soda with a refreshing fizz.",veg:true},
{id:61,name:"Cold Coffee",category:"Drinks",price:90,description:"Chilled creamy coffee drink.",veg:true},
{id:62,name:"Masala Tea",category:"Drinks",price:30,description:"Hot Indian tea brewed with aromatic spices.",veg:true}
];
const DISH_BY_ID = new Map(DISHES.map(d => [d.id, d]));

/* ---------------------------------------------------------- Configuration */
// sha256("admin:admin") — the default admin credential (see "Admin sign-in").
const DEFAULT_CREDENTIAL_SHA256 = "8da193366e1554c08b2870c50f737b9587c3372b656151c4a96028af26f51334";

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
  liveCheckMaxMs: 6 * 60 * 1000,
  /* Admin sign-in. Only the SHA-256 hash of "username:passcode" is kept here,
     so the passcode itself never appears in the page source. The default hash
     below is sha256("admin:admin") — replace it with your own, see README:
       window.SPICE_STREET_CONFIG = { adminCredentialSha256: "…" }
     Generate one in the browser console:
       SpiceStreetMenu.hashCredentials("yourname", "your passcode")            */
  adminCredentialSha256: DEFAULT_CREDENTIAL_SHA256,
  adminMaxAttempts: 5,              // wrong tries before the form locks
  adminLockMs: 30 * 1000            // ...and for how long
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

/* -------------------------------------------------------- Admin passcode */
// The sign-in credential is checked as a SHA-256 hash, never as a plaintext
// string, so "admin / admin" is not readable in the page source any more.
// DEFAULT_CREDENTIAL_SHA256 (declared with the configuration above) is the
// out-of-the-box credential; replace it as described in the README.
const LOGIN_ATTEMPTS_KEY = "spice-street-login-attempts-v1";

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];
function rotr32(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
function utf8Bytes(text) {
  if (typeof TextEncoder === "function") return new TextEncoder().encode(text);
  const s = unescape(encodeURIComponent(text));            // very old browsers
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
function toHex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}
// Used only when Web Crypto is unavailable (non-secure context, e.g. http://LAN).
function sha256Pure(text) {
  const bytes = utf8Bytes(text);
  const len = bytes.length;
  const blocks = Math.ceil((len + 9) / 64);
  const buf = new Uint8Array(blocks * 64);
  buf.set(bytes);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  const bits = len * 8;
  view.setUint32(blocks * 64 - 8, Math.floor(bits / 4294967296));
  view.setUint32(blocks * 64 - 4, bits >>> 0);
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
             0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  for (let blk = 0; blk < blocks; blk++) {
    const off = blk * 64;
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(w[i - 15], 7) ^ rotr32(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr32(w[i - 2], 17) ^ rotr32(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) outView.setUint32(i * 4, H[i]);
  return toHex(out);
}
async function sha256Hex(text) {
  const subtle = (typeof crypto !== "undefined" && crypto) ? crypto.subtle : null;
  if (subtle && typeof subtle.digest === "function") {
    try { return toHex(new Uint8Array(await subtle.digest("SHA-256", utf8Bytes(text)))); }
    catch (e) { /* fall through to the pure-JS implementation */ }
  }
  return sha256Pure(text);
}
// Hash of "username:passcode" — the value stored in CONFIG.adminCredentialSha256.
async function hashCredentials(username, passcode) {
  return sha256Hex(String(username || "").trim().toLowerCase() + ":" + String(passcode || ""));
}
// Length-independent, branch-free comparison of two hex digests.
function sameDigest(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function readAttempts() {
  const raw = readJSON(localStorage, LOGIN_ATTEMPTS_KEY, null) || {};
  return { count: Math.max(0, Number(raw.count) || 0), lockedUntil: Number(raw.lockedUntil) || 0 };
}
function writeAttempts(a) { writeJSON(localStorage, LOGIN_ATTEMPTS_KEY, a); }
function lockRemaining() { return Math.max(0, readAttempts().lockedUntil - Date.now()); }

/* ------------------------------------------------------------- Rendering */
/* Customer menu filters ---------------------------------------------------
   The search box and the diet / availability chips only change what is shown
   on screen; menu-data.json stays the source of truth for prices & status. */
const menuFilter = { query: "", diet: "all", availableOnly: false };

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Escapes each slice separately, so a query can never inject markup (and can
// never match inside an escaped entity such as "&amp;").
function escHighlight(text, query) {
  const raw = text == null ? "" : String(text);
  const q = String(query || "").trim();
  if (!q) return esc(raw);
  const lower = raw.toLowerCase(), target = q.toLowerCase();
  if (lower.indexOf(target) === -1) return esc(raw);
  let out = "", from = 0, idx;
  while ((idx = lower.indexOf(target, from)) !== -1) {
    out += esc(raw.slice(from, idx)) + "<mark>" + esc(raw.slice(idx, idx + target.length)) + "</mark>";
    from = idx + target.length;
  }
  return out + esc(raw.slice(from));
}

function dietMark(d) {
  const label = d.veg ? "Vegetarian" : "Non-vegetarian";
  return '<span class="diet-mark' + (d.veg ? "" : " nonveg") + '" title="' + label + '" aria-label="' + label + '"></span>';
}

// Every word of the query has to appear in the name, description or category,
// so "veg noodles" and "noodles veg" both work.
function matchesFilter(dish, state) {
  if (menuFilter.diet === "veg" && !dish.veg) return false;
  if (menuFilter.diet === "nonveg" && dish.veg) return false;
  if (menuFilter.availableOnly && !state.availability[dish.id]) return false;
  const words = menuFilter.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = (dish.name + " " + dish.description + " " + dish.category).toLowerCase();
  return words.every(w => haystack.indexOf(w) !== -1);
}

function filtersActive() {
  return Boolean(menuFilter.query.trim()) || menuFilter.diet !== "all" || menuFilter.availableOnly;
}

function renderCustomer() {
  const menu = $("menu");
  if (!menu) return;
  const state = loadState();
  const q = menuFilter.query.trim();
  const groups = new Map();
  let shown = 0;
  DISHES.forEach(d => {
    if (!matchesFilter(d, state)) return;
    if (!groups.has(d.category)) groups.set(d.category, []);
    groups.get(d.category).push(d);
    shown++;
  });

  let html = "";
  groups.forEach((dishes, category) => {
    html += '<section class="category-section" id="cat-' + slugify(category) + '"><div class="category-heading"><div class="category-icon">' +
      (CATEGORIES[category] || "🍽️") + '</div><div><h2>' + esc(category) + '</h2><p>' + dishes.length +
      (dishes.length === 1 ? " item" : " items") + '</p></div></div><div class="menu-grid">';
    dishes.forEach(d => {
      const on = state.availability[d.id];
      html += '<article class="menu-card' + (on ? "" : " sold") + '"><div><div class="category">' + dietMark(d) + esc(category) +
        '</div><div class="dish-name">' + escHighlight(d.name, q) + '</div><div class="description">' + escHighlight(d.description, q) +
        '</div><div class="price">₹' + state.prices[d.id] + '</div></div><div class="badge ' + (on ? "on" : "off") + '">' +
        (on ? "✓ Available" : "✕ Sold out") + '</div></article>';
    });
    html += "</div></section>";
  });

  if (!shown) {
    html = '<div class="menu-empty"><p aria-hidden="true">🔍</p><strong>No dishes found</strong>' +
      '<span>' + (q ? "Nothing on the menu matches “" + esc(q) + "”." : "No dishes match the filters you picked.") +
      '</span><button id="clearFiltersBtn" class="menu-empty-btn" type="button">Clear search &amp; filters</button></div>';
  }
  menu.innerHTML = html;

  const count = $("menuCount");
  if (count) {
    count.textContent = shown === 0 ? "" : filtersActive()
      ? "Showing " + shown + " of " + DISHES.length + " dishes"
      : DISHES.length + " dishes across " + groups.size + " categories";
  }
  const updated = $("menuUpdated");
  if (updated) updated.textContent = state.updatedAt ? "Menu updated " + formatTime(state.updatedAt) : "";
}

/* Search box, chips and category jump links (customer pages only) ---------- */
function buildCategoryChips() {
  const row = $("categoryJump");
  if (!row || row.childElementCount) return;
  const seen = [];
  DISHES.forEach(d => { if (seen.indexOf(d.category) === -1) seen.push(d.category); });
  row.innerHTML = seen.map(c =>
    '<button class="chip chip-cat" type="button" data-category="' + esc(c) + '"><span aria-hidden="true">' +
    (CATEGORIES[c] || "🍽️") + "</span>" + esc(c) + "</button>").join("");
}

function scrollToCategory(category) {
  const target = document.getElementById("cat-" + slugify(category));
  if (!target) return;
  const tools = document.querySelector(".menu-tools");
  const offset = (tools ? tools.offsetHeight : 0) + 12;   // clear the sticky bar
  const top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

function resetFilters() {
  menuFilter.query = ""; menuFilter.diet = "all"; menuFilter.availableOnly = false;
  const input = $("menuSearch");
  if (input) input.value = "";
  syncFilterUI();
  renderCustomer();
}

// Keeps the chips, the clear button and aria-pressed in step with menuFilter.
function syncFilterUI() {
  const clear = $("searchClear");
  if (clear) clear.hidden = !menuFilter.query;
  document.querySelectorAll("#dietFilters [data-diet]").forEach(btn => {
    const on = btn.dataset.diet === menuFilter.diet;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const avail = $("availableOnly");
  if (avail) {
    avail.classList.toggle("is-active", menuFilter.availableOnly);
    avail.setAttribute("aria-pressed", menuFilter.availableOnly ? "true" : "false");
  }
}

function initCustomerTools() {
  const menu = $("menu");
  if (!menu) return;
  buildCategoryChips();
  syncFilterUI();

  const input = $("menuSearch");
  if (input) {
    input.addEventListener("input", () => {
      menuFilter.query = input.value;
      syncFilterUI();
      renderCustomer();
    });
    // "/" jumps to the search box, as on most menu and docs sites.
    document.addEventListener("keydown", e => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      input.focus();
    });
  }

  const clearBtn = $("searchClear");
  if (clearBtn) clearBtn.addEventListener("click", () => {
    menuFilter.query = "";
    if (input) { input.value = ""; input.focus(); }
    syncFilterUI();
    renderCustomer();
  });

  const dietRow = $("dietFilters");
  if (dietRow) dietRow.addEventListener("click", e => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    if (btn.hasAttribute("data-available-only")) menuFilter.availableOnly = !menuFilter.availableOnly;
    else if (btn.dataset.diet) menuFilter.diet = btn.dataset.diet;
    else return;
    syncFilterUI();
    renderCustomer();
  });

  const catRow = $("categoryJump");
  if (catRow) catRow.addEventListener("click", e => {
    const btn = e.target.closest(".chip-cat");
    if (!btn) return;
    const category = btn.dataset.category;
    // If the current filters hide that category, clear them so the jump works.
    if (!document.getElementById("cat-" + slugify(category)) && filtersActive()) resetFilters();
    scrollToCategory(category);
  });

  menu.addEventListener("click", e => {
    const btn = e.target.closest("#clearFiltersBtn");
    if (btn) resetFilters();
  });
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
// Sign-in: compare SHA-256("user:passcode") with CONFIG.adminCredentialSha256.
// Wrong tries are counted in localStorage and lock the form briefly, so the
// hash cannot be brute-forced by simply reloading the page.
async function submitLogin() {
  const form = $("loginForm"), error = $("loginError");
  if (!form) return false;
  const userField = $("loginUsername"), passField = $("loginPassword");
  const button = form.querySelector(".login-btn");

  if (lockRemaining()) { showLockout(); return false; }

  const username = (userField ? userField.value : "").trim().toLowerCase();
  const passcode = passField ? passField.value : "";
  if (button) { button.disabled = true; button.textContent = "Checking…"; }
  if (error) error.textContent = "";

  let ok = false;
  try {
    ok = sameDigest(await hashCredentials(username, passcode),
                    String(CONFIG.adminCredentialSha256 || "").trim().toLowerCase());
  } catch (err) {
    ok = false;
  }
  if (passField) passField.value = "";           // never leave it in the DOM
  if (button) { button.disabled = false; button.textContent = "Sign in"; }

  if (ok) {
    writeAttempts({ count: 0, lockedUntil: 0 });
    stopLockoutTicker();
    sessionStorage.setItem(ADMIN_SESSION, "true");
    adminLogin.hidden = true; adminApp.hidden = false;
    if (error) error.textContent = "";
    warnIfDefaultPasscode();
    renderAdmin();
    afterAdminVisible();
    return true;
  }

  const attempts = readAttempts();
  attempts.count += 1;
  if (attempts.count >= CONFIG.adminMaxAttempts) {
    attempts.lockedUntil = Date.now() + CONFIG.adminLockMs;
    attempts.count = 0;
    writeAttempts(attempts);
    showLockout();
  } else {
    writeAttempts(attempts);
    const left = CONFIG.adminMaxAttempts - attempts.count;
    if (error) error.textContent = "Incorrect username or passcode. " + left +
      (left === 1 ? " attempt" : " attempts") + " left before a short lock.";
  }
  return false;
}

let lockoutTicker = null;
function stopLockoutTicker() {
  if (lockoutTicker) { clearInterval(lockoutTicker); lockoutTicker = null; }
}
function showLockout() {
  const error = $("loginError");
  const form = $("loginForm");
  const button = form ? form.querySelector(".login-btn") : null;
  const tick = () => {
    const left = lockRemaining();
    if (!left) {
      stopLockoutTicker();
      if (error) error.textContent = "";
      if (button) { button.disabled = false; button.textContent = "Sign in"; }
      return;
    }
    const secs = Math.ceil(left / 1000);
    if (error) error.textContent = "Too many attempts. Try again in " + secs + "s.";
    if (button) { button.disabled = true; button.textContent = "Locked · " + secs + "s"; }
  };
  tick();
  stopLockoutTicker();
  lockoutTicker = setInterval(tick, 500);
}

// Nudges the owner to replace admin/admin, which is still the default hash.
function warnIfDefaultPasscode() {
  const app = $("adminApp");
  if (!app || $("defaultPasscodeNotice")) return;
  if (!sameDigest(String(CONFIG.adminCredentialSha256 || "").trim().toLowerCase(), DEFAULT_CREDENTIAL_SHA256)) return;
  const notice = document.createElement("div");
  notice.className = "notice";
  notice.id = "defaultPasscodeNotice";
  notice.innerHTML = "<strong>Still using the default sign-in</strong>" +
    "<span>admin / admin is the shipped credential, so anyone who finds this page can change your menu. " +
    "Pick your own: in the browser console run " +
    "<code>SpiceStreetMenu.hashCredentials(\"you\", \"your passcode\")</code> and put the hash in " +
    "<code>window.SPICE_STREET_CONFIG.adminCredentialSha256</code> before app.js loads. " +
    '<a href="https://github.com/' + esc(CONFIG.repo) + '#admin-sign-in" target="_blank" rel="noopener">Step-by-step</a></span>';
  app.insertBefore(notice, app.firstChild);
}

function initAdmin() {
  const loginForm = $("loginForm");
  if (loginForm) {
    if (sessionStorage.getItem(ADMIN_SESSION) === "true") {
      adminLogin.hidden = true; adminApp.hidden = false;
      warnIfDefaultPasscode();              // also on a reload within the session
    }
    loginForm.addEventListener("submit", e => { e.preventDefault(); submitLogin(); });
    if (lockRemaining()) showLockout();     // a lock survives a page reload
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
  initCustomerTools();
  const haveLocal = hasLocalState();
  if (haveLocal) renderAll();
  await syncFromPublished();        // first-time visitors wait for the real menu
  if (!haveLocal) renderAll();       // (falls back to the built-in catalog if offline)
  startPolling();
}
boot();

// Handy for debugging from the browser console. `hashCredentials` is what you
// run to generate the value for CONFIG.adminCredentialSha256 (see README).
window.SpiceStreetMenu = {
  config: CONFIG, dishes: DISHES, loadState, syncFromPublished, publisher,
  setAvailability, setPrice, resetAllAvailable, connectGitHub, disconnectGitHub,
  publishToGitHub, verifyToken, commitMessage, applyPatch, stateFromItems, itemsFromState,
  // customer menu filters
  menuFilter, renderCustomer, initCustomerTools, resetFilters, matchesFilter, escHighlight, slugify,
  // admin passcode
  hashCredentials, sha256Hex, sha256Pure, sameDigest, readAttempts, lockRemaining,
  DEFAULT_CREDENTIAL_SHA256
};
