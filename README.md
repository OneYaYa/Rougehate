<p align="center">
  <a href="README.zh-CN.md">Simplified Chinese</a> · <strong>English</strong>
</p>

<div align="center">
  <img src="assets/branding/rouge-hate-icon-256.png" width="168" alt="ROUGE HATE game icon">
  <h1>ROUGE HATE</h1>
  <p><strong>Speak your weapon. Survive the stars.</strong></p>
</div>

A cosmic survivor roguelite where natural language creates characters, weapons, and mutations.

[![ROUGE HATE gameplay trailer](assets/branding/rouge-hate-trailer-preview.gif)](trailer-output/rouge-hate-gameplay-trailer-final.mp4)

<p align="center">
  <a href="trailer-output/rouge-hate-gameplay-trailer-final.mp4"><strong>▶ Watch / download the full 1080p trailer</strong></a>
</p>

## Promotional Art

![Seven cosmic patrons](assets/concepts/cosmic-patrons-roster.png)

![AI cosmic weapon concepts](assets/weapons/cosmic-weapon-concept-sheet-v2.png)

## Run Locally

Requires Python 3.10 or newer. No npm or pip dependencies are required.

```powershell
git clone https://github.com/OneYaYa/Rougehate.git
cd Rougehate
python server.py
```

Open <http://127.0.0.1:8787>. The complete game remains playable without an API key by using its local rule compiler.

## Optional: Enable OpenAI Generation

```powershell
Copy-Item .env.example .env
```

Add a dedicated `OPENAI_API_KEY` to `.env`, then restart `python server.py`. Git ignores `.env`; the key is read only by the Python service and is never sent to the browser.

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/OneYaYa/Rougehate)

1. Click the button, sign in to Render, and authorize access to this repository.
2. Enter `OPENAI_API_KEY` on the Blueprint page. Render stores it as a secret environment variable and never writes it back to GitHub.
3. Click **Deploy Blueprint**, then open the provided `onrender.com` URL.

The included [`render.yaml`](render.yaml) uses a free web service. Free services sleep after idle periods and wake on the next visit. You can upgrade the instance later if the site needs to remain continuously active.

## Repository Layout

```text
Rougehate/
├─ assets/          # Runtime images and README promotional art
├─ trailer-output/ # Published gameplay trailer
├─ index.html       # Page structure
├─ styles.css       # Page styles
├─ game.js          # Game logic
├─ vfx-library.js   # Visual-effect definitions
├─ server.py        # Static-file and AI API server
├─ render.yaml      # Render Blueprint
└─ .env.example     # Optional environment template
```

Player records are stored in each browser's `localStorage`; the server does not store personal save data.
