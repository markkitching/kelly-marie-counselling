#!/usr/bin/env node
/**
 * Pull the show's recent episodes into the podcast page's content file, so they can be
 * reordered and hidden in the CMS like any other episode.
 *
 * Sources, in order of how little setup they need:
 *
 *   youtube-rss  (default)  No credentials at all. The channel's public Atom feed, which
 *                           carries the 15 most recent videos. Gives a video id, so each
 *                           episode gets a playable still on the page.
 *   youtube-api             A Google API key. Same data, but the full back catalogue
 *                           rather than the last 15. One quota unit per call.
 *   spotify                 Client id + secret. Kept because it works, though Spotify
 *                           has new app creation on hold, so most people can't get
 *                           credentials right now.
 *
 * The rules that matter, whichever source is used:
 *   - Order is never rearranged. Episodes already in the file stay where the editor
 *     put them; genuinely new ones go on top, newest first.
 *   - A field with something in it is never overwritten. Rewrite a title or a
 *     description for the website and the sync leaves it alone. Clear it and the next
 *     sync fills it back in.
 *   - Nothing is ever deleted.
 *   - A failed fetch writes nothing at all and exits non-zero, so a bad day upstream
 *     can't empty the page.
 *
 * Usage:
 *   node scripts/sync-podcast-episodes.js
 *   node scripts/sync-podcast-episodes.js --source youtube-api
 *   node scripts/sync-podcast-episodes.js --dry-run
 *   node scripts/sync-podcast-episodes.js --fixture path/to/response.xml
 *
 * Environment:
 *   YOUTUBE_CHANNEL_ID   UC… — YouTube Studio > Settings > Channel > Advanced
 *   YOUTUBE_API_KEY      only for --source youtube-api
 *   SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET   only for --source spotify
 *   (optional) SPOTIFY_SHOW_ID, SPOTIFY_MARKET, EPISODE_SYNC_LIMIT
 */

const fs = require("fs");
const path = require("path");

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "";
const SHOW_ID = process.env.SPOTIFY_SHOW_ID || "033TZ1QVIUJCQZ6TJ2XBYH";
const MARKET = process.env.SPOTIFY_MARKET || "GB";
const LIMIT = Math.min(Number(process.env.EPISODE_SYNC_LIMIT || 30), 50);
const PAGE_FILE = path.join(__dirname, "..", "src", "content", "pages", "podcast.json");

// Long enough to be useful, short enough that a card stays a card. Spotify descriptions
// often carry sponsor copy and links; the editor can rewrite and the sync won't undo it.
const DESCRIPTION_LIMIT = 240;

// ── Shaping Spotify's response ───────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(releaseDate) {
  const parts = String(releaseDate || "").split("-");
  if (parts.length !== 3) return String(releaseDate || "");   // Spotify may give just a year
  const [year, month, day] = parts;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

function formatDuration(ms) {
  const minutes = Math.round(Number(ms || 0) / 60000);
  return minutes > 0 ? `${minutes} min` : "";
}

function shorten(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= DESCRIPTION_LIMIT) return clean;
  const cut = clean.slice(0, DESCRIPTION_LIMIT);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "") + "…";
}

function shape(item) {
  const meta = [formatDate(item.release_date), formatDuration(item.duration_ms)]
    .filter(Boolean)
    .join(" · ");
  return {
    id: item.id,
    title: String(item.name || "").trim(),
    description: shorten(item.description),
    meta,
    value: (item.external_urls && item.external_urls.spotify) || `https://open.spotify.com/episode/${item.id}`,
  };
}

// ── Merging (pure — this is the part that can lose the editor's work) ─────────

function spotifyId(url) {
  const found = String(url || "").match(/episode[/:]([A-Za-z0-9]+)/);
  return found ? found[1] : "";
}

