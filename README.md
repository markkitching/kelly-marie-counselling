# Kelly Marie Counselling — Website

A single-page counselling website for Kelly Marie Counselling (Leeds), built with
[Eleventy](https://www.11ty.dev/) + Tailwind CSS, hosted on Cloudflare Pages, and
editable through a friendly visual editor ([Pages CMS](https://pagescms.org)) — no code required.

- **Live site:** https://kellymariewellbeing.com  (`kellymariecounselling.com` redirects to it)
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
- [x] **Custom domain** — `kellymariewellbeing.com` live on Cloudflare Pages, old domain redirecting ✓
- [x] **Visual CMS** — Pages CMS editing enabled ✓
- [ ] **Custom sections** — allow editor to add/reorder new sections (low priority)
- [x] **Colour themes** — editor can switch palettes or set custom colours ✓
- [x] **Six new menu items + holding pages** — Wellbeing, Counselling, Training & Coaching, Podcast, Merchandise, Meet the Team ✓
- [x] **Menu order + show/hide editable in the CMS** — names and destinations stay locked ✓
- [x] **Six new pages' content editable** — simple fields per page; placeholder shows until filled ✓
- [x] **Spec the six new pages** — draft content written for all six, awaiting review ✓
- [ ] **Sign off the draft page content** — see *Draft content: what needs checking* below
- [x] **Page blocks added to `.pages.yml`** — forms tailored per page, round-trip verified ✓
- [x] **Podcast episodes pull automatically from YouTube** — daily, with order and edits preserved ✓
- [ ] **Run the podcast sync once** — Actions → Sync podcast episodes → Run workflow

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
| `src/_includes/page-body.njk` | Renders the optional content blocks that make up a page. |
| `scripts/gen-pages-yml.py` | Regenerates the six `Page:` entries in `.pages.yml` from one block map. |
| `scripts/check-pages-yml.py` | Verifies a CMS save can't drop any stored field. |
| `scripts/sync-podcast-episodes.js` | Pulls recent episodes from YouTube (or Spotify) into the podcast page. |
| `scripts/test-sync-merge.js` | Proves the sync can't undo the editor's order, edits or hidden episodes. |
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
and so on). A page is assembled from **optional blocks** — fill in the ones that suit
the page and leave the rest empty. Blocks render in the fixed order below, and their
backgrounds alternate light/dark automatically, so the page keeps its rhythm whichever
combination is in use.

| Block | Fields | Used by |
|---|---|---|
| **Heading band** | Small heading, Page title, Intro paragraph | every page |
| **Main text** | Main text, Photo (optional, sits alongside) | every page |
| **Cards** | Section heading + rows of *icon, title, description, meta* | Wellbeing, Counselling, Training |
| **Checklist** | `checklistTitle` + `checklistItems` rows of *text*, shown two-up with ticks | Wellbeing, Counselling, Training |
| **Listen links** | Section heading + rows of *label, icon, link* | Podcast |
| **Episodes** | Section heading + rows of *number, title, description, meta, YouTube link, Spotify link, show/hide* | Podcast |
| **Products** | Section heading + rows of *name, price, description, photo, meta, link* | Merchandise |
| **People** | Section heading + rows of *name, role, credentials, bio, photo* | Meet the Team |
| **Quote** | Quote + attribution, on the dark band | Wellbeing, Counselling, Training |
| **FAQs** | Section heading + rows of *question, answer*, as an accordion | Wellbeing, Counselling, Training, Meet the Team |
| **Closing CTA** | `ctaHeading`, `ctaText`, `ctaButtonLabel`, `ctaButtonIcon`, `ctaButtonHref` | every page |

**Rows collapse to one line.** Every repeatable list — episodes, cards, FAQs, people,
products — shows each row as a single draggable line carrying its title, so reordering
thirty episodes is dragging thirty lines rather than scrolling thirty open forms. Click a
line to open it. Configured per list in `.pages.yml`:

```yaml
type: object
list:
  collapsible:
    collapsed: true
    summary: '{title}'      # any field on the row; {index} also works
```

The one exception is **Main menu**, whose rows stay open: they are two fields, and one is
the *Show in menu* tick box that makes the list worth having. Collapsing would hide it.

> Keep the summary token pointing at a field that actually exists on the row — a token
> that doesn't resolve renders as empty, giving you a list of blank lines to drag. The
> check below catches that.

Blocks look after themselves:

- **A blank row renders nothing.** Adding a card and leaving it empty shows no card,
  rather than an empty box.
- **A missing link degrades gracefully.** A listen link with no address shows as a
  greyed "Soon" chip, so the row is ready the moment a real URL exists.
- **Fewer than three people** get a narrower grid, so a two-person team doesn't sit in
  a three-column row with a hole in it.
- **The placeholder is still the fallback.** Empty the whole page and it returns to its
  "coming soon" holding screen, so pages can be built one at a time.

Content lives in `src/content/pages/<slug>.json`, loaded by `src/_data/pages.js` and
rendered by `src/_includes/page-body.njk`.

> ⚠️ **Fixed order.** Blocks always appear in the order above; the editor can't reorder
> them. That was a deliberate simplification — reorderable blocks need a polymorphic
> list in the CMS, which is a much larger change. Worth revisiting only if a page
> genuinely needs a different order.

### Podcast episodes sync automatically

A scheduled job pulls the show's recent episodes into `src/content/pages/podcast.json`,
where they behave like any other episode: reorder by dragging, untick to hide, edit any
wording. The page renders the first 10 ticked.

**The source is YouTube, not Spotify.** Spotify's Web API would work, but Spotify has
new app creation on hold, so most people can't obtain credentials at all. YouTube is the
better source regardless: it hands back a video id, which is what the episode card needs
to show a playable still rather than just a link out.

| Source | Setup | Reach |
|---|---|---|
| `youtube-rss` *(default)* | nothing at all | the 15 most recent videos |
| `youtube-api` | a Google API key | the full back catalogue |
| `spotify` | client id + secret | the show's episodes — kept working, but see above |

**Setup: none.** The show's handle is committed in the sync script, and the `UC…` id
YouTube's feed actually wants is looked up from the channel page at run time. A channel
id isn't secret, so nothing belongs in repository settings. To point the sync at a
different channel, set a `YOUTUBE_CHANNEL` repository variable to its handle or id.

For more than the feed's 15 episodes, create an API key at
<https://console.cloud.google.com/apis/credentials> with **YouTube Data API v3** enabled,
add it as the secret `YOUTUBE_API_KEY`, and set the variable `EPISODE_SOURCE` to
`youtube-api`. It costs one quota unit per call against a free daily allowance of 10,000
— the script uses `playlistItems.list` rather than `search.list`, which would cost 100.

> **If the lookup ever fails** — YouTube changes its page, or serves a consent page — the
> sync stops with the reason and writes nothing. Setting `YOUTUBE_CHANNEL` to the `UC…`
> id (YouTube Studio → Settings → Channel → Advanced) skips the lookup entirely.

```bash
npm run test:sync                                       # the merge rules — 23 checks
npm run sync:podcast                                    # no configuration needed
node scripts/sync-podcast-episodes.js --dry-run         # show what would change
node scripts/sync-podcast-episodes.js --fixture f.xml   # test against a saved feed
node scripts/sync-podcast-episodes.js --source youtube-api
```

`.github/workflows/sync-podcast.yml` runs daily at 06:00 UTC and on demand from the
Actions tab. It runs the merge tests first, syncs, confirms the site still builds, and
commits only if something changed — which triggers the usual Cloudflare deploy.

**What the sync will and won't do.** These rules exist so a nightly job can never quietly
undo an afternoon's editing, and every one is covered by `npm run test:sync`:

| | |
|---|---|
| Order | Never rearranged. Existing episodes stay where they were put; new ones go on top, newest first |
| Your edits | A field with something in it is never overwritten. Rewrite a title or description for the website and it stays. Clear it and the next sync refills it |
| Hidden episodes | Stay hidden |
| Deletions | Never. An episode that vanishes upstream stays in the file until someone removes it |
| Failure | Writes nothing and exits non-zero. An outage upstream cannot empty the page |

> **Identity is the video id**, parsed exactly as `src/_data/pages.js` parses it — so an
> episode whose YouTube link was pasted in by hand is recognised as the same episode and
> is not duplicated. An episode with no YouTube link at all is invisible to the sync and
> left completely alone, which is why the original placeholder topics survive untouched,
> and why they drop off the page once real episodes sit above them.

> **Descriptions are trimmed to 240 characters** on a word boundary. YouTube descriptions
> carry timestamps, links and sponsor copy that would wreck a card. Rewrite any of them
> and the sync leaves your version alone.

### Podcast episodes — how adding one will work

Pages CMS can't browse YouTube or Spotify, so an episode is added by **pasting a link**.
Each episode row has:

| Field | Notes |
|---|---|
| Episode number | Optional, shown as a small label |
| Title | Required — a row with no title isn't rendered |
| Description | Optional |
| Duration / date | Optional free text |
| On the page | *Shown* or *Hidden* — hiding takes it off the page without deleting it |
| YouTube link | Paste anything YouTube's Share button gives you |
| Spotify link | Paste anything Spotify's Share button gives you |

**Choosing which episodes appear, and in what order.** Drag the rows to reorder them —
that order is what the page uses, so newest-first is just a matter of dragging. Set an
episode to *Hidden* to take it off the page while keeping it in the list.

Each row collapses to one line reading **`Shown · Episode title`**, so the whole list can
be read and reordered without opening anything. That is why *On the page* is a two-value
dropdown rather than a tick box: `summary` renders text, so a tick box's state could not
appear in the line. Pages CMS has no way to put an interactive control in a collapsed
row, so a toggle you can click without opening the row isn't available.

**The page shows the first 10 ticked episodes** (`EPISODE_LIMIT` in `src/_data/pages.js`).
Beyond that, a line appears under the grid linking out to the full back catalogue, so a
long-running show doesn't turn the page into an endless scroll. Every episode can stay
in the CMS regardless — the limit only affects what's rendered.

> **Only an explicit "hidden" hides a row.** `isHidden()` in `src/_data/pages.js` accepts
> the `Hidden` value, the `false` that rows written before the dropdown existed still
> carry, and any casing or stray spacing around either. Everything else shows, including
> a row with no value and one the CMS left the key out of. Erring the other way would
> silently publish an episode someone had hidden. `clean()` passes booleans through
> untouched for the same reason — were `false` flattened to `""` it would read as shown.

**The YouTube field is deliberately forgiving.** `pages.js` pulls the video id out of a
watch URL, a `youtu.be` short link, an `/embed/` or `/shorts/` URL, or a bare id — so
whatever gets pasted, it works. Spotify accepts `open.spotify.com` links, `spotify.link`
short links and `spotify:episode:…` URIs; anything that isn't a Spotify address is
ignored rather than rendered as a link that goes somewhere unexpected.

What each combination produces:

| Episode has | Card shows |
|---|---|
| A YouTube link | The video still, which becomes the player when clicked, plus both listen links |
| Spotify only | An "Audio episode" panel and a *Listen on Spotify* link |
| Neither | A "Not published yet" placeholder — so a planned episode can be listed before it exists |

Every card keeps a media area of the same size, so cards sitting side by side line up
whichever combination they use.

> **Nothing is requested from YouTube until someone presses play.** The card shows a
> still image, and only on click does the player load — from `youtube-nocookie.com`.
> For a counselling site, where a visitor reading the page shouldn't be handed to
> Google's tracking, that's worth the small amount of extra code.

### 2a. Each page's form shows only the blocks that page uses

`.pages.yml` gives every page its own tailored form, so *Page: Merchandise* has no
Checklist section and *Page: Counselling* has no Products section. The block map that
decides this lives in `scripts/gen-pages-yml.py`, which regenerates all six entries —
edit the map and re-run it rather than hand-editing 900 lines of YAML.

Field names in the form match the JSON keys exactly. That matters more than it sounds:
Pages CMS writes back only what its schema knows about, so a key with no matching field
would be **silently deleted** the first time the editor saves. The generator and a
round-trip check guard against that — see *Checking the CMS schema* below.

Every field is a `string`, `text`, `image`, `select`, or an `object` with `list: true`.
There is no nesting beyond one level, which is why `checklistTitle`/`checklistItems` and
the `ctaHeading`/`ctaText`/`ctaButton…` fields are flat rather than nested objects.

### Checking the CMS schema

After changing `.pages.yml` or the page JSON, confirm a save can't lose anything:

```bash
python3 scripts/check-pages-yml.py     # every stored key has a matching form field
```

It parses the YAML, compares each form against its JSON file (including the sub-fields
of every list block), then simulates a save — writing each file back with only the keys
the form knows — and confirms the built site is byte-for-byte unchanged.

### Podcast episodes — how adding one will work

Pages CMS can't browse YouTube or Spotify, so an episode is added by **pasting a link**.
Each episode row has:

| Field | Notes |
|---|---|
| Episode number | Optional, shown as a small label |
| Title | Required — a row with no title isn't rendered |
| Description | Optional |
| Duration / date | Optional free text |
| YouTube link | Paste anything YouTube's Share button gives you |
| Spotify link | Paste anything Spotify's Share button gives you |

**The YouTube field is deliberately forgiving.** `pages.js` pulls the video id out of a
watch URL, a `youtu.be` short link, an `/embed/` or `/shorts/` URL, or a bare id — so
whatever gets pasted, it works. Spotify accepts `open.spotify.com` links, `spotify.link`
short links and `spotify:episode:…` URIs; anything that isn't a Spotify address is
ignored rather than rendered as a link that goes somewhere unexpected.

What each combination produces:

| Episode has | Card shows |
|---|---|
| A YouTube link | The video still, which becomes the player when clicked, plus both listen links |
| Spotify only | An "Audio episode" panel and a *Listen on Spotify* link |
| Neither | A "Not published yet" placeholder — so a planned episode can be listed before it exists |

Every card keeps a media area of the same size, so cards sitting side by side line up
whichever combination they use.

> **Nothing is requested from YouTube until someone presses play.** The card shows a
> still image, and only on click does the player load — from `youtube-nocookie.com`.
> For a counselling site, where a visitor reading the page shouldn't be handed to
> Google's tracking, that's worth the small amount of extra code.

### ⚠️ 2a. `.pages.yml` must be updated before this content goes live

The new block fields **are not yet in the CMS schema**. Until they are:

- the editor can't see or change any of the new content, and
- **saving one of these pages in Pages CMS would strip every field the form doesn't
  know about**, wiping the block content.

So `.pages.yml` needs its six `Page:` entries extended with the fields in the table
above before this reaches `main`. Field types needed are all ones already proven in
this repo — `string`, `text`, `image`, and `object` with `list: true`.

### Draft content: what needs checking

The draft copy was written to show the design working. These points are placeholders
or assumptions and need Kelly's sign-off before publishing:

| Page | Needs confirming |
|---|---|
| Podcast | Named *The Kelly Marie Podcast*. The show's Spotify and YouTube addresses are still needed, and the four listed episodes are placeholder topics to be replaced with real ones. |
| Merchandise | The four products are illustrative. No prices are quoted — each shows "Coming soon" instead. |
| Meet the Team | The second card is an unnamed "Associate Practitioner — joining soon" placeholder. Delete it if the practice isn't recruiting. Kelly's card has no portrait: the photo currently in *About* is a landscape, not a headshot. |
| Counselling | The fees FAQ says fees are confirmed at consultation rather than quoting a figure. |
| Training & Coaching | The sectors named in the FAQ ("media and manufacturing") come from the existing Workplace Therapy copy. |
| All pages | No photos are set. Each page's Main text block can take one. |

### 3. Also worth adding at the same time

- **Per-page SEO** — `metaTitle` / `metaDescription` fields. Titles are currently derived
  automatically as *"{Page name} | Kelly Marie Counselling"*, and there's no per-page description.
- **Footer links** — the footer's Quick Links show only the homepage-section links
  (About / Services / My Approach / Contact), matching what it showed before. Decide
  whether the six pages belong there too.

### Brand names don't currently match

The header and footer read **Kelly Marie Wellbeing**, but the browser tab title and the
search-engine description in *Page settings* still read **Kelly Marie Counselling**.
Those two fields are what Google prints in its results, so the site currently presents
one name to visitors and another to search.

That is worth a deliberate decision rather than a quick fix: "counselling" is the word
people actually search for, so replacing it in the title and description may cost real
traffic. A common middle course is a title carrying both — *"Kelly Marie Wellbeing |
Counselling & Psychotherapy in Leeds"* — which keeps the search term while matching the
brand. Both fields are editable under **Page settings**.

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
│   ├── holding.njk         ← Generates the six standalone pages (one per newPages entry)
│   ├── _includes/
│   │   ├── site-header.njk ← Shared <head> + sticky nav
│   │   ├── page-body.njk   ← Optional content blocks for the standalone pages
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
│   └── images/          ← uploaded through the CMS; favicon.ico is generated
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
(currently `https://formspree.io/f/mwvjrpyo`).

> ⚠️ **The delivery address lives at Formspree, not in this repo.** It was set to
> kelly@**kellymariecounselling**.com before the domain moved. If that mailbox has gone,
> enquiries submitted through the form go nowhere and nobody is told. Worth confirming in
> the Formspree dashboard that it now delivers to kelly@kellymariewellbeing.com — and
> worth sending a test enquiry through the live form either way, since this is the one
> failure on the site that is completely silent.

---

## Custom domain migration (Hostinger → Cloudflare) — reference

The site now serves from `kellymariewellbeing.com`; `kellymariecounselling.com` redirects
to it. The notes below describe the original migration of the older domain and still
apply to its DNS.

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
