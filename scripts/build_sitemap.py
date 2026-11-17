#!/usr/bin/env python3
"""Build canonical XML sitemap for all public qexus GitHub Pages projects."""
from datetime import date
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = "https://qexus.github.io"
FISHERIES = ("fisheries", "fisheries-ca")
STATIC = ("/", "/work.html", "/manac/", "/fisheries/", "/fisheries-ca/", "/site-map.html", "/status.html", "/privacy.html")
GUIDES = ("", "professions.html", "employers.html", "registries.html", "glossary.html") + tuple(f"lesson-{i:02}.html" for i in range(1,13))
CANONICAL = STATIC + tuple(f"/{site}/guides/{name}" for site in FISHERIES for name in GUIDES)
NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", NAMESPACE)

def build(when="2026-11-17"):
    assert len(CANONICAL)==42 and len(set(CANONICAL))==42
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
