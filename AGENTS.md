# AGENTS.md - VVZ Studio / MyBot static site rules

## Project Scope

- This repository is a static VVZ Studio / MyBot website.
- Default stack: static HTML, CSS, and vanilla JavaScript.
- Do not introduce frameworks, package managers, build pipelines, server runtimes, backend rewrites, CDNs, external APIs, LLMs, or generated app structure unless the user explicitly requests that change.
- Preserve existing public URLs, filenames, and route behavior unless the user explicitly asks to change routing.

## Working Rules

- Work only in this local repository unless the user explicitly changes the scope.
- Audit before edits. Read the real files, script loading order, existing configuration, and current public page behavior relevant to the request before proposing or changing code.
- Keep edits narrow and tied to the requested subsystem.
- Do not make unrelated SEO, design, routing, copy, or behavior changes while fixing a specific feature.
- Preserve unrelated page content and behavior.
- Do not commit unless the user explicitly asks for a commit.
- Never commit secrets, tokens, private chat IDs, credentials, passwords, real TLS private keys, real public or private infrastructure IP addresses, real SSH host/key paths, `server.env`, or other secret operational values. Loopback addresses such as `127.0.0.1` and `::1`, plus explicitly reserved documentation placeholders, are allowed in tracked configuration and documentation. If an endpoint is already public in the repo, treat it as sensitive operational configuration and avoid expanding exposure.

## Deployment And Production Boundary

- Codex works locally in this repository only.
- Never connect to the VPS or production server.
- Never run deploy, `ssh`, `rsync`, `scp`, `systemctl`, or commands that modify production infrastructure.
- Never modify production state, services, certificates, firewall rules, server files, or runtime environment.
- Tracked deployment, Nginx, and production documentation may be read or changed only when the user explicitly asks for that work.
- Full host-specific Nginx server blocks belong to this website repository.
- API backend snippets and backend `systemd` units belong to `vvz-lead-system`, not this website repository.

## Lead Flow And Telegram Rules

- Forms, lead-flow, and Telegram links must have one canonical JavaScript owner.
- Do not add duplicate click interceptors for the same Telegram links.
- Personal Telegram links must not be silently rewritten to bot links.
- Bot links may be intercepted only when explicitly marked or when they target the canonical bot account.
- Any Apps Script integration must match actual form fields used by the HTML forms, including fields such as `name`, `email`, `phone`, `city`, `project`, `message`, `lang`, `page`, and tracking metadata when present.
- If Apps Script code is only a template or not confirmed as deployed code, mark it clearly as a template and do not describe it as the production backend.
- If frontend submission uses `no-cors`, do not claim that the browser can verify Apps Script success unless the integration is changed to support readable responses.

## SEO And Language Rules

- Keep language routes valid across English, French, and Russian pages.
- Keep sitemap, hreflang, canonical, noindex, and JSON-LD valid when touching pages that affect routing, indexing, language alternates, or structured data.
- Thank-you page routing must match the active document language.
- Do not remove `noindex` from demo or thank-you pages unless the user explicitly asks.

## SaaS And Tenant Claims

- Do not invent tenant, SaaS, CRM, auth, database, routing, lead pipeline, or backend behavior in static files.
- Marketing copy may describe planned or packaged capabilities, but implementation claims must match code that actually exists.
- If tenant or SaaS behavior is not implemented in the static site, state that clearly in audits.

## Output Requirements

- Keep outputs compact and evidence-based.
- Lead with file-by-file findings for audits and reviews.
- Include exact file paths and, where useful, line numbers.
- Include exact validation commands run, plus their result.
- If a command could not be run, state why.
- When asked for a plan, provide a focused fix plan and avoid patching until the user authorizes edits.
