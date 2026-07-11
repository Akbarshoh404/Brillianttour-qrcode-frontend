# PDF Manager — Frontend

## What this actually is

This is the dashboard the Brilliant Tour team uses to manage the PDFs
behind their printed QR codes — menus, brochures, itineraries, price
sheets. Drag a PDF in, get a permanent QR code back. Update the file later
and every QR code already printed on paper keeps working, because the QR
code points at a permanent ID, not the file itself.

It's a small internal tool for one team, not a public product. A single
shared login gates the dashboard — nobody scanning a QR code or opening a
shared PDF link ever needs to sign in, only the person managing documents
does. Each card shows a document's QR code, how many times it's been
scanned or downloaded, and gives you one-click actions: view, download,
replace the file, copy the QR link, disable it, or move it to the trash.
Expanding a card reveals a scan breakdown (countries, devices, browsers)
and a switch to pause a QR code without deleting it.

This grew from serving one business to serving several: a document can be
deployed under any registered domain (so a bank's QR codes read
`kapitalbank-docs.uz` while a tour operator's read their own domain,
picked from a dropdown at upload time), and documents can be organized
into folders — each folder pill along the top of the dashboard filters the
grid to just that folder's files.

## Tech stack

React 19, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query,
Axios, Framer Motion, React Hook Form, Lucide Icons.

## Project structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute
│   ├── layout/          # TopNav, DashboardLayout
│   ├── documents/         # DocumentCard (+ accordion detail), Trash card, upload/replace/delete modals, QR preview
│   ├── domains/            # AddDomainModal
│   ├── folders/              # FolderNav (filter pills), AddFolderModal
│   └── ui/                     # Button, Modal, Toast, Switch, Skeleton, EmptyState — generic primitives
├── hooks/                          # useAuth (frontend-only password gate), useDocuments/useDomains/useFolders (TanStack Query), useDarkMode, useDebounce
├── pages/                            # Login, Dashboard, Trash, NotFound
├── services/                           # axios client + document/domain/folder services (all API calls live here)
├── types/                                # shared TypeScript types matching the backend's responses
└── utils/                                  # formatting, clipboard, file-download helpers
```

## Auth (frontend-only)

`/login` is the only public route. Everything else — the dashboard (`/`)
and the trash bin (`/trash`) — is wrapped in `ProtectedRoute`, which checks
a value in `sessionStorage`.

This is deliberately **not real authentication** — the backend has no
concept of a login and doesn't check anything. It's a password prompt that
gates the dashboard *page*, comparing what's typed against
`VITE_DASHBOARD_PASSWORD`, which gets baked into the JS bundle at build
time. Anyone who opens the browser's dev tools and reads the bundle can
find the password. That's an accepted tradeoff for "keep casual visitors
off the dashboard," not a security boundary — the backend API itself is
still open to anyone who has its URL, exactly as it always was.

If real auth (backend-enforced, can't be bypassed by reading the JS) is
ever needed, that's a backend change, not a frontend one.

## Domains and folders

Both are managed inline, right where you'd need them, rather than on a
separate settings page:

- **Domains** — the upload modal has a "Deploy to domain" dropdown listing
  every domain the backend knows about, plus a `+` button that opens a
  small form to register a new one on the spot. Picking a domain there
  decides what `qr_link` (the URL actually encoded in the QR code) looks
  like for that document — everything else about it stays on the backend's
  own domain.
- **Folders** — `FolderNav` renders a row of filter pills above the
  document grid ("All files" + one per folder + document counts), each
  with its own `+ New folder` action. The upload modal has a matching
  folder dropdown, pre-selected to whatever folder you're currently
  viewing. To move an *existing* document into a different folder, expand
  its card ("Show details") — there's a folder select there that calls the
  move endpoint, which physically relocates the file between Supabase
  Storage buckets on the backend.

## Environment variables

Copy `.env.example` to `.env`:

| Variable | What it's for |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, no trailing slash |
| `VITE_DASHBOARD_PASSWORD` | Password required to unlock the dashboard UI (frontend-only gate, see above) |

**Important:** Vite bakes `VITE_*` variables into the JS bundle at **build
time**, not at runtime. If you deploy using the `Dockerfile` in this repo,
your hosting platform needs to pass `VITE_API_URL` as a Docker **build
argument** — setting it as a plain runtime environment variable on the
container does nothing, since by then the bundle is already built. If your
platform instead builds directly from `npm run build` (no Docker), a normal
build-time environment variable is enough.

## Running locally

```bash
npm install
copy .env.example .env    # fill in VITE_API_URL
npm run dev
```

Dashboard is at `http://localhost:5173`, gated by whatever password you set
in `VITE_DASHBOARD_PASSWORD`. You'll also need the backend running (see the
backend repo's README) for the document list to load anything.

## Building for production

```bash
npm run build
```

Output goes to `dist/` — a fully static site, servable from anywhere
(nginx, Vercel, Netlify, S3 + CDN, etc.).

## Deployment notes

- The included `Dockerfile` builds the static site and serves it with
  nginx. `nginx.conf.template` listens on `$PORT` (via nginx's built-in
  envsubst templating), defaulting to `80` — this makes the same image work
  on PaaS platforms that inject a dynamic port as well as on a plain VPS.
- If you're not using the Dockerfile (e.g. deploying to Vercel/Netlify
  directly from the built static files), just make sure `VITE_API_URL` is
  set as a build-time env var before `npm run build` runs.
- After changing `VITE_API_URL` on your hosting platform, you must trigger
  a full rebuild — a cached/incremental redeploy will keep serving the old
  API URL baked into the previous build.

## How it talks to the backend

All API calls go through `src/services/api.ts` (a single Axios instance)
and `documentService.ts` (typed wrappers per endpoint) — no auth headers
attached, since the backend doesn't check for any. Server state (the
document list, the trash list, per-document scan summaries) is managed
with TanStack Query — uploads, replacements, deletes, restores, and
disable/enable toggles are all mutations that automatically invalidate and
refetch the relevant list on success, so the UI always reflects what's
actually in the database without manual state juggling.
