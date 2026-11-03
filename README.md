# PASOR HUSSEIN — the UTHM marketplace

A responsive local marketplace built with **Next.js 16.4.3 App Router and React 19.3.1**, with PWA installation and offline support. Double-click `Open PASOR.cmd` to build when needed and launch the production preview in your browser at `http://127.0.0.1:4173`. Node.js and dependencies are available on this computer.

The preview includes food and drinks, preloved, services, rentals and other finds; campus/search/price filters; saved listings; seller details; browser-local listing creation and demo conversations; multiple linked businesses; independent SSM and PTU badges; 3D campus cards; a dimensional low-poly background; original SVG category icons; animated validation feedback; separate user and item ratings; mutual buyer/seller reviews; and an illustrative top-selling chart. Branded loading, progress and error screens use original SVG/CSS artwork without emoji.

## Run and install

- `npm run dev`: development server; service worker caching is intentionally disabled to keep edits current.
- `npm run build` followed by `npm run start`: production preview with PWA support.
- `npm run check`: syntax and PWA manifest/icon/offline-resource checks.
- `node scripts/check-pwa.mjs http://127.0.0.1:4173`: optional checks against a running production preview.

The production preview uses a web app manifest, 192/512 pixel PNG icons, a scoped service worker, a browser installation control and offline status. After an initial online visit and offline preparation, the marketplace shell and local assets can be reopened offline. Installation depends on browser support. Localhost is allowed; a future hosted deployment requires HTTPS. No push-notification permissions are requested. Development mode unregisters this app's worker to avoid stale previews.

Loading and error designs can be reviewed at `/loading-preview` and `/error-preview`. Unknown paths show the branded 404 page. The real route loading and error boundaries use the same design system.

## Account and posting flow

- Students use an exact `@student.uthm.edu.my` email; staff and lecturers use an exact `@uthm.edu.my` email. Campus identity belongs to the person.
- A person can link multiple business profiles under their university account. Businesses do not have separate university logins.
- The posting identity selector offers the personal profile and that account's linked businesses. Each listing retains the identity chosen when it was created, even if the active posting identity changes later.
- `Verified SSM` and `Verified PTU` are separate badge types. A business can hold either or both after independent review. Neither badge is implied by university membership.
- New registration references entered in this preview create pending review requests. They never grant a verified badge or approved perks automatically. Sample listings demonstrate the visual treatment of each badge.

## Reputation and campus charts

Personal and business profile reputation is separate from each listing's item rating. Buyers can review the seller and item independently; sellers can review buyers. The preview creates explicitly simulated completed exchanges before enabling role-appropriate reviews, blocks self-reviews and duplicate targets, and preserves which account and business were involved. Counterpart accounts can leave their own reciprocal feedback; no reciprocal review is fabricated. Demo reviews are stored on this device. Real purchase eligibility, review moderation and durable ratings must be enforced on the server before launch.

The top-selling chart shows illustrative week/month counts plus completed local demo exchanges. It does not represent live orders or real sales. Review counts do not determine sales ranking.

## Preview boundaries

Initial inventory, sellers, ratings, sales counts and verified business badges are illustrative samples. Saved finds, preview account details, linked businesses, custom card colour, created listings, conversations, demo exchanges and reviews persist only in the current browser. Messages are not delivered, registration requests are not submitted and listings/reviews are not published to other devices or users. No payments or real marketplace transactions occur.

The email eligibility form recognizes exact campus domains case insensitively. Entering the account preview simulates a personal account for testing; it does not authenticate, send emails, create a real account or confer verification. This browser-local simulation is not a security boundary. The user requested the preview before connecting university sign-in and requested that it remain local.

## Production connection

Before launch, connect an approved university identity provider or verified email service, enforce verified campus membership and account authorization on the server, and add durable shared storage for listings/profiles/messages and image uploads. Authorize a personal profile through the university identity and each business profile through an ownership or management relationship. Validate every posting identity on the server. Add independent administrative SSM and PTU registration reviews and approved badge records; users must not be able to self-assign either badge. Connect communications, reporting/moderation and listing ownership server-side before allowing real trades.

`app/` contains the Next.js routes, metadata, loading/error boundaries and root layout. `components/` contains React PWA and loading controls. The focused migration preserves the tested marketplace interaction module in `dist/app.js` and trusted page shell in `dist/index.html`; `scripts/prepare-next.mjs` copies assets to `public/` and prepares the server-rendered markup before dev/build. This is a Next.js application, with the existing marketplace module mounted after React hydration rather than an iframe. `dist/assets/sources.json` records product photo sources. Typography and original low-poly SVG artwork are served locally. No passwords, authentication tokens or external credentials are used or stored by the preview. It remains local-only; nothing has been published.
