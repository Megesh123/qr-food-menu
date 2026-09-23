# QR Food Menu

Spice Street digital QR menu, hosted on GitHub Pages at https://menu.nexgenlink.co.in.

## Pages

- Landing page: `/` (`index.html`)
- Customer menu: `/customer` (`customer/index.html`, also `customer.html`)
- Admin dashboard: `/admin` (`admin/index.html`, also `admin.html`) — login `admin` / `admin`

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
- Menu items themselves (names, categories, descriptions) live in the `DISHES`
  list in `app.js`; `menu-data.json` carries the live price and availability
  for each item.
- To point the dashboard at a fork or another branch, set
  `window.SPICE_STREET_CONFIG = { repo: "owner/name", branch: "main" }` in the
  page before `app.js` loads (defaults are in `app.js`).

## GitHub Pages

Enable Pages from Settings → Pages → Deploy from branch → `main` → `/ (root)`.
