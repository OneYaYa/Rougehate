<p align="center">
  <a href="README.zh-CN.md">Simplified Chinese</a> · <strong>English</strong>
</p>

<div align="center">
  <img src="assets/branding/rouge-hate-icon-256.png" width="168" alt="ROUGE HATE purple singularity icon">
  <h1>ROUGE HATE</h1>
  <p><strong>Speak your weapon. Survive the stars.</strong></p>
  <p>A cosmic survivor roguelite where imagination becomes combat.</p>
</div>

[![ROUGE HATE gameplay trailer](assets/branding/rouge-hate-trailer-preview.gif)](trailer-output/rouge-hate-gameplay-trailer-final.mp4)

<p align="center">
  <a href="trailer-output/rouge-hate-gameplay-trailer-final.mp4"><strong>▶ Watch / download the full 1080p gameplay trailer</strong></a>
</p>

## Your Words Become Weapons

> Create a miniature star that devours every enemy on screen, then fractures into a lightning storm.

ROUGE HATE turns a sentence into a real combat build: weapon form, firing rhythm, trajectory, targeting, status effects, visual identity, and a meaningful tradeoff. Describe your opening character just as freely, then reshape existing attacks through Weapon Dreams as the expedition grows more desperate.

This is not a chatbot beside the game. Language changes what happens inside the fight.

## Build the Impossible

- **Create a combat identity in one sentence** — warrior, hunter, mage, or something entirely your own.
- **Forge attacks from natural language** — homing swords, collapsing stars, storm chains, orbital weapons, living projectiles, and stranger ideas.
- **Mutate weapons mid-run** — describe how an existing attack should evolve and preview the result before accepting it.
- **Meet seven cosmic patrons** — each god bends your build through an exclusive blessing pool and rare cross-patron combinations.
- **Discover 110 relics and blessings** — stack synergies, unlock transformations, and push five weapons toward extreme endgame forms.
- **Fight 18 cosmic creature types** — swarms, snipers, chargers, hatchers, shields, artillery, elites, and sector bosses.
- **Cross a nine-minute expedition** — three escalating sectors, four weapon forges, shifting encounters, and the Hate Singularity.
- **Play without an API key** — the local rule compiler keeps the complete run playable offline.

## Seven Patrons. Seven Ways to Break the Sky.

![Seven original cosmic patrons](assets/concepts/cosmic-patrons-roster.png)

Blind Star · White Raven · Red Sun · Sleeping Moon · Spore Mother · Thunder Beast · Stargazer

Only a few answer each expedition. Their blessings collide with relics, weapons, and one another, so the same starting idea can become a different machine every run.

## An Armory Written in Natural Language

![AI cosmic weapon concepts](assets/weapons/cosmic-weapon-concept-sheet-v2.png)

Every generated weapon is translated into a safe, bounded combat blueprint rather than arbitrary code. The fantasy remains yours; the game keeps its numbers survivable, readable, and fair enough to build around.

## One Expedition

1. Describe who you are and enter the first sector with a matching weapon and signature ability.
2. Cut through star beasts, collect experience, and choose relics or a patron's blessing.
3. Enter Weapon Dreams to rewrite attacks already in your arsenal.
4. Forge new weapons from your own sentences at major combat milestones.
5. Carry five weapons and a web of synergies into the final sector.
6. Destroy the Hate Singularity—or leave an echo for the next expedition.

## Launch Your Own Web Version

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/OneYaYa/Rougehate)

The included Render Blueprint publishes the game and its Python API as one shareable website. It uses a free web service by default; free instances sleep while idle and wake on the next visit. `OPENAI_API_KEY` is stored only as a Render secret and is never committed to GitHub or exposed to the browser.

<details>
<summary><strong>Run locally</strong></summary>

Requires Python 3.10 or newer. No npm or pip packages are required.

```powershell
git clone https://github.com/OneYaYa/Rougehate.git
cd Rougehate
python server.py
```

Open <http://127.0.0.1:8787>. To enable OpenAI generation, copy `.env.example` to `.env`, add a dedicated `OPENAI_API_KEY`, and restart the server. Without a key, the game automatically uses local generation rules.

</details>

Player records live in each browser's `localStorage`; the server does not store personal save data.
