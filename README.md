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
- [ ] **Make the whole menu reorderable in the CMS** — currently only the four original links can be reordered; see *Planned CMS work* below
- [ ] **Spec the six new pages** — real content for Wellbeing, Counselling, Training & Coaching, Podcast, Merchandise, Meet the Team

---

## Planned CMS work — the new pages

The six new pages are currently **hard-coded**, deliberately: nothing in `.pages.yml`
or `content.json` was changed. This section records what needs doing to hand them
over to the editor, once the pages are actually specced.

### Where things live now

| File | Role |
|---|---|
| `src/_data/newPages.json` | The six new pages (`title` + `slug`). Developer-owned, not editable in the CMS. |
| `src/_data/mainNav.js` | Merges `content.nav` + `newPages` into the single flat menu, pinning Contact last. |
| `src/holding.njk` | Paginates over `newPages` — one "coming soon" page per entry, all sharing the same placeholder copy. |
| `src/_includes/site-header.njk` | Shared `<head>` + sticky nav. |
| `src/_includes/site-footer.njk` | Shared footer + page scripts. |

The four original links (About / Services / My Approach / Contact) still come from
`content.nav` and still point at sections of the homepage — their destinations are
unchanged. The menu is a single flat level; there is no dropdown.

### 1. ⚠️ Make the menu one editable, reorderable list

**This is the important one.** The menu is currently assembled from *two* sources that
the editor can only half-control:

- `content.nav` — editable and drag-reorderable in the CMS, but only covers the four
  homepage-section links
- `newPages.json` — the six new pages, **not editable at all**, and always inserted
  between "My Approach" and "Contact" by `mainNav.js`

So **the editor cannot currently reorder the menu as a whole** — they can shuffle the
four old links among themselves, but can't move Wellbeing above Services, can't move
Podcast to the end, and can't reposition Contact. The Contact-last rule is hard-coded
in `mainNav.js`.

The fix is to collapse both sources into **one** list in `content.json`, where each
entry is either a homepage section link or a standalone page:

```yaml
- name: nav
  label: Main menu (drag to reorder)
  type: object
  list: true
  fields:
    - { name: label, label: Link text, type: string }
    - name: type
      label: What does this link go to?
      type: select
      options:
        values:
          - { value: section, label: "A section of the homepage" }
          - { value: page,    label: "Its own page" }
    - { name: anchor, label: "If a homepage section — which one (e.g. about, services)", type: string }
    - { name: slug,   label: "If its own page — page address, lowercase with dashes (e.g. meet-the-team)", type: string }
```

`mainNav.js` then becomes a thin mapper (`type === 'page' ? '/'+slug+'/' : '/#'+anchor`)
with no ordering logic of its own, and `holding.njk` paginates over the entries where
`type === 'page'`. Dragging rows in the CMS reorders the real menu — including moving
Contact wherever they want it.

> ⚠️ **Warn the editor in the field label:** changing a `slug` changes that page's web
> address, so any existing links to it (or search-engine results) will break.

> **Watch the menu width.** Ten items already fill the header bar — the
> "Request a Consultation" button had to come out of the top bar to make room (it's
> still in the hero and the mobile menu). Adding more items, or much longer labels,
> will overflow. Worth either capping the count, or revisiting the design at that point.

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
- **Footer links** — the footer's Quick Links mirror `content.nav` only. Decide whether
  the new pages belong there too.

### 4. Open design question

"Services" (an existing homepage section) overlaps conceptually with *Wellbeing*,
*Counselling* and *Training & Coaching*, which now sit beside it in the same flat menu.
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
│   │   ├── newPages.json   ← The six new pages (hard-coded for now — see Planned CMS work)
│   │   └── mainNav.js      ← Merges content.nav + newPages into the flat menu
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
