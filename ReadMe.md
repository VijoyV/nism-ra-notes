This is a perfect way to document the process so you don't have to remember these technical hurdles later. You can save this as `README.md` in your root folder.

---

# NISM-RA Study Guide: Maintenance & Deployment

This guide explains how to add new study material, test it locally, and deploy it to the live website.

## 1. Project Structure

To ensure the site builds correctly, keep the files in this layout:

```text
nism-ra-notes/
├── mkdocs.yml          # Core configuration and Sidebar (LHS) setup
├── docs/               # All content goes here
│   ├── index.md        # The Homepage
│   ├── chapter-01.md   # Study notes
│   └── data/           # Folder for quiz JSON files
└── .github/            # (Optional) GitHub automation files

```

---

## 2. Local Development (Testing before Pushing)

Use this to see changes instantly and test the Quiz functionality (fetching JSON) without security errors.

### One-Time Setup

If you haven't installed the theme yet:

```powershell
pip install mkdocs-material

```

### Launch Local Server

Run this command from the root `nism-ra-notes` folder:

```powershell
python -m mkdocs serve

```

* **View at:** `http://127.0.0.1:8000`
* **Note:** The browser will refresh automatically every time you save a file in VS Code.

---

## 3. Adding New Content

1. Create a new `.md` file inside the `docs/` folder.
2. Add the new file to the `nav` section in `mkdocs.yml`:
```yaml
nav:
  - "Chapter 8: Company Analysis": chapter-08.md

```


*Note: Always use double quotes if the title contains a colon (`:`).*

---

## 4. Deployment to GitHub Pages

Once your local test looks good, follow these steps to go live.

### The Deployment Command

Run this in your terminal to compile the HTML and push it to the live branch:

```powershell
python -m mkdocs gh-deploy

```

### Critical GitHub Settings (Must be Noted)

If the site shows a 404, verify these settings at:
`GitHub Repo > Settings > Pages`

* **Build and Deployment > Source:** Must be set to **"Deploy from a branch"**.
* **Branch:** Must be set to **`gh-pages`** and the folder to **`/(root)`**.
* **Custom Domain:** Leave blank unless using a private domain.
* **Enforce HTTPS:** Should be **Checked**.

---

## 5. Troubleshooting 404 Errors

* **Empty Site:** Ensure all `.md` files are inside the `docs/` folder.
* **URL Case:** The URL is case-sensitive. Use `https://vijoyv.github.io/nism-ra-notes/`.
* **Refresh:** If you just deployed, wait 2–3 minutes for GitHub's servers to sync. Use an Incognito window to bypass browser cache.