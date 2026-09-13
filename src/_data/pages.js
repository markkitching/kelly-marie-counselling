const fs = require("fs");
const path = require("path");

const PAGES_DIR = path.join(__dirname, "..", "content", "pages");

// Editable content for the standalone pages, keyed by slug. A page whose fields are
// still empty falls back to the "coming soon" placeholder in holding.njk, so pages can
// be filled in one at a time.
//
// Read fresh each time rather than require()d, so `eleventy --serve` picks up edits.
module.exports = () => {
  const pages = {};

  for (const file of fs.readdirSync(PAGES_DIR).sort()) {
    if (!file.endsWith(".json")) continue;
    pages[path.basename(file, ".json")] = JSON.parse(
      fs.readFileSync(path.join(PAGES_DIR, file), "utf8")
    );
  }

  return pages;
};
