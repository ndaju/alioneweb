<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:aliome-crucial-context -->
# AliOne Mail API Critical Configuration

## IMAP API Routes (`/api/mail/list`, `/api/mail/read`)
These API routes use `imapflow` and `mailparser` packages.

### Requirements
1. **`next.config.ts`** must include `serverExternalPackages: ["imapflow", "mailparser"]` — without this, the standalone build will NOT include these packages in `/app/node_modules/`, causing MODULE_NOT_FOUND at runtime.

2. **`tls: { rejectUnauthorized: false }`** must be set in the `ImapFlow` constructor options — the mailserver uses a self-signed certificate, and Node.js will throw `Error: self-signed certificate` during TLS handshake.

3. **Empty INBOX handling** — Dovecot returns `Command failed` for `FETCH 1:*` on empty mailboxes. Always check `imap.status('INBOX', { messages: true })` first and only fetch if `messages > 0`.

4. **ImapFlow credential storage** — email passwords are stored in Clerk `publicMetadata` as `claimedEmail`/`claimedPassword` for auto-login from the dashboard.

## `docker-mailserver/config/` is git-tracked
The `postfix-accounts.cf` file in `docker-mailserver/config/` is tracked by git. Email accounts created via `docker exec mailserver setup email add` modify this file. Doing `git pull` will overwrite local changes. After deployment, the file MUST be restored:
```bash
git checkout stash@{0} -- docker-mailserver/config/postfix-accounts.cf
```
Consider adding this file to `.gitignore` and keeping only a `.gitkeep`.

## Docker
- Docker socket at `/var/run/docker.sock` is mounted into the nextjs container for `docker exec mailserver setup email add`
- Docker CLI installed in runner stage via `apk add docker-cli` with GID 998 matching host docker group
- The standalone output lives at `/app/` in the container (not `/app/.next/standalone/`)

## Docker Inter-Container Networking
**IMPORTANT**: fail2ban inside the mailserver container bans container IPs that fail IMAP login too many times. This causes TCP connections between containers to timeout (ICMP still works because fail2ban only blocks TCP).

**Fix**: Add the Docker bridge subnet to fail2ban's `ignoreip`:
- Config file: `docker-mailserver/config/fail2ban-jail.cf` (persists across restarts)
- Manual: `docker exec mailserver sh -c 'sed -i "s|ignoreip = 127.0.0.1/8|ignoreip = 127.0.0.1/8 172.18.0.0/16|" /etc/fail2ban/jail.local; fail2ban-client reload'`
- To unban: `docker exec mailserver sh -c 'fail2ban-client unban --all; nft flush table inet f2b-table'`
## Clerk & Domain Configuration
- **VPS repo structure**: Files are at repo root (`~/alioneweb/`), NOT in `next/` subdirectory. Dockerfile, docker-compose.yml, src/ all at root.
- **Docker build**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be passed as a build arg (not just runtime env) because Next.js inlines it at build time.
- **docker-compose.yml**: Both `build.args` AND `environment` must have the key hardcoded:
  ```yaml
  build:
    args:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
  environment:
    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
    - CLERK_SECRET_KEY=sk_live_...
  ```
- **Clerk production keys** enforce domain validation. `mail.alione.cc` must be in Clerk Dashboard "Allowed subdomains" AND served over HTTPS.
- **Cloudflare "Always Use HTTPS"** (SSL/TLS → Edge Certificates) must be ON for mail.alione.cc, otherwise Clerk rejects `http://` with `secure-context: false` + origin error.
- **VPS quick edits**: Use `sed -i` for file changes, then `docker compose build --no-cache nextjs && docker compose up -d nextjs` to rebuild (no git push/pull needed).
- **Session sharing**: Clerk sessions on `alione.cc` are NOT automatically shared with `mail.alione.cc` subdomain. Need `isSatellite` config or proper Clerk domain setup.

## proxy.ts Mail Subdomain Logic
- `mail.alione.cc` unauthenticated requests → redirect to `/sign-in?redirect_url=/dashboard/mail`
- `mail.alione.cc` authenticated requests → rewrite to `/dashboard/mail`
- The rewrite line MUST check `userId`: `if (userId && url.pathname !== "/dashboard/mail")`
- Without `userId` check, `/sign-in` gets rewritten to `/dashboard/mail` causing blank page.
<!-- END:aliome-crucial-context -->
