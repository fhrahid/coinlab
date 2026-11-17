# AGENTS.md

Guide for AI coding agents (and new contributors) working on the COiN Lab website.
Read this before changing code. Design rules are in [DESIGN.md](DESIGN.md).

## What this is

The website and CMS of **COiN Lab** (Computational Intelligence Lab, Southeast University, Dhaka).
Public pages show research wings, people, publications and jobs. `/admin` is a password-protected CMS that edits all of it.

Motto, used verbatim in the hero: *"COiN Lab brings computational intelligence into contact with real questions—health, finance, security, language, agriculture, and the people living through them."*

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router, React 19, **JavaScript** (no TypeScript) |
| Styling | Tailwind CSS v4, tokens in `app/globals.css` |
| Components | shadcn/ui, Radix base, `radix-maia` style, lucide icons |
| Theme | `next-themes`, class strategy, light and dark |
| Data | MongoDB (official driver), seed fallback when no database |
| Media | Cloudinary, signed direct uploads |
| Package manager | **pnpm** |

## Commands

```bash
pnpm dev      # dev server on :3000
pnpm lint     # must pass before you finish
pnpm test     # node --test, unit tests in lib/*.test.mjs
pnpm build    # must pass before you finish
```

If a dev server is already running, never build into its `.next` folder. Build beside it:

```bash
NEXT_DIST_DIR=.next-verify pnpm build
```

## Layout

```
app/
  layout.jsx            fonts, theme provider, toaster
  globals.css           design tokens (light + dark) and motion utilities
  (site)/               public pages; layout.jsx adds header, footer, progress bar
    page.jsx            homepage
    wings/ people/ papers/ jobs/   listing + [slug] detail pages
  admin/                CMS entry (session gate)
  api/                  route handlers (content, applications, messages, auth, uploads, settings)
components/
  ui/                   shadcn components — generated, edit only to add variants
  site/                 shared public blocks (header, footer, cards, typography)
  home/                 homepage sections
  admin/                CMS screens
hooks/                  use-debounced-value, use-mobile
lib/                    data access and pure helpers (see below)
```

## Data model

All content is read through the query functions in `lib/content.js`. Records are keyed by a unique `slug`.

| Function | Use it for |
|---|---|
| `getRecord(name, slug)` | One record (detail pages). Never load a list to find one item |
| `getList(name, "field,field")` | A list with only the fields the page shows |
| `getByWing(name, wingSlug, fields)` | People or papers of one wing, filtered in the database |
| `getPublications(wing, limit)` | Papers shaped for display; the limit is applied in the database |
| `getWingCounts()`, `getCount(name)` | Totals, counted in the database |
| `getCollection(name)` | Every field of every record: the CMS, and small collections (`roles`, `slides`) |

Take the narrowest one that works. They accept plain strings and numbers (not option objects) so React `cache()` can share a repeated call within one render.

| Collection | Purpose | Notes |
|---|---|---|
| `wings` | Research areas | `focusPoints` is a list |
| `people` | Lab members | `role` holds a role **name**; `type` is the role's tier, set by the API. People have no order of their own |
| `roles` | Role list and hierarchy | `serial` is the only ordering: it places the role, and everyone holding it, in the hierarchy. `tier` groups roles under one heading |
| `papers` | Publications | `type`, `featured`, `codeUrl`, `doi`, `pdfKey`, `wingSlugs` |
| `partners` | Partner institutions | |
| `slides` | Homepage photo panel | Cloudinary URL plus transform settings |
| `jobs` | Job postings | `deadline` is `YYYY-MM-DD`; `active` switch |
| `applications` | Job applications | Private, admin only |
| `messages` | Contact-form inbox | Private, admin only |
| `settings` | CMS password hash | |

Adding a field to a collection touches four places, in this order:

1. `schema` in `app/api/content/route.js` (the API drops any field not listed).
2. `emptyRecord` / `toFormRecord` in `lib/collections.js`.
3. The form block in `components/admin/record-form.jsx`.
4. The public page that shows it.

## Rules that keep things in sync

