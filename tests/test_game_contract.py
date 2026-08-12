from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
GAME = (ROOT / "game.js").read_text(encoding="utf-8")


class BrowserGameContractTests(unittest.TestCase):
    def test_only_stage_one_uses_an_opening_wave(self):
        self.assertIn("const openingWaveSizes = [8];", GAME)
        self.assertIn("if (stageIndex !== 0) return;", GAME)

    def test_three_forges_follow_the_new_combat_beats(self):
        self.assertIn('queueReward("forge", clearedTier)', GAME)
        self.assertIn('queueReward("forge", 2)', GAME)
        self.assertIn("state.finalBossForgeAt = state.time + 10", GAME)
        self.assertIn('queueReward("forge", 3)', GAME)

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
        self.assertIn("Twelve modular structure genes", GAME)
        self.assertIn("Math.min(11", GAME)


if __name__ == "__main__":
    unittest.main()
