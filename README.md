# Kelly Marie Counselling — Website

A warm, single-page counselling website for Kelly Marie Counselling (Leeds). Plain HTML + Tailwind CSS CDN — no build step required.

---

## TODO

- [ ] **Phone number** — replace `07700 000 000` placeholder in `index.html` (2 occurrences: contact section + footer)
- [ ] **BACP membership number** — replace `No. 000000` placeholder in the footer badge
- [ ] **Social links** — add Instagram / Facebook / LinkedIn to the footer once profiles exist
- [ ] **Custom domain** — add `kellymariecounselling.com` in Cloudflare Pages → Custom domains

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
