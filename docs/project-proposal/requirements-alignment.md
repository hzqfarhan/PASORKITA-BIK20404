# Assignment alignment

Source: supplied `sources/assignment-brief.pdf`, particularly pages 1-2 and the website rubric on page 5. The lecturer's quoted message sets the preliminary lab presentation format. It does not replace the PDF's final submission requirements.

## Decision

Pasor Kita fits **Idea B: a website for promoting/buying products (E-commerce)**. Keep product discovery, listing management and a complete pickup order workflow central to the proposal.

## Website requirements

| PDF requirement | Proposed response | Evidence to prepare |
| --- | --- | --- |
| 1. 7-14 distinct pages through navigation/hyperlinks | 13 purposeful pages, listed below | Navigation map and working page links |
| 2. HTML, CSS and JavaScript frontend with consistent appearance | Reuse the existing visual identity, styles and interaction patterns in EJS-rendered HTML | Consistent navigation, spacing, colours and typography |
| 3. Backend for processing, authentication and server logic | Node.js with Express for login, listing ownership, stock and order rules | Real server routes and permission checks |
| 4. Frameworks optional | Express is a proposed choice. The brief does not require removing Next.js | Explain the choice in the technical chapter |
| 5. Clear, consistent navigation | Common header/menu, active state, breadcrumbs where useful, and role-appropriate links | Complete buyer and seller journeys |
| 6. Readability and accessibility | Readable type, high contrast, labels, alt text, keyboard access and visible focus | Keyboard review and mobile/desktop inspection |
| 7. At least five relevant images plus accessible multimedia | At least five product images with meaningful alt text, plus a short captioned guide video or reduced-motion-compatible animation | Images on actual pages and an accessible multimedia example |
| 8. Database with at least three related tables | Seven proposed domain tables with foreign keys | ER diagram, schema and queries joining related records |
| 9. Create, Read, Update and Delete | Product listing CRUD, category CRUD for administrators and saved-item management | Show all four product operations using persisted data |
| 10. Responsive design | Adapt navigation, listings, forms and tables for phones, tablets and desktop | Check the actual user flows on several viewport sizes |
| 11. Basic security, input validation and sanitisation | Password hashes, secure sessions, role/ownership checks, parameterised SQL, output escaping and validated uploads | Rejected invalid requests and blocked unauthorised edits |

Accessible multimedia is a separate content consideration from simply counting five images. Existing animations may contribute, but a short captioned walkthrough makes the evidence clearer.

## Proposed page map: 13 pages

Each row is a distinct page purpose. Repeated product IDs and the new/edit variants of one editor do not inflate the count. Modal dialogs and error/loading previews should not be used to reach the minimum.

| No. | Page | Proposed route | Purpose |
| --- | --- | --- | --- |
| 1 | Home | `/` | Introduce Pasor Kita, categories and featured products |
| 2 | Marketplace | `/products` | Browse, search, sort and filter products |
| 3 | Product details | `/products/:id` | View images, price, seller, pickup details and reviews |
| 4 | Registration | `/register` | Create a local project account |
| 5 | Login | `/login` | Authenticate and establish a server session |
| 6 | My profile | `/account` | View and update personal and seller information |
| 7 | Seller dashboard | `/seller` | View owned listings and incoming orders |
| 8 | Product editor | `/seller/products/new`, `/seller/products/:id/edit` | Create or update a listing through the same editor page type |
| 9 | Saved products | `/saved` | Manage a persistent shortlist |
| 10 | Checkout | `/checkout/:productId` | Submit a single-product order with quantity and pickup details |
| 11 | My orders | `/orders` | Track buyer orders and view completion history |
| 12 | Admin dashboard | `/admin` | Manage categories and moderate listings/reviews |
| 13 | About and help | `/help` | Explain the marketplace, pickup process and multimedia guide |

Reviews appear on the product page. Sellers manage order status through the seller dashboard. This avoids extra pages beyond the 14-page maximum. Individual new/edit product URLs share one purposeful editor template.

## Current prototype and implementation gaps

Assessment is based on the inspected README, package configuration, route files and marketplace implementation. It is not a claim that a full runtime audit has occurred.

| Current state | Required next step |
| --- | --- |
| Next.js application wrapping a substantial HTML/CSS/JavaScript marketplace | Reuse the UI in an Express/EJS application if the group adopts the proposed stack |
| Many interactions use buttons and dialogs within one main marketplace page | Build the distinct navigable page purposes above |
| Demo account entry and university-domain eligibility checks | Add real registration, password hashing, login/logout and server sessions |
| Browser-local profiles, saved items and listings | Persist shared records in MySQL |
| Simulated completed exchanges and illustrative sales counts | Implement real order state and derive any displayed counts from actual records |
| Local-only conversations | Keep messaging as an extension until durable delivery and permissions are implemented |
| Sample SSM/PTU badges and pending registration references | Treat these as illustrative. Add real administrator-reviewed evidence before enabling genuine verification |
| Existing responsive styling, product images, PWA and visual artwork | Reuse useful assets, then verify accessibility and the final multi-page layout |

The prototype is a useful UI starting point. It does not yet satisfy real backend authentication, shared database integration or complete server-enforced CRUD merely by running in Next.js.

## Suggested implementation order

1. Agree the name, scope and 13-page map. Preserve a copy of the current prototype before migration.
2. Build Express routes, shared EJS layouts and navigation while retaining useful CSS/assets.
3. Create the MySQL schema and seed representative categories/products.
4. Implement registration, sessions and access control.
5. Implement and demonstrate persistent product CRUD with ownership checks.
6. Implement one-product checkout, stock handling and pickup order statuses.
7. Add saved products, completed-order reviews and administration.
8. Check responsiveness, accessibility, five images, multimedia and error states.
9. Prepare ER/web-tree diagrams, implementation explanations and final demonstration evidence.

Keep optional business verification, live messages, online payment, services/rentals and advanced visual features behind the core work in priority. Divide the modules across up to five members while ensuring equal contributions and shared understanding of the complete system.

## Final report and assessment requirements

- The project contributes **20%** of the course evaluation: report **5 marks**, website development **8 marks**, presentation **7 marks**.
- Group size: **up to five members**, with equal contribution.
- Report deadline in the PDF: **3 January 2027, Week 15**.
- Final presentation window in the PDF: **29 December 2026 to 1 January 2027, Week 15**.
- Final presentation length: **15-20 minutes**, with every member attending and prepared to answer questions.
- The separate preliminary lab presentation in the lecturer's message: **three slides, less than 10 minutes**.

Report contents:

1. Cover: all group members, matriculation numbers and section.
2. Abstract: objectives, methodology, findings and conclusions, written to reflect the completed work.
3. Chapter 1: introduction, objectives, scope and significance.
4. Chapter 2: user/system requirements, hardware/software, languages and database, with citations.
5. Chapter 3: database design, interfaces and web-tree diagram.
6. Chapter 4: implementation, with selected code and explanations.
7. Chapter 5: results, user manual/system flow and discussion.
8. References using **Mendeley** and the **UTHM reference format**.

Formatting: **Times New Roman, size 11, 1.15 line spacing and justified alignment**. The PDF requires **at least 10 references**, using research papers, journals and books from **2021-2026**. Official framework documentation is useful supplementary material, but should not be assumed to replace these ten academic sources.

The rubric rewards working localhost deployment, real database integration, interface/navigation quality, secure CRUD and responsive design. A polished interface alone cannot demonstrate the backend and database criteria.
