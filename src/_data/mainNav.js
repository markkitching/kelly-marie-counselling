const fs = require("fs");
const path = require("path");

const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));

// Builds the single, flat main menu out of two sources that will eventually
// become one CMS-managed list (see "Planned CMS work" in the README):
//   - content.nav  → links to sections of the homepage
//   - newPages     → the standalone pages
// Contact is pinned last; everything else keeps its source order.
module.exports = () => {
  const anchors = (read("content.json").nav || []).map((link) => ({
    label: link.label,
    href: `/#${link.anchor}`,
    isContact: link.anchor === "contact",
  }));

  const pages = read("newPages.json").map((page) => ({
    label: page.title,
    href: `/${page.slug}/`,
    isContact: false,
  }));

  return [
    ...anchors.filter((l) => !l.isContact),
    ...pages,
    ...anchors.filter((l) => l.isContact),
  ];
};
