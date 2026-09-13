# Kelly Marie Counselling — Website

A single-page counselling website for Kelly Marie Counselling (Leeds), built with
[Eleventy](https://www.11ty.dev/) + Tailwind CSS, hosted on Cloudflare Pages, and
editable through a friendly visual editor ([Pages CMS](https://pagescms.org)) — no code required.

- **Live site:** https://kellymariecounselling.com
- **Visual editor:** https://app.pagescms.org (sign in with GitHub)

---

## ✏️ How to edit the website (for Kelly / family — no code)

1. Go to **https://app.pagescms.org** and sign in with your GitHub account.
2. Choose the **kelly-marie-counselling** project.
3. In the sidebar you'll see one entry per part of the site — *Page settings, Header / logo,
   Colours / theme, Main menu, Top section (hero), About Kelly, Services, Workplace Wellness,
   Therapeutic approach, The process, Contact, Footer,* plus one **Page:** entry per standalone
   page. Click whichever you want to change.
4. Change any text, or upload a new photo (Hero photo / About photo).
5. Click **Save**.
6. Wait about **1–2 minutes** — the live website updates itself automatically.

That's it. You never touch code, and you can't break the design — only the words and
photos are editable. If something doesn't look right, you can always change it back and Save again.

### Changing the site colours
1. In the editor, open **Colours / theme**.
2. Pick a ready-made **Colour scheme** (Navy, Forest green, Terracotta, Plum, or Charcoal & gold) and **Save** — the whole site re-colours itself, and text stays readable.
3. *(Advanced, optional)* To use an exact brand colour, type a hex code (e.g. `#1c3553`) into one of the **Advanced** boxes. Leaving a box blank just uses the chosen scheme. Note: picking a very light "main dark colour" can make white text hard to read.


---

## TODO

- [ ] **Social links** — add Instagram / Facebook / LinkedIn to the footer once profiles exist
- [ ] **Phone number** — removed for now; ask the developer to re-add when a number is available
- [x] **BACP membership number** — set in the editor (No. 00922563) ✓
- [x] **Custom domain** — `kellymariecounselling.com` live on Cloudflare Pages ✓
- [x] **Visual CMS** — Pages CMS editing enabled ✓
- [ ] **Custom sections** — allow editor to add/reorder new sections (low priority)
- [x] **Colour themes** — editor can switch palettes or set custom colours ✓
- [x] **Six new menu items + holding pages** — Wellbeing, Counselling, Training & Coaching, Podcast, Merchandise, Meet the Team ✓
- [x] **Menu order + show/hide editable in the CMS** — names and destinations stay locked ✓
- [x] **Six new pages' content editable** — simple fields per page; placeholder shows until filled ✓
- [ ] **Spec the six new pages** — real content for Wellbeing, Counselling, Training & Coaching, Podcast, Merchandise, Meet the Team

---

## CMS — what the editor controls, and what's next

### Where things live

| File | Role |
|---|---|
| `src/_data/menuItems.js` | **Code-owned** menu catalogue: each item's label and destination. Not editable in the CMS, by design. |
| `src/_data/newPages.json` | The six standalone pages (`title` + `slug`). Feeds both the catalogue and page generation. |
| `src/_data/mainNav.js` | Applies the editor's order and show/hide choices to that catalogue. |
| `src/content/pages/` | Editable content for the six standalone pages, one file each. |
| `src/_data/pages.js` | Loads those files, keyed by slug. |
| `src/holding.njk` | Builds each page — real content when filled in, "coming soon" placeholder when not. |
| `src/_includes/site-header.njk` | Shared `<head>` + sticky nav. |
| `src/_includes/site-footer.njk` | Shared footer + page scripts. |

**How the menu behaves:** the header shows the logo, a "Request a Consultation" button
and a burger handle at every screen size. The handle opens one panel listing the links
on a single level — no submenus, no separate desktop and mobile arrangements to keep in
sync. It closes on link click, Escape, or a click outside.

### ✅ 1. Menu order and visibility — editable

Under **Main menu** in the editor, each row is one menu link. The editor can:

- **drag rows** to change the order links appear in
- **untick "Show in menu"** to hide a link

They deliberately *cannot* edit link names or destinations — those live in
`menuItems.js`, so a link can't be renamed into something misleading or pointed at a
URL that doesn't exist.

> **Hiding is not deleting.** A hidden page stays online at its own address; it just
> isn't linked from the menu. That's what makes it possible to build a page out before
> announcing it.

Stored in `src/content/menu.json` as:

```json
{
  "items": [
    { "item": "about", "visible": true },
    { "item": "wellbeing", "visible": false }
  ]
}
```

`mainNav.js` skips rows whose `item` is unknown, so a stale row can't break the build.

> ⚠️ **One sync point for developers:** the list of choices in the **Menu link**
> dropdown is written out in `.pages.yml`. Adding a page to `newPages.json` means adding
> a matching option there too, or it won't be selectable.

> **Room to grow.** Because every link lives in the dropdown panel rather than spread
> across the header bar, adding more items doesn't threaten the layout — the panel just
> gets taller. Only worry if the list gets long enough to need scrolling on a phone.

### ✅ 2. Page content — editable

Each of the six pages has its own editor entry (**Page: Wellbeing**, **Page: Podcast**
and so on) with a simple set of fields:

| Field | Notes |
|---|---|
| Small heading | Optional label above the title |
| Page title | Falls back to the menu name if left blank |
| Intro paragraph | Shown slightly larger |
| Main text | Press Enter for new lines |
| Photo | Optional — sits beside the text, height-capped so a tall portrait can't tower over short copy |

> **The placeholder is the fallback.** Leave *Intro* and *Main text* both empty and the
> page keeps its "coming soon" holding screen. So pages can be filled in one at a time,
> and an unfinished one never looks broken.

Content lives in `src/content/pages/<slug>.json`, loaded by `src/_data/pages.js`.

**If these pages outgrow simple text**, the next step is a reusable section builder
(text block / cards / image+text) so each page can be assembled from blocks — the
"Custom sections" TODO. Worth doing once we know what Podcast, Merchandise and Meet the
Team actually need, since those three are quite different in shape from the service pages.

### 3. Also worth adding at the same time

- **Per-page SEO** — `metaTitle` / `metaDescription` fields. Titles are currently derived
  automatically as *"{Page name} | Kelly Marie Counselling"*, and there's no per-page description.
- **Footer links** — the footer's Quick Links show only the homepage-section links
  (About / Services / My Approach / Contact), matching what it showed before. Decide
  whether the six pages belong there too.

### 4. Open design question

"Services" (an existing homepage section) overlaps conceptually with *Wellbeing*,
*Counselling* and *Training & Coaching*, which now sit beside it in the same menu.
Worth resolving the information architecture when the new pages are specced, so
visitors aren't offered two competing routes to similar content.

---

## 🔧 One-time setup (admin)

This was set up once; recorded here in case it ever needs redoing.

### 1. Cloudflare Pages build settings
Because the site now uses a build step, set (Cloudflare → Workers & Pages → project → Settings → Builds & deployments):

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `_site` |
| Framework preset | None |

### 2. Give the editor (daughter) access
- She creates a free account at https://github.com (one time).
- Repo owner: GitHub repo → **Settings → Collaborators → Add people** → invite her username.
- She accepts the email invite.

### 3. Connect Pages CMS
- Go to https://app.pagescms.org, sign in with GitHub, and authorise the Pages CMS GitHub app **for this repository only**.
- The editing forms are defined by [`.pages.yml`](.pages.yml) in the repo root.

---

## 🏗️ How it's built (for developers)

```
/
├── .eleventy.js            ← Eleventy build config
├── .pages.yml              ← Pages CMS editing-form definitions
├── package.json            ← Eleventy dependency + build scripts
├── src/
│   ├── index.njk           ← Homepage (HTML + Tailwind, with {{ placeholders }})
│   ├── holding.njk         ← Generates the six "coming soon" pages (one per newPages entry)
│   ├── _includes/
│   │   ├── site-header.njk ← Shared <head> + sticky nav
│   │   └── site-footer.njk ← Shared footer + page scripts
│   ├── content/            ← ALL editable text (one file per section — what the CMS edits)
│   │   ├── hero.json  about.json  services.json  …
│   │   └── pages/          ← Content for the six standalone pages
│   ├── _data/
│   │   ├── content.js      ← Merges src/content/*.json into one `content` object
│   │   ├── pages.js        ← Loads src/content/pages/*.json
│   │   ├── colors.js       ← Resolves the chosen palette / custom hex overrides
│   │   ├── newPages.json   ← The six standalone pages (developer-owned)
│   │   ├── menuItems.js    ← Menu labels + destinations (locked, not CMS-editable)
│   │   └── mainNav.js      ← Applies the editor's order / show-hide choices
│   └── images/
│       ├── kelly-hero.jpg
│       └── kelly-about.jpg
└── _site/                  ← Build output (git-ignored, generated by Eleventy)
```

The design lives in `src/index.njk`; the words/photos live in `src/content/*.json`.
Eleventy merges them into `_site/index.html` at build time, so the page is fully
rendered static HTML (good for SEO). Pages CMS edits those files via friendly forms — one
sidebar entry per file, so no single form gets unwieldy.

### Local development

```bash
npm install        # once
npm run dev        # live preview at http://localhost:8080
npm run build      # one-off build into _site/
```

### Editing in code (instead of the CMS)
- **Text / photos:** edit the relevant file in `src/content/` (one per section).
- **Colours:** editable from the CMS (Colours / theme). The named palettes and the
  `forest`/`sage`/`stone`/`cream` token mapping live at the top of `src/index.njk` in the
  `PALETTES` table in `src/_data/colors.js`; custom hex overrides come from `src/content/theme.json`.
- **Layout / design:** edit `src/index.njk` (Tailwind classes).
- Commit + push to `main`; Cloudflare rebuilds and deploys in ~1–2 minutes.

### Contact form (Formspree)
The form posts to the Formspree endpoint stored in `src/content/site.json` → `formspreeEndpoint`
(currently `https://formspree.io/f/mwvjrpyo`, delivering to kelly@kellymariecounselling.com).

---

## Custom domain migration (Hostinger → Cloudflare) — reference

`kellymariecounselling.com` is **registered** with Hostinger (unchanged). Only **DNS management**
moved to Cloudflare, because Cloudflare Pages needs Cloudflare-hosted DNS to serve an apex (no-`www`) domain.
This is already done — kept here for reference.

### EMAIL records — KEEP (all must be "DNS only" / grey cloud)

| Type  | Name                          | Value                                          | Priority |
|-------|-------------------------------|------------------------------------------------|----------|
| MX    | `@`                           | `mx1.hostinger.com`                            | 5        |
| MX    | `@`                           | `mx2.hostinger.com`                            | 10       |
| TXT   | `@`                           | `v=spf1 include:_spf.mail.hostinger.com ~all`  | —        |
| TXT   | `_dmarc`                      | `v=DMARC1; p=none`                             | —        |
| CNAME | `hostingermail-a._domainkey`  | `hostingermail-a.dkim.mail.hostinger.com`      | —        |
| CNAME | `hostingermail-b._domainkey`  | `hostingermail-b.dkim.mail.hostinger.com`      | —        |
| CNAME | `hostingermail-c._domainkey`  | `hostingermail-c.dkim.mail.hostinger.com`      | —        |
| CNAME | `autodiscover`                | `autodiscover.mail.hostinger.com`              | —        |
| CNAME | `autoconfig`                  | `autoconfig.mail.hostinger.com`                | —        |

> **⚠️ Known import gotcha:** Cloudflare imports the 5 mail CNAMEs as **Proxied (orange)** —
> they must be toggled to grey **"DNS only"** or DKIM/email breaks. Only website records stay proxied.

### WEBSITE records (managed automatically by Cloudflare Pages custom domains)
The apex + `www` records pointing at the old Hostinger site (`A 145.223.124.152`, `A 147.79.79.23`,
two `AAAA`, and `CNAME www → …cdn.hstgr.net`) were **deleted**; Pages recreated the correct proxied records.

### www → non-www redirect
A Cloudflare Redirect Rule ("Redirect from WWW to root") sends `www.kellymariecounselling.com`
to `kellymariecounselling.com`.
