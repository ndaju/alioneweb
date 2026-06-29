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
<!-- END:aliome-crucial-context -->
