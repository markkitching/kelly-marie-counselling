#!/usr/bin/env python3
"""Verify that saving a page in the CMS cannot lose content.

Pages CMS writes back only the fields its schema declares, so a key stored in a JSON
file with no matching field in .pages.yml is silently deleted the first time the editor
presses Save. This checks two things:

  1. every key in every page file has a matching form field, and
  2. simulating a save on all six pages leaves the built site byte-for-byte identical.

Run after changing .pages.yml or any file in src/content/pages/.
"""
import collections, filecmp, json, pathlib, shutil, subprocess, sys, tempfile

import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "_site"


def build():
    result = subprocess.run(["npm", "run", "build"], cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        sys.exit("build failed:\n" + result.stdout[-2000:] + result.stderr[-2000:])


def page_entries(cfg):
    return [e for e in cfg["content"] if e["name"].startswith("page-")]


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


def simulate_save(entries):
    """Rewrite each file with only what the form knows, exactly as the CMS would."""
    for entry in entries:
        path = ROOT / entry["path"]
        data = json.loads(path.read_text(), object_pairs_hook=collections.OrderedDict)
        out = collections.OrderedDict()
        for field in entry["fields"]:
            name = field["name"]
            if field.get("list"):
                subs = [s["name"] for s in field["fields"]]
                out[name] = [
                    collections.OrderedDict((s, row.get(s, "")) for s in subs)
                    for row in (data.get(name) or [])
                ]
            else:
                out[name] = data.get(name, "")
        path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")


def identical(left, right):
    comparison = filecmp.dircmp(left, right)
    if comparison.left_only or comparison.right_only or comparison.diff_files:
        return False
    return all(identical(left / d, right / d) for d in comparison.common_dirs)


def main():
    cfg = yaml.safe_load((ROOT / ".pages.yml").read_text())
    entries = page_entries(cfg)
    print(f"{len(entries)} page forms in .pages.yml\n")

    print("1. every stored key has a matching form field")
    fields_ok = compare_fields(entries)
    print("   pass\n" if fields_ok else "   FAIL\n")

    print("2. a save leaves the built site unchanged")
    build()
    with tempfile.TemporaryDirectory() as tmp:
        before = pathlib.Path(tmp) / "before"
        shutil.copytree(SITE, before)

        originals = {ROOT / e["path"]: (ROOT / e["path"]).read_text() for e in entries}
        try:
            simulate_save(entries)
            build()
            same = identical(before, SITE)
        finally:
            for path, text in originals.items():
                path.write_text(text)
            build()

    print("   pass\n" if same else "   FAIL — a save changes the rendered site\n")

    if fields_ok and same:
        print("PASS — the CMS cannot drop a stored field")
        return 0
    print("FAILED")
    return 1


if __name__ == "__main__":
    sys.exit(main())
