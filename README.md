# Personal Website

This is a lightweight static site scaffold for a personal website.

Structure:

- index.html — Homepage
- about.html — About page
- projects.html — Projects and portfolio
- contact.html — Contact info
- css/styles.css — Base styles
- js/main.js — Minimal client JS
- assets/* — Images and svgs

Preview locally (requires Node or Python):

Using Python 3:

```powershell
python -m http.server 8080
# then open http://localhost:8080
```

Using Node (http-server):

```powershell
npm install -g http-server; http-server -c-1
```

Deployment:

- GitHub Pages (recommended for simple sites):
	1. Create a branch named `gh-pages` and push the built site to that branch, or move site files into a `/docs` folder on `main`.
	2. In your repository on GitHub, go to Settings → Pages and select the branch/folder to publish.
	3. Optionally add a `CNAME` file for a custom domain.

- Netlify / Vercel:
	- Connect your GitHub repository and point the site to the root (or `/docs`) for static deploys. No build step is necessary for this scaffold.

Tips:

- Replace the placeholder content (name, email, project descriptions) before publishing.
- Use an automated workflow (`github-actions`) if you add a build step (SSG or bundler).
- Keep sensitive data out of the repo; use environment variables for any server-side tokens.

Customize and replace placeholder content with your details.