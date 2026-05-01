# Changelog

All notable changes to the **WriteSpace** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

- **Public Landing Page** — Hero section with gradient banner, feature highlights (Write & Publish, Role-Based Access, Instant & Local), latest posts preview, and footer with navigation links.
- **Authentication System**
  - Login page (`/login`) with username and password validation, inline error messages, and role-based redirect (admin → `/admin`, user → `/blogs`).
  - Registration page (`/register`) with display name, username, password, and confirm password fields. Client-side validation for required fields, minimum password length, password match, and username uniqueness.
  - Session management via `localStorage` with `login()`, `logout()`, `register()`, `getCurrentUser()`, and `isAdmin()` utilities.
  - Already-authenticated users are automatically redirected away from login and register pages.
- **Role-Based Routing and Access Control**
  - `ProtectedRoute` component guards authenticated routes and redirects unauthenticated users to `/login`.
  - Admin-only routes (`/admin`, `/admin/users`) redirect non-admin users to `/blogs`.
  - Public routes (`/`, `/login`, `/register`) accessible to all visitors.
- **Avatar System**
  - Role-distinct visual avatars with emoji indicators (👑 for admin, 📖 for user).
  - Configurable sizes (`sm`, `md`, `lg`) with gradient background colors.
  - `getAvatar()` helper for consistent avatar rendering across components.
- **Blog CRUD with Ownership Enforcement**
  - Blog list page (`/blogs`) displaying all posts in a responsive grid sorted by newest first, with empty state and call-to-action.
  - Single blog post reading page (`/blog/:id`) with full content, author avatar, display name, and formatted date.
  - Write new post page (`/write`) with title and content fields, character counters, and inline validation.
  - Edit post page (`/blog/:id/edit`) with pre-filled form data and ownership enforcement — users can only edit their own posts, admins can edit any post.
  - Delete post functionality with confirmation dialog modal, available to post authors and admins.
  - `BlogCard` component with colorful accent borders, content excerpts, author info, and edit icon for authorized users.
- **Admin Dashboard** (`/admin`)
  - Gradient banner header with personalized welcome message.
  - Four `StatCard` components displaying Total Posts, Total Users, Total Admins, and Total Regular Users.
  - Quick-action buttons for writing new posts and managing users.
  - Recent posts section with edit and delete controls and confirmation dialog.
- **User Management Panel** (`/admin/users`)
  - Gradient banner header with page description.
  - User list with `UserRow` components displaying avatar, display name, username, role badge, creation date, and delete button.
  - Create user form with display name, username, password, confirm password, and role selection fields with validation.
  - Delete user functionality with confirmation dialog modal.
  - Protection against deleting the default admin account (`admin-001`) and the currently logged-in user.
- **Navigation**
  - `PublicNavbar` for unauthenticated users with WriteSpace branding, Login, and Register links.
  - `Navbar` for authenticated users with WriteSpace branding, Blogs, Write, user avatar chip with role badge, and Logout button. Admin users see additional Admin Dashboard and Manage Users links.
- **localStorage Persistence**
  - All data (posts, users, sessions) stored in `localStorage` with safe read/write/remove helpers.
  - Automatic admin user seeding on first load with default credentials (`admin` / `adminpw`).
  - No server or database required — fully client-side data management.
- **Responsive Tailwind CSS UI**
  - Fully responsive layout using Tailwind CSS utility classes with `sm:`, `md:`, and `lg:` breakpoints.
  - Gradient backgrounds, rounded cards, shadow effects, and smooth hover/focus transitions.
  - Custom color palette extending Tailwind defaults for indigo, violet, pink, teal, and slate.
- **Vercel SPA Deployment**
  - `vercel.json` configured with SPA rewrite rules for client-side routing support.
- **Testing**
  - Unit tests for `storage.js` covering posts CRUD, users CRUD, session management, admin initialization, and `localStorage` error handling.
  - Unit tests for `auth.js` covering login, logout, register, `getCurrentUser`, and `isAdmin` with mocked storage.
  - Integration tests for `App.jsx` covering public routes, protected route redirects, authenticated user access, admin-only route access, navbar rendering, and page navigation.