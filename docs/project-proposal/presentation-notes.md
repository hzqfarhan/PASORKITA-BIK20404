> Historical proposal note: the original deck/script below describes the earlier MySQL plan. The current selected stack is Express + EJS + Supabase PostgreSQL + Three.js. See [the full current architecture](../architecture/system-architecture.md) and [migration status](../migration/setup-and-status.md).

# Pasor Kita: presentation content and speaker notes

## Fit with Project Idea B

**Yes. Pasor Kita fits Idea B: a website for promoting/buying products (E-commerce).** Its central activity is product discovery and buying from campus sellers. Keep that transaction flow clear when presenting, rather than describing the project primarily as a social network or business directory.

Proposed full title: **Pasor Kita: A Campus E-commerce Marketplace for the UTHM Community**.

The existing preview uses PASOR/PASOR HUSSEIN branding. This proposal uses the user's requested name, Pasor Kita. Updating application branding is a later implementation task.

## Presentation format and timing

The lecturer's preliminary lab instruction is three slides: Title, Background and List of Modules, with a limit of less than 10 minutes. The architecture is an extra slide requested by the user, so retain it as an optional appendix. The PDF's 15-20 minute instruction concerns the final project presentation.

| Slide | Topic | Suggested time |
| --- | --- | --- |
| 1 | Title | 45 seconds |
| 2 | Background | 2 minutes |
| 3 | List of modules | 3 minutes |
| 4 | System architecture, if permitted | 1 minute 30 seconds |
| Total | All four slides | 7 minutes 15 seconds |

These are rehearsal allocations, not a guarantee of speech length. The short scripts below leave room to explain examples and answer a brief question. Rehearse once as a group and keep the actual presentation below 10 minutes.

## Slide 1: Project title

**On the slide**

PASOR KITA

A Campus E-commerce Marketplace for the UTHM Community

Project Idea B: E-commerce

BIK20404 Web Development

Semester 1, 2026/2027

**Team Members**

