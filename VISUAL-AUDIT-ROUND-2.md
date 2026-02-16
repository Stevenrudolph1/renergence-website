# Renergence Website — Visual Audit Round 2

**Date:** 2026-02-15
**Scope:** All public-facing pages across goldfish-app-vsl8y.ondigitalocean.app
**Auditor:** Claude (code-based audit of HTML/CSS source)
**Files reviewed:** 56 HTML files, styles.css (~3000 lines), sr-design-tokens.css, sr-covers.css, header.js, footer.js

---

## Executive Summary

The design system foundation is strong — tokens are well-organized, the type scale is fluid, and the thread color system is coherent. Round 1 fixes landed well. Round 2 reveals a different class of issues: accumulated inline styles undermining the design system, missed opportunities for typographic drama, inconsistent visual treatment across structurally identical pages, and accessibility gaps that slipped through.

**28 findings across 7 categories. 9 high-priority, 11 medium, 8 low.**

---

## 1. TYPOGRAPHY

### 1.1 Hardcoded px font-sizes on cover titles (HIGH)

**31+ instances** across index.html, products.html, and all 12 book pages.

Every `.cover-title` element inside the book cover components uses inline `style="font-size:12.5px"` (or 11.5px, 13.5px, 10px depending on the title length). These bypass the design token system entirely.

**Files affected:**
- `index.html` — lines 134, 166, 196 (3 covers)
- `products.html` — lines 102, 147, 179, 207, 235, 279, 310, 336, 387 (9 covers)
- All 12 `books/*.html` pages (1-4 covers each)

**Why it matters:** If the cover component ever needs to scale responsively or the design tokens change, these won't follow. They're also px-based, which doesn't respect user font-size preferences.

**Fix:** Create cover-title sizing variants in sr-covers.css: `.cover-title--sm` (11.5px → 0.72rem), `.cover-title--md` (12.5px → 0.78rem), `.cover-title--lg` (13.5px → 0.84rem), `.cover-title--xl` (14.5px → 0.91rem). Replace all inline styles with the appropriate class.

---

### 1.2 SVG text elements use unitless font-size (MEDIUM)

**how-it-works.html** has an SVG operating loop diagram where `<text>` elements use `font-size="14"` and `font-size="11"` (unitless). These don't scale with the page's font-size settings.

**Fix:** Use `font-size="0.875rem"` and `font-size="0.6875rem"`, or apply CSS classes to the SVG text elements.

---

### 1.3 No serif/display type anywhere outside covers (LOW — but feels like a miss)

The entire site runs on IBM Plex Sans. Libre Baskerville exists in the design tokens (`--font-title`) and is loaded via Google Fonts, but it only appears on:
- Book cover titles
- Recognition hooks on the homepage (`.recognition-hook`)

Sections like the signal-bridge statement, the "How It Works" operating loop labels, and the coherence statement on the frameworks page would all benefit from serif display type to create typographic hierarchy. Right now, sans-serif-on-sans-serif makes every section feel the same weight.

**Candidates for serif treatment:**
- `.signal-bridge-statement` ("People blame themselves for what the arrangement is doing to them.")
- `.coherence-statement` (frameworks page)
- Course hero `<h1>` elements on training pages
- Book page hero questions ("Has something that once worked become quietly expensive to maintain?")

---

### 1.4 Body text line-length exceeds readable range on wide screens (MEDIUM)

Several content sections set `max-width: var(--content-wide)` (800px), which at `--text-lg` (~18px) produces lines of ~90+ characters. The optimal range is 60-75 characters.

**Affected sections:**
- `.thread-header` (books pages)
- `.framework-item` (frameworks page)
- `.org-content` (practitioners page)
- `.model-content` (our-model page)

**Fix:** These prose-heavy sections should use `--content-mid` (700px) or the `--prose-max-width` (65ch) token that already exists but isn't applied to these containers.

---

## 2. QUOTABLES & RECOGNITION MOMENTS

### 2.1 No blockquote styling exists in the CSS (HIGH)

The stylesheet has zero `blockquote` rules. There's no `.callout`, `.pullquote`, or `.highlight-text` class. This means every time the content has a line that should land as a recognition moment, it's either:
- Wrapped in a `<p>` with inline styles
- Buried in a wall of body text

