# Deployment Guide

This document covers how to deploy **WriteSpace** to production. WriteSpace is a fully client-side single-page application (SPA) — no server, database, or backend API is required. All data is stored in the user's browser via `localStorage`.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build](#build)
- [Vercel Deployment](#vercel-deployment)
  - [Automatic Deployment from Git](#automatic-deployment-from-git)
  - [Manual Deployment via Vercel CLI](#manual-deployment-via-vercel-cli)
  - [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Environment Variables](#environment-variables)
- [Other Hosting Platforms](#other-hosting-platforms)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Cloudflare Pages](#cloudflare-pages)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- A [Vercel](https://vercel.com/) account (for Vercel deployment)
- A Git repository hosted on GitHub, GitLab, or Bitbucket

---

## Build

Create a production-optimized build by running:

```bash
npm install
npm run build
```

This uses Vite to bundle the application into the `dist/` directory. The output is a set of static files (HTML, CSS, JS) ready to be served by any static hosting provider.

To preview the production build locally before deploying:

```bash
npm run preview
```

To run the test suite before deploying:

```bash
npm run test
```

---

## Vercel Deployment

Vercel is the recommended deployment platform for WriteSpace. It auto-detects the Vite framework and requires minimal configuration.

### Automatic Deployment from Git

This is the recommended approach. Vercel will automatically build and deploy your app on every push to your default branch.

1. **Push your code** to a Git repository on GitHub, GitLab, or Bitbucket.

2. **Import the project** in the [Vercel Dashboard](https://vercel.com/dashboard):
   - Click **"Add New…"** → **"Project"**.
   - Select your Git provider and authorize access if prompted.
   - Choose the repository containing your WriteSpace project.

3. **Configure build settings** — Vercel should auto-detect these, but verify they match:

   | Setting            | Value            |
   | ------------------ | ---------------- |
   | **Framework Preset** | Vite             |
   | **Build Command**    | `npm run build`  |
   | **Output Directory** | `dist`           |
   | **Install Command**  | `npm install`    |
   | **Node.js Version**  | 18.x or higher   |

4. **Deploy** — Click the **"Deploy"** button. Vercel will install dependencies, run the build, and publish the site.

5. **Subsequent deploys** happen automatically whenever you push commits to the connected branch. Pull request branches will receive preview deployments with unique URLs.

### Manual Deployment via Vercel CLI

If you prefer deploying from your local machine:

1. Install the Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. Log in to your Vercel account:

   ```bash
   vercel login
   ```

3. From the project root, run:

   ```bash
   vercel
   ```

   Follow the prompts to link the project. Vercel will build and deploy automatically.

4. For production deployments:

   ```bash
   vercel --prod
   ```

### SPA Rewrite Configuration

WriteSpace uses client-side routing via React Router v6. All routes (e.g., `/blogs`, `/admin`, `/blog/:id`) are handled in the browser — there are no corresponding server-side routes.

Without a rewrite rule, navigating directly to a route like `/blogs` or refreshing the page on `/blog/some-id` would result in a **404 error** because the hosting server looks for a file at that path and finds none.

The `vercel.json` file in the project root solves this by rewriting all requests to `index.html`:

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

**How it works:**

- Any request to any path (e.g., `/blogs`, `/admin/users`, `/blog/abc123`) is served the `index.html` file.
- Once `index.html` loads, React Router reads the URL and renders the correct page component.
- Static assets in the `dist/assets/` directory (JS, CSS, images) are served normally because Vercel resolves exact file matches before applying rewrites.

> **Important:** Do not remove or modify `vercel.json` unless you understand the implications for client-side routing. Without this file, direct URL access and page refreshes will break.

---

## Environment Variables

**No environment variables are required.** WriteSpace stores all data (posts, users, sessions) in the browser's `localStorage`. There is no backend, API, or database to configure.

### Optional Variables

You may optionally set the following variable to customize the browser tab title:

| Variable          | Default      | Description                          |
| ----------------- | ------------ | ------------------------------------ |
| `VITE_APP_TITLE`  | `WriteSpace` | Custom app title for the browser tab |

To set environment variables:

- **Locally:** Copy `.env.example` to `.env` and edit the values:

  ```bash
  cp .env.example .env
  ```

- **On Vercel:** Go to your project's **Settings** → **Environment Variables** and add the variable there. Vercel injects these at build time.

> **Note:** Only variables prefixed with `VITE_` are exposed to the client-side code via `import.meta.env.VITE_*`. Never store secrets in `VITE_` variables — they are embedded in the built JavaScript bundle and visible to anyone.

---

## Other Hosting Platforms

WriteSpace can be deployed to any static hosting provider. The key requirement is configuring a **fallback/rewrite rule** so that all routes serve `index.html`.

### Netlify

1. Run `npm run build` to generate the `dist/` directory.
2. Deploy the `dist/` directory to Netlify.
3. Create a `public/_redirects` file (or `netlify.toml`) with the following rule:

   **`public/_redirects`:**
   ```
   /*    /index.html   200
   ```

   **Or `netlify.toml`:**
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### GitHub Pages

1. Run `npm run build` to generate the `dist/` directory.
2. Deploy the `dist/` directory to GitHub Pages (e.g., using the `gh-pages` package or GitHub Actions).
3. Add a `404.html` file to `dist/` that is a copy of `index.html`. GitHub Pages serves `404.html` for unknown routes, which allows React Router to handle the routing.

> **Note:** GitHub Pages does not support true SPA rewrites. The `404.html` workaround may cause a brief 404 status code before the page renders correctly.

### Cloudflare Pages

1. Connect your Git repository to Cloudflare Pages.
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Cloudflare Pages automatically handles SPA routing for single-page applications — no additional configuration is needed.

---

## CI/CD Notes

### Vercel Auto-Deploy

When connected to a Git repository, Vercel provides:

- **Production deployments** on every push to the default branch (e.g., `main`).
- **Preview deployments** on every push to a pull request branch, each with a unique URL.
- **Instant rollbacks** to any previous deployment from the Vercel Dashboard.

### Running Tests in CI

To run the test suite before deploying, you can add a test step to your CI pipeline. For example, in a GitHub Actions workflow:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build
      # Deploy dist/ to your hosting provider
```

> **Tip:** If using Vercel's Git integration, Vercel handles the build and deploy steps automatically. You only need a separate CI workflow if you want to run tests before Vercel deploys.

### Build Output

The `npm run build` command produces the following output structure:

```
dist/
├── index.html          # Entry point (served for all routes)
├── vite.svg            # Favicon
└── assets/
    ├── index-[hash].js   # Bundled JavaScript
    └── index-[hash].css  # Bundled CSS (Tailwind)
```

All filenames include content hashes for cache busting. Static assets can be cached aggressively by the CDN.

---

## Troubleshooting

### Page shows 404 on refresh or direct URL access

**Cause:** The hosting server does not have a rewrite/fallback rule configured for SPA routing.

**Solution:** Ensure your hosting platform serves `index.html` for all routes. For Vercel, verify that `vercel.json` exists in the project root with the rewrite rule:

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

For other platforms, see the [Other Hosting Platforms](#other-hosting-platforms) section above.

### Blank page after deployment

**Cause:** The build output may not be served correctly, or the base path is misconfigured.

**Solution:**
1. Open the browser developer tools (F12) and check the **Console** tab for errors.
2. Check the **Network** tab to see if JS and CSS files are loading (status 200).
3. Verify the output directory is set to `dist` in your hosting provider's settings.
4. If deploying to a subdirectory (e.g., `https://example.com/app/`), add a `base` option to `vite.config.js`:

   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/app/',
   });
   ```

### Styles are missing or broken

**Cause:** Tailwind CSS may not be processing correctly during the build.

**Solution:**
1. Ensure `tailwind.config.js` has the correct `content` paths:
   ```js
   content: [
     './index.html',
     './src/**/*.{js,jsx}',
   ],
   ```
2. Ensure `postcss.config.js` includes the Tailwind and Autoprefixer plugins.
3. Ensure `src/index.css` contains the Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. Run `npm run build` again and verify that the output CSS file in `dist/assets/` is not empty.

### Data is lost after redeployment

**Expected behavior.** WriteSpace stores all data in the browser's `localStorage`. Data is tied to the user's browser and domain — it is not included in the deployment bundle. Redeploying the app does not affect existing `localStorage` data as long as the domain remains the same.

If users report lost data:
- They may have cleared their browser data or switched browsers.
- They may be accessing the app from a different domain or subdomain (e.g., a preview deployment URL vs. the production URL).

### Default admin account

On first load, WriteSpace automatically seeds a default admin account:

| Username | Password | Role  |
| -------- | -------- | ----- |
| `admin`  | `adminpw`| Admin |

This account is created in `localStorage` when the app initializes. If the admin account is missing, clearing `localStorage` and refreshing the page will re-seed it.

### Build fails with dependency errors

**Solution:**
1. Delete `node_modules/` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```
2. Reinstall dependencies:
   ```bash
   npm install
   ```
3. Run the build again:
   ```bash
   npm run build
   ```

### Tests fail before deployment

**Solution:**
1. Run the test suite locally to reproduce the failure:
   ```bash
   npm run test
   ```
2. Check that the test setup file exists at `src/setupTests.js` (referenced in `vitest.config.js`).
3. Ensure all test dependencies are installed (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `vitest`).