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
3. Click **Website content**. You'll see simple forms grouped by section:
   *Top section, About Kelly, Services, Therapeutic approach, The process, Contact, Footer.*
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
- [ ] **Make the six new pages' content editable** — see *CMS* section below
- [ ] **Spec the six new pages** — real content for Wellbeing, Counselling, Training & Coaching, Podcast, Merchandise, Meet the Team

---

## CMS — menu control (done) and what's still planned

### Where things live

| File | Role |
|---|---|
| `src/_data/menuItems.js` | **Code-owned** menu catalogue: each item's label and destination. Not editable in the CMS, by design. |
| `src/_data/newPages.json` | The six standalone pages (`title` + `slug`). Feeds both the catalogue and page generation. |
| `src/_data/mainNav.js` | Applies the editor's order and show/hide choices to that catalogue. |
| `src/holding.njk` | Paginates over `newPages` — one "coming soon" page per entry. |
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

Stored in `content.json` as:

```json
"menu": [
  { "item": "about", "visible": true },
  { "item": "wellbeing", "visible": false }
]
```

`mainNav.js` skips rows whose `item` is unknown, so a stale row can't break the build.

> ⚠️ **One sync point for developers:** the list of choices in the **Menu link**
> dropdown is written out in `.pages.yml`. Adding a page to `newPages.json` means adding
> a matching option there too, or it won't be selectable.

> **Room to grow.** Because every link lives in the dropdown panel rather than spread
> across the header bar, adding more items doesn't threaten the layout — the panel just
> gets taller. Only worry if the list gets long enough to need scrolling on a phone.

### 2. Give each page real content

All six pages currently share one hard-coded placeholder. Two options:

- **Simple** — add `heading` and `body` fields to each item in the list above, and have
  `holding.njk` render them. Keeps one section per page. Good enough if these stay simple.
- **Proper** — a separate Pages CMS `collection` (one file per page), so each page can
  have its own sections, images and cards like the homepage does. This is the right
  shape once the pages are properly specced, and is the recommended route.

### 3. Also worth adding at the same time

- **Publish toggle** — a `published` (or `comingSoon`) flag per item, so a page can be
  built out before it's linked from every page on the site. Right now all six are live
  in the menu the moment they exist.
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
│   ├── _data/
│   │   ├── content.json    ← ALL editable text lives here (what the CMS edits)
│   │   ├── colors.js       ← Resolves the chosen palette / custom hex overrides
│   │   ├── newPages.json   ← The six standalone pages (developer-owned)
│   │   ├── menuItems.js    ← Menu labels + destinations (locked, not CMS-editable)
│   │   └── mainNav.js      ← Applies the editor's order / show-hide choices
│   └── images/
│       ├── kelly-hero.jpg
│       └── kelly-about.jpg
└── _site/                  ← Build output (git-ignored, generated by Eleventy)
```

The design lives in `src/index.njk`; the words/photos live in `src/_data/content.json`.
Eleventy merges them into `_site/index.html` at build time, so the page is fully
rendered static HTML (good for SEO). Pages CMS edits `content.json` via friendly forms.

### Local development

```bash
npm install        # once
npm run dev        # live preview at http://localhost:8080
npm run build      # one-off build into _site/
```

### Editing in code (instead of the CMS)
- **Text / photos:** edit `src/_data/content.json`.
- **Colours:** editable from the CMS (Colours / theme). The named palettes and the
  `forest`/`sage`/`stone`/`cream` token mapping live at the top of `src/index.njk` in the
  `{% set palettes %}` block; custom hex overrides come from `content.json` → `theme`.
- **Layout / design:** edit `src/index.njk` (Tailwind classes).
- Commit + push to `main`; Cloudflare rebuilds and deploys in ~1–2 minutes.

### Contact form (Formspree)
The form posts to the Formspree endpoint stored in `content.json` → `site.formspreeEndpoint`
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
