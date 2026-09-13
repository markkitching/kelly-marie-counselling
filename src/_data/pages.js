const fs = require("fs");
const path = require("path");

const PAGES_DIR = path.join(__dirname, "..", "content", "pages");

// Trimmed so a field the editor "cleared" but left a stray space or newline in still
// counts as empty — otherwise the page would drop its placeholder for a blank screen.
const clean = (value) => (typeof value === "string" ? value.trim() : value || "");

// Editable content for the standalone pages, keyed by slug. A page with nothing filled
// in falls back to the "coming soon" placeholder in holding.njk, so pages can be
// written one at a time.
//
// Read fresh each time rather than require()d, so `eleventy --serve` picks up edits.
module.exports = () => {
  const pages = {};

  for (const file of fs.readdirSync(PAGES_DIR).sort()) {
    if (!file.endsWith(".json")) continue;

    const raw = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), "utf8"));
    const page = {
      eyebrow: clean(raw.eyebrow),
      heading: clean(raw.heading),
      intro: clean(raw.intro),
      body: clean(raw.body),
      image: clean(raw.image),
    };

    // The eyebrow alone is decoration, so it doesn't by itself make a page "written".
    page.hasContent = Boolean(
      page.heading || page.intro || page.body || page.image
    );

    pages[path.basename(file, ".json")] = page;
  }

  return pages;
};
