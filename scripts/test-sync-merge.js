#!/usr/bin/env node
/**
 * The sync's merge rules, tested without touching the network.
 *
 * This is the part that can quietly destroy work: an editor's chosen order, their
 * hidden episodes, and any title or description they rewrote for the website.
 */
const assert = require("assert");
const { merge, shape, shorten, formatDate, formatDuration } = require("./sync-spotify-episodes.js");

const spotify = (id, name, extra = {}) => shape({
  id,
  name,
  description: extra.description || `Description of ${name}`,
  release_date: extra.release_date || "2026-09-12",
  duration_ms: extra.duration_ms || 2040000,
  external_urls: { spotify: `https://open.spotify.com/episode/${id}` },
});

const local = (id, extra = {}) => ({
  number: "", title: `Local ${id}`, description: "", meta: "",
  youtube: "", spotify: id ? `https://open.spotify.com/episode/${id}` : "",
  visible: true, ...extra,
});

let passed = 0;
const test = (name, fn) => {
  try { fn(); console.log(`  ok    ${name}`); passed++; }
  catch (error) { console.log(`  FAIL  ${name}\n        ${error.message}`); process.exitCode = 1; }
};

console.log("merge rules\n");

test("new episodes are added, newest first, above what's already there", () => {
  const { episodes, added } = merge([local("AAA")], [spotify("CCC", "Newest"), spotify("BBB", "Newer"), spotify("AAA", "Old")]);
  assert.strictEqual(added, 2);
  assert.deepStrictEqual(episodes.map(e => e.title), ["Newest", "Newer", "Local AAA"]);
});

test("the editor's order is never rearranged", () => {
  const existing = [local("CCC"), local("AAA"), local("BBB")];          // deliberately shuffled
  const { episodes } = merge(existing, [spotify("AAA", "A"), spotify("BBB", "B"), spotify("CCC", "C")]);
  assert.deepStrictEqual(episodes.map(e => e.spotify.slice(-3)), ["CCC", "AAA", "BBB"]);
});

test("a hidden episode stays hidden", () => {
  const { episodes } = merge([local("AAA", { visible: false })], [spotify("AAA", "Fresh title")]);
  assert.strictEqual(episodes[0].visible, false);
});

test("a rewritten title is not overwritten", () => {
  const { episodes } = merge([local("AAA", { title: "My better title" })], [spotify("AAA", "Spotify's title")]);
  assert.strictEqual(episodes[0].title, "My better title");
});

test("a rewritten description is not overwritten", () => {
  const { episodes } = merge([local("AAA", { description: "Written for the website." })], [spotify("AAA", "T")]);
  assert.strictEqual(episodes[0].description, "Written for the website.");
});

test("an empty field is filled in from Spotify", () => {
  const { episodes } = merge([local("AAA", { title: "", description: "", meta: "" })], [spotify("AAA", "From Spotify")]);
  assert.strictEqual(episodes[0].title, "From Spotify");
  assert.strictEqual(episodes[0].description, "Description of From Spotify");
  assert.strictEqual(episodes[0].meta, "12 Sep 2026 · 34 min");
});

test("a manually added YouTube link survives", () => {
  const { episodes } = merge([local("AAA", { youtube: "dQw4w9WgXcQ" })], [spotify("AAA", "T")]);
  assert.strictEqual(episodes[0].youtube, "dQw4w9WgXcQ");
});

test("episodes with no Spotify link are left completely alone", () => {
  const placeholder = local("", { title: "Placeholder topic" });
  const { episodes, added } = merge([placeholder], [spotify("AAA", "Real")]);
  assert.strictEqual(added, 1);
  assert.deepStrictEqual(episodes[1], placeholder);
});

test("re-syncing the same episodes changes nothing at all", () => {
  const incoming = [spotify("BBB", "B"), spotify("AAA", "A")];
  const once = merge([], incoming).episodes;
  const twice = merge(once, incoming);
  assert.strictEqual(twice.added, 0);
  assert.deepStrictEqual(twice.episodes, once);
});

test("an episode dropped from Spotify is kept, not deleted", () => {
  const { episodes } = merge([local("AAA"), local("BBB")], [spotify("AAA", "A")]);
  assert.strictEqual(episodes.length, 2);
  assert.ok(episodes.some(e => e.spotify.endsWith("BBB")));
});

test("a spotify: URI is recognised as the same episode", () => {
  const { added } = merge([local("", { spotify: "spotify:episode:AAA" })], [spotify("AAA", "A")]);
  assert.strictEqual(added, 0);
});

console.log("\nformatting\n");

test("dates read as a human would write them", () => {
  assert.strictEqual(formatDate("2026-09-12"), "12 Sep 2026");
  assert.strictEqual(formatDate("2026-01-01"), "1 Jan 2026");
  assert.strictEqual(formatDate("2026"), "2026");          // Spotify sometimes gives only a year
  assert.strictEqual(formatDate(undefined), "");
});

test("durations round to whole minutes", () => {
  assert.strictEqual(formatDuration(2040000), "34 min");
  assert.strictEqual(formatDuration(0), "");
});

test("long descriptions are cut at a word, not mid-word", () => {
  const long = "word ".repeat(200);
  const cut = shorten(long);
  assert.ok(cut.length <= 241, `got ${cut.length}`);
  assert.ok(cut.endsWith("…"));
  assert.ok(!cut.includes("wor…"));
});

test("a short description is left exactly as it is", () => {
  assert.strictEqual(shorten("  Two   sentences. Here.  "), "Two sentences. Here.");
});

console.log(`\n${passed} checks passed${process.exitCode ? " — WITH FAILURES" : ""}`);