| No. | Student Name | Matric No. | Author Profile |
| :-: | :--- | :-: | :--- |
| 1 | [ARINAH HUSNA BINTI MOHD NOOR](https://author.uthm.edu.my/student/#) | `AI250059` | [author.uthm.edu.my](https://author.uthm.edu.my/student/#) |
| 2 | [NUR AISYA SOFEA BINTI SHAHRUL AMER](https://author.uthm.edu.my/student/#) | `AI250114` | [author.uthm.edu.my](https://author.uthm.edu.my/student/#) |
| 3 | [NUR QURRATUL AIN BINTI NORHASRIZAL](https://author.uthm.edu.my/student/#) | `AI250186` | [author.uthm.edu.my](https://author.uthm.edu.my/student/#) |
| 4 | [AISYAH HUSNA BINTI AL-HILMI](https://author.uthm.edu.my/student/#) | `AI250164` | [author.uthm.edu.my](https://author.uthm.edu.my/student/#) |
| 5 | [MUHAMMAD HAZIQ FARHAN BIN NORDIN](https://author.uthm.edu.my/student/#) | `AI250128` | [author.uthm.edu.my](https://author.uthm.edu.my/student/#) |

**Suggested speech**

Assalamualaikum and good afternoon to our lecturer and fellow classmates. Our proposed project is Pasor Kita, a campus e-commerce marketplace for the UTHM community, presented by Arinah Husna, Nur Aisya Sofea, Nur Qurratul Ain, Aisyah Husna, and Muhammad Haziq Farhan. It falls under Project Idea B because it allows campus sellers to promote products and users to place orders. We plan to focus on everyday products such as food, books and preloved items, with campus pickup as the main fulfilment method.

## Slide 2: Background

**On the slide**

### Problem to address

Product posts across separate chats and social channels can be difficult to find and compare.

### Proposed solution

A central campus marketplace with product details, seller profiles and pickup orders.

### Target users

UTHM students, staff and campus sellers.

### Objectives

- Help buyers find products by category, price and campus.
- Give sellers control over listings and order status.
- Record orders and reviews in a shared database.

**Suggested speech**

Our starting problem is product discovery. When sellers promote items in separate chats or social channels, buyers may need to search several places to compare product details. We are treating this as the problem our project will address. We have not yet conducted a campus survey, so we will validate it through feedback from potential users.

Pasor Kita proposes one marketplace for the UTHM community. Buyers can browse product information and filter by category, price or campus. Sellers can manage their listings and respond to orders. We will initially focus on products and campus pickup to keep the project manageable.

The main objectives are to make products easier to find, provide a clear product and order management workflow, and store shared records in a database. Students and staff may act as buyers or sellers. An administrator will manage categories and handle inappropriate content.

Use one concrete example if time allows: a student finds a preloved textbook, checks the price and pickup point, places an order, and later leaves a review after completion.

## Slide 3: List of modules

**On the slide**

| Module | Main functions |
| --- | --- |
| Accounts and profiles | Register, sign in and manage buyer/seller profiles |
| Product catalogue | Create, view, update and delete product listings |
| Search and saved items | Filter by category, price and campus, and save products |
| Orders and campus pickup | Place an order and track its status |
| Ratings and reviews | Review products after a completed order |
| Administration | Manage categories, moderate listings and review activity |

**Suggested speech**

We propose six core modules. First, the account module provides real registration and login, with profile information stored on the server. A registered member can buy and sell through the same account.

Second, the product catalogue supports full CRUD. Sellers can create a listing, buyers can read it, and its owner can update or delete it. Each listing includes an image, category, price, quantity and pickup location.

Third, search and saved items help buyers narrow the catalogue by category, price and campus. Fourth, the order module supports a Buy Now flow for one product at a time. The buyer chooses a quantity and pickup details. The server checks stock and calculates the total. The seller can accept the order and move it through the allowed pickup statuses.

Fifth, a buyer can review a product after completing an order. Finally, the administration module allows an administrator to maintain categories and moderate inappropriate content. The server will check permissions so users can only change records they are allowed to manage.

The first version uses payment on pickup. Real online payment, live chat, university SSO and SSM/PTU verification are future extensions. PWA and 3D visual features can stay if they do not delay the core requirements.

## Slide 4: Proposed system architecture

**On the slide**

- Browser: HTML, CSS and JavaScript.
- Application server: Node.js, Express and EJS templates.
- Database: MySQL with related user, product and order records.
- Security: password hashing, session checks, input validation and parameterised queries.
- Initial deployment: localhost for the project demonstration.

The slide includes an editable three-layer diagram. EJS runs on the server and produces HTML for the browser.

**Suggested speech**

We propose a three-layer architecture. The browser displays HTML, CSS and JavaScript. A Node.js server using Express handles requests and renders EJS templates. It applies authentication, ownership checks and business rules before accessing MySQL.

For example, when a buyer submits an order, Express checks their session, validates the requested quantity and loads the current product price from MySQL. It saves the order and order item together, updates stock, and returns the result to the browser. The browser does not connect directly to the database.

This structure makes our backend logic, database relationships and CRUD operations easy to demonstrate in the lab. It is a proposed implementation, while the current project is still a local Next.js prototype.

## Framework explanation

Node.js is a JavaScript runtime. Express is a backend web framework that runs on Node.js. Next.js is a React framework for full-stack web applications. Therefore, the precise proposed change is **from Next.js to an Express application running on Node.js**, with EJS templates and MySQL.

The PDF does not ban Next.js. It specifies HTML/CSS/JavaScript on the frontend, a backend for authentication and processing, and optional frameworks. Keeping Next.js could also satisfy those requirements if the missing backend and database work were completed. We recommend Express here because the existing marketplace already contains a reusable HTML/CSS/JavaScript implementation and the group can present a straightforward request-to-database workflow.

Official technical references:

- [Node.js introduction](https://nodejs.org/learn/getting-started/introduction-to-nodejs)
- [Express documentation](https://expressjs.com/)
- [Next.js documentation](https://nextjs.org/docs)

These documentation links explain the technologies. They do not replace the assignment's requirement for at least ten research papers, journals or books from 2021-2026 in the final report.

## Likely questions

**Why does this fit Idea B?** Buyers discover products, place orders and track completion. Sellers promote products and manage orders.

**Why use Express?** It supports a clear Node.js backend with explicit routes, validation and database operations. Framework choice is optional in the PDF.

**Do you need a real payment gateway?** The PDF does not explicitly require one. The proposal uses payment on pickup and records order status. If the lecturer expects an online payment flow, use a sandbox integration as a later extension.

**How will you prove database integration?** Show related Users, Categories, Products, Orders and OrderItems records, then demonstrate a saved listing and order surviving a restart or appearing in a second browser session.

**How will you prove security?** Demonstrate that one seller cannot edit another seller's listing, that guests cannot place orders, and that invalid quantities or prices are rejected on the server.

**Are the present badges and accounts real?** The current preview contains illustrative badges and simulated accounts. The proposed backend must enforce identity and permissions before treating them as real. An email domain check alone does not verify university membership or email ownership.

**What is your scope boundary?** Product listings and pickup orders form the assessed core. Services, rentals, real-time chat, online payments and external verification remain extensions.
