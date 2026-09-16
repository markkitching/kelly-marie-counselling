#!/usr/bin/env node
/**
 * Pull the show's recent episodes from Spotify into the podcast page's content file,
 * so they can be reordered and hidden in the CMS like any other episode.
 *
 * The rules that matter:
 *   - Order is never rearranged. Episodes already in the file stay where the editor
 *     put them; genuinely new ones go on top, newest first.
 *   - A field with something in it is never overwritten. Rewrite a title or a
 *     description for the website and the sync leaves it alone. Clear it and the next
 *     sync fills it back in from Spotify.
 *   - Nothing is ever deleted. An episode pulled from Spotify that later disappears
 *     stays in the file until someone removes it.
 *   - A failed fetch writes nothing at all and exits non-zero, so a bad night at
 *     Spotify can't empty the page.
 *
 * Usage:
 *   node scripts/sync-spotify-episodes.js
 *   node scripts/sync-spotify-episodes.js --dry-run
 *   node scripts/sync-spotify-episodes.js --fixture path/to/response.json
 *
 * Environment: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
 *   (optional) SPOTIFY_SHOW_ID, SPOTIFY_MARKET, SPOTIFY_EPISODE_LIMIT
 */

const fs = require("fs");
const path = require("path");

const SHOW_ID = process.env.SPOTIFY_SHOW_ID || "033TZ1QVIUJCQZ6TJ2XBYH";
const MARKET = process.env.SPOTIFY_MARKET || "GB";
const LIMIT = Math.min(Number(process.env.SPOTIFY_EPISODE_LIMIT || 30), 50);
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
    url: (item.external_urls && item.external_urls.spotify) || `https://open.spotify.com/episode/${item.id}`,
  };
}

// ── Merging (pure — this is the part that can lose the editor's work) ─────────

function spotifyId(url) {
  const found = String(url || "").match(/episode[/:]([A-Za-z0-9]+)/);
  return found ? found[1] : "";
}

function newEpisode(fresh) {
  return {
    number: "",
    title: fresh.title,
    description: fresh.description,
    meta: fresh.meta,
    youtube: "",
    spotify: fresh.url,
    visible: true,
  };
}

function merge(existing, incoming) {
  const seen = new Set(existing.map((episode) => spotifyId(episode.spotify)).filter(Boolean));

  const kept = existing.map((episode) => {
    const id = spotifyId(episode.spotify);
    const fresh = id && incoming.find((candidate) => candidate.id === id);
    if (!fresh) return episode;
    return {
      ...episode,
      title: episode.title || fresh.title,
      description: episode.description || fresh.description,
      meta: episode.meta || fresh.meta,
      spotify: episode.spotify || fresh.url,
    };
  });

  const added = incoming.filter((fresh) => !seen.has(fresh.id)).map(newEpisode);
  return { episodes: [...added, ...kept], added: added.length };
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

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const fixtureFlag = process.argv.indexOf("--fixture");

  let incoming;
  if (fixtureFlag !== -1) {
    const body = JSON.parse(fs.readFileSync(process.argv[fixtureFlag + 1], "utf8"));
    incoming = (body.items || []).filter(Boolean).map(shape);
    console.log(`using fixture: ${incoming.length} episodes`);
  } else {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set.");
    }
    incoming = await fetchEpisodes(await getToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET));
    console.log(`Spotify returned ${incoming.length} episodes for show ${SHOW_ID}`);
  }

  if (!incoming.length) {
    throw new Error("Spotify returned no episodes — refusing to write, in case this is a blip.");
  }

  const page = JSON.parse(fs.readFileSync(PAGE_FILE, "utf8"));
  const before = page.episodes || [];
  const { episodes, added } = merge(before, incoming);
  page.episodes = episodes;

  console.log(`${before.length} episodes in the file, ${added} new, ${episodes.length} after merge`);

  if (dryRun) {
    console.log("--dry-run: nothing written");
    return;
  }
  fs.writeFileSync(PAGE_FILE, JSON.stringify(page, null, 2) + "\n");
  console.log(`wrote ${path.relative(process.cwd(), PAGE_FILE)}`);
}

// Exported so the merge rules can be tested without touching the network.
module.exports = { merge, shape, spotifyId, shorten, formatDate, formatDuration };

if (require.main === module) {
  main().catch((error) => {
    console.error("sync failed:", error.message);
    console.error("nothing was written.");
    process.exit(1);
  });
}