**Lines that should hit harder visually but don't:**
- "People blame themselves for what the arrangement is doing to them." (index.html, signal-bridge)
- "Something that once worked has become quietly expensive to maintain." (recognition hook — currently styled well, but nothing else matches this treatment)
- "The beginning told you almost nothing. Cost hid early and compounded quietly." (index.html — plain `<p>`)
- "Can this person see past the story people tell to what's actually going on?" (foundation.html — hero subtitle, styled but no standalone treatment)
- "They're good at it. They're succeeding. And it's quietly costing them everything." (alignment.html — hero subtitle)

**Fix:** Create a `.pullquote` component:
- Font: `var(--font-title)` (Libre Baskerville)
- Size: `var(--text-xl)` or `var(--text-2xl)`
- Left border: 3px solid with thread color
- Padding-left: `var(--space-site-md)`
- Color: `var(--text-primary)`
- Max-width: `var(--prose-max-width)`

This already exists partially as `.recognition-hook` on the homepage — extract and generalize it.

---

### 2.2 Training page opening statements are visually buried (HIGH)

Every training page opens with a powerful hook paragraph — but it's rendered as plain `<p style="font-size: var(--text-lg);">`. No visual distinction from the explanatory prose that follows.

**Examples:**
- structure.html: "Someone is doing the work of three people. Stays late. Holds things together. Everyone calls them dedicated."
- alignment.html: "Some people are depleted not because of bad structure or something broken. The structure is fine. They're just good at work that fights who they are."
- positioning.html: "Every practitioner has a default mode — how they show up when not thinking about it."
- foundation.html: "Someone is depleted. Overloaded. Stuck. The default explanation is always about the person."

These are the best copy on the site and they look like every other paragraph.

**Fix:** Apply the `.pullquote` treatment (from 2.1) or a `.course-hook` class that uses serif font, larger size, and a visual accent.

---

### 2.3 Book page hero questions lack visual punch (MEDIUM)

Each book detail page (books/renergence.html, books/structure.html, etc.) has a gateway section with a strong question — e.g., "Has something that once worked become quietly expensive to maintain?" These use the `.thread-question` class (italic, `var(--text-lg)`, `var(--text-secondary)` color).

The secondary color + italic makes them feel subdued when they should be the recognition-moment anchor of the page.

**Fix:** Promote to primary text color. Consider serif font. These are the most important sentences on each page.

---

## 3. CHARTS, GRAPHS & DATA VISUALIZATION

### 3.1 Operating loop diagram (how-it-works.html) — accessibility and scaling issues (MEDIUM)

The 4-stage operating loop is an inline SVG with hardcoded positions. Issues:
- Text uses unitless `font-size` attributes (see 1.2)
- No `<title>` or `<desc>` on the SVG for screen readers
- The diagram is purely visual with no text equivalent
- On mobile, the SVG scales down but text becomes illegible below ~375px viewport

**Fix:** Add `role="img"`, `<title>`, and `<desc>`. Consider a text fallback for screen readers. Address font-size scaling.

---

### 3.2 Stat block on homepage is underutilized (LOW)

The "30 Years / 300,000+ People / 4 Areas / 9 Books" stat block on the homepage is the only data visualization on the entire site. The pattern works well visually but appears nowhere else.

**Missed opportunities:**
- Training overview page: could show "5 Courses / 3 Tracks / 20-25 Hours Each"
- Products page: could show "4 Free Books / 5 Paid Books / 3 Licenses"
- About page: could show "21 Years in India / 300,000+ People / 4 Frameworks"

---

### 3.3 The stat-block container uses inline styles (MEDIUM)

The `<section>` wrapping the stat block on index.html uses `style="padding: var(--space-site-sm) 0; background-color: var(--surface-card);"` instead of a CSS class.

**Fix:** Add `.stat-section` class to styles.css.

---

## 4. INLINE STYLE ACCUMULATION (SYSTEMIC)

### 4.1 Training pages: 60+ inline style attributes (HIGH)

The five training detail pages (foundation, structure, alignment, positioning, mntest) are the worst offenders. Nearly every content section, table cell, list, and card uses inline `style="..."` attributes.

**Pattern examples (repeated across all 5 pages):**
- `<p style="font-size: var(--text-lg);">` — 5+ per page
- `<div style="margin: var(--space-site-md) 0; padding: var(--space-site-md); background: var(--surface-page); border-radius: var(--site-radius); border-left: 3px solid var(--thread-hnr);">` — enrollment detail boxes
- `<table role="table" style="width: 100%; border-collapse: collapse;">` — course materials tables
- `<td style="padding: var(--space-site-sm) var(--space-site-md); border-bottom: 1px solid var(--surface-divider-light);">` — every table cell
- `<li style="margin-bottom: var(--space-site-xs);">` — enrollment detail list items

