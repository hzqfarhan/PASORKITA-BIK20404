<p align="center">
  <img src="public/assets/uthm-logo.png" alt="Universiti Tun Hussein Onn Malaysia (UTHM) Logo" width="380" />
</p>

<h1 align="center">PASOR KITA — Campus Marketplace</h1>

<p align="center">
  <strong>BIK20404 Web Development &bull; Semester 1, 2026/2027</strong><br>
  Faculty of Computer Science and Information Technology (FSKTM)<br>
  Universiti Tun Hussein Onn Malaysia (UTHM)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Course-BIK20404%20Web%20Development-0056b3.svg" alt="Course" />
  <img src="https://img.shields.io/badge/Express-v5-lightgrey.svg?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL%20%2F%20PostgreSQL-Database-blue.svg?logo=mysql" alt="Database" />
  <img src="https://img.shields.io/badge/PWA-Ready%20%26%20Offline-success.svg" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Project%20Idea-B%3A%20E--Commerce-orange.svg" alt="Project Idea B" />
</p>

---

## 👥 Project Team Details

| No. | Student Name | Matric No. | Author Profile |
| :-: | :--- | :-: | :--- |
| 1 | [ARINAH HUSNA BINTI MOHD NOOR](https://author.uthm.edu.my/student/#) | `AI250059` | [author.uthm.edu.my/student/#](https://author.uthm.edu.my/student/#) |
| 2 | [NUR AISYA SOFEA BINTI SHAHRUL AMER](https://author.uthm.edu.my/student/#) | `AI250114` | [author.uthm.edu.my/student/#](https://author.uthm.edu.my/student/#) |
| 3 | [NUR QURRATUL AIN BINTI NORHASRIZAL](https://author.uthm.edu.my/student/#) | `AI250186` | [author.uthm.edu.my/student/#](https://author.uthm.edu.my/student/#) |
| 4 | [AISYAH HUSNA BINTI AL-HILMI](https://author.uthm.edu.my/student/#) | `AI250164` | [author.uthm.edu.my/student/#](https://author.uthm.edu.my/student/#) |
| 5 | [MUHAMMAD HAZIQ FARHAN BIN NORDIN](https://author.uthm.edu.my/student/#) | `AI250128` | [author.uthm.edu.my/student/#](https://author.uthm.edu.my/student/#) |

---

## 📌 Executive Summary

**PASOR KITA** is a specialized campus e-commerce Progressive Web Application (PWA) designed exclusively for the **Universiti Tun Hussein Onn Malaysia (UTHM)** community. Built in accordance with **Project Idea B (E-commerce Marketplace)** for course **BIK20404**, it streamlines trading across campus by bringing fragmented social media sales into one centralized, secure, and user-friendly digital marketplace.

From everyday student essentials, preloved textbooks, study equipment, food and beverages, to campus services and dorm rentals, Pasor Kita offers tailored discovery, reliable seller verification, mutual review systems, and offline-capable PWA installation.

---

## 🌟 Core Features & Modules

### 1. 🎓 Campus Identity & Role-Based Access
* **Strict University Domain Validation**: Designed for `@student.uthm.edu.my` (students) and `@uthm.edu.my` (staff and lecturers).
* **Unified Account Management**: Individuals maintain their personal identity while having the ability to register and manage multiple campus business ventures under a single login.
* **Persistent Posting Identity**: Listings clearly distinguish between personal student sales and commercial student-run businesses.

### 2. 🛡️ Trust & Verification Badges
* **Independent Verification Levels**:
  * **Verified SSM**: For campus businesses registered with the Companies Commission of Malaysia (Suruhanjaya Syarikat Malaysia).
  * **Verified PTU**: For student entrepreneurs officially endorsed by UTHM's Pusat Transformasi Universiti (PTU) / Entrepreneurship Centre.
* Badges are granted only via administrative validation and cannot be self-assigned.

### 3. 🛍️ Campus E-Commerce & Item Discovery
* **Categories**: Food & Beverages, Books & Academic Supplies, Tech & Electronics, Preloved Fashion, and Campus Services.
* **Fulfillment**: Geared towards campus meetup, college pickup (Kolej Kediaman), and direct campus delivery.
* **Smart Filtering & Search**: Filter by price, category, campus zones, and verified merchant status.

### 4. ⭐ Mutual Reputation & Rating System
* Separate reputation scores for personal profiles, business entities, and individual items.
* Reciprocal review mechanism: buyers can review sellers and products, while sellers can review buyer interactions.
* Anti-fraud guardrails: blocks self-reviews and duplicate submissions.

### 5. 📱 Progressive Web Application (PWA) & Offline Shell
* Service Worker caching allows offline reopening of the marketplace shell.
* Web App Manifest with responsive 192px/512px application icons and maskable assets.
* Desktop and mobile install prompts without requiring third-party app stores.
* Branded error, offline, and loading screens without relying on external CDNs or generic emojis.

---

## 📂 Project Architecture

```
pasorkita_bik20404/
├── app/                              # Next.js App Router
│   ├── layout.jsx                    # Root layout with metadata & fonts
│   ├── page.jsx                      # Marketplace view & client hydration mount
│   ├── loading.jsx                   # Branded loading boundary
│   ├── error.jsx                     # Branded error boundary
│   ├── not-found.jsx                 # Custom 404 handler
│   ├── loading-preview/              # Isolated preview for loading states
│   └── error-preview/                # Isolated preview for error screens
├── components/                       # React components & UI controls
│   ├── BrandedLoader.jsx             # SVG animated brand loader
│   ├── BrandedError.jsx              # Vector art error illustrations
│   ├── InitialLoading.jsx            # Splash loading state
│   └── PwaControls.jsx               # PWA installation & status pills
├── dist/                             # Core marketplace interaction module & assets
│   ├── app.js                        # Client-side state, catalog, filters & storage
│   ├── index.html                    # Semantic HTML5 marketplace preview shell
│   ├── styles.css                    # Design system tokens & primary stylesheets
│   ├── accounts.css                  # Profile & multi-business identity styles
│   ├── reviews.css                   # Rating & mutual review modal styles
│   └── assets/                       # SVG icons, fonts, photography & UTHM logo
├── docs/                             # Course documentation & proposal materials
│   ├── README.md                     # Documentation index
│   └── project-proposal/             # Proposal deliverables
│       ├── README.md                 # Proposal overview & hand-in guide
│       ├── presentation-notes.md     # Slide speech scripts & Q&A guide
│       ├── requirements-alignment.md # 11 course website requirements matrix
│       ├── system-architecture.md    # Express/MySQL target architecture & schema
│       └── slides/                   # PowerPoint presentation (.pptx)
├── public/                           # Static assets served by Next.js
│   ├── assets/                       # Vectors, fonts, UTHM official logo
│   ├── icons/                        # PWA application icons (192, 512, maskable)
│   ├── manifest.webmanifest          # PWA metadata configuration
│   ├── sw.js                         # Custom service worker
│   └── offline.html                  # Branded offline fallback screen
├── scripts/                          # Build & verification automation
│   ├── check-pwa.mjs                 # Automated PWA manifest & asset validation
│   ├── launch-local.mjs              # Local development launcher
│   └── prepare-next.mjs              # Asset synchronization & SSR prepper
├── dev.mjs                           # Interactive development orchestrator
├── next.config.mjs                   # Next.js configuration
├── package.json                      # Dependencies & npm scripts
├── Open PASOR.cmd                    # One-click Windows launch script
└── README.md                         # Repository documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.9.0` or higher
* **npm**: `v10.0.0` or higher

### Quick Launch (Windows)
Double-click `Open PASOR.cmd` in the project root to automatically build and open the local production preview at:
```
http://127.0.0.1:4173
```

### Manual CLI Commands

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *Runs Next.js dev server on port `4173`. Service worker caching is intentionally disabled in dev mode to ensure instantaneous UI updates.*

3. **Production Build & Preview**:
   ```bash
   npm run build
   npm run start
   ```
   *Compiles the application and runs the production server with full PWA service worker caching enabled.*

4. **Run Quality & PWA Verification**:
   ```bash
   npm run check
   ```
   *Validates JavaScript syntax, PWA manifest integrity, and service worker asset availability.*

---

## 📑 Course Documentation & Proposal Links

All course proposal files for **BIK20404 Web Development** are maintained under [`docs/project-proposal/`](docs/project-proposal/README.md):

* 📊 **[PowerPoint Presentation Slides](docs/project-proposal/slides/pasor-kita-project-proposal.pptx)**: Project proposal presentation deck covering Project Title, Background, List of Modules, and System Architecture Appendix.
* 🎙️ **[Presentation Content & Speaker Notes](docs/project-proposal/presentation-notes.md)**: Rehearsal script, allocated time breakdown, and anticipated lecturer Q&A.
* 📋 **[Assignment Requirements Alignment Matrix](docs/project-proposal/requirements-alignment.md)**: Comprehensive mapping of all 11 project requirements and 13 proposed application pages.
* 🏗️ **[Target System Architecture & Schema](docs/project-proposal/system-architecture.md)**: Backend roadmap, relational database schema (MySQL/Express), and migration plan.

---

## 📜 Academic Integrity & Notice

This project is developed as an academic coursework submission for **BIK20404 Web Development** at **Universiti Tun Hussein Onn Malaysia (UTHM)**. All simulated data, sample business listings, and demo badges are for illustrative and testing purposes.
