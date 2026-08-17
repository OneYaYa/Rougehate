from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
GAME = (ROOT / "game.js").read_text(encoding="utf-8")
VFX = (ROOT / "vfx-library.js").read_text(encoding="utf-8")
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
STYLES = (ROOT / "styles.css").read_text(encoding="utf-8")


class BrowserGameContractTests(unittest.TestCase):
    def test_only_stage_one_uses_an_opening_wave(self):
        self.assertIn("const openingWaveSizes = [8];", GAME)
        self.assertIn("if (stageIndex !== 0) return;", GAME)

    def test_four_forges_follow_the_new_combat_beats(self):
        self.assertIn("forgeOpened: [false, false, false, false]", GAME)
        self.assertIn('queueReward("forge", clearedTier)', GAME)
        self.assertIn("const nextForgeTier = enemy.bossIndex + 2", GAME)
        self.assertIn("state.finalBossForgeAt = state.time + 15", GAME)
        self.assertIn('queueReward("forge", 4)', GAME)
        self.assertIn("weapons.length >= 5", GAME)

    def test_ai_mutations_use_effect_graphs_without_named_templates(self):
        self.assertIn('function executeEffectRules(trigger, weapon, context = {})', GAME)
        self.assertIn('executeEffectRules("on_attack"', GAME)
        self.assertIn('executeEffectRules("on_hit"', GAME)
        self.assertIn('executeEffectRules("on_kill"', GAME)
        self.assertNotIn("mutationMechanicMeta", GAME)
        self.assertNotIn("mutationWishSuggestions", GAME)
        self.assertIn('effects: Array.isArray(choice.effects)', GAME)

    def test_upgrade_rarity_palette_and_metal_ai_cards_are_distinct(self):
        for color in ("#f2f2ef", "#70df86", "#55aaff", "#b47cff", "#ff9f43"):
            self.assertIn(color, GAME)
        self.assertIn('rarity: "uncommon"', GAME)
        self.assertIn('card.style.setProperty("--rarity-color", "#b8c2ce")', GAME)

    def test_dot_has_independent_ticks_and_visible_feedback(self):
        self.assertIn("enemy.burnTickAt = state.time + .35", GAME)
        self.assertIn("enemy.poisonTickAt = state.time + .5", GAME)
        self.assertIn("state.damageDealt += tick", GAME)
        self.assertIn("`☣${Math.max(1, Math.round(tick))}`", GAME)
        self.assertIn('status: "burn"', GAME)
        self.assertIn('status: "poison"', GAME)

    def test_drops_compass_and_visual_variants_are_present(self):
        self.assertIn('type: "heal"', GAME)
        self.assertIn('type: "cache"', GAME)
        self.assertIn("function drawBossCompass()", GAME)
        self.assertIn("function weaponTarget(", GAME)
        self.assertIn("Twenty-four visual signatures", GAME)
        self.assertIn("Math.min(23", GAME)

    def test_vfx_library_has_216_non_color_recipes(self):
        self.assertIn('const chassis = ["rifle", "cannon", "blade", "daggers", "bow", "staff", "orb", "tome", "drone"]', VFX)
        self.assertIn("24 hand-authored visual signatures", VFX)
        self.assertIn("count: Object.keys(recipes).length", VFX)
        self.assertIn("projectile, trail, beam, impact, cast, slash, aura, attachment", VFX)

    def test_three_minute_stages_have_random_mid_stage_events(self):
        self.assertIn("const STAGE_DURATION = 180;", GAME)
        self.assertIn("const BOSS_TIMES = [160, 340, 520];", GAME)
        self.assertIn('{ id: "meteor"', GAME)
        self.assertIn('{ id: "courier"', GAME)
        self.assertIn('{ id: "rift"', GAME)
        self.assertIn("function updateArenaHazards(dt)", GAME)
        self.assertIn("function drawEventTargetCompass()", GAME)

    def test_experience_recovery_prevents_distant_progress_loss(self):
        self.assertIn("function vacuumExperience(", GAME)
        self.assertIn("const overdue = state.time - (gem.bornAt ?? state.time) >= 18", GAME)
        self.assertIn('vacuumExperience("Boss 瓦解，战区经验全部回收")', GAME)

    def test_generated_weapon_has_looping_preview_and_rebuild_choice(self):
        self.assertIn('id="resultPreviewTime"', INDEX)
        self.assertIn('id="reforgeButton"', INDEX)
        self.assertIn("function drawWeaponPreviewFrame(weapon, elapsed, preview = ui.resultWeaponCanvas)", GAME)
        self.assertIn("% 5000", GAME)
        self.assertIn("function rejectWeaponAndReforge()", GAME)
        self.assertIn(".weapon-preview-video", STYLES)

    def test_forge_can_request_an_ai_recommendation_from_live_combat_state(self):
        self.assertIn('id="recommendButton"', INDEX)
        self.assertIn("function forgeCombatSnapshot()", GAME)
        self.assertIn('generateWeapon("", { recommend: true })', GAME)
        self.assertIn("combatState: forgeCombatSnapshot()", GAME)
        self.assertIn(".recommend-button", STYLES)

    def test_weapon_dream_returns_one_recommended_previewed_result(self):
        self.assertIn('textarea.placeholder = "对当前武器进行改造。"', GAME)
        self.assertIn('generateMutations("", { recommend: true })', GAME)
        self.assertIn("dataset.mutationRecommend", GAME)
        self.assertIn("data.choices.slice(0, 1)", GAME)
        self.assertIn("function startMutationPreview(choice, preview, timeLabel, progressFill)", GAME)
        self.assertIn("function mutationPreviewWeapon(choice)", GAME)
        self.assertIn("mutation-hammer-vfx", GAME)
        self.assertIn("audio.hammerStrike(\"precision\")", GAME)
        self.assertIn("dataset.mutationRetry", GAME)
        self.assertIn(".single-mutation-mode .upgrade-options", STYLES)

    def test_three_shot_mutation_and_slower_upgrade_curve_are_runtime_features(self):
        self.assertIn('rule.action === "repeat_attack"', GAME)
        self.assertIn("const shotCount = 1 + repeatCount", GAME)
        self.assertIn("const INITIAL_XP_NEED = 24", GAME)
        self.assertIn("Math.pow(state.level, 1.34) * 8", GAME)
        self.assertIn("const MUTATION_UPGRADE_INTERVAL = 4", GAME)

    def test_orbit_release_homing_is_distinct_from_fixed_orbit(self):
        self.assertIn("function orbitLaunchPoint(weapon, index, count)", GAME)
        self.assertIn('const orbitLaunch = Boolean(weapon.orbit_launch && weapon.trajectory === "homing")', GAME)
        self.assertIn("projectile.hitIds,", GAME)
        self.assertIn("!excludedIds?.has(enemy.id)", GAME)
        self.assertIn('weapon.delivery !== "orbit" && !weapon.orbit_launch', GAME)
        self.assertIn('if (weapon.orbit_launch && weapon.delivery === "projectile")', GAME)
        projectile_fire = GAME[GAME.index("function fireProjectile"):GAME.index("function fireBeam")]
        self.assertIn("if (orbitLaunch)", projectile_fire)

    def test_weapon_stats_audio_and_visual_budget_are_explicit(self):
        self.assertIn('makeMiniStat("DPS", dps)', GAME)
        self.assertIn('makeMiniStat("攻速", `${attacksPerSecond}/s`)', GAME)
        self.assertIn("profileFor(weapon = {})", GAME)
        self.assertIn('audio.shoot("projectile", weapon)', GAME)
        self.assertIn("function friendlyVfxAlpha()", GAME)
        self.assertIn('effect.source === "enemy"', GAME)

    def test_adaptive_score_tracks_stage_pressure_and_boss_state(self):
        self.assertIn("updateScore(gameState, boss, enemyCount)", GAME)
        self.assertIn('const mode = boss ? `boss-${boss.bossIndex}` : `stage-${stageIndex}`', GAME)
        self.assertIn("this.ambientWash(stageIndex, boss ? .88", GAME)
        self.assertIn("audio.updateScore(state, currentBoss, enemies.length)", GAME)
        self.assertIn("audio.stageShift(state.stageIndex)", GAME)
        self.assertIn("audio.setEnabled(!audio.enabled)", GAME)

    def test_every_stage_has_a_guaranteed_large_midpoint_elite_squad(self):
        self.assertIn('{ offset: 90, kind: "mid_elite" }', GAME)
        self.assertIn("const stageEliteSquads = [", GAME)
        self.assertIn("function promoteEnemyToElite(enemy, profile = {})", GAME)
        self.assertIn("enemy.radius *= Math.max(1.25", GAME)
        self.assertIn("spawnStageEliteSquad(stageIndex, true)", GAME)
        for elite_name in ("蓝幕执政官·折光冠", "紫孢母皇·万巢", "雷鸣主星·赫兹", "憎恨织主·红寂"):
            self.assertIn(elite_name, GAME)

    def test_bosses_have_larger_presence_radii(self):
        self.assertIn('radius: 56, damage: 18', GAME)
        self.assertIn('radius: 68, damage: 24', GAME)
        self.assertIn('radius: 82, damage: 29', GAME)
        self.assertIn("const presencePulse = 1 + Math.sin", GAME)
        self.assertIn("audio.boss(index)", GAME)

    def test_upgrades_have_distinct_relic_patron_and_ai_ceremonies(self):
        self.assertIn('id="upgradeCeremony"', INDEX)
        self.assertIn("async function playUpgradeCeremony(upgrade)", GAME)
        self.assertIn("async function playAICeremony(", GAME)
        self.assertIn('type: "patron"', GAME)
        self.assertIn('type: "relic"', GAME)
        self.assertIn('type: "ai"', GAME)
        self.assertIn("audio.patronArrival(patronId)", GAME)
        self.assertIn("audio.relic(profileId)", GAME)
        self.assertIn("audio.mutation()", GAME)
        self.assertIn(".ceremony-patron", STYLES)
        self.assertIn(".ceremony-patron-name", STYLES)
        self.assertIn("patron-color-rift", STYLES)
        self.assertIn("relic-stamp-in", STYLES)
        self.assertIn('duration: 650', GAME)
        self.assertIn('partner ? 78 : 58', GAME)
        self.assertIn(".ceremony-ai", STYLES)
        self.assertIn('id="ceremonyAiWeaponCanvas"', INDEX)
        self.assertIn("function renderAICeremonyBlueprint(weapon", GAME)
        self.assertIn("drawWeaponModel(blueprintCtx, weapon", GAME)
        self.assertIn("SCAN</span><span>DECOMPOSE</span><span>LOCK", INDEX)
        self.assertIn("weapon: previewWeapon", GAME)

    def test_patron_arrival_precedes_three_same_patron_choices(self):
        self.assertIn("async function playPatronArrival(patronId, choices)", GAME)
        self.assertIn("audio.patronArrival(patronId)", GAME)
        self.assertIn("hammerStrike(patronId", GAME)
        self.assertIn("function availablePatronUpgrades(patronId", GAME)
        self.assertIn("choices.length < 3", GAME)
        self.assertIn("currentUpgradePatron = encounter.patronId", GAME)
        self.assertIn("await playPatronArrival(currentUpgradePatron, currentUpgradeChoices)", GAME)
        self.assertIn("availableUpgrades(state.rewardType === \"artifact\", currentUpgradePatron)", GAME)
        self.assertIn(".ceremony-color-flash", STYLES)
        self.assertIn("boon-impact-ring", STYLES)
        self.assertIn("boon-card-deal", STYLES)

    def test_all_seven_patrons_have_original_portrait_assets(self):
        portrait_names = (
            "white-raven.webp", "red-sun.webp", "sleeping-moon.webp", "spore-mother.webp",
            "thunder-beast.webp", "blind-star.webp", "stargazer.webp",
        )
        for portrait_name in portrait_names:
            self.assertIn(f'assets/patrons/{portrait_name}', GAME)
            self.assertTrue((ROOT / "assets" / "patrons" / portrait_name).is_file())


if __name__ == "__main__":
    unittest.main()
