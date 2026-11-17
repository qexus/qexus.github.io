#!/usr/bin/env python3
"""Build canonical XML sitemap for all public qexus GitHub Pages projects."""
from datetime import date
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = "https://qexus.github.io"
FISHERIES = ("fisheries", "fisheries-ca")
STATIC = ("/", "/work.html", "/manac/", "/fisheries/", "/fisheries-ca/", "/site-map.html", "/status.html", "/privacy.html")
GUIDES = ("", "professions.html", "employers.html", "registries.html", "glossary.html") + tuple(f"lesson-{i:02}.html" for i in range(1,13))
ORIGINAL = STATIC + tuple(f"/{site}/guides/{name}" for site in FISHERIES for name in GUIDES)
LANGUAGES = ("fr", "uk")
LOCALIZED_PORTAL = tuple(f"/{lang}/{page}" for lang in LANGUAGES for page in ("", "work.html", "site-map.html", "status.html", "privacy.html"))
LOCALIZED_MANAC = tuple(f"/manac/{lang}/" for lang in LANGUAGES)
LOCALIZED_FISHERIES = tuple(
    f"/{site}/{lang}/{path}"
    for site in FISHERIES for lang in LANGUAGES
    for path in ("", "guides/") + tuple(f"guides/lesson-{i:02}.html" for i in range(1, 13))
)
LOCALIZED_REFERENCES = tuple(
    f"/{site}/{lang}/guides/{guide}.html"
    for site in FISHERIES for lang in LANGUAGES
    for guide in ("professions", "employers", "registries", "glossary")
)
CANONICAL = ORIGINAL + LOCALIZED_PORTAL + LOCALIZED_MANAC + LOCALIZED_FISHERIES + LOCALIZED_REFERENCES
NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", NAMESPACE)

def build(when="2026-11-17"):
    assert len(CANONICAL)==126 and len(set(CANONICAL))==126
    root=ET.Element(f"{{{NAMESPACE}}}urlset")
    for path in CANONICAL:
        entry=ET.SubElement(root, f"{{{NAMESPACE}}}url")
        ET.SubElement(entry, f"{{{NAMESPACE}}}loc").text=ROOT+path
        ET.SubElement(entry, f"{{{NAMESPACE}}}lastmod").text=when
    ET.indent(root,space="  ")
    return '<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding="unicode")+'\n'

if __name__=="__main__":
    Path("sitemap.xml").write_text(build(),encoding="utf-8")
    print("Wrote",len(CANONICAL),"canonical URLs to sitemap.xml")
