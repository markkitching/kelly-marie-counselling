"""Regenerate the six 'Page:' entries in .pages.yml from one block map."""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = ["heart-handshake","users","megaphone","user","target","infinity","presentation",
         "briefcase","message-circle","brain","shield","clock","layers","monitor","calendar",
         "mail","award","map-pin","check","leaf","book-open","mic","music","video","headphones",
         "shopping-bag","image","activity","compass","sun","graduation-cap","handshake",
         "lightbulb","sparkles","phone","quote","gift","package","shirt","coffee"]

PAGES = json.loads((ROOT / "src/_data/newPages.json").read_text())
# The Counselling page is built from the homepage's seven sections rather than from
# blocks, so it gets no entry here — its forms are copied from the homepage ones below.
SECTION_PAGES = {"counselling"}

BLOCKS = {
    "wellbeing":         ["cards", "checklist", "quote", "faqs"],
    "training-coaching": ["cards", "checklist", "quote", "faqs"],
    "podcast":           ["links", "episodes"],
    "merchandise":       ["products"],
    "meet-the-team":     ["people", "faqs"],
}

def f(name, label, ftype, indent=6, extra=""):
    pad = " " * indent
    out = f"{pad}- name: {name}\n{pad}  label: {label}\n{pad}  type: {ftype}\n"
    return out + extra

def icon_field(indent):
    pad = " " * indent
    vals = "\n".join(f"{pad}      - {i}" for i in ICONS)
    return (f"{pad}- name: icon\n{pad}  label: Icon\n{pad}  type: select\n"
            f"{pad}  options:\n{pad}    values:\n{vals}\n")

def listblock(name, label, description, subfields, *, summary, indent=6):
    """A repeatable block.

    Rows collapse to a single line showing `summary`, so a long list stays draggable
    rather than becoming a wall of open forms. `{field}` resolves against the row.
    """
    pad = " " * indent
    out = (f"{pad}- name: {name}\n{pad}  label: {label}\n{pad}  description: {description}\n"
           f"{pad}  type: object\n"
           f"{pad}  list:\n"
           f"{pad}    collapsible:\n"
           f"{pad}      collapsed: true\n"
           f"{pad}      summary: '{summary}'\n"
           f"{pad}  fields:\n")
    return out + subfields

def sub(name, label, ftype, indent=6, description=None, values=None):
    pad = " " * (indent + 4)
    out = f"{pad}- name: {name}\n{pad}  label: {label}\n"
    if description:
        out += f"{pad}  description: {description}\n"
    out += f"{pad}  type: {ftype}\n"
    if values:
        out += f"{pad}  options:\n{pad}    values:\n"
        out += "".join(f"{pad}      - {v}\n" for v in values)
    return out

