const fs = require("fs");
const path = require("path");

const PAGES_DIR = path.join(__dirname, "..", "content", "pages");

// Trimmed so a field the editor "cleared" but left a stray space or newline in still
// counts as empty — otherwise the page would drop its placeholder for a blank screen.
const clean = (value) => (typeof value === "string" ? value.trim() : value || "");

// These files are written by the CMS, which has been seen to save an empty file when
// every field is cleared. Treat anything unreadable as "not written yet" rather than
// letting it fail the build — a failed build blocks every later edit from deploying.
const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) || {};
  } catch {
    console.warn(`[content] ${path.basename(file)} is empty or invalid — using the placeholder`);
    return {};
  }
};

// Editable content for the standalone pages, keyed by slug. A page with nothing filled
// in falls back to the "coming soon" placeholder in holding.njk, so pages can be
// written one at a time.
//
// Read fresh each time rather than require()d, so `eleventy --serve` picks up edits.
module.exports = () => {
  const pages = {};

  for (const file of fs.readdirSync(PAGES_DIR).sort()) {
    if (!file.endsWith(".json")) continue;

    const raw = readJson(path.join(PAGES_DIR, file));
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
