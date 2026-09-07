import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location(
    "browser_security", ROOT / "scripts/browser-security.py"
)
security = importlib.util.module_from_spec(spec)
spec.loader.exec_module(security)


class BrowserSecurityTests(unittest.TestCase):
    def test_policy_blocks_script_attributes_eval_objects_and_framing(self):
        values = security.headers()
        csp = dict(
            directive.strip().split(" ", 1)
            for directive in values["Content-Security-Policy"].split(";")
            if " " in directive.strip()
        )
        self.assertNotIn("'unsafe-inline'", csp["script-src"])
        self.assertNotIn("'unsafe-eval'", csp["script-src"])
        self.assertEqual(csp["script-src-attr"], "'none'")
        self.assertEqual(csp["frame-ancestors"], "'none'")
        self.assertEqual(csp["object-src"], "'none'")
        self.assertEqual(values["X-Frame-Options"], "DENY")
        self.assertEqual(values["X-Content-Type-Options"], "nosniff")
        self.assertIn("https://*.dl.dropboxusercontent.com", csp["media-src"])
        self.assertNotIn("dropbox", csp["script-src"])

    def test_scoped_rule_has_host_and_owned_paths_without_wildcard_host(self):
        rule = security.cloudflare_rule()
        expression = rule["expression"]
        self.assertIn('http.host eq "comphy-lab.org"', expression)
        self.assertIn('starts_with(http.request.uri.path, "/teaching/")', expression)
        self.assertNotIn('starts_with(http.request.uri.path, "/")', expression)
        for path in ["/sl25", "/sl2", "/add", "/documentationWeb/"]:
            self.assertFalse(security.route_policy().is_owned_path(path))
        self.assertNotIn("Content-Security-Policy-Report-Only", security.headers())
        self.assertIn(
            "content-security-policy-report-only",
            security.cloudflare_rule(True)["action_parameters"]["headers"],
        )

    def test_inventory_rejects_inline_handlers_and_remote_script(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            parser = security.ScriptInventory(site / "index.html", site)
            parser.feed(
                '<script>alert(1)</script><button onclick="alert(1)">x</button>'
                '<script src="https://example.org/script.js"></script>'
                '<a href="javascript:alert(1)">bad</a>'
            )
            self.assertIn("executable inline script", parser.errors)
            self.assertIn("inline handler onclick", parser.errors)
            self.assertIn("javascript URL", parser.errors)
            self.assertTrue(any("nonlocal" in error for error in parser.errors))

    def test_inventory_allows_json_data_but_checks_local_script_exists(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            (site / "good.js").write_text("/* approved */")
            parser = security.ScriptInventory(site / "index.html", site)
            parser.feed(
                '<script type="application/ld+json">{"name":"Lab"}</script>'
                '<script src="/good.js"></script>'
            )
            self.assertEqual(parser.errors, [])
            parser.feed('<script src="/missing.js"></script>')
            self.assertTrue(any("missing" in error for error in parser.errors))

    def test_inventory_rejects_unterminated_inline_script(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            parser = security.ScriptInventory(site / "index.html", site)
            parser.feed("<script>alert(1)")
            parser.close()
            self.assertIn("executable inline script", parser.errors)

    def test_inventory_rejects_vendor_bytes_with_wrong_integrity(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            (site / "assets/vendor").mkdir(parents=True)
            (site / "assets/vendor/x.js").write_text("changed bytes")
            parser = security.ScriptInventory(site / "index.html", site)
            parser.feed('<script src="/assets/vendor/x.js" integrity="sha384-bad"></script>')
            self.assertTrue(any("integrity mismatch" in error for error in parser.errors))

    def test_security_contact_is_valid_and_expiry_is_enforced(self):
        security.check_security_txt(ROOT / ".well-known/security.txt")
        original = (ROOT / ".well-known/security.txt").read_text()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "security.txt"
            path.write_text(original.replace("2027-09-01", "2020-09-01"))
            with self.assertRaisesRegex(ValueError, "expired"):
                security.check_security_txt(path)
            path.write_text(original.rstrip("\n") + "\nExpires: 2030-01-01T00:00:00Z\n")
            with self.assertRaisesRegex(ValueError, "exactly one"):
                security.check_security_txt(path)


if __name__ == "__main__":
    unittest.main()
