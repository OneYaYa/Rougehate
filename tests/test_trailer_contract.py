from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
TRAILER = (ROOT / "trailer.js").read_text(encoding="utf-8")
RENDERER = (ROOT / "tools" / "render_trailer.py").read_text(encoding="utf-8")


class TrailerContractTests(unittest.TestCase):
    def test_director_mode_shows_ai_role_creation_and_final_forge(self):
        self.assertIn("state.running = false;", TRAILER)
        self.assertIn("openArchetypeSelection();", TRAILER)
        self.assertIn("openForge(4);", TRAILER)

    def test_endgame_cuts_use_distinct_vfx_signatures(self):
        for variant in (2, 3, 6, 9, 11, 15, 17, 19, 21, 22, 23):
            self.assertIn(f"visual_variant: {variant}", TRAILER)
        self.assertIn("双螺旋雷鳗", TRAILER)
        self.assertIn("飞出去的赤月", TRAILER)
        self.assertIn("遮天幼星群", TRAILER)

    def test_renderer_rebuilds_readme_preview(self):
        self.assertIn("def build_preview", RENDERER)
        self.assertIn("rouge-hate-trailer-preview.gif", RENDERER)


if __name__ == "__main__":
    unittest.main()
