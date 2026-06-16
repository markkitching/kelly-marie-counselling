# Kelly Marie Counselling — Website

A warm, single-page counselling website for Kelly Marie Counselling (Leeds). Plain HTML + Tailwind CSS CDN — no build step required.

---

## TODO

- [ ] **Phone number** — removed from the site for now; re-add to the contact section and footer when a number is available
- [ ] **BACP membership number** — replace `No. 000000` placeholder in the footer badge
- [ ] **Social links** — add Instagram / Facebook / LinkedIn to the footer once profiles exist
- [x] **Custom domain** — `kellymariecounselling.com` live on Cloudflare Pages ✓

---

## Custom domain migration (Hostinger → Cloudflare)

`kellymariecounselling.com` is **registered** with Hostinger and that does not change. We move only **DNS management** to Cloudflare, because Cloudflare Pages needs Cloudflare-hosted DNS to serve an apex (no-`www`) domain.

### Steps

1. Cloudflare dashboard → **+ Add → Connect a domain** → enter `kellymariecounselling.com` → **Free** plan. Cloudflare scans and imports the existing Hostinger records.
2. **⚠️ Verify the email records below survived the import** before doing anything else. If any are missing, add them manually. Missing MX/SPF/DKIM records break email *and* the contact-form deliveries to kelly@kellymariecounselling.com.
3. Replace the two **website** records (see table) so they point at Pages instead of the old Hostinger site.
4. Hostinger hPanel → Domains → `kellymariecounselling.com` → Nameservers → switch to **Custom** and paste the two Cloudflare nameservers shown in the dashboard.
5. Wait for Cloudflare's activation email (usually <1 hour, up to 24).
6. Workers & Pages → this project → **Custom domains** → add `kellymariecounselling.com` *and* `www.kellymariecounselling.com`.

> **Reversible:** if anything breaks, set the Hostinger nameservers back to their originals and you return to today's setup within ~1 hour.

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

> **⚠️ Known import gotcha:** Cloudflare imports the MX and TXT rows correctly as "DNS only," but sets the **5 mail CNAMEs** (3× `hostingermail-*._domainkey`, `autodiscover`, `autoconfig`) to **Proxied (orange cloud)**. This breaks DKIM signing and mail-client auto-setup. Edit each of the 5 and toggle the proxy **off** so it shows grey **"DNS only."** Only website records should be proxied/orange.

### WEBSITE records — REPLACE (these point at the old Hostinger site)

Cloudflare resolves the old Hostinger `ALIAS @` into real server A/AAAA records on import. Delete all of the following; the Pages custom-domain step (6) recreates the correct proxied records automatically:

| Type  | Name  | Old Hostinger value (delete)                     |
|-------|-------|--------------------------------------------------|
| A     | `@`   | `145.223.124.152`                                |
| A     | `@`   | `147.79.79.23`                                   |
| AAAA  | `@`   | `2a02:4780:4d:8…` (Hostinger IPv6)               |
| AAAA  | `@`   | `2a02:4780:4b:1f…` (Hostinger IPv6)              |
| CNAME | `www` | `www.kellymariecounselling.com.cdn.hstgr.net`    |

---

## Contents

```
/
├── index.html          ← Entire website
├── images/
│   ├── README.md       ← Photo instructions
│   ├── kelly-hero.jpg  ← Add your hero portrait here
│   └── kelly-about.jpg ← Add your about-section photo here
└── README.md           ← This file
```

---

## Updating content

All content lives in `index.html`. Each major section is marked with a comment block:

```
<!-- ═══════════════════════════════════════════════
     SECTION NAME
     UPDATE: what to change in this section
════════════════════════════════════════════════ -->
```

Use your editor's search (`Ctrl+F` / `Cmd+F`) to find `UPDATE:` — every placeholder that needs replacing is flagged this way.

### Key things to update

| What | Where to look |
|---|---|
| Email address | Search `kelly@kellymariecounselling.com` (2 occurrences) |
| Phone number | Search `07700 000 000` (2 occurrences) |
| Location / address | Search `Leeds, West Yorkshire` |
| BACP membership number | Search `No. 000000` |
| Hero headline & bio | `HERO` and `ABOUT KELLY` sections |
| Services descriptions | `SERVICES` section — 6 card blocks |
| Availability hours | `CONTACT` section, availability row |
| Formspree endpoint | See below |

---

## Adding photos

Place photo files in the `images/` folder:

- `images/kelly-hero.jpg` — portrait used in the hero section
- `images/kelly-about.jpg` — photo used in the About section

See `images/README.md` for size recommendations. The site shows styled placeholders when images are absent, so it looks good at any stage.

---

## Configuring Formspree (contact form)

1. Sign up for a free account at [formspree.io](https://formspree.io)
2. Click **New Form** → give it a name (e.g. "Kelly Marie Website")
3. Copy the form endpoint — it looks like `https://formspree.io/f/abcdefgh`
4. In `index.html`, find `YOUR_FORM_ID` and replace it:

```html
<!-- Before -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">

<!-- After -->
<form action="https://formspree.io/f/abcdefgh" method="POST">
```

5. Save and push. Formspree will email you every time someone submits the form.

> **Free tier** — 50 submissions/month. Upgrade if you need more.

---

## Deploying to Cloudflare Pages

1. Push this repo to GitHub (already done if you're reading this there).
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages** → **Create a project**.
3. Connect your GitHub account and select the `kelly-marie-counselling` repository.
4. Configure the build:

| Setting | Value |
|---|---|
| Framework preset | **None** |
| Build command | *(leave blank)* |
| Build output directory | `/` |

5. Click **Save and Deploy**. Cloudflare will deploy on every push to `main`.

Your site will be live at `https://kelly-marie-counselling.pages.dev` (or a custom domain you configure in the Pages settings).

### Custom domain

In Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain** → follow the DNS instructions.

---

## Local preview

No server needed. Just open `index.html` in any browser:

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Or use VS Code's **Live Server** extension for auto-reload on save.

---

## Making changes

Edit `index.html`, commit, and push to `main`. Cloudflare Pages will auto-deploy within ~30 seconds.

```bash
git add index.html images/
git commit -m "Update contact details"
git push
```
