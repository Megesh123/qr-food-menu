# QR Food Menu

Spice Street digital QR menu, hosted on GitHub Pages at https://menu.nexgenlink.co.in.

## Pages

- Landing page: `/` (`index.html`)
- Customer menu: `/customer` (`customer/index.html`)
- Admin dashboard: `/admin` (`admin/index.html`)
- Not found: `404.html` — GitHub Pages shows this for any unknown URL, so an
  old or mistyped QR code still lands on a page that links back to the menu.

`customer.html` and `admin.html` are kept as tiny redirect stubs that forward to
`/customer` and `/admin`. Older QR codes and bookmarks keep working, the markup
exists in only one place per page, and neither duplicate can be indexed.

## Finding dishes (customer menu)

The customer menu has a search box and filters above the list:

- **Search** matches dish names, descriptions *and* categories, so `dosa`,
  `pizza` and `chinese` all work. Every word has to match, so `veg noodles`
  narrows further. Matching text is highlighted, and `/` focuses the box.
- **Veg / Non-veg** filters on the `veg` flag of each dish in the `DISHES` list
  in `app.js`. Each card also shows the usual green / red diet marker.
- **Available now** hides everything currently sold out.
- **Category chips** jump straight to a section (they clear the filters first if
  those filters are hiding the section).

The search box never changes what is published — `menu-data.json` stays the
source of truth, and the filters only affect the screen they run on.

## Admin sign-in

The dashboard checks a **SHA-256 hash** of `username:passcode`, so the passcode
itself is not readable in the page source (it used to be a plain
`u === "admin" && p === "admin"` comparison).

- Out of the box the credential is still `admin` / `admin`
  (`sha256("admin:admin")` is the default in `app.js`). **Change it** — the
  dashboard shows a reminder until you do.
- Five wrong attempts lock the form for 30 seconds. The counter lives in
  `localStorage`, so reloading does not clear it.

### Setting your own passcode

1. Open the dashboard in your browser, sign in, and open the developer console.
2. Run `SpiceStreetMenu.hashCredentials("yourname", "your passcode")` and copy
   the 64-character hash it prints. The passcode you type is hashed in the
   browser and never leaves the device.
3. Put the hash in the page before `app.js` loads — in `admin/index.html`,
   just above the `<script src="/app.js?v=15">` tag:

   ```html
   <script>
     window.SPICE_STREET_CONFIG = {
       adminCredentialSha256: "PASTE_THE_HASH_HERE"
     };
   </script>
   ```

4. Commit and let GitHub Pages redeploy. Sign in with the new username and
   passcode.

The hash is one-way: it can be verified but not turned back into the passcode.
Because the check still runs in the browser it is a *gate*, not real
authentication — the GitHub token (below) is what actually protects the
repository, so keep that token scoped to Contents read/write on this repo only.

Hashing uses the browser's Web Crypto API, with a small built-in SHA-256
fallback for non-secure contexts (for example a plain-`http` LAN preview).

## How live menu updates work

`menu-data.json` in this repository is the single source of truth for prices
and Available / Sold-out status.

1. The admin changes a price or taps **AVAILABLE / SOLD OUT** in the dashboard.
2. The change is saved on the admin's phone instantly, and a couple of seconds
   later the dashboard **commits `menu-data.json` to this repository** through
   the GitHub API (several quick changes are batched into one commit, e.g.
   `menu: Mutton Biriyani → sold out; Idli → price ₹45`).
3. GitHub Pages redeploys automatically (usually under a minute).
4. Every open customer menu re-checks `menu-data.json` about once a minute
   (and whenever the tab is reopened), so customers see the new price /
   sold-out badge without doing anything.

The status bar at the top of the dashboard shows exactly where a change is:
*Saving… → Publishing to GitHub… → Published to GitHub ✓ → Live on the customer menu ✓*.
If the phone is offline or GitHub is unreachable, the change stays on the
device and is published automatically when the connection is back (there is
also a **Retry** button).

## One-time setup: connect the admin dashboard to GitHub

The dashboard needs permission to commit to this repository. This is done
with a GitHub *fine-grained personal access token* that is limited to this one
repository:

1. Open https://github.com/settings/personal-access-tokens/new (signed in as the
   repository owner).
2. **Repository access** → *Only select repositories* → `qr-food-menu`.
3. **Permissions → Repository permissions → Contents → Read and write**.
   No other permission is needed.
4. Choose an expiry (e.g. 1 year), generate the token and copy it.
5. Open `/admin`, sign in, tap **GitHub settings**, paste the token and tap
   **Connect**.

The token is stored only in that browser (localStorage) — it never goes into
the repository. Repeat step 5 on every phone/laptop that should be able to
update the menu, and use **Disconnect** to remove it from a device. When the
token expires the dashboard tells you and asks for a new one.

## Notes & limits

- Two devices can edit at the same time: each publish re-reads the file on
  GitHub and merges only the fields that changed, so one phone never
  overwrites the other's changes.
- GitHub Pages (branch deploy) has a soft limit of about 10 builds per hour.
  Changes are batched into as few commits as possible; if the limit is ever
  hit, GitHub simply queues the build and the update appears a little later.
- Menu items themselves (names, categories, descriptions and the veg /
  non-veg flag) live in the `DISHES` list in `app.js`; `menu-data.json` carries
  only the live price and availability for each item, so adding a dish never
  needs a publish. Items in `menu-data.json` whose `id` is not in `DISHES` are
  ignored.
- To point the dashboard at a fork or another branch, set
  `window.SPICE_STREET_CONFIG = { repo: "owner/name", branch: "main" }` in the
  page before `app.js` loads (defaults are in `app.js`).

## GitHub Pages

Enable Pages from Settings → Pages → Deploy from branch → `main` → `/ (root)`.