**Why it matters:** The inline styles use tokens (good!) but bypass the stylesheet, making global changes impossible. If you want to adjust the enrollment details box, you need to edit 5 files instead of 1 CSS rule.

**Fix priority (by reusable class needed):**
1. `.course-intro-text` — for the opening hook paragraph
2. `.enrollment-details` — for the enrollment info box
3. `.course-materials-table` — already exists in foundation.html, extend to all pages
4. `.supplementary-reading` — for the "Supplementary Reading" callout
5. `.pricing-track-wrapper` — for the pricing card container

---

### 4.2 Products page: info boxes and warning boxes use inline styles (MEDIUM)

The products page has contextual info boxes (book descriptions, pricing notes, practitioner CTAs) styled entirely with inline attributes.

**Fix:** Extract into `.info-box`, `.warning-box`, `.practitioner-cta` classes.

---

### 4.3 training.html (hub page): pricing table uses 40+ inline styles (MEDIUM)

The training overview page has a course pricing table where every `<th>`, `<td>`, and `<tr>` has inline border, padding, and alignment styles.

**Fix:** The `.thread-table` CSS class already handles similar tables on the books page. Extend or adapt for the training pricing table.

---

## 5. TABLES & DATA PRESENTATION

### 5.1 Course materials tables missing `<thead>` and `<th>` (HIGH — accessibility)

All 5 training detail pages have "What's Inside" tables listing course materials. None use `<thead>` or `<th>` elements.

**Current structure:**
```html
<table role="table" style="...">
  <tbody>
    <tr><td>Course Manual</td><td>Your primary reference...</td></tr>
    ...
  </tbody>
</table>
```

**Required structure:**
```html
<table>
  <thead>
    <tr><th scope="col">Material</th><th scope="col">Description</th></tr>
  </thead>
  <tbody>
    <tr><td>Course Manual</td><td>Your primary reference...</td></tr>
  </tbody>
</table>
```

**GOV-05 impact:** Screen readers cannot identify column headers, making the table data meaningless to assistive technology users.

---

### 5.2 Training pricing table on hub page lacks proper structure (MEDIUM)

The pricing comparison table on training.html uses inline styles on every cell and has no CSS class. It should reuse the `.thread-table` pattern from styles.css.

---

### 5.3 Library organization table on how-it-works.html (LOW)

This table already has proper `.library-org-table` CSS classes and thread-colored row borders. It's the best-structured table on the site. The training tables should follow this pattern.

---

## 6. LAYOUT & SPACING CONSISTENCY

### 6.1 Training pages lack visual breathing room between sections (HIGH)

Each training detail page has 7-8 major sections stacked vertically with minimal visual differentiation. The sections are:
1. Course intro
2. How This Course Works
3. What You Learn
4. Curriculum
5. What's Inside
6. Supplementary Reading
7. Two Tracks
8. Enrollment Details

They alternate between white and slightly-off-white backgrounds (`--surface-page` vs `--surface-card`), but the contrast is so subtle it doesn't register. The result: each page feels like one long scroll of text.

**Fix options:**
- Add section-divider marks (the SVG thread marks used on the homepage between sections)
- Increase background contrast between alternating sections
- Add thread-colored top borders to major section headings
- Insert horizontal rules or decorative dividers between content groups

---

### 6.2 `<details>` accordion elements have no visual treatment (MEDIUM)

The curriculum sections use native `<details>` elements. The `<summary>` text has no special styling — it looks like a regular paragraph with a disclosure triangle.

**Fix:** Style `<summary>` elements with:
- `font-weight: var(--weight-semibold)`
- `font-size: var(--text-lg)` or `var(--text-xl)`
- `cursor: pointer`
- Thread-colored disclosure marker or left border
- Consider `role="heading" aria-level="3"` for screen reader hierarchy

---

### 6.3 Footer column spacing uneven at certain breakpoints (LOW)

The footer uses `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`. At viewport widths between 600-700px, this can produce 3 uneven columns where the last column wraps to a new row with too much whitespace.

**Fix:** Add a media query to force 2-column layout at tablet widths.

---

### 6.4 Gateway text-col centers on mobile when it shouldn't (LOW)

At 600px breakpoint, `.gateway-text-col` gets `text-align: center` (styles.css line 2289). Book descriptions and thread questions shouldn't be centered — left-alignment is more readable for multi-line text.

