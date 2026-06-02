# GitHub Pages Setup

This project now includes an automatic GitHub Pages deployment workflow:

- Workflow file: `.github/workflows/deploy-pages.yml`
- Build target: `dist`
- Trigger: every push to `main` that changes the frontend or workflow

## One-time GitHub settings

In the GitHub repository `giftirace/giftirace.github.io`:

1. Open `Settings` -> `Pages`
2. Under `Build and deployment`, set `Source` to `GitHub Actions`
3. Save

## How publishing works now

1. You write in `/write` or upload a Markdown file there
2. The page commits the Markdown file into `posts/`
3. That commit lands on `main`
4. GitHub Actions builds the Vite app
5. GitHub Pages deploys the generated `dist`

## Important note

The automatic deployment only starts after the repository has GitHub Pages enabled with `Source = GitHub Actions`.