- **Roles.** People store a role by name. Renaming a role in the CMS updates every person who holds it; a role cannot be deleted while someone holds it. Roles start as the built-in list in `lib/roles.js`; the first save copies that list into the database. Hierarchy logic lives only in `lib/roles.js` (`buildHierarchy`, `rankPeople`).
- **Jobs.** "Is this posting open?" is decided only by `isJobOpen` in `lib/jobs.js`. The public pages, the applications API and the CMS list all call it. Do not re-implement the date check.
- **Publications.** Shape papers with `getPublications()`; render them with `components/site/publication-list.jsx`. Authors who match a person's name link to their profile.
- **Cache.** Public pages are statically generated with `revalidate = 10`. Every CMS write also calls `revalidatePath("/", "layout")`, so edits show at once.

## Performance rules

- Do not fetch a whole collection and filter it in JavaScript. Ask the database for the record, the fields and the count you need (see the query functions above).
- Query functions are wrapped in React `cache()`: the same call inside one render runs once.
- Person photos and logos go through `thumbUrl(url, size)` so the browser downloads a right-sized image, not the original.
- Sort fields in `lib/content.js` match the indexes created in `lib/mongodb.js`. Add an index when you add a new sort or lookup.
- Search inputs go through `useDebouncedValue` and filter a prebuilt lower-cased index (see `papers-browser.jsx`, `record-list.jsx`).
- Keep pages server components. Add `"use client"` only for state, effects or browser APIs.
- No Framer Motion, GSAP or 3D libraries. Animation is CSS (see DESIGN.md).
- Client-only extras that are not needed for first paint load through `components/home/lazy.jsx`.

## Component rules

- Reach for `components/ui` first. Add more with `pnpm dlx shadcn@latest add <name>`.
- Before adding a third-party registry component, check its dependencies. Reject anything that pulls in `motion`.
- Use semantic tokens (`bg-card`, `text-muted-foreground`, `text-brand`). Never hard-code a colour; it breaks one of the two themes.
- Forms use `Field` + `FieldLabel`; callouts use `Alert`; empty states use `Empty`; confirmations use `AlertDialog`.
- `cn()` merges classes; custom utilities must not start with `text-` or they get merged away (`label-caps`, `display-heading`).

## Security rules

- Every write route checks `isAdminRequest` first. It also rejects writes whose `Origin` is another site (CSRF).
- The session cookie is `HttpOnly`, `Secure` and `SameSite=Strict`. The CMS password is stored with scrypt.
- Login, password change and the public forms are rate limited with `limited()` from `lib/http.js`. Add it to any new public write route.
- Uploads accept only the types listed in `app/api/uploads/route.js`. SVG is excluded on purpose.
- Security headers are set in `next.config.mjs`.
- The content API whitelists fields per collection. Keep it that way.
- Links stored from the CMS and rendered as `href` must be validated as `http(s)` (see `codeUrl`).
- Public forms (`/api/contact`, `/api/applications`) use a honeypot field and a rate limit.
- Never commit `.env*`. Never log secrets.

## Before you finish

1. `pnpm lint`, `pnpm test`, `pnpm build` all pass.
2. Check the pages you touched in **both themes** at 320, 390, 768 and 1440px: no horizontal scroll, no console errors.
3. New non-trivial logic in `lib/` has a test beside it.
4. Say plainly what you could not verify (for example, anything that needs the real database).

**The local `.env` points at the live database.** A local server reads and writes real content. Do not submit forms, save records or run write tests against it; use a throwaway database for that.

## Known gaps

- Rate limits are kept in memory per server process (see `lib/rate-limit.js`); move them to the proxy or Redis if the site runs on more than one instance.
- No Content-Security-Policy header yet.
- Media is on Cloudinary; the move to Cloudflare R2 is planned in [docs/R2_MIGRATION_PLAN.md](docs/R2_MIGRATION_PLAN.md).
- No automated browser tests in the repo; UI checks are manual.
- `next lint` is deprecated in Next 16; migrate to the ESLint CLI when upgrading.
