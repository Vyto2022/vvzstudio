import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NGINX_DIR = ROOT / "deploy" / "nginx"
PROD = NGINX_DIR / "vvzstudio.conf"
STAGING = NGINX_DIR / "vvzstudio-staging.conf"
README = NGINX_DIR / "README.md"
API_INCLUDE = "include /etc/nginx/snippets/vvz-lead-api.conf;"
FORBIDDEN_PATTERNS = (
    r"\bproxy_pass\b",
    r"location\s+\^?~?\s*/api/",
    r"\blimit_req\b",
    r"\blimit_req_zone\b",
    r"BEGIN (?:RSA |OPENSSH |EC |)PRIVATE KEY",
    r"\bssh\s+(?:root@|[A-Za-z0-9._-]+@|\d)",
    r"~/.ssh/",
    r"/home/[^/\s]+/\.ssh/",
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    r"[A-Za-z0-9_=-]{24,}\.[A-Za-z0-9_=-]{6,}\.[A-Za-z0-9_=-]{20,}",
)
PROD_SECURITY_HEADERS = (
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header X-Frame-Options "SAMEORIGIN" always;',
    'add_header X-XSS-Protection "1; mode=block" always;',
    'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
    'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
)
STAGING_SECURITY_HEADERS = (
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header X-Frame-Options "SAMEORIGIN" always;',
    'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
)
STATIC_SECURITY_HEADERS = (
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header X-Frame-Options "SAMEORIGIN" always;',
)


def read(path):
    return path.read_text(encoding="utf-8")


def server_blocks(text):
    blocks = []
    pos = 0
    while True:
        match = re.search(r"\bserver\s*\{", text[pos:])
        if not match:
            return blocks
        start = pos + match.start()
        cursor = pos + match.end()
        depth = 1
        while cursor < len(text) and depth:
            if text[cursor] == "{":
                depth += 1
            elif text[cursor] == "}":
                depth -= 1
            cursor += 1
        blocks.append(text[start:cursor])
        pos = cursor


def https_blocks(text):
    return [block for block in server_blocks(text) if "listen 443 ssl http2;" in block]


def location_block(text, marker):
    start = text.index(marker)
    cursor = start + len(marker)
    depth = 1
    while cursor < len(text) and depth:
        if text[cursor] == "{":
            depth += 1
        elif text[cursor] == "}":
            depth -= 1
        cursor += 1
    return text[start:cursor]


def server_level_add_headers(block):
    headers = []
    depth = 0
    for line in block.splitlines():
        stripped = line.strip()
        if depth == 1 and stripped.startswith("add_header "):
            headers.append(stripped)
        depth += line.count("{") - line.count("}")
    return headers


