from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
TRAILER = (ROOT / "trailer.js").read_text(encoding="utf-8")
TRAILER_CSS = (ROOT / "trailer.css").read_text(encoding="utf-8")
RENDERER = (ROOT / "tools" / "render_trailer.py").read_text(encoding="utf-8")


class TrailerContractTests(unittest.TestCase):
    def test_director_mode_shows_complete_run_loop(self):
        self.assertIn("state.running = false;", TRAILER)
        self.assertIn("openArchetypeSelection();", TRAILER)
        self.assertIn("showPatronRoster();", TRAILER)
        self.assertIn("void showCeremony({", TRAILER)
        self.assertIn("openForge(4);", TRAILER)
        self.assertIn("showWeaponResult(previewWeapon", TRAILER)
        self.assertIn("showMutationChoice();", TRAILER)
        for stage in ("stageHunterBuild();", "stageStormBuild();", "stageSingularityBuild();"):
            self.assertIn(stage, TRAILER)

    def test_director_mode_showcases_all_patron_portraits_and_boon_count(self):
        for portrait in (
            "blind-star.webp", "white-raven.webp", "red-sun.webp", "sleeping-moon.webp",
            "spore-mother.webp", "thunder-beast.webp", "stargazer.webp",
        ):
            self.assertIn(f"assets/patrons/{portrait}", TRAILER)
        self.assertIn("7 位独特宇宙神祇", TRAILER)
        self.assertIn("63 项专属赐福", TRAILER)
        self.assertIn("function showPatronRoster()", TRAILER)
        self.assertIn('title: "太阳的指纹"', TRAILER)
        self.assertIn("击杀后留下太阳残焰，持续灼烧附近敌群", TRAILER)
        self.assertIn(".rh-trailer-patrons", TRAILER_CSS)
        self.assertIn('title: evolvedWeapon.name', TRAILER)
        self.assertIn('weapon: evolvedWeapon', TRAILER)
        self.assertIn('mode: "mutation"', TRAILER)

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

    def test_last_stand_leads_into_ai_weapon_comeback(self):
        self.assertIn("function stageLastStand()", TRAILER)
        self.assertIn("function stageForgedComeback()", TRAILER)
        self.assertIn("player.hp = 9;", TRAILER)
        self.assertIn("function trailerDropGuard", TRAILER)
        self.assertIn("八颗幼星主动追猎，贯穿折返，沿途孵化雷暴。", TRAILER)
        self.assertLess(TRAILER.index("stageLastStand();"), TRAILER.index("openForge(4);"))
        self.assertLess(TRAILER.index("openForge(4);"), TRAILER.index("stageForgedComeback();"))
        comeback_setup = TRAILER[TRAILER.index("function stageForgedComeback()"):TRAILER.index("function prepareLateBuild")]
        self.assertIn("spawnHorde(34, false)", comeback_setup)
        self.assertIn("const comebackPacks = [", comeback_setup)

    def test_last_stand_uses_organic_pursuit_and_finale_has_three_builds(self):
        last_stand_shot = TRAILER[TRAILER.index("later(13.65"):TRAILER.index("later(17.8")]
        self.assertIn('drive("KeyA", "KeyW")', last_stand_shot)
        self.assertIn('dash("KeyA", "KeyW")', last_stand_shot)
        self.assertIn("cameraMove(-34, 14, 38, -16, 4.0);", last_stand_shot)
        last_stand_setup = TRAILER[TRAILER.index("function stageLastStand()"):TRAILER.index("function stageForgedComeback()")]
        self.assertIn("const packs = [", last_stand_setup)
        self.assertIn("seedAmbushBarrage();", last_stand_setup)
        self.assertNotIn("index / enemies.length * Math.PI * 2", last_stand_setup)
        self.assertNotIn("五件武器。杀出去。", TRAILER)
        for function in ("function stageHunterBuild()", "function stageStormBuild()", "function stageSingularityBuild()"):
            self.assertIn(function, TRAILER)
        self.assertIn('caption("终局武器 01 / HUNTER", "遮天幼星群"', TRAILER)
        self.assertIn('caption("终局武器 02 / STORM", "万伏雷鳗"', TRAILER)
        self.assertIn('caption("终局武器 03 / VOID", "事件视界"', TRAILER)
        self.assertIn("prepareLateBuild([forkedBeam]", TRAILER)
        self.assertIn("prepareLateBuild([eventHorizon]", TRAILER)
        self.assertIn("function seedEnemyBarrage", TRAILER)
        self.assertIn("seedEnemyBarrage(colors, 1, 10, 112)", TRAILER)

    def test_opening_dashes_have_enemies_on_both_travel_lanes(self):
        opening = TRAILER[TRAILER.index("function stageOpeningHook()"):TRAILER.index("function configureRun")]
        self.assertIn("const openingRoute = [", opening)
        self.assertIn("enemy.hp = enemy.maxHp = 1450", opening)
        self.assertIn("currentBoss.x = player.x + 500", opening)

    def test_renderer_rebuilds_readme_preview(self):
        self.assertIn("def build_preview", RENDERER)
        self.assertIn("rouge-hate-trailer-preview.gif", RENDERER)
        self.assertIn('DURATION = 54.22', RENDERER)
        self.assertIn('rouge-hate-gameplay-trailer-final.mp4', RENDERER)

    def test_ai_wish_gets_text_closeup_and_synchronized_keypresses(self):
        self.assertIn('body.classList.add("trailer-forge-input-closeup")', TRAILER)
        self.assertIn('body.classList.remove("trailer-forge-input-closeup")', TRAILER)
        self.assertIn("trailer-forge-input-closeup .input-frame textarea", TRAILER_CSS)
        self.assertIn("trailer-forge-input-closeup .forge-header", TRAILER_CSS)
        self.assertIn("trailer-forge-input-closeup .char-count", TRAILER_CSS)
        self.assertIn('body.classList.add("trailer-forge-result")', TRAILER)
        self.assertIn("def add_keypress", RENDERER)
        self.assertIn("add_keypress(track, at, index", RENDERER)
        self.assertIn("OUTPUT_FPS = 25", RENDERER)
        self.assertIn("def detect_capture_inpoint", RENDERER)

    def test_capture_hides_boot_frames_and_has_no_fake_letterbox(self):
        self.assertIn('classList.add("trailer-capture-boot")', (ROOT / "index.html").read_text(encoding="utf-8"))
        self.assertIn('classList.remove("trailer-capture-boot")', TRAILER)
        self.assertNotIn("rh-trailer-letterbox", TRAILER)
        self.assertNotIn("rh-trailer-letterbox", TRAILER_CSS)


if __name__ == "__main__":
    unittest.main()
