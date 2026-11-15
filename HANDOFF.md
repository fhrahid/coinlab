# COiN Lab website handoff

## Current state (all verified working)

- Production build passes; site served via `npm start` (use a free port, e.g. 3001).
- `.env` has `ADMIN_PASSWORD` plus live MongoDB Atlas (database `coinlab`) and Cloudinary (`dfyqotxnz`) credentials. Collections `wings`/`people`/`papers`/`partners` are seeded in the `coinlab` database.
- Theme re-done to the logo palette (navy `#0e1b40` / indigo `#3f4291` / light cyan `#9ccdee`); no green/olive remnants.
- Homepage: intro → sliding partner strip → research wings → stats → people → join. Stats are source-grounded: 05 wings, 04 partner institutions (dynamic from partners collection), 04 collaborator countries.
- Partner strip: seeds UIU/IUT/DIU/IIUC as text wordmarks; renders uploaded logos automatically once `logoUrl` is set in CMS.
- "Ecosystem" language removed everywhere.

## CMS (`/admin`)

- **Settings** (sidebar): live connection status (MongoDB/Cloudinary + media usage), a link to the Cloudinary Media Library, and a runtime CMS password change — the new password is stored salted-hashed in the `settings` collection and overrides `ADMIN_PASSWORD` from `.env`; changing it invalidates every active session (12-hour sessions).
- Collections: Wings, People, Papers, Partners — all with Cloudinary upload widgets (file preview before upload, explicit **Upload now**, **Remove** to detach, **Delete** on saved records which also deletes the file from Cloudinary storage).
- Uploaded photos render publicly: person photos on the homepage, `/people`, and profile pages; wing covers on wing pages; paper PDFs linked from the archive; partner logos in the homepage strip. Public pages revalidate every 10 s, so saved content appears without a rebuild.
- **People**: role dropdown with the 8 roles from the proposal/organogram (Director, Advisory Committee Member, In-Charge COiN Lab, Research Area Head, Lead Researcher, Research Associate, Research Assistant, Research Intern). Wings chosen via checkboxes (never typed). `type` (leadership/researcher) auto-derived by `lib/roles.js`. Bio supports Markdown — a toolbar (bold, italic, heading, list, link) edits it with a live preview, and `components/RichText.jsx` renders it on the profile page.
- **Papers**: paste-a-citation parser (`lib/citation.js`) auto-fills title/authors/year/venue/DOI/slug; validates and reports exactly which fields are missing; guideline note shows the expected APA-style format (IEEE quoted titles also supported). Papers page renders standard citation format: Authors (Year). *Venue*. DOI link.
- **Partners**: abbr/name/logo upload (`logoUrl` accepts pasted URLs or Cloudinary delivery URLs).

## Data entry team notes

- To enable saving + uploads: already wired — set `MONGODB_URI` + Cloudinary vars in `.env` (they are filled in) and restart. Saving requires a name/title; slugs are validated server-side.
- Roles list lives in `lib/roles.js`; wings in CMS or `lib/content.js` seeds.

## Verification already done

- Playwright: homepage responsive at 320/390/1440 (no overflow), slider animates + pauses on hover, reduced-motion fallback, CMS login, role dropdown (8 roles), wing checkboxes (5 wings), parser success + missing-field errors, no console errors.
- Citation parser unit-tested on APA, IEEE, arXiv, and incomplete inputs.
