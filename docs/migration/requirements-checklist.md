# Current BIK20404 requirement checklist

Source: [supplied assignment PDF](../project-proposal/sources/assignment-brief.pdf), pages 1-2 and the website assessment rubric. Updated 3 November 2026.

The chosen stack is **Node.js + Express + EJS + Supabase PostgreSQL + Three.js**. The PDF allows optional frameworks and requires a relational database with at least three related tables. It does not mandate MySQL.

| No. | PDF requirement | Current implementation/evidence | Remaining verification |
| --- | --- | --- | --- |
| 1 | 7-14 purposeful pages | Fourteen content page purposes, linked through the common navigation and related page links | Review the full user journey in a browser. Product/editor variants and filters do not add separate purposes |
| 2 | HTML, CSS and JavaScript frontend with consistent design | EJS-generated HTML, retained local CSS/artwork/fonts, browser JS and Three.js | Visual review on desktop and phone |
| 3 | Backend processing, authentication and server-side logic | Express registration/login, PostgreSQL sessions, listing ownership and order rules | Test the configured live Supabase connection |
| 4 | Frameworks optional | Express and EJS replace the active Next.js/React runtime | Explain the selection in the report |
| 5 | Clear and consistent navigation | Common EJS shell, sidebar links, breadcrumbs, forms and meaningful routes | Keyboard and small-screen review |
| 6 | Readability/accessibility | Larger form/text styles, labels, focus outlines, alt text, native dialog and reduced motion | Contrast and screen-reader/browser review |
| 7 | At least five relevant images and accessible multimedia | Eight sample product photos, original SVG artwork, Three.js scene and animated guide with readable text/pause control | Confirm final image sources/alt text and animation controls in a browser |
| 8 | At least three related database tables | Eleven related PostgreSQL tables, constraints, foreign keys and schema-qualified queries | Create and demonstrate the schema on the intended Supabase project |
| 9 | Create, Read, Update and Delete | Persisted product CRUD and administrator category CRUD | Demonstrate a seller creating/editing/removing a listing. Historical ordered items are archived |
| 10 | Responsive design | Existing responsive CSS plus refinements for new catalogue, forms, checkout and administration | Phone/tablet/desktop visual checks remain outstanding |
| 11 | Basic security with validation/sanitisation | Password hashes, CSRF, ownership/role checks, escaped HTML, parameterised SQL, upload limits and security headers | Production integrations need the additional controls listed in the architecture |

## Automated evidence

`npm run check` verifies JavaScript syntax, EJS compilation, the page-purpose count and PWA assets. The **16 automated tests** cover the core domain and HTTP/database flows, including invalid writes, stock cancellation replay and sessions after an Express restart. They use isolated PGlite PostgreSQL, not the user's Supabase project.

Live Supabase validation and browser visual review are still pending. The local browser tool was disabled in the session's Work settings, and no database connection string was supplied. Do not claim those checks have passed in a report or presentation.

## Scope and final submission

The implemented checkout uses campus pickup and payment on pickup. Online payment is a proposed extension, described with gateway/webhook/refund requirements in [the complete architecture](../architecture/system-architecture.md). The PDF does not explicitly require an online payment gateway.

This code migration does not complete the final report. The PDF still requires the cover/member details, abstract, five report chapters, interface/database/web-tree designs, implementation explanation, user manual/discussion and at least ten academic references from 2021-2026 using Mendeley and UTHM format. Apply the stated Times New Roman 11, 1.15 spacing and justified alignment to the final report document.

The preliminary lab request remains three slides in under ten minutes. The PDF's final presentation is a separate 15-20 minute session with every group member prepared to answer questions.
