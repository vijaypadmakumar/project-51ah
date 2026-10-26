# Project 51A(h) website

Plain HTML, CSS and JavaScript. No frameworks, no libraries and no build step.
Open `index.html` in a browser, or upload the whole folder to any static host
(Netlify, GitHub Pages, cPanel hosting and so on).

The only outside request is the Inter Tight font from Google Fonts. Remove the
three font lines in each page's `<head>` and the site falls back to
Helvetica or Arial.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: hero, practice intro, numbers band, Selected Work (sticky stacking cards), Article 51A(h), inquiry band |
| `work.html` | All projects, filter by method, grid or list view |
| `project.html?p=<slug>` | One template for every project: lead photo, facts, four-step story, gallery, previous and next |
| `practice.html` | The firm write-up, how a project develops, the four values as tabs, studio team |
| `contact.html` | Contact details and inquiry form |
| `404.html` | Page not found (point your host's 404 setting at it) |

## Folders

```
assets/
  css/
    tokens.css       colours, type sizes, spacing, easing (Sand, Laterite, Night themes)
    base.css         reset, type, links, buttons, layout helpers
    components.css   header, phone menu, footer, image boxes, cards, gallery, tabs, form
    motion.css       reveal animations and reduced-motion rules
    pages.css        page-specific layouts and breakpoints
  js/
    main.js          shared: phone menu, scroll reveals, blinds, parallax numbers, line drawing, count-up
    projects-data.js the project list (edit this to add projects)
    home.js          Selected Work cards and sticky index
    work.js          filters and grid/list views
    project.js       fills the project page from the data
    practice.js      values tabs
    contact.js       form checks and sending
  images/            put photographs here (see the photo list)
  icons/favicon.svg
```

## Common edits

**Add or change a project.** Edit `assets/js/projects-data.js`. Each project
has a `slug` (used in its address), name, place, year, method, area and phase.
Set `featured: true` on up to four projects to show them on the home page.

**Add a photograph.** Every grey box on the site is labelled with the photo it
needs and the path to save it at, for example `assets/images/home/hero.jpg`.

- In an HTML page, replace the placeholder's `<span class="ph__label">…</span>`
  with `<img src="assets/images/home/hero.jpg" alt="Describe the photo">` and
  remove `role="img"` and `aria-label` from the box.
- For projects, see "Adding a project's photos" below.

Save photos as JPG or WebP, around 2400 px on the long side for wide images
and 1600 px for the rest, under about 400 KB each.

**Adding a project's photos.** Every project has its own folder, named after
its slug (the short name in `projects-data.js`):

```
assets/images/projects/courtyard-house/
  cover.jpg        Work page thumbnail
  card.jpg         Home page card (featured projects only)
  lead.jpg         big photo at the top of the project page
  chapter-1.jpg    Observation
  chapter-2.jpg    Material exploration and testing
  chapter-3.jpg    Making
  chapter-4.jpg    Refinement
  gallery-01.jpg … gallery-08.jpg
```

1. Rename the photos to these names and put them in the project's folder.
2. In `projects-data.js`, change that project's `photos: false` to `photos: true`.
3. Optionally add captions: `captions: { 'gallery-01': 'Living room in the morning' }`.

Missing files show as a plain box, so photos can go in a few at a time. To
use a photo stored elsewhere for one slot, add `images: { cover: 'path/to/file.jpg' }`.

**Fill the numbers band.** In `index.html`, replace each `[00]` with the real
figure. Write `<dd data-count="24">24</dd>` to make it count up on scroll.

**Contact details.** Replace `[studio email]`, `[+91 phone]`, `[Street address]`
and `[PIN]` in the footer of every page and on `contact.html`. Set the same
email as `STUDIO_EMAIL` at the bottom of `assets/js/main.js`, and the WhatsApp
number in the `wa.me/` links.

**Inquiry form.** With no server, the form checks the fields and then opens the
visitor's email app with the inquiry filled in. To receive inquiries directly,
connect a form service (Formspree, Netlify Forms or the host's own) and replace
the last step in `assets/js/contact.js`.

**Theme.** Change `data-theme="sand"` on the `<html>` tag to `laterite` or
`night`.

## Responsive behaviour

- Phones (up to 720 px): menu button with a full-screen menu, single column,
  hero picture runs edge to edge, project list becomes stacked rows,
  Selected Work cards stack without the side index.
- Tablets (721 to 1024 px, iPad portrait and landscape): full header nav,
  hero text above the picture, Selected Work keeps its sticky index.
- Desktop (above 1024 px): the layout of the approved prototype.

Checked at 375 px (phone), 820 × 1180 (iPad portrait), 1180 × 820 (iPad
landscape) and 1440 px (desktop) with no sideways scrolling.

## Motion

Headlines rise from behind a mask, large images open with a blinds reveal,
smaller images wipe in from the left, project images blur in, outlined numbers
drift at a different speed, and the lines in the dark bands draw themselves as
you scroll. All of it runs on `IntersectionObserver` and a single scroll
handler, so it works in Safari, Chrome, Edge and Firefox. Visitors who ask for
reduced motion get the finished page with no animation.

## Still needed from the studio

See `PHOTO-LIST.md` for the photographs. Also: real project names and details,
the figures for the numbers band, team names and roles, the studio's address,
phone, email and social links, and confirmation of the values copy on the
Practice page.
