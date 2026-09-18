const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "content", "counselling");

// The Counselling page is built from the same seven sections as the homepage, but from
// its own copy of the content — same design, independent words. Loaded exactly like
// src/_data/content.js, including the guard against a file the CMS has emptied.
//
// Read fresh each time rather than require()d, so `eleventy --serve` picks up edits.
module.exports = () => {
  const sections = {};

  for (const file of fs.readdirSync(DIR).sort()) {
    if (!file.endsWith(".json")) continue;
    const key = path.basename(file, ".json");
    try {
      sections[key] = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
    } catch {
      console.warn(`[content] counselling/${file} is empty or invalid — skipping that section`);
      sections[key] = {};
    }
  }

  return sections;
};
