# AKDY Shopify theme

Online Store 2.0 theme converted from the client-approved static preview of
the akdyusa.com home page (built in the `akdy website migration` workspace).
The conversion is structural only — the rendered home page must match the
approved preview pixel-for-pixel.

## Connecting to the store

1. Push this repository to GitHub (it must stay at the repo root — Shopify's
   GitHub integration rejects themes in subdirectories).
2. In Shopify admin: **Online Store → Themes → Add theme → Connect from
   GitHub**, pick this repo and the `main` branch.
3. The home page renders with the approved content immediately —
   `templates/index.json` and the section schemas are seeded with the
   current copy, images, and slide order.

## Structure

- `layout/theme.liquid` — head (PT Sans / PT Sans Narrow webfonts, akdy.css),
  icon defs, announcement bar + header sections, `content_for_layout`, footer.
- `sections/hero-carousel.liquid` — slides as blocks (add/remove/reorder in
  the editor). Slide order is the display order; a slide with no eyebrow and
  no heading renders image-only (slide 5, the tub-filler infographic).
- `sections/promo-band.liquid`, `sections/info-grid.liquid` — the other two
  home page sections; tiles are blocks with a "wide" checkbox.
- `sections/header.liquid` / `sections/footer.liquid` — nav and footer link
  columns use menu pickers, but until menus are assigned they fall back to
  the approved hardcoded links so nothing renders empty.
- `assets/akdy.css`, `assets/akdy.js` — copied byte-for-byte from the
  approved preview; do not edit here without back-porting to the preview.

## Editing content

Everything Min needs is in the theme editor: header shipping-notice lines,
hero slides (image, eyebrow, heading, button, link), promo copy, info tiles,
footer headings/menus/copyright, and global settings for the logo and social
URLs. No code changes required.

## Before launch (pending)

- **Images are hotlinked from www.akdyusa.com** (carousel, promo GIF, info
  tiles, logo). Upload them to Shopify's CDN via each section's image picker
  / the logo setting, then remove the external URLs. Do this before launch —
  hotlinks break if the old site goes away.
- Assign real menus (header, footer columns) and link targets; placeholder
  links currently render `href="#" data-todo="pending"`.
- "Quick Order" in the utility row has no Shopify equivalent yet.
- The header search icon links to /search rather than opening the original
  site's typeahead overlay.

## Category and product templates

`templates/collection.json` + `sections/main-collection.liquid` and
`templates/product.json` + `sections/main-product.liquid` are real templates
built from the support-page audits (one browse layout covers support
families, part-type pages, and the future kitchen/bathroom categories).
They are **built but unpopulated until a catalogue is imported** — with no
products they render the full page furniture with a clean empty message.
To light them up:

- Import products; stock status drives the IN STOCK / Out Of Stock badges,
  and products without photos get the deliberate "Image not available" tile.
- Create menus for each collection's sidebar ("Sidebar category menu"
  setting) and family child-row (the "Child category menu" setting, or
  automatically a menu whose handle matches the collection handle).
- Top-level landing pages (Support, Home & Kitchen, Bathroom) turn on
  "Show child categories as image tiles" in their collection template:
  photo above an uppercase label, seven per row, per the live /support
  capture. The photo is the linked collection's image (falls back to its
  first product's image); a link with neither renders label-only, exactly
  like Fireplace / Kitchen Faucet / Bath Faucet on the live page.
- The final-sale notice on /support is the collection description — it
  renders centered under the title on every collection that has one.
- Breadcrumb ancestry comes from a nav menu with handle `breadcrumbs`,
  nested to mirror the category tree (Support > Shower Panel > Bracket).
  The current collection is found in it BY URL — never by display name,
  because three support categories all display "Accessories" — and trails
  degrade gracefully to Home > collection (or Home > product) for anything
  not in the menu. This is how the audit's variable-depth trails (1–4
  levels) reproduce.
- Configure Search & Discovery filters; the sidebar renders them, and
  degrades to just the category list when none exist.
- Per-page count, compare bar, and all labels are section settings.

Not wired yet: the compare-bar's actual compare view (selection capped at 4,
button inert), wishlist (no native Shopify equivalent), list/table view
toggles (visual state only), reviews (static "no reviews" block — a review
app can replace it), and the per-page select (display-only; the real count
is the section setting).

## Warranty page

`templates/page.warranty.json` + `sections/main-warranty.liquid`. The live
`/warranty` page has no AKDY-built content of its own — the whole body is a
NetSuite "Online Lead Form" (warranty registration) embedded as an iframe.
The section keeps using that same NetSuite form (URL is a section setting,
defaulting to the live embed), so the page works immediately with zero
backend decisions — same data destination as today. The full field list is
documented in `docs/policy-page-content/warranty-form-fields.md` in case a
native Shopify form ever replaces it.

## Magic Rag page

`templates/page.mg.json` + `sections/main-magic-rag.liquid`. Same
situation as Warranty: the live `/mg` page (a QR-code-reached review-
redemption form, same family as the Gift page) is entirely a NetSuite
"Online Lead Form" iframe. The section keeps using that same NetSuite form
(URL is a section setting, defaulting to the live embed) so it works
immediately with the same backend as today. Field list — in case a native
Shopify form ever replaces it — is in
`docs/policy-page-content/magic-rag-form-fields.md`.

Create the Shopify page with the handle `mg` (Online Store → Pages → Add
page, then set the URL handle to `mg` in that page's SEO section) so the
URL matches the live site exactly; assign it the `page.mg` template.

## Stubs

The remaining templates are minimal placeholders that render without
errors: `list-collections`, `page`, `cart`, `search`, `blog`, `article`,
`404`, and everything in `templates/customers/`. Real versions come later,
styled from the corresponding page audits in the migration workspace.
