# Deployment

The FTPS deployment script reads configuration only from environment variables.
It does not source local files automatically.

Required variables:

- `VVZ_FTPS_HOST`
- `VVZ_FTPS_USER`
- `VVZ_FTPS_PASSWORD`
- `VVZ_FTPS_REMOTE_DIR`

Accepted values are intentionally narrow. `VVZ_FTPS_HOST` must be a hostname
without a scheme or path. `VVZ_FTPS_USER` supports letters, digits, dot,
underscore, hyphen, plus, and `@`. `VVZ_FTPS_REMOTE_DIR` must be a relative
path made from safe path components and must not contain `..`. Passwords must
not contain whitespace or control characters because they are written to a
temporary netrc file.

Example invocation with placeholder values:

```bash
export VVZ_FTPS_HOST="ftps.example.invalid"
export VVZ_FTPS_USER="deploy-user"
export VVZ_FTPS_PASSWORD="replace-with-ftps-password"
export VVZ_FTPS_REMOTE_DIR="public_html"
bash scripts/deploy.sh
```

For local use, keep real values in `.deploy.ftps.env` or another untracked
secret store, then export them into the shell before running the script.
