#!/usr/bin/env python3
"""Verify that saving a page in the CMS cannot lose content.

Pages CMS writes back only the fields its schema declares, so a key stored in a JSON
file with no matching field in .pages.yml is silently deleted the first time the editor
presses Save. This checks two things:

  1. every key in every page file has a matching form field, and
  2. simulating a save on all six pages leaves the built site byte-for-byte identical.

Run after changing .pages.yml or any file in src/content/pages/.
"""
import collections, filecmp, json, pathlib, re, shutil, subprocess, sys, tempfile

import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "_site"


def build():
    result = subprocess.run(["npm", "run", "build"], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        sys.exit("build failed:\n" + result.stdout[-2000:] + result.stderr[-2000:])


def page_entries(cfg):
    """Every form that edits a JSON file — not just the standalone pages.

    Anything the CMS can save is somewhere it can also silently drop a field, so the
    whole sidebar is checked rather than a chosen subset.
    """
    return [
        entry for entry in cfg["content"]
        if entry.get("type") == "file"
        and entry.get("format") == "json"
        and (ROOT / entry["path"]).exists()
    ]


def check_summaries(cfg):
    """A collapsed row shows `summary`; a token naming no field renders as an empty line."""
    ok = True
    for entry in cfg["content"]:
        for field in entry.get("fields", []):
            options = field.get("list")
            if field.get("type") != "object" or not isinstance(options, dict):
                continue
            summary = options.get("collapsible", {}).get("summary", "")
            names = {sub["name"] for sub in field["fields"]}
            for token in re.findall(r"{(\w+)}", summary):
                if token != "index" and token not in names:
                    print(f"  {entry['name']}.{field['name']}: summary uses {{{token}}}, which is not a field on the row")
                    ok = False
    return ok


def compare_fields(entries):
    """Report any stored key that has no form field. Returns True if all is well."""
    ok = True
    for entry in entries:
        data = json.loads((ROOT / entry["path"]).read_text())
        fields = {f["name"]: f for f in entry["fields"]}

        lost = set(data) - set(fields)
        if lost:
            print(f"  {entry['name']}: would lose {', '.join(sorted(lost))}")
            ok = False

        for name, field in fields.items():
            if not field.get("list"):
                continue
            subs = {s["name"] for s in field["fields"]}
            for row in data.get(name, []) or []:
                lost_sub = set(row) - subs
                if lost_sub:
                    print(f"  {entry['name']}: {name} rows would lose {', '.join(sorted(lost_sub))}")
                    ok = False
    return ok


def simulate_save(entries, drop_empty):
    """Rewrite each file with only what the form knows, as the CMS would.

    Pages CMS has been observed to leave empty fields out of the file altogether rather
    than writing "", so both shapes are worth testing: `drop_empty` covers what it
    actually does, and the other covers a version that writes every key.
    """
    def keep(value):
        return not (drop_empty and value in ("", [], None))

    for entry in entries:
        path = ROOT / entry["path"]
        data = json.loads(path.read_text(), object_pairs_hook=collections.OrderedDict)
        out = collections.OrderedDict()
        for field in entry["fields"]:
            name = field["name"]
            if field.get("list"):
                subs = [s["name"] for s in field["fields"]]
                rows_out = [
                    collections.OrderedDict(
                        (s, row[s]) for s in subs if s in row and keep(row[s])
                    )
                    for row in (data.get(name) or [])
                ]
                if keep(rows_out):
                    out[name] = rows_out
            else:
                value = data.get(name, "")
                if keep(value):
                    out[name] = value
        path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")


def identical(left, right):
    comparison = filecmp.dircmp(left, right)
    if comparison.left_only or comparison.right_only or comparison.diff_files:
        return False
    return all(identical(left / d, right / d) for d in comparison.common_dirs)


def main():
    cfg = yaml.safe_load((ROOT / ".pages.yml").read_text())
    entries = page_entries(cfg)
    print(f"{len(entries)} forms edit JSON in .pages.yml\n")

    print("0. every collapsed list summarises itself with a field it actually has")
    summaries_ok = check_summaries(cfg)
    print("   pass\n" if summaries_ok else "   FAIL\n")

    print("1. every stored key has a matching form field")
    fields_ok = compare_fields(entries)
    print("   pass\n" if fields_ok else "   FAIL\n")

    print("2. a save leaves the built site unchanged")
    build()
    same = True
    with tempfile.TemporaryDirectory() as tmp:
        before = pathlib.Path(tmp) / "before"
        shutil.copytree(SITE, before)
        originals = {ROOT / e["path"]: (ROOT / e["path"]).read_text() for e in entries}

        for drop_empty in (True, False):
            label = "omitting empty fields" if drop_empty else "writing every field"
            try:
                simulate_save(entries, drop_empty)
                build()
                ok = identical(before, SITE)
            finally:
                for path, text in originals.items():
                    path.write_text(text)
                build()
            print(f"   {label}: {'pass' if ok else 'FAIL'}")
            same = same and ok
    print()

    if summaries_ok and fields_ok and same:
        print("PASS — the CMS cannot drop a stored field")
        return 0
    print("FAILED")
    return 1


if __name__ == "__main__":
    sys.exit(main())