// Mirrors the parsing in src/_data/pages.js, so an id written by hand in any of
// YouTube's link formats is recognised as the same episode the sync already knows.
function youtubeId(value) {
  const raw = String(value || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const found = raw.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return found ? found[1] : "";
}

// Which episode field a source fills, and how to read an id back out of it.
const FIELDS = {
  youtube: youtubeId,
  spotify: spotifyId,
};

function newEpisode(fresh, field) {
  return {
    number: "",
    title: fresh.title,
    description: fresh.description,
    meta: fresh.meta,
    youtube: field === "youtube" ? fresh.value : "",
    spotify: field === "spotify" ? fresh.value : "",
    visible: true,
  };
}

function merge(existing, incoming, field = "spotify") {
  const idOf = FIELDS[field];
  if (!idOf) throw new Error(`unknown episode field: ${field}`);

  const seen = new Set(existing.map((episode) => idOf(episode[field])).filter(Boolean));

  const kept = existing.map((episode) => {
    const id = idOf(episode[field]);
    const fresh = id && incoming.find((candidate) => candidate.id === id);
    if (!fresh) return episode;
    return {
      ...episode,
      title: episode.title || fresh.title,
      description: episode.description || fresh.description,
      meta: episode.meta || fresh.meta,
      [field]: episode[field] || fresh.value,
    };
  });

  const added = incoming.filter((fresh) => !seen.has(fresh.id)).map((fresh) => newEpisode(fresh, field));
  return { episodes: [...added, ...kept], added: added.length };
}

// ── YouTube ──────────────────────────────────────────────────────────────────

// Titles and descriptions arrive XML- or HTML-escaped from both the feed and the API.
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " " };
function unescapeXml(text) {
  return String(text || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, code) => {
      if (code[0] === "#") {
        const value = code[1] === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(value) ? String.fromCodePoint(value) : whole;
      }
      return ENTITIES[code] !== undefined ? ENTITIES[code] : whole;
    });
}

function shapeYouTube({ id, title, description, published }) {
  return {
    id,
    title: unescapeXml(title).trim(),
    description: shorten(unescapeXml(description)),
    meta: formatDate(String(published || "").slice(0, 10)),
    value: id,                      // pages.js takes a bare video id
  };
}

// The channel's public Atom feed. No key, no quota — but only the 15 most recent.
function parseYouTubeFeed(xml) {
  const field = (block, tag) => {
    const found = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return found ? found[1] : "";
  };
  return (xml.match(/<entry>[\s\S]*?<\/entry>/g) || [])
    .map((entry) => shapeYouTube({
      id: field(entry, "yt:videoId"),
      title: field(entry, "title"),
      description: field(entry, "media:description"),
      published: field(entry, "published"),
    }))
    .filter((episode) => episode.id);
}

