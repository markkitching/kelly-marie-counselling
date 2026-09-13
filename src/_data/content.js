const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "content");

// Each section of the site is its own file in src/content/ so the CMS can offer them
// as separate entries in its sidebar rather than one very long form. They're merged
// back into a single `content` object here, keyed by filename, so templates carry on
// using content.hero.*, content.about.* and so on.
//
// Read fresh each time rather than require()d, so `eleventy --serve` picks up edits.
module.exports = () => {
  const content = {};

  for (const file of fs.readdirSync(CONTENT_DIR).sort()) {
    if (!file.endsWith(".json")) continue;
    const key = path.basename(file, ".json");
    content[key] = JSON.parse(
      fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")
    );
  }

  return content;
};
