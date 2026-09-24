const fs = require("fs");
const path = require("path");

const PAGES_DIR = path.join(__dirname, "..", "content", "pages");

// Where a page's closing button goes when the editor hasn't set a link.
const CONTACT_URL = require("./links.js")().contact;

// How many episodes the podcast page shows. The editor can list every episode and hide
// or reorder them freely; only this many of the shown ones reach the page, with a link
// out to the full back catalogue underneath.
const EPISODE_LIMIT = 10;

// Trimmed so a field the editor "cleared" but left a stray space or newline in still
// counts as empty — otherwise the page would drop its placeholder for a blank screen.
// Tick boxes are passed through as-is: an unticked one is `false`, which must not be
// flattened to "" or an episode the editor hid would go on showing.
const clean = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "boolean") return value;
  return value || "";
};

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

// A YouTube link can be pasted in any of the forms the site hands out — a watch URL, a
// youtu.be short link, an embed or shorts URL — or just the bare id. All we keep is the
// id, which is what both the thumbnail and the player need.
const YOUTUBE_ID = /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/;
const youtubeId = (value) => {
  const raw = clean(value);
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const found = raw.match(YOUTUBE_ID);
  return found ? found[1] : "";
};

// Spotify's share menu gives out open.spotify.com links, spotify.link short links and
// spotify: URIs. Anything that isn't one of those is dropped rather than rendered as a
// link that goes somewhere unexpected.
const SPOTIFY_URL = /^https:\/\/([a-z0-9-]+\.)*(spotify\.com|spotify\.link)\//;
const spotifyUrl = (value) => {
  const raw = clean(value);
  const uri = raw.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/);
  if (uri) return `https://open.spotify.com/${uri[1]}/${uri[2]}`;
  return SPOTIFY_URL.test(raw) ? raw : "";
};

// One repeatable block — a card, an episode, a person. `keys` is the shape we render,
// so an unexpected field in the file is ignored rather than leaking into the page.
// Rows missing `required` are dropped: adding a row in the CMS and leaving it blank
// should show nothing, not an empty card.
const rows = (raw, required, keys) =>
  (Array.isArray(raw) ? raw : [])
    .map((row) => {
      const out = {};
      for (const key of keys) out[key] = clean((row || {})[key]);
      return out;
    })
    .filter((row) => row[required]);

// Editable content for the standalone pages, keyed by slug. Every block is optional, so
// a page shows only what's been filled in, and a page with nothing at all falls back to
// the "coming soon" placeholder in holding.njk.
//
// Read fresh each time rather than require()d, so `eleventy --serve` picks up edits.
module.exports = () => {
  const pages = {};

  for (const file of fs.readdirSync(PAGES_DIR).sort()) {
    if (!file.endsWith(".json")) continue;

    const raw = readJson(path.join(PAGES_DIR, file));

    const page = {
      // Heading band + opening text
      eyebrow: clean(raw.eyebrow),
      heading: clean(raw.heading),
      intro: clean(raw.intro),
      body: clean(raw.body),
      image: clean(raw.image),

      // Optional blocks, rendered in a fixed order by page-body.njk. Each carries an
      // optional heading of its own; left blank, the block simply has no heading.
      cardsTitle: clean(raw.cardsTitle),
      cards: rows(raw.cards, "title", ["icon", "title", "description", "meta"]),
      checklistTitle: clean(raw.checklistTitle),
      checklistItems: rows(raw.checklistItems, "text", ["text"]),
      linksTitle: clean(raw.linksTitle),
      links: rows(raw.links, "label", ["label", "icon", "href"]),
      episodesTitle: clean(raw.episodesTitle),
      // Every episode on the list is on the page, up to EPISODE_LIMIT. Taking one off
      // means deleting it, which moves it to the page's archive.
      episodes: rows(raw.episodes, "title",
        ["number", "title", "description", "meta", "youtube", "spotify"])
        .map((episode) => ({
          ...episode,
          youtube: youtubeId(episode.youtube),
          spotify: spotifyUrl(episode.spotify),
        })),
      productsTitle: clean(raw.productsTitle),
      products: rows(raw.products, "name", ["name", "price", "description", "image", "meta", "href"]),
      peopleTitle: clean(raw.peopleTitle),
      people: rows(raw.people, "name", ["name", "role", "credentials", "bio", "image"]),
      faqsTitle: clean(raw.faqsTitle),
      faqs: rows(raw.faqs, "question", ["question", "answer"]),
      quote: clean(raw.quote),
      quoteAuthor: clean(raw.quoteAuthor),
      ctaHeading: clean(raw.ctaHeading),
      ctaText: clean(raw.ctaText),
      ctaButtonLabel: clean(raw.ctaButtonLabel),
      // These two always resolve to something, so neither counts towards hasContent.
      ctaButtonIcon: clean(raw.ctaButtonIcon) || "calendar",
      ctaButtonHref: clean(raw.ctaButtonHref) || CONTACT_URL,
      // No default: the CMS drops a field the editor has emptied, so an absent value has
      // to mean "no button" or clearing it would quietly put the button back.
      ctaBackLabel: clean(raw.ctaBackLabel),
    };

    // The listen buttons double as the "everything else is over here" link when the
    // episode list is capped.
    page.primaryLink = page.links.find((link) => link.href) || null;
    page.episodesTruncated = page.episodes.length > EPISODE_LIMIT;
    page.episodes = page.episodes.slice(0, EPISODE_LIMIT);

    // The eyebrow alone is decoration, and a block's heading is just a label for rows
    // that may not exist — neither makes a page "written" on its own.
    page.hasContent = Boolean(
      page.heading ||
        page.intro ||
        page.body ||
        page.image ||
        page.quote ||
        page.ctaHeading ||
        page.ctaText ||
        page.cards.length ||
        page.checklistItems.length ||
        page.links.length ||
        page.episodes.length ||
        page.products.length ||
        page.people.length ||
        page.faqs.length
    );

    pages[path.basename(file, ".json")] = page;
  }

  return pages;
};
