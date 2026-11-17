import unittest
from pathlib import Path
import xml.etree.ElementTree as ET
import sys

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scripts"))
from build_sitemap import CANONICAL, ROOT

class SitemapAudit(unittest.TestCase):
    def test_canonical_urls_are_unique(self):
        self.assertEqual(len(CANONICAL),42)
        self.assertEqual(len(CANONICAL),len(set(CANONICAL)))

    def test_published_sitemap_matches_known_pages(self):
        tree=ET.parse(Path(__file__).resolve().parents[1]/"sitemap.xml")
        namespace={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
        locs=[x.text for x in tree.findall(".//s:loc",namespace)]
        self.assertEqual(set(locs),{ROOT+p for p in CANONICAL})
        self.assertEqual(len(locs),42)
        self.assertFalse(any("?lang=" in u for u in locs),"Dynamic language UI is not a separate canonical HTML page")

    def test_robot_file_points_to_the_sitemap(self):
        robots=(Path(__file__).resolve().parents[1]/"robots.txt").read_text()
        self.assertIn("Sitemap: https://qexus.github.io/sitemap.xml",robots)
