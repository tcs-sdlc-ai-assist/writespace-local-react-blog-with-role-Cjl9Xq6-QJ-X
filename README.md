# WriteSpace

A clean, modern blogging platform built with React where ideas come to life. Write, share, and manage your content — all from your browser. No server or database required; all data is stored locally in `localStorage`.

## Tech Stack

- **React 18+** — Component-based UI library
- **Vite** — Lightning-fast build tool and dev server
- **Tailwind CSS** — Utility-first CSS framework
- **React Router v6** — Client-side routing with role-based access control
- **localStorage** — Client-side data persistence (no backend required)
- **Vitest** — Unit and integration testing framework
- **PropTypes** — Runtime prop type checking

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build

Create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Testing

Run the test suite:

```bash
npm run test
```

## Default Credentials

On first load, a default admin account is automatically seeded:

| Username | Password | Role  |
| -------- | -------- | ----- |
| `admin`  | `adminpw`| Admin |

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel SPA rewrite rules
├── .env.example                # Environment variable template
├── CHANGELOG.md                # Project changelog
├── public/
│   └── vite.svg                # Favicon
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component with route definitions
    ├── App.test.jsx            # Integration tests for routing and access control
    ├── index.css               # Tailwind CSS directives
    ├── setup.js                # Test setup
    ├── components/
    │   ├── Avatar.jsx          # Role-distinct avatar with emoji indicators
    │   ├── BlogCard.jsx        # Blog post card for grid display
    │   ├── Navbar.jsx          # Authenticated user navigation bar
    │   ├── ProtectedRoute.jsx  # Route guard with role-based access control
    │   ├── PublicNavbar.jsx    # Guest/public navigation bar
    │   ├── StatCard.jsx        # Admin dashboard statistic card
    │   └── UserRow.jsx         # User management row/card component
    ├── pages/
    │   ├── AdminDashboard.jsx  # Admin-only dashboard with stats and recent posts
    │   ├── Home.jsx            # Blog list page with responsive grid
    │   ├── LandingPage.jsx     # Public landing page with hero and features
    │   ├── LoginPage.jsx       # Login form with validation
    │   ├── ReadBlog.jsx        # Single blog post reading page
    │   ├── RegisterPage.jsx    # Registration form with validation
    │   ├── UserManagement.jsx  # Admin-only user CRUD panel
    │   └── WriteBlog.jsx       # Blog post create/edit form
    └── utils/
        ├── auth.js             # Authentication logic (login, logout, register)
        ├── auth.test.js        # Unit tests for auth utilities
        ├── storage.js          # localStorage CRUD helpers and admin seeding
        └── storage.test.js     # Unit tests for storage utilities
```

## Route Map

| Path              | Component          | Access          | Description                          |
| ----------------- | ------------------ | --------------- | ------------------------------------ |
| `/`               | `LandingPage`      | Public          | Hero section, features, latest posts |
| `/login`          | `LoginPage`        | Public          | User login form                      |
| `/register`       | `RegisterPage`     | Public          | User registration form               |
| `/blogs`          | `Home`             | Authenticated   | All blog posts in a responsive grid  |
| `/blog/:id`       | `ReadBlog`         | Authenticated   | Full blog post reading view          |
| `/write`          | `WriteBlog`        | Authenticated   | Create a new blog post               |
| `/blog/:id/edit`  | `WriteBlog`        | Authenticated   | Edit an existing blog post           |
| `/admin`          | `AdminDashboard`   | Admin only      | Dashboard with stats and management  |
| `/admin/users`    | `UserManagement`   | Admin only      | User account CRUD panel              |

### Access Control

- **Public** — Accessible to all visitors, including unauthenticated users.
- **Authenticated** — Requires a valid session. Unauthenticated users are redirected to `/login`.
- **Admin only** — Requires an authenticated session with `role: 'admin'`. Non-admin users are redirected to `/blogs`.

## Features

### Authentication & Authorization
- Login and registration with client-side validation
- Session management via `localStorage`
- Role-based access control (Admin and User roles)
- Automatic redirect for already-authenticated users
- Protected route guards with role enforcement

### Blog Management
- Create, read, update, and delete blog posts
- Ownership enforcement — users edit only their own posts, admins edit any post
- Rich blog card grid with colorful accent borders and content excerpts
- Character counters on write/edit forms
- Confirmation dialog for post deletion

### Admin Dashboard
- Platform overview with stat cards (Total Posts, Users, Admins, Regular Users)
- Recent posts section with inline edit and delete controls
- Quick-action buttons for writing posts and managing users

### User Management (Admin)
- View all user accounts with avatar, role badge, and creation date
- Create new user accounts with role selection
- Delete user accounts with confirmation dialog
- Protection against deleting the default admin and the currently logged-in user

### Avatar System
- Role-distinct visual avatars with emoji indicators (👑 Admin, 📖 User)
- Configurable sizes (`sm`, `md`, `lg`) with gradient backgrounds

### UI & Design
- Fully responsive layout with Tailwind CSS (`sm:`, `md:`, `lg:` breakpoints)
- Gradient backgrounds, rounded cards, shadow effects, and smooth transitions
- Custom color palette (indigo, violet, pink, teal, slate)
- Public and authenticated navigation bars

### Data Persistence
- All data stored in `localStorage` — no server or database required
- Automatic admin user seeding on first load
- Safe read/write/remove helpers with error handling

## Environment Variables

No environment variables are required. All data is stored in `localStorage`.

Optionally, you can customize the app title:

```
VITE_APP_TITLE=WriteSpace
```

Copy `.env.example` to `.env` to get started:

```bash
cp .env.example .env
```

## Deployment

### Vercel

This project is configured for deployment on [Vercel](https://vercel.com/) as a single-page application.

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/dashboard).
3. Vercel will auto-detect the Vite framework. Use the following settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Deploy. The `vercel.json` file includes SPA rewrite rules to support client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Other Platforms

For any static hosting platform (Netlify, GitHub Pages, Cloudflare Pages, etc.):

1. Run `npm run build` to generate the `dist/` directory.
2. Deploy the contents of `dist/` to your hosting provider.
3. Configure a fallback/rewrite rule to serve `index.html` for all routes (required for client-side routing).

## License

This project is private and proprietary.