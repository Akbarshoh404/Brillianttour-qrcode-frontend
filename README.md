# PDF Manager — Frontend

## What this actually is

This is the dashboard used to manage the PDFs behind a set of printed QR
codes — menus, brochures, itineraries, price sheets, bank documents.
Drag a PDF in, get a permanent QR code back. Update the file later and
every QR code already printed on paper keeps working, because the QR code
points at a permanent ID, not the file itself.

It's a small internal tool, not a public product. A single shared
password gates the dashboard — nobody scanning a QR code or opening a
shared PDF link ever needs to enter anything, only whoever manages the
documents does.

What you can do from here:

- **Upload** a PDF, optionally titled, filed into a folder, and deployed
  under a specific domain — all from one drag-and-drop modal.
- **Manage domains** — this tool can serve more than one business's QR
  codes. Register a domain (e.g. `kapitalbank-docs.uz`) once, then pick it
  from a dropdown whenever you upload something that should live there.
  Everything else about the document stays on the backend's own domain;
  only the printed/scanned link changes.
- **Organize into folders** — filter pills above the document grid switch
  between folders, and each one is backed by its own storage bucket on
  the backend, not just a label.
- **See real activity per document** — expand any card ("Show details")
  for a country/device/browser breakdown and a recent-scans feed, all
  built from data the backend already had (no tracking scripts, no
  permission prompts).
- **Pause a QR code without deleting it** — useful when, say, a client
  stops paying: visitors see an "unavailable" page instead of the PDF, and
  turning it back on is instant.
- **Trash with a safety net** — deleting moves a document to `/trash`,
  recoverable for a week before it's gone for good, or you can skip the
  wait and delete it forever from the trash view.

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
│   └── ui/                     # Button, Modal, Select, Toast, Switch, Skeleton, EmptyState — generic primitives
├── hooks/                          # useAuth (frontend-only password gate), useDocuments/useDomains/useFolders (TanStack Query), useDarkMode, useDebounce
├── pages/                            # Login, Dashboard, Trash, NotFound
├── services/                           # axios client + document/domain/folder services (all API calls live here)
├── types/                                # shared TypeScript types matching the backend's responses
└── utils/                                  # formatting, clipboard, file-download helpers
```

## How the dashboard is laid out

The document grid is two columns wide on desktop. Expanding a card's
details ("Show details") also expands whichever card shares its row —
otherwise one card grows taller than its neighbor and the row looks
broken. That pairing is handled in `DocumentGrid`, which owns the expanded
state and hands each `DocumentCard` an `isExpanded` flag rather than the
card tracking it itself.

Each card shows the actual QR destination link (not just an icon to copy
it) — useful for eyeballing which domain a document is deployed under
without opening anything.

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

- **Domains** — the upload modal has a "Deploy to domain" picker listing
  every domain the backend knows about (name + bare domain shown
  together), with an "Add a new domain" entry at the bottom of the list
  that opens a small form to register one on the spot. Picking a domain
  decides what `qr_link` (the URL actually encoded in the QR code, and
  shown directly on the document's card) looks like for that document —
  everything else stays on the backend's own domain.
- **Folders** — `FolderNav` renders a row of filter pills above the
  document grid ("All files" + one per folder + document counts), each
  with its own `+ New folder` action. The upload modal has a matching
  folder picker, pre-selected to whatever folder you're currently
  viewing. To move an *existing* document into a different folder, expand
  its card — there's a folder picker there that calls the move endpoint,
  which physically relocates the file between Supabase Storage buckets on
  the backend.

Both pickers are the same custom `Select` component (`components/ui/Select.tsx`)
rather than a native `<select>` — it supports the richer two-line options
(name + URL) and the inline "add new" action a native dropdown can't.

## Environment variables

Copy `.env.example` to `.env`:

| Variable | What it's for |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, no trailing slash |
| `VITE_DASHBOARD_PASSWORD` | Password required to unlock the dashboard UI (frontend-only gate, see above) |

**Important:** Vite bakes `VITE_*` variables into the JS bundle at **build
time**, not at runtime. If you deploy using the `Dockerfile` in this repo,
your hosting platform needs to pass these as Docker **build arguments** —
setting them as plain runtime environment variables on the container does
nothing, since by then the bundle is already built. If your platform
instead builds directly from `npm run build` (no Docker), normal
build-time environment variables are enough.

## Running locally

```bash
npm install
copy .env.example .env    # fill in VITE_API_URL and VITE_DASHBOARD_PASSWORD
npm run dev
```

Dashboard is at `http://localhost:5173`, gated by whatever password you set
in `VITE_DASHBOARD_PASSWORD`. You'll also need the backend running (see the
backend repo's README) for the document list, domains, and folders to load
anything.

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
  directly from the built static files), just make sure `VITE_API_URL` and
  `VITE_DASHBOARD_PASSWORD` are set as build-time env vars before `npm run
  build` runs.
- After changing either on your hosting platform, you must trigger a full
  rebuild — a cached/incremental redeploy will keep serving the old values
  baked into the previous build.

## How it talks to the backend

All API calls go through `src/services/api.ts` (a single Axios instance)
and per-resource service modules (`documentService.ts`, `domainService.ts`,
`folderService.ts`) with typed wrappers per endpoint — no auth headers
attached, since the backend doesn't check for any. Server state (documents,
trash, domains, folders, per-document scan summaries) is managed with
TanStack Query — every mutation (upload, replace, delete, restore,
disable/enable, move, create/delete domain or folder) automatically
invalidates and refetches the relevant queries on success, so the UI
always reflects what's actually in the database without manual state
juggling.
