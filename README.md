# COiN Lab website

## What is included

- Public homepage with the COiN Lab visual system.
- Research wing directory and individual pages at `/wings` and `/wings/[slug]`.
- People directory and individual profiles at `/people` and `/people/[slug]`.
- Admin CMS at `/admin` for managing wings, people, roles, papers, partners, slideshow photos and job postings, with inboxes for messages and job applications.
- Jobs page at `/jobs` with on-site applications.
- MongoDB-backed content APIs with seed-content fallback for local development.
- Cloudinary signed-upload endpoint at `/api/uploads`.

## Stack and structure

Next.js 15 (App Router, React 19) · Tailwind CSS v4 · shadcn/ui (Radix base, `radix-maia` style, lucide icons) · light and dark themes · MongoDB · Cloudinary.

```
app/
  layout.jsx          root layout: fonts, theme provider, toaster
  globals.css         design tokens for both themes, motion utilities
  (site)/             public pages: home, wings, people, papers, jobs
  admin/              CMS entry (session gate)
  api/                route handlers
components/
  ui/                 shadcn components (add more with: pnpm dlx shadcn@latest add <name>)
  site/               header, footer, cards, typography and other shared public blocks
  home/               homepage sections
  admin/              CMS: sidebar, record list/form, slide editor, inboxes, settings
lib/                  data access, auth, Cloudinary, and pure helpers with tests
```

Working rules for contributors and AI agents are in [AGENTS.md](AGENTS.md). The design system is in [DESIGN.md](DESIGN.md).

Checks: `pnpm lint`, `pnpm test`, `pnpm build`.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add a MongoDB Atlas connection string and a long `ADMIN_PASSWORD`.
3. Run `pnpm install` and `pnpm dev`.
4. Open `http://localhost:3000/admin` to manage content.

Without `MONGODB_URI`, the public site uses the seed records in `lib/content.js`; the CMS stays read-only and explains that MongoDB must be connected before publishing.

## MongoDB Atlas setup

1. Create a free Atlas project and free-tier cluster.
2. Create a database user with read/write access to a database named `coinlab`.
3. Add the deployment host/IP to Atlas Network Access. For a hosted deployment, use the platform's fixed egress guidance or the narrowest temporary rule that fits your deployment.
4. Copy the Atlas SRV connection string into `MONGODB_URI` and replace the username, password, and cluster host.

The application creates the `wings`, `people`, and `papers` collections on first save. It uses the official MongoDB Node.js driver and reuses the connection pool in development.

## Cloudinary setup

1. Create a free Cloudinary account; the **Cloud name** is shown on the Dashboard.
2. Open **Settings → API Keys** and copy the **API Key** and **API Secret**.
3. Put all three values into `.env.local` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

The server signs the upload parameters with the API secret; the browser then uploads the file directly to Cloudinary, so the secret never reaches the client. The record stores the Cloudinary delivery URL returned by the upload, so no separate public-base-URL setting is needed.

## Deployment

Deploy the Next.js app to Vercel, Cloudflare Workers with the Next.js adapter, or another Node-compatible host. Add the variables from `.env.example` to the host's encrypted environment settings. Do not commit `.env.local` or any Cloudinary secret.

The current CMS is intentionally small and editorial: choose a collection, select a record, edit structured fields, and save. The next natural enhancement is role-based accounts for multiple editors, plus drag-and-drop media fields wired to the already available Cloudinary upload endpoint.
