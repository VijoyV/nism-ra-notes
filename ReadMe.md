This updated `README.md` now includes the **MathJax** setup (so your AI-generated formulas render correctly) and the **Sequential Workflow** to ensure your code and your website stay in sync.

---

# NISM-RA Study Guide: Maintenance & Deployment

This guide explains how to add new study material, test it locally, and deploy it to the live website using the **Local Build** method.

## 1. Project Structure

To ensure the site builds correctly, keep the files in this layout:

```text
nism-ra-notes/
├── mkdocs.yml          # Configuration & MathJax settings
├── .gitignore          # Keeps build files out of GitHub
├── docs/               # ALL content goes here
│   ├── index.md        # The Homepage
│   ├── chapter-01.md   # Study notes
│   ├── data/           # Folder for quiz JSON files
│   └── javascripts/    # Contains mathjax.js for formulas
└── .github/            # (Optional)

```

---

## 2. Local Development (Testing)

Always test locally to check if your **Math formulas ($)** and **Quiz JSON** work before going live.

### One-Time Setup

```powershell
pip install mkdocs-material

```

### Launch Local Server

Run this from the root `nism-ra-notes` folder:

```powershell
python -m mkdocs serve

```

* **View at:** `http://127.0.0.1:8000`
* **Live Preview:** The browser refreshes automatically as you save files in VS Code.

---

## 3. The "Golden Loop" Workflow (Commit & Deploy)

To keep your GitHub code and the Live Site in sync, follow these three steps in order:

### Step A: Save Source to GitHub (`main` branch)

This saves your `.md` and `.yml` files.

```powershell
git add .
git commit -m "Update notes and math config"
git push origin main

```

### Step B: Publish to the Web (`gh-pages` branch)

This converts the Markdown to HTML and pushes it to the live site.

```powershell
python -m mkdocs gh-deploy

```

---

## 4. Formula & Math Rendering

The AI-generated math formulas (using `$`) require **Arithmatex**.

1. **`mkdocs.yml`** must include `pymdownx.arithmatex` in the extensions.
2. **`docs/javascripts/mathjax.js`** must exist to tell the browser to recognize the `$` sign.

---

## 5. Critical GitHub Settings

If the site shows a 404, verify these settings at: `GitHub Repo > Settings > Pages`

* **Source:** Must be set to **"Deploy from a branch"** (Do NOT use GitHub Actions).
* **Branch:** Must be set to **`gh-pages`** and the folder to **`/(root)`**.
* **Enforce HTTPS:** Must be **Checked**.

---

## 6. Troubleshooting

* **Formula not showing?** Check if `python -m mkdocs serve` shows any errors in the terminal.
* **404 Error?** GitHub takes ~2 minutes to sync. Try an **Incognito Window** to bypass the browser cache.
* **Command not recognized?** Always use `python -m mkdocs` instead of just `mkdocs`.