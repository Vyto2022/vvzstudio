# VVZ Studio Nginx Site Files

This directory tracks only the VVZ Studio website Nginx site files. Full host-specific server blocks for the static website belong to this repository. Backend API snippets, backend rate-limit zones, backend services, backend environment files, and runtime ownership for the lead API belong to `vvz-lead-system`.

## Files

- `vvzstudio.conf` is the production site file for `vvzstudio.com` and `www.vvzstudio.com`.
- `vvzstudio-staging.conf` is the staging site file for `staging.vvzstudio.com`.

Both files include `/etc/nginx/snippets/vvz-lead-api.conf`. That snippet, plus `/etc/nginx/conf.d/vvz-lead-rate-limit.conf`, must be installed from `vvz-lead-system` before these site files are enabled or tested.

Certbot-managed certificate files are not copied into this repository. The certificate and key paths under `/etc/letsencrypt/live/...` must be restored, renewed, and managed separately on the server. Real TLS keys, `server.env`, tokens, SSH host details, SSH key paths, and VPS IP addresses must not be committed.

## Install

Inspect the files before installing:

```bash
sudo nginx -T | less
sudo ls -l /etc/nginx/sites-available /etc/nginx/sites-enabled
```

Back up the currently active site files before replacing them:

```bash
sudo cp -a /etc/nginx/sites-available/vvzstudio /etc/nginx/sites-available/vvzstudio.backup.$(date -u +%Y%m%dT%H%M%SZ)
sudo cp -a /etc/nginx/sites-available/vvzstudio-staging /etc/nginx/sites-available/vvzstudio-staging.backup.$(date -u +%Y%m%dT%H%M%SZ)
```

Install these tracked files as:

```bash
sudo install -m 0644 deploy/nginx/vvzstudio.conf /etc/nginx/sites-available/vvzstudio
sudo install -m 0644 deploy/nginx/vvzstudio-staging.conf /etc/nginx/sites-available/vvzstudio-staging
```

Create relative symlinks in `sites-enabled`:

```bash
cd /etc/nginx/sites-enabled
sudo ln -sfn ../sites-available/vvzstudio vvzstudio
sudo ln -sfn ../sites-available/vvzstudio-staging vvzstudio-staging
ls -l vvzstudio vvzstudio-staging
```

Run the install, then the symlink check, then validate Nginx, and reload only after the validation succeeds:

```bash
sudo nginx -t
sudo nginx -s reload
```

## Rollback

Inspect the current active files and backups:

```bash
sudo ls -l /etc/nginx/sites-available/vvzstudio*
sudo nginx -T | less
```

Restore the chosen backup, verify symlinks, test Nginx, and reload only after a successful test:

```bash
sudo cp -a /etc/nginx/sites-available/vvzstudio.backup.YYYYMMDDTHHMMSSZ /etc/nginx/sites-available/vvzstudio
sudo cp -a /etc/nginx/sites-available/vvzstudio-staging.backup.YYYYMMDDTHHMMSSZ /etc/nginx/sites-available/vvzstudio-staging
ls -l /etc/nginx/sites-enabled/vvzstudio /etc/nginx/sites-enabled/vvzstudio-staging
sudo nginx -t
sudo nginx -s reload
```

These commands are operator instructions for a server session. They are not commands for Codex to run from this repository.
