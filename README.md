<p align="center">
  <a href="README.zh-CN.md">简体中文</a> · <strong>English</strong>
</p>

<div align="center">
  <img src="assets/branding/rouge-hate-icon-256.png" width="168" alt="ROUGE HATE purple singularity game icon">
  <h1>ROUGE HATE</h1>
  <p><strong>Speak your weapon. Survive the stars.</strong></p>
  <p>A cosmic survivor roguelite where natural language creates your character and attacks.</p>
</div>

[![ROUGE HATE gameplay trailer](assets/branding/rouge-hate-trailer-preview.gif)](trailer-output/rouge-hate-gameplay-trailer-final.mp4)

<p align="center">
  <a href="trailer-output/rouge-hate-gameplay-trailer-final.mp4"><strong>▶ Watch / download the full 1080p · 25 FPS trailer</strong></a>
</p>

The trailer follows a desperate comeback: define a custom combat identity, dash through swarms in a wormhole, receive blessings from seven cosmic patrons, endure a near-death encirclement, forge an AI weapon in natural language, break the horde, and rebuild a weapon blueprint. Every combat shot was captured from live Canvas gameplay. The music, typing, and transition sounds are original and generated locally.

## Your Words Become Real Weapons

The AI is not a decorative chatbot. You can write:

> Create a miniature star that devours every enemy on screen, then splits into a lightning storm.

The game turns that sentence into a weapon with a physical form, firing rhythm, trajectory, targeting strategy, range, status effects, and tradeoffs, then adds it directly to combat. Explicit behaviors are treated as a semantic contract: a "self-guided flying sword" leaves the player and actively hunts enemies instead of becoming a fixed orbit. The server only scales numerical values to fit the power budget, and it never generates or executes arbitrary code.

You can also describe your opening character, such as a stellar warrior with a greatsword, a hunter who grows spores with poison arrows, or an astral mage who manipulates gravity. The character receives a matching appearance, starting weapon, passive, and `Space` ability.

## Core Experience

- **Build a character in one sentence:** choose warrior, hunter, or mage, or enter a completely free-form concept.
- **Create weapons in one sentence:** forge after the first Stage I wave, Boss 1, Boss 2, and 15 seconds into the final boss, for one starting weapon plus four creations.
- **Faithful behavior:** combine straight shots, active homing, boomerangs, spirals, snakes, orbital drops, and four targeting modes; only numerical power is budgeted.
- **Free-form AI mutations:** every fourth upgrade can reshape an existing attack from your description or an AI recommendation, with a five-second live behavior preview.
- **Three distinct upgrade presentations:** relic synchronization, full-screen patron manifestations, and animated AI weapon scan/disassembly/protocol-lock sequences.
- **216 auditable weapon effects:** nine chassis multiplied by 24 handcrafted visual signatures, affecting silhouette, cast motion, projectile or beam, trail, impact, and disappearance.
- **110 relics and blessings:** seven patrons, three irregular relic pools, dual-patron prerequisites, legendary blessings, essence upgrades, and eight hidden transformations.
- **18 cosmic creature types:** pursuit, ranged fire, self-destruction, charges, hatching, shields, sniping, and radial barrages mix progressively across stages.
- **Contested drops:** enemies release experience, healing biomass, and alien chests; elite and boss chests offer build-changing rewards.
- **Nine-minute expeditions:** three escalating three-minute sectors, mid-run encounters, and the purple stellar-core boss known as the Hate Singularity.
- **Fully playable without AI:** the local rule compiler preserves the entire combat and reward loop when no API key is available.

## Seven Cosmic Patrons

![ROUGE HATE cosmic patron roster](assets/concepts/cosmic-patrons-roster.png)

<p align="center"><sub>Blind Star · White Raven · Red Sun · Sleeping Moon · Spore Mother · Thunder Beast · Stargazer</sub></p>

Each patron has nine exclusive blessings, for 63 patron blessings across common, rare, epic, dual-patron, and legendary tiers. You can meet at most four patrons in one expedition, pushing the same weapon set toward very different builds. Together with the drifting relic pools, the upgrade system contains 110 handcrafted, rule-driven enhancements.

## One Expedition

1. Describe your character archetype and receive a starting weapon and signature ability.
2. Level through ordinary star beasts. When a patron appears, meet them and choose one of three blessings; each run includes at most four patrons.
3. Every fourth level triggers a Weapon Dream that mutates an existing attack, with a looping combat preview before forging.
4. Forge the first new weapon after clearing Stage I's opening wave; later creations follow boss milestones.
5. In Sector III, combine five weapons, relics, dual-patron blessings, and hidden transformations into an extreme endgame build.
6. Destroy the Hate Singularity and carry its echo into the next expedition.

## Start the Game

Requires Python 3.10+. No npm or pip dependencies are needed.

```powershell
git clone https://github.com/OneYaYa/Rougehate.git
cd Rougehate
Copy-Item .env.example .env
python server.py
```

Open <http://127.0.0.1:8787>.

For more tailored character and weapon generation, configure OpenAI:

```dotenv
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.6-terra
```

The local Python service is the only process that reads the API key. The browser never receives it. The game remains fully playable without a key.

## Web Deployment

For a self-managed Linux server with Docker and Caddy, see [Deployment](DEPLOY.md). Keep the API key in the server's `.env` file—never in browser code or Git.

## Controls

| Action | Input |
|---|---|
| Move | `WASD` / arrow keys / touch drag |
| Signature ability | `Space` |
| Choose an upgrade | `1` / `2` / `3` or click a card |
| Pause | `Esc` |
| Attack | Automatic targeting and firing |

## Current Version

This browser prototype is playable from character creation through the final boss. Records, settings, the weapon codex, and meta-progression echoes are stored locally in the browser.

Cloud saves, controller support, accounts, and a production installer are not yet available. The development server is intended for local play and should not be exposed to the public internet without protection.

<details>
<summary><strong>AI safety boundaries and validation</strong></summary>

- The OpenAI Responses API and Structured Outputs restrict results to a strict JSON Schema.
- The server re-clamps values, validates executable effect graphs, and enforces weapon budgets of 72 / 104 / 140 / 184.
- The model never generates or executes JavaScript or Python.
- Failed model calls use locally generated demonstration results so the reward flow never stalls.

```powershell
python -m unittest discover -s tests -v
python -m py_compile server.py
```

</details>

<details>
<summary><strong>Original weapon art direction</strong></summary>

![ROUGE HATE original cosmic weapon concept sheet](assets/weapons/cosmic-weapon-concept-sheet-v2.png)

The concept sheet establishes a common visual language of alien anatomy, old machinery, crystals, and celestial rings. In-game weapons are assembled at runtime from modular Canvas models.

</details>

<details>
<summary><strong>Re-recording the trailer</strong></summary>

Director mode lives at `?trailer=1` and only affects deterministic gameplay recording.

```powershell
python -m pip install numpy imageio-ffmpeg playwright
python tools\render_trailer.py
```

The recorder uses an installed Google Chrome by default. It outputs `trailer-output/rouge-hate-gameplay-trailer-final.mp4` as H.264 High / AAC Stereo / 1920×1080 / 25 FPS and rebuilds the lightweight README preview GIF.

</details>