async function fetchYouTubeFeed() {
  if (!CHANNEL_ID) {
    throw new Error("YOUTUBE_CHANNEL_ID must be set (the UC… id from YouTube Studio > Settings > Channel > Advanced).");
  }
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(CHANNEL_ID)}`;
  const response = await fetch(url);
  if (response.status === 404) {
    throw new Error(`YouTube has no feed for channel ${CHANNEL_ID}. That id must be the UC… form, not the @handle.`);
  }
  if (!response.ok) throw new Error(`YouTube returned ${response.status} for the channel feed.`);
  return parseYouTubeFeed(await response.text());
}

// The Data API, for more than the feed's 15. channels.list then playlistItems.list,
// one quota unit each — search.list would cost 100 and is not needed.
async function fetchYouTubeApi() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY must be set for --source youtube-api.");
  if (!CHANNEL_ID) throw new Error("YOUTUBE_CHANNEL_ID must be set.");

  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(CHANNEL_ID)}&key=${key}`;
  const channelResponse = await fetch(channelUrl);
  if (!channelResponse.ok) throw new Error(`YouTube returned ${channelResponse.status} looking up the channel. Check YOUTUBE_API_KEY and that the YouTube Data API v3 is enabled.`);
  const channel = (await channelResponse.json()).items?.[0];
  if (!channel) throw new Error(`YouTube knows no channel ${CHANNEL_ID}.`);

  const uploads = channel.contentDetails.relatedPlaylists.uploads;
  const episodes = [];
  let pageToken = "";
  while (episodes.length < LIMIT) {
    const listUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}` +
      `&maxResults=${Math.min(50, LIMIT - episodes.length)}&key=${key}` + (pageToken ? `&pageToken=${pageToken}` : "");
    const listResponse = await fetch(listUrl);
    if (!listResponse.ok) throw new Error(`YouTube returned ${listResponse.status} listing uploads.`);
    const body = await listResponse.json();
    for (const item of body.items || []) {
      episodes.push(shapeYouTube({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        published: item.snippet.publishedAt,
      }));
    }
    pageToken = body.nextPageToken;
    if (!pageToken) break;
  }
  return episodes.slice(0, LIMIT);
}

// ── Talking to Spotify ───────────────────────────────────────────────────────

async function getToken(id, secret) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) {
    throw new Error(`Spotify refused the credentials (${response.status}). Check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.`);
  }
  return (await response.json()).access_token;
}

async function fetchEpisodes(token) {
  const url = `https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?market=${MARKET}&limit=${LIMIT}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) {
    throw new Error(`Spotify has no show ${SHOW_ID} in market ${MARKET}. Check SPOTIFY_SHOW_ID, and that the show is published in that market.`);
  }
  if (!response.ok) {
    throw new Error(`Spotify returned ${response.status} for the episode list.`);
  }
  const body = await response.json();
  // Spotify pads the array with nulls for anything unavailable in this market.
  return (body.items || []).filter(Boolean).map(shape);
}

// ── Entry point ──────────────────────────────────────────────────────────────

const SOURCES = {
  "youtube-rss": { field: "youtube", fetch: fetchYouTubeFeed, parse: parseYouTubeFeed },
  "youtube-api": { field: "youtube", fetch: fetchYouTubeApi, parse: parseYouTubeFeed },
  spotify: {
    field: "spotify",
    fetch: async () => {
      const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
      if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set for --source spotify.");
      }
      return fetchEpisodes(await getToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET));
    },
    parse: (text) => (JSON.parse(text).items || []).filter(Boolean).map(shape),
  },
};

function flag(name, fallback = "") {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? fallback : process.argv[at + 1];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const sourceName = flag("source", process.env.EPISODE_SOURCE || "youtube-rss");
  const source = SOURCES[sourceName];
  if (!source) {
    throw new Error(`unknown source "${sourceName}". Use one of: ${Object.keys(SOURCES).join(", ")}.`);
  }

  const fixture = flag("fixture");
  const incoming = fixture
    ? source.parse(fs.readFileSync(fixture, "utf8"))
    : await source.fetch();

  console.log(`${sourceName}${fixture ? " (fixture)" : ""}: ${incoming.length} episodes`);

  if (!incoming.length) {
    throw new Error("No episodes came back — refusing to write, in case this is a blip.");
  }

  const page = JSON.parse(fs.readFileSync(PAGE_FILE, "utf8"));
  const before = page.episodes || [];
  const { episodes, added } = merge(before, incoming, source.field);
  page.episodes = episodes;

  console.log(`${before.length} in the file, ${added} new, ${episodes.length} after merge`);

  if (dryRun) {
    console.log("--dry-run: nothing written");
    return;
  }
  fs.writeFileSync(PAGE_FILE, JSON.stringify(page, null, 2) + "\n");
  console.log(`wrote ${path.relative(process.cwd(), PAGE_FILE)}`);
}

// Exported so the merge rules can be tested without touching the network.
module.exports = { merge, shape, shapeYouTube, parseYouTubeFeed, unescapeXml,
                   spotifyId, youtubeId, shorten, formatDate, formatDuration };

if (require.main === module) {
  main().catch((error) => {
    console.error("sync failed:", error.message);
    console.error("nothing was written.");
    process.exit(1);
  });
}
