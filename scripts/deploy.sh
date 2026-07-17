#!/usr/bin/env bash
set -euo pipefail
set +x

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NETRC_DIR=""

cleanup() {
  if [[ -n "${NETRC_DIR}" && -d "${NETRC_DIR}" ]]; then
    rm -rf "${NETRC_DIR}"
  fi
}
trap cleanup EXIT

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    printf 'Missing required variable: %s\n' "${name}" >&2
    exit 1
  fi
}

invalid_var() {
  local name="$1"
  printf 'Invalid variable: %s\n' "${name}" >&2
  exit 1
}

has_control_or_whitespace() {
  local value="$1"
  [[ "${value}" =~ [[:cntrl:][:space:]] ]]
}

validate_host() {
  local name="$1"
  local value="$2"
  if has_control_or_whitespace "${value}"; then
    invalid_var "${name}"
  fi
  if [[ "${value}" == -* || "${value}" != *.* || "${value}" == *..* ]]; then
    invalid_var "${name}"
  fi
  if [[ ! "${value}" =~ ^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$ ]]; then
    invalid_var "${name}"
  fi
}

validate_user() {
  local name="$1"
  local value="$2"
  if has_control_or_whitespace "${value}"; then
    invalid_var "${name}"
  fi
  if [[ ! "${value}" =~ ^[A-Za-z0-9._+@-]+$ ]]; then
    invalid_var "${name}"
  fi
}

validate_password() {
  local name="$1"
  local value="$2"
  if has_control_or_whitespace "${value}"; then
    invalid_var "${name}"
  fi
}

validate_remote_dir() {
  local name="$1"
  local value="$2"
  local component
  if has_control_or_whitespace "${value}"; then
    invalid_var "${name}"
  fi
  if [[ "${value}" == /* || "${value}" == */ || "${value}" == *//* ]]; then
    invalid_var "${name}"
  fi
  if [[ ! "${value}" =~ ^[A-Za-z0-9._+@/-]+$ ]]; then
    invalid_var "${name}"
  fi
  IFS='/' read -r -a components <<< "${value}"
  for component in "${components[@]}"; do
    if [[ -z "${component}" || "${component}" == "." || "${component}" == ".." ]]; then
      invalid_var "${name}"
    fi
  done
}

require_var VVZ_FTPS_HOST
require_var VVZ_FTPS_USER
require_var VVZ_FTPS_PASSWORD
require_var VVZ_FTPS_REMOTE_DIR

validate_host VVZ_FTPS_HOST "${VVZ_FTPS_HOST}"
validate_user VVZ_FTPS_USER "${VVZ_FTPS_USER}"
validate_password VVZ_FTPS_PASSWORD "${VVZ_FTPS_PASSWORD}"
validate_remote_dir VVZ_FTPS_REMOTE_DIR "${VVZ_FTPS_REMOTE_DIR}"

old_umask="$(umask)"
umask 077
NETRC_DIR="$(mktemp -d "${TMPDIR:-/tmp}/vvz-ftps.XXXXXX")"
cat > "${NETRC_DIR}/.netrc" <<EOF
machine ${VVZ_FTPS_HOST}
login ${VVZ_FTPS_USER}
password ${VVZ_FTPS_PASSWORD}
EOF
umask "${old_umask}"

echo "📤 GitHub push..."
git push

echo "🚀 Upload to Namecheap via FTPS..."

HOME="${NETRC_DIR}" lftp "ftp://${VVZ_FTPS_HOST}" <<EOF
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set net:timeout 15
set net:max-retries 2

lcd ${PROJECT_DIR}

# обычно на shared-хостинге корень деплоя — public_html
cd "${VVZ_FTPS_REMOTE_DIR}"

mirror -R --delete \
  --exclude-glob .git/ \
  --exclude-glob .vscode/ \
  --exclude-glob node_modules/ \
  --exclude-glob *.DS_Store \
  .
bye
EOF

echo "✅ Deploy done"
