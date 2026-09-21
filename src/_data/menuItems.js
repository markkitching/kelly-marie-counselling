const fs = require("fs");
const path = require("path");

// The menu's labels and destinations are owned here, in code — deliberately not in the
// CMS. The editor controls order and visibility only, so a link can never be renamed
// into something misleading or pointed at a URL that doesn't exist.
//
// Homepage sections scroll to an anchor; pages come from newPages.json so page
// existence has a single source of truth.
// Sections the Counselling page carries. The homepage is now just its top section, so
// these scroll targets live there rather than on `/`.
const SECTIONS = [
  { id: "about", label: "About", anchor: "about" },
  { id: "services", label: "Services", anchor: "services" },
  { id: "approach", label: "My Approach", anchor: "approach" },
];
const SECTION_PAGE = "/counselling/";

// Pages that aren't in newPages.json because they have no editable body of their own.
const EXTRA_PAGES = [{ id: "contact", label: "Contact", href: "/contact/" }];

module.exports = () => {
  const pages = JSON.parse(
    fs.readFileSync(path.join(__dirname, "newPages.json"), "utf8")
  );

  const items = {};

  for (const section of SECTIONS) {
    items[section.id] = {
      label: section.label,
      href: `${SECTION_PAGE}#${section.anchor}`,
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

  for (const page of EXTRA_PAGES) {
    items[page.id] = { label: page.label, href: page.href, isSection: false };
  }

  return items;
};