---

## 7. ACCESSIBILITY GAPS

### 7.1 Links without underlines (MEDIUM — GOV-05 violation)

Throughout the site, links use `text-decoration: none` with only color differentiation. Per GOV-05 and WCAG 1.4.1 (Use of Color), links must have a non-color indicator.

**Affected patterns:**
- `.recognition-link` (homepage)
- `.gateway-link`, `.gateway-depth` (books page)
- `.framework-link` (frameworks page)
- `.tool-link` (products page)
- All navigation links in training pages
- Supplementary reading links on training detail pages

Many of these add underline on `:hover` — but that doesn't help keyboard or touch users.

**Fix:** Add `text-decoration: underline` (possibly `text-underline-offset: 2px` for aesthetics) to all inline text links. Button-styled links (`.cta-primary`, `.download-option`) are exempt.

---

### 7.2 Format help tooltip lacks keyboard support (MEDIUM)

The "what's ePub?" tooltip on index.html and products.html uses `onclick="return false;"` with a hover-triggered `.format-tip` span. No keyboard activation, no `aria-expanded`, no focus management.

**Fix:** Convert to a proper tooltip pattern with `aria-describedby`, keyboard toggle, and focus management.

---

### 7.3 Products page "Ask the Navigator" button accessibility (LOW)

```html
<button type="button" class="link-button" onclick="...">ask the navigator</button>
```
Styled as a text link but is a `<button>`. If it looks like a link, use `<a>`. If it behaves like a button, ensure it has proper focus styling and `aria-label` if the action isn't obvious.

---

### 7.4 Cover alt-text: SVG covers have no text alternative (LOW)

The inline SVG book covers throughout the site use `aria-hidden="true"` on the SVG marks (correct for decorative elements), but the overall cover component itself has no `alt` text or `aria-label` describing what the cover represents.

For sighted users, the cover communicates "this is the Renergence book." For screen reader users, they get only the text content within the cover divs, which may be fragmentary.

**Fix:** Add `role="img" aria-label="Renergence book cover"` to the outer `.cover` div.

---

## PRIORITY MATRIX

### Do First (High ROI, Low Effort)
| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 2.1 | Create `.pullquote` CSS component | 15 min | Every page with a recognition moment improves |
| 2.2 | Apply pullquote to training page openers | 30 min | 5 pages get instant visual upgrade |
| 5.1 | Add `<thead>`/`<th>` to course materials tables | 30 min | Accessibility compliance for 5 tables |
| 7.1 | Add underlines to inline text links | 15 min | GOV-05 compliance sitewide |

### Do Second (Medium Effort, High Impact)
| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 1.1 | Replace hardcoded px cover-title sizes with classes | 1 hr | 31+ elements, future-proofs cover system |
| 4.1 | Extract training page inline styles to CSS classes | 2 hr | 60+ inline styles → 5 reusable classes |
| 6.1 | Add visual section breaks to training pages | 1 hr | Major readability improvement |
| 6.2 | Style `<details>` accordion summaries | 30 min | Curriculum sections get visual treatment |
| 1.3 | Apply serif type to key statements | 30 min | Typographic hierarchy deepens |

### Do Third (Lower Priority or Larger Scope)
| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 1.4 | Tighten max-width on prose sections | 30 min | Better line length |
| 3.1 | Fix SVG diagram accessibility | 45 min | Screen reader support for diagram |
| 3.2 | Add stat blocks to other pages | 1 hr | Visual pattern reuse |
| 4.2-4.3 | Extract remaining inline styles | 1.5 hr | Maintenance improvement |
| 7.2 | Fix tooltip keyboard support | 45 min | Accessibility compliance |

---

## Appendix: Files Audited

**Core pages:** index.html, how-it-works.html, products.html, frameworks.html, about.html, pricing.html, contact.html, our-model.html, practitioners.html

**Book pages (12):** renergence.html, structure.html, heroes-not-required.html, multiple-natures-book.html, engagement-map-book.html, alignment.html, positioning.html, mn-educators.html, mn-counselors.html, mn-practitioners.html, when-we-stop-seeing-people.html, on-witnessing.html

**Training pages (6):** training.html, foundation.html, structure.html, alignment.html, positioning.html, mntest.html

**CSS:** styles.css, sr-design-tokens.css, sr-covers.css

**JS:** header.js, footer.js

---

*End of Round 2 audit.*
