from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
GAME = (ROOT / "game.js").read_text(encoding="utf-8")
VFX = (ROOT / "vfx-library.js").read_text(encoding="utf-8")


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


if __name__ == "__main__":
    unittest.main()