class NginxSiteDeployTests(unittest.TestCase):
    def assert_contains_once(self, text, needle):
        self.assertEqual(text.count(needle), 1, needle)

    def assert_forbidden_absent(self, text):
        for pattern in FORBIDDEN_PATTERNS:
            self.assertIsNone(re.search(pattern, text, re.IGNORECASE), pattern)

    def assert_headers_exact(self, block, expected):
        self.assertEqual(server_level_add_headers(block), list(expected))

    def assert_hidden_files_contract(self, block):
        hidden = location_block(block, "location ~ /\\.(?!well-known) {")
        self.assertIn("deny all;", hidden)
        self.assertIn("return 404;", hidden)
        self.assertIn("access_log off;", hidden)
        self.assertIn("log_not_found off;", hidden)

    def assert_static_headers(self, block):
        for header in STATIC_SECURITY_HEADERS:
            self.assertIn(header, block)

    def test_exact_artifact_list(self):
        artifacts = sorted(path.name for path in NGINX_DIR.iterdir() if path.is_file())
        self.assertEqual(
            artifacts,
            ["README.md", "vvzstudio-staging.conf", "vvzstudio.conf"],
        )
        self.assertTrue((ROOT / "tests" / "test_nginx_site_deploy.py").is_file())

    def test_production_site_block(self):
        text = read(PROD)
        blocks = server_blocks(text)
        self.assertEqual(len(blocks), 1)
        block = blocks[0]

        self.assertIn("listen 443 ssl http2;", block)
        self.assertIn("listen [::]:443 ssl http2;", block)
        self.assertIn("server_name vvzstudio.com www.vvzstudio.com;", block)
        self.assertIn("root /var/www/vvzstudio;", block)
        self.assertIn("index index.html;", block)
        self.assertIn("ssl_certificate /etc/letsencrypt/live/vvzstudio.com/fullchain.pem;", block)
        self.assertIn("ssl_certificate_key /etc/letsencrypt/live/vvzstudio.com/privkey.pem;", block)
        self.assertIn("include /etc/letsencrypt/options-ssl-nginx.conf;", block)
        self.assertIn("return 301 https://vvzstudio.com$request_uri;", block)
        self.assert_headers_exact(block, PROD_SECURITY_HEADERS)
        self.assert_hidden_files_contract(block)
        self.assertIn("location / {\n        try_files $uri $uri/ =404;\n    }", block)
        static = location_block(
            block,
            "location ~* \\.(?:css|js|mjs|png|jpg|jpeg|gif|svg|webp|ico|woff2|woff|ttf|eot)$ {",
        )
        self.assertIn("expires 30d;", static)
        self.assertIn('add_header Cache-Control "public, max-age=2592000, immutable";', static)
        self.assert_static_headers(static)
        self.assertIn("try_files $uri =404;", static)
        self.assertIn("access_log off;", static)
        self.assertNotIn("Permissions-Policy", block)
        self.assert_contains_once(block, API_INCLUDE)
        self.assertNotIn("server.env", text)
        self.assert_forbidden_absent(text)

    def test_staging_site_blocks(self):
        text = read(STAGING)
        blocks = server_blocks(text)
        self.assertEqual(len(blocks), 2)
        http, https = blocks

        self.assertIn("listen 80;", http)
        self.assertIn("listen [::]:80;", http)
        self.assertIn("server_name staging.vvzstudio.com;", http)
        self.assertIn("root /var/www/vvzstudio-staging;", http)
        self.assertIn("location ^~ /.well-known/acme-challenge/ {\n        try_files $uri =404;\n    }", http)
        self.assertIn("return 301 https://staging.vvzstudio.com$request_uri;", http)

        self.assertIn("listen 443 ssl http2;", https)
        self.assertIn("listen [::]:443 ssl http2;", https)
        self.assertIn("server_name staging.vvzstudio.com;", https)
        self.assertIn("root /var/www/vvzstudio-staging;", https)
        self.assertIn("index index.html;", https)
        self.assertIn(
            "ssl_certificate /etc/letsencrypt/live/staging.vvzstudio.com/fullchain.pem;",
            https,
        )
        self.assertIn(
            "ssl_certificate_key /etc/letsencrypt/live/staging.vvzstudio.com/privkey.pem;",
            https,
        )
        self.assertIn("include /etc/letsencrypt/options-ssl-nginx.conf;", https)
        self.assert_headers_exact(https, STAGING_SECURITY_HEADERS)
        self.assert_hidden_files_contract(https)
        self.assertIn("location / {\n        try_files $uri $uri/ =404;\n    }", https)
        self.assertNotIn("Strict-Transport-Security", https)
        self.assertNotIn("X-XSS-Protection", https)
        self.assertNotIn("Permissions-Policy", https)
        self.assert_contains_once(https, API_INCLUDE)
        self.assertNotIn("server.env", text)
        self.assert_forbidden_absent(text)

    def test_https_blocks_share_one_api_include(self):
        prod_https = https_blocks(read(PROD))
        staging_https = https_blocks(read(STAGING))
        self.assertEqual(len(prod_https), 1)
        self.assertEqual(len(staging_https), 1)
        self.assert_contains_once(prod_https[0], API_INCLUDE)
        self.assert_contains_once(staging_https[0], API_INCLUDE)

    def test_readme_required_instructions_and_no_secrets(self):
        text = read(README)
        required = (
            "Full host-specific server blocks for the static website belong to this repository.",
            "belong to `vvz-lead-system`",
            "`vvzstudio.conf` is the production site file",
            "`vvzstudio-staging.conf` is the staging site file",
            "/etc/nginx/sites-available/vvzstudio",
            "/etc/nginx/sites-available/vvzstudio-staging",
            "cd /etc/nginx/sites-enabled",
            "sudo ln -sfn ../sites-available/vvzstudio vvzstudio",
            "sudo ln -sfn ../sites-available/vvzstudio-staging vvzstudio-staging",
            "/etc/nginx/conf.d/vvz-lead-rate-limit.conf",
            "/etc/nginx/snippets/vvz-lead-api.conf",
            "Back up the currently active site files before replacing them",
            "sudo nginx -t",
            "sudo nginx -s reload",
            "reload only after the validation succeeds",
            "Rollback",
            "Certbot-managed certificate files are not copied into this repository.",
            "Real TLS keys, `server.env`, tokens, SSH host details, SSH key paths, and VPS IP addresses must not be committed.",
            "They are not commands for Codex to run from this repository.",
        )
        for needle in required:
            self.assertIn(needle, text)
        self.assert_forbidden_absent(text)


if __name__ == "__main__":
    unittest.main()