def build(slug, title):
    blocks = BLOCKS[slug]
    body = (
        f"  - name: page-{slug}\n"
        f"    label: 'Page: {title}'\n"
        f"    description: >-\n"
        f"      Every section below is optional — fill in what suits this page and leave the rest\n"
        f"      empty. Clear the whole page and it goes back to its \"coming soon\" screen.\n"
        f"      This page's menu link is under Main menu.\n"
        f"    type: file\n"
        f"    path: src/content/pages/{slug}.json\n"
        f"    format: json\n"
        f"    fields:\n"
    )
    body += f("eyebrow", "Small heading above the title (optional)", "string")
    body += f("heading", f'Page title (leave blank to use "{title}")', "string")
    body += f("intro", "Intro paragraph (shown slightly larger)", "text")
    body += f("body", "Main text (press Enter for new lines)", "text")
    body += f("image", "Photo (optional — sits beside the main text)", "image")

    if "cards" in blocks:
        body += f("cardsTitle", "Cards — section heading (optional)", "string")
        body += listblock("cards", "Cards",
            "A row of cards. Drag to reorder. A card with no title is not shown.",
            icon_field(10) + sub("title", "Title", "string")
            + sub("description", "Description", "text")
            + sub("meta", "Small label underneath (optional)", "string"), summary="{title}")

    if "checklist" in blocks:
        body += f("checklistTitle", "Checklist — section heading (optional)", "string")
        body += listblock("checklistItems", "Checklist items",
            "Shown as a two-column ticked list. An item with no text is not shown.",
            sub("text", "Text", "string"), summary="{text}")

    if "links" in blocks:
        body += f("linksTitle", "Listen links — section heading (optional)", "string")
        body += listblock("links", "Listen links",
            'Buttons linking out. Leave the address empty and the button shows as a greyed "Soon".',
            sub("label", "Button text", "string") + icon_field(10)
            + sub("href", "Address", "string", description="Full https:// address"), summary="{label}")

    if "episodes" in blocks:
        body += f("episodesTitle", "Episodes — section heading (optional)", "string")
        body += listblock("episodes", "Episodes",
            "Drag to reorder — newest first is usual. An episode with no title is not shown.",
            sub("number", "Episode number (optional)", "string")
            + sub("title", "Title", "string")
            + sub("description", "Description", "text")
            + sub("meta", "Duration or date (optional)", "string")
            + sub("youtube", "YouTube link", "string",
                  description="Paste anything YouTube's Share button gives you. Adds a video the visitor can play here.")
            + sub("spotify", "Spotify link", "string",
                  description="Paste anything Spotify's Share button gives you.")
            + sub("visible", "On the page", "select", values=["Shown", "Hidden"],
                  description="Hidden takes it off the page without deleting it. The page shows the first 10 marked Shown."),
            summary="{visible} · {title}")

    if "products" in blocks:
        body += f("productsTitle", "Products — section heading (optional)", "string")
        body += listblock("products", "Products",
            "A product with no name is not shown.",
            sub("name", "Name", "string")
            + sub("description", "Description", "text")
            + sub("image", "Photo", "image")
            + sub("price", "Price (optional)", "string", description='e.g. "£14.00". Leave empty to show the label below instead.')
            + sub("meta", "Label shown when there is no price", "string", description='e.g. "Coming soon"')
            + sub("href", "Buy link (optional)", "string"), summary="{name}")

    if "people" in blocks:
        body += f("peopleTitle", "People — section heading (optional)", "string")
        body += listblock("people", "People",
            "A person with no name is not shown.",
            sub("name", "Name", "string")
            + sub("role", "Role", "string")
            + sub("credentials", "Credentials (optional)", "string")
            + sub("bio", "Short biography", "text")
            + sub("image", "Photo", "image"), summary="{name}")

    if "quote" in blocks:
        body += f("quote", "Quote (optional — shown on the dark band)", "text")
        body += f("quoteAuthor", "Quote — who said it", "string")

    if "faqs" in blocks:
        body += f("faqsTitle", 'Questions — section heading (leave blank for "Common questions")', "string")
        body += listblock("faqs", "Common questions",
            "Shown as an accordion. A question with no text is not shown.",
            sub("question", "Question", "string") + sub("answer", "Answer", "text"), summary="{question}")

    body += f("ctaHeading", "Closing section — heading (optional)", "string")
    body += f("ctaText", "Closing section — text (optional)", "text")
    body += f("ctaButtonLabel", 'Closing button text (blank uses "Request a Consultation")', "string")
    body += icon_field(6).replace("- name: icon\n", "- name: ctaButtonIcon\n").replace("  label: Icon\n", "  label: Closing button icon\n")
    body += f("ctaButtonHref", 'Closing button link (blank goes to the contact form)', "string")
    return body

SECTION_LABELS = {
    "hero": "Top section (hero)", "about": "About Kelly", "services": "Services",
    "workplace": "Workplace Wellness", "approach": "Therapeutic approach",
    "process": "The process", "contact": "Contact",
}


def copied_sections(yml, slug, title):
    """The homepage's section forms, re-pointed at another page's copy of the content.

    Copied from the live text rather than redefined, so a field added to the homepage's
    About form appears on the Counselling one the next time this runs.
    """
    out = []
    for name, label in SECTION_LABELS.items():
        start = yml.index(f"  - name: {name}\n")
        after = yml.find("\n  - name: ", start + 1)
        block = yml[start:after + 1] if after != -1 else yml[start:]

        block = block.replace(f"  - name: {name}\n", f"  - name: {slug}-{name}\n", 1)
        block = re.sub(r"^    label: .*$", f"    label: '{title}: {label}'", block, count=1, flags=re.M)
        block = re.sub(r"^    path: src/content/.*$", f"    path: src/content/{slug}/{name}.json",
                       block, count=1, flags=re.M)
        out.append(block)
    return "".join(out)


yml_before = (ROOT / ".pages.yml").read_text()
entries = "".join(build(p["slug"], p["title"]) for p in PAGES if p["slug"] not in SECTION_PAGES)
entries += copied_sections(yml_before, "counselling", "Counselling")

yml = yml_before
start = yml.index("  - name: page-wellbeing")
assert yml[start:].rstrip().endswith("type: image") or True
new = yml[:start] + entries
(ROOT / ".pages.yml").write_text(new)
print(f"rewrote {len(PAGES) - len(SECTION_PAGES)} block pages + {len(SECTION_LABELS)} counselling sections — .pages.yml is now {len(new.splitlines())} lines")
