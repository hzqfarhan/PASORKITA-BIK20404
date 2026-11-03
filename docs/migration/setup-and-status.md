# Pasor Kita: migration and Supabase setup

Updated 3 November 2026. The selected stack is **Node.js + Express + EJS + Supabase PostgreSQL + Three.js**.

## Implementation status

The active application no longer uses Next.js or React. Its previous source is preserved in [the prototype archive](../archive/nextjs-prototype/README.md). The running site uses `server/`, `views/` and `public/`.

| Area | Implemented in this migration |
| --- | --- |
| Rendering and navigation | Express routes, 22 EJS templates and 14 distinct page purposes |
| Design | Retained burgundy/cream palette, original SVG artwork, category illustrations, local fonts, floating atmosphere and flip/tilt campus cards |
| Three.js | Local Three.js modules and an interactive low-poly hero scene, with reduced-motion handling and the existing SVG fallback |
| Accounts | University-domain registration, bcrypt password hashes, login/logout, persistent PostgreSQL sessions and editable profiles |
| Product management | Server-backed create/read/update/delete, listing ownership checks and restricted image uploads |
| Discovery | Search, category/campus/price filters, sorting, catalogue pagination and saved products |
| Ordering | One product per order, server-calculated totals, transactional stock reservation and seller-controlled pickup statuses |
| Cancellation | Permitted cancellations restore stock once. Repeating cancellation cannot restore it twice |
| Reputation | Separate item, seller and buyer reviews following completed orders, with duplicate/self-review checks |
| Messages | Persistent buyer/seller messages, with participant checks. Refresh to see new messages |
| Businesses | Multiple linked businesses per account, ownership checks and independent SSM/PTU review requests |
| Administration | Category CRUD, listing/review moderation and registration-reference decisions |
| Accessibility/content | Form labels, keyboard focus, relevant images, responsive styles and a readable animated guide with a pause control |
| PWA | Manifest, install prompt when supported and an offline page. Personalised HTML and writes are not cached |
| Database | Eleven related PostgreSQL tables in a separate `pasor_kita` schema |

The Supabase project has **not** been connected in this workspace because `DATABASE_URL` has not been supplied. The application deliberately shows a setup message instead of silently substituting browser-local data. The automated checks use a separate PGlite PostgreSQL engine and disposable records.

## Connect Supabase

1. Use the intended Supabase project. Open **Connect** and copy its PostgreSQL connection string. For this persistent Express server, the session pooler is a practical option where a direct connection is unsuitable. Supabase documents both direct and pooled connection choices in [Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres).
2. Copy the root `.env.example` to a new root `.env`. Put your actual connection string in `DATABASE_URL`. This is a database password connection, not the project URL or a publishable/anon API key.
3. URL-encode special characters in the password portion of the connection string. Keep the file local. The repository ignores `.env` files.
4. Set a random `SESSION_SECRET` of at least 32 characters. Development can generate a local secret if omitted. Production requires an explicit non-placeholder secret.
5. If you want the sample catalogue and a demonstration administrator, choose a strong `SEED_PASSWORD` and set `SEED_ADMIN_EMAIL`. Seed only a dedicated development/demo database.

```dotenv
HOST=127.0.0.1
PORT=4173
NODE_ENV=development
TRUST_PROXY=0
DATABASE_URL=postgresql://postgres.PROJECT_REF:ENCODED_PASSWORD@YOUR_SESSION_POOLER_HOST:5432/postgres
SESSION_SECRET=YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
SEED_PASSWORD=YOUR_DEVELOPMENT_DEMO_PASSWORD
SEED_ADMIN_EMAIL=admin@uthm.edu.my
```

Then run from the project root:

```powershell
npm install
npm run db:setup
npm start
```

Open **http://127.0.0.1:4173**. `npm run dev` enables server watching. `Open PASOR.cmd` also starts the Express application after dependencies and database setup are ready.

The setup command creates only this application's `pasor_kita` schema and its tables. It does not replace the Supabase `auth`, `storage` or `public` schemas. Schema creation uses a single checked-out PostgreSQL connection for its transaction. Existing application rows are retained. The seed command skips existing seed accounts/listings and does not reset their passwords or elevate an existing ordinary account.

For a seeded demo, the administrator uses `SEED_ADMIN_EMAIL` and the chosen `SEED_PASSWORD`. Sample seller accounts use `sample.nasi@student.uthm.edu.my`, `sample.headphones@student.uthm.edu.my`, and the equivalent sample product names. Sample listings are visibly labelled. Sample business badges are not automatically approved, and no sales/reviews are fabricated.

## TLS and database access

- Hosted database connections use TLS with certificate verification. If your connection needs the project's CA certificate, save it outside public assets and set `DATABASE_CA_CERT` to its local path.
- The application does not turn off certificate verification to work around connection errors.
- All queries use schema-qualified tables and parameterised values.
- Keep `pasor_kita` outside Supabase's exposed Data API schemas. Browser clients do not receive the database connection string.
- Use an owner/migration connection for setup. For a public deployment, provision a separate runtime database role with only the necessary privileges on this schema, its tables and identity sequences.
- `email_verified` starts false. Domain matching is eligibility validation, not proof of email ownership or university membership.

## Validation commands

```powershell
npm run check
npm test
```

`npm run check` checks runtime JavaScript syntax, compiles EJS templates, counts the page purposes and verifies PWA assets. `npm test` uses a disposable PostgreSQL engine and local Express HTTP requests. It does not connect to, seed or modify your Supabase database.

Automated checks cover authentication, ownership, CSRF, escaped content, product CRUD, upload rejection, business ownership, saved finds, price calculations, stock changes, cancellation replay, review eligibility, messages, category administration, filters and sessions surviving an Express restart. These checks do not verify live Supabase networking or browser rendering.

Browser preview was unavailable because local browser use was disabled in the session's Work settings. Review the home page, forms, phone layouts and Three.js rendering in your own browser before the final presentation.

## Coursework page count

| No. | Page purpose | Route |
| --- | --- | --- |
| 1 | Home/discovery | `/` |
| 2 | Marketplace and its filtered views | `/products` |
| 3 | Product details | `/products/:id` |
| 4 | Registration | `/register` |
| 5 | Login | `/login` |
| 6 | Account, campus card and businesses | `/account` |
| 7 | Seller studio | `/seller` |
| 8 | Product editor, new/edit variants | `/seller/products/new`, `/seller/products/:id/edit` |
| 9 | Saved products | `/saved` |
| 10 | Checkout | `/checkout/:productId` |
| 11 | Buyer orders and reviews | `/orders` |
| 12 | Administration | `/admin` |
| 13 | About/help and animated guide | `/help` |
| 14 | Messages | `/messages` |

Filtered views, product IDs, editor variants, dialogs, error pages and external gateway screens do not add separate content page purposes to this map. The result stays within the assignment's 7-14 pages.

## Remaining external services

Current payment is **payment on pickup**. Online payment, connected seller payouts, production email verification/recovery, cloud image storage, scheduled notification jobs and public hosting are proposed extensions in [the full architecture](../architecture/system-architecture.md). Their API keys, subscriptions and integrations have not been created by this migration.

Uploads currently use a local `uploads/` directory, suitable for the localhost demonstration. Move them to durable object storage before using a host with an ephemeral filesystem. Services/rentals use the catalogue and messaging facilities. Automatic booking calendars, deposits, return tracking and timed rental pricing require additional domain rules.
