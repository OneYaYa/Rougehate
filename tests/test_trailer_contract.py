from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
TRAILER = (ROOT / "trailer.js").read_text(encoding="utf-8")
RENDERER = (ROOT / "tools" / "render_trailer.py").read_text(encoding="utf-8")


class TrailerContractTests(unittest.TestCase):
    def test_director_mode_shows_complete_run_loop(self):
        self.assertIn("state.running = false;", TRAILER)
        self.assertIn("openArchetypeSelection();", TRAILER)
        self.assertIn('openUpgrade("upgrade");', TRAILER)
        self.assertIn("openForge(4);", TRAILER)
        self.assertIn("showWeaponResult(previewWeapon", TRAILER)
        self.assertIn("showMutationChoice();", TRAILER)
        self.assertIn("configureRun(3, true);", TRAILER)

    def test_showcase_build_uses_distinct_vfx_signatures(self):
        for variant in (2, 6, 21, 23):
            self.assertIn(f"visual_variant: {variant}", TRAILER)
        self.assertIn("双螺旋雷鳗", TRAILER)
        self.assertIn("遮天幼星群", TRAILER)
        self.assertIn("没有外面的世界", TRAILER)

    def test_avatar_is_directed_through_each_combat_shot(self):
        self.assertIn("ROUGE_HATE_TRAILER_CAMERA", TRAILER)
        self.assertGreaterEqual(TRAILER.count("cameraMove("), 6)
        self.assertGreaterEqual(TRAILER.count("dash("), 10)
        self.assertGreaterEqual(TRAILER.count("drive("), 16)

    def test_renderer_rebuilds_readme_preview(self):
        self.assertIn("def build_preview", RENDERER)
        self.assertIn("rouge-hate-trailer-preview.gif", RENDERER)
        self.assertIn('DURATION = 38.02', RENDERER)
        self.assertIn('rouge-hate-gameplay-trailer-final.mp4', RENDERER)


if __name__ == "__main__":
    unittest.main()
