#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "📤 GitHub push..."
git push

echo "🚀 Upload to Namecheap via FTPS..."

lftp -u "deploy@vvzstudio.com","NyKy2006+-*/." ftp://ftp.vvzstudio.com <<EOF
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set net:timeout 15
set net:max-retries 2

lcd ${PROJECT_DIR}

# обычно на shared-хостинге корень деплоя — public_html
cd public_html

mirror -R --delete \
  --exclude-glob .git/ \
  --exclude-glob .vscode/ \
  --exclude-glob node_modules/ \
  --exclude-glob *.DS_Store \
  .
bye
EOF

echo "✅ Deploy done"
