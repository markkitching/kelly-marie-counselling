const fs = require("fs");
const path = require("path");

// The menu's labels and destinations are owned here, in code — deliberately not in the
// CMS. The editor controls order and visibility only, so a link can never be renamed
// into something misleading or pointed at a URL that doesn't exist.
//
// Homepage sections scroll to an anchor; pages come from newPages.json so page
// existence has a single source of truth.
const SECTIONS = [
  { id: "about", label: "About", anchor: "about" },
  { id: "services", label: "Services", anchor: "services" },
  { id: "approach", label: "My Approach", anchor: "approach" },
  { id: "contact", label: "Contact", anchor: "contact" },
];

module.exports = () => {
  const pages = JSON.parse(
    fs.readFileSync(path.join(__dirname, "newPages.json"), "utf8")
  );

  const items = {};

  for (const section of SECTIONS) {
    items[section.id] = {
      label: section.label,
      href: `/#${section.anchor}`,
      isSection: true,
    };
  }

  for (const page of pages) {
    items[page.slug] = {
      label: page.title,
      href: `/${page.slug}/`,
      isSection: false,
    };
  }

  return items;
};
