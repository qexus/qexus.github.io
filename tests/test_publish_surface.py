"""Only site content is eligible for public GitHub Pages rendering."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class PublishedSurfaceTests(unittest.TestCase):
    def test_jekyll_excludes_internal_files(self):
        text = (ROOT / '_config.yml').read_text(encoding='utf-8')
        for required in ('- .github', '- qa', '- scripts', '- tests', "- '*.md'"):
            self.assertIn(required, text)
        self.assertNotIn('  - assets', text)
        self.assertNotIn('  - shared', text)

    def test_no_obsolete_audits_in_current_root(self):
        for name in ('AUDIT.md', 'MULTISITE_AUDIT.md', 'LOCALIZATION_AUDIT.md', 'SECURITY_AUDIT_2026-11.md'):
            self.assertFalse((ROOT / name).exists(), name)
        for name in ('BFISHERMAN_ROADMAP.md', 'IMPLEMENTATION.md', 'MOBILE_QA_CHECKLIST.md', 'BRAND.md', 'SECURITY.md'):
            self.assertFalse((ROOT / name).exists(), name)

    def test_operational_docs_retained_outside_site(self):
        for name in ('BFISHERMAN_ROADMAP.md', 'IMPLEMENTATION.md', 'MOBILE_QA_CHECKLIST.md', 'BRAND.md'):
            self.assertTrue((ROOT / '.github/project' / name).exists(), name)
        self.assertTrue((ROOT / '.github/SECURITY.md').exists())

    def test_public_web_assets_are_still_present(self):
        for p in ('index.html', 'work.html', 'site-map.html', 'status.html', 'privacy.html', 'robots.txt', 'sitemap.xml', 'styles.css', 'shared/site-i18n.js', 'assets/qx-logo-180.png'):
            self.assertTrue((ROOT / p).is_file(), p)

if __name__ == '__main__':
    unittest.main()
