# DESIGN.md

The design system of the COiN Lab website. Follow it so every page stays consistent.

## Idea

A research lab, shown with a futuristic but calm interface. The visuals come from the lab's motto: computational intelligence **in contact with** real fields. So the signature elements are connection lines, pen strokes that draw themselves, and content that links one thing to another (a field to its wing, an author to their profile).

Avoid decoration that says nothing about the lab.

## Tokens

All colours, radius and fonts live in `app/globals.css`. `:root` is the light theme, `.dark` the dark theme.

| Token                       | Use                                                |
| --------------------------- | -------------------------------------------------- |
| `background`, `foreground`  | Page and main text                                 |
| `card`                      | Raised surfaces                                    |
| `muted`, `muted-foreground` | Quiet surfaces and secondary text                  |
| `primary`                   | Main action colour                                 |
| `brand`, `brand-2`          | The logo's blue and cyan; gradients and highlights |
| `border`, `input`, `ring`   | Lines, field borders, focus ring                   |
| `navy`, `navy-foreground`   | Always-dark surface (CMS login)                    |
| `success`, `destructive`    | Status                                             |

To rebrand, change `--brand`, `--brand-2` and `--primary` in both blocks. Check contrast in both themes after any change.

Fonts: Geist Sans for text, Geist Mono for labels and numbers. Radius base is `0.875rem`; cards and panels use `rounded-3xl`, controls are pills.

## Building blocks

Compose pages from these. Do not restyle them per page.

| Block                               | File                                   | Use                                         |
| ----------------------------------- | -------------------------------------- | ------------------------------------------- |
| `Chip`                              | `components/site/typography.jsx`       | Small mono label above a heading            |
| `SectionHeader`                     | same                                   | Chip + headline + lead; opens every section |
| `Highlight`                         | same                                   | Gradient word in a headline                 |
| `Scribble`                          | same                                   | Pen-stroke underline that draws itself      |
| `ArrowBadge`                        | same                                   | Arrow in a circle, ends a pill button       |
| `PageHero`                          | `components/site/page-hero.jsx`        | Top of every inner page                     |
| `Crumbs`                            | `components/site/crumbs.jsx`           | Breadcrumbs on detail pages                 |
| `WingCard`, `PersonCard`, `JobCard` | `components/site/`                     | Content cards                               |
| `PublicationList`                   | `components/site/publication-list.jsx` | Numbered paper list                         |
| `Button variant="glow"`             | `components/ui/button.jsx`             | The one primary action per view             |

Utilities in `globals.css`: `wrap` (page gutter), `display-heading`, `label-caps`, `text-gradient`, `bezel` (double border), `dot-grid`.

## Page pattern

1. `PageHero` with a chip, an `h1`, one lead sentence.
2. Content inside `wrap`, sections spaced `py-12 md:py-16` (inner pages) or `py-20 md:py-28` (homepage).
3. Cards in a grid; lists as `PublicationList` or `Item` rows.
4. An `Empty` state for every list that can be empty.

Homepage order: hero with motto and diagram, partners, research wings, recent work, method, stats, people, photo slideshow, contact.

## Motion

CSS only. Every animation is disabled under `prefers-reduced-motion`.

| Effect           | How                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Scroll reveal    | `reveal` class (scroll-driven animation; content is simply visible where unsupported)          |
| Line drawing     | `animate-draw` on an SVG path with `pathLength="1"`                                            |
| Count-up numbers | `count-up` class with `--num` set inline                                                       |
| Theme switch     | View Transition, circle expanding from the toggle                                              |
| Cursor glow      | `data-spotlight` attribute on a card                                                           |
| Page loading     | `nav-progress` bar along the top edge while a route loads (`components/site/nav-progress.jsx`) |
| Page entrance    | Each route fades in through `app/(site)/template.jsx`                                          |
| Scrollbar        | Slim themed scrollbar, defined once in `globals.css`                                           |
| Entrance         | `animate-fade-up`, staggered with `[animation-delay:…]`                                        |

Animate only `transform`, `opacity` and `stroke-dashoffset`. Keep durations under one second, except ambient loops.

## Accessibility

- Text contrast meets WCAG AA in both themes.
- Every interactive element has a visible focus ring and is at least 24px tall; primary controls are 40px or more.
- Auto-playing content (the slideshow) has a pause button.
- Decorative graphics are `aria-hidden`; repeated marquee content has a plain `sr-only` list.
- A person without a photo, or whose photo fails to load, shows a person icon (`PersonAvatar`), never initials or broken-image alt text.
- One `h1` per page; headings do not skip levels.

## Do and don't

- Do use tokens. Don't write `bg-[#0e1b40]` or `text-white` on a themed surface.
- Do reuse a block. Don't build a new card style for one page.
- Do let content carry the page: papers, people, figures. Don't add stock imagery or filler slogans.
- Do keep one `glow` button per view. Don't make every button the primary one.
