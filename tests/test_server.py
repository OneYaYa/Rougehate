import io
import json
import os
import unittest
from unittest.mock import patch

import server


class WeaponCompilerTests(unittest.TestCase):
    def test_static_assets_are_allowlisted_without_path_traversal(self):
        self.assertEqual(server.safe_static_request_path("/"), "/index.html")
        self.assertEqual(
            server.safe_static_request_path("/assets/enemies/cosmic-bestiary-v2.png"),
            "/assets/enemies/cosmic-bestiary-v2.png",
        )
        self.assertIsNone(server.safe_static_request_path("/server.py"))
        self.assertIsNone(server.safe_static_request_path("/assets/%2e%2e/server.py"))

    def test_offline_barrett_keeps_core_identity(self):
        weapon, adjustments = server.rebalance_weapon(
            server.offline_weapon("给我一把燃烧的巴雷特", level=3),
            level=3,
        )
        self.assertEqual(weapon["delivery"], "projectile")
        self.assertEqual(weapon["visual_form"], "rifle")
        self.assertGreaterEqual(weapon["pierce"], 4)
        self.assertGreaterEqual(weapon["range"], 540)
        self.assertGreater(weapon["burn_damage"], 0)
        self.assertRegex(weapon["color"], r"^#[0-9a-fA-F]{6}$")
        self.assertIsInstance(adjustments, list)

    def test_balance_budget_reduces_extreme_damage(self):
        raw = server.offline_weapon("普通武器", level=1)
        raw.update(damage=160, cooldown=0.18, projectile_count=8, pierce=7,
                   explosion_radius=120, homing=1, crit_chance=0.45)
        weapon, adjustments = server.rebalance_weapon(raw, level=1)
        self.assertLess(weapon["damage"], 160)
        self.assertTrue(adjustments)
        self.assertLessEqual(weapon["balance_score"], weapon["budget"])

    def test_three_stage_forge_bands_are_strictly_increasing(self):
        raw = server.offline_weapon("稳定的星尘步枪", level=1)
        weapons = [server.rebalance_weapon(raw, level=1, forge_tier=tier)[0] for tier in (1, 2, 3)]
        self.assertEqual([weapon["budget"] for weapon in weapons], [72.0, 104.0, 140.0])
        self.assertLess(weapons[0]["balance_score"], weapons[1]["balance_score"])
        self.assertLess(weapons[1]["balance_score"], weapons[2]["balance_score"])
        for tier, weapon in enumerate(weapons, 1):
            floor = server.FORGE_TIER_BUDGETS[tier] * server.FORGE_TIER_FLOORS[tier]
            self.assertGreaterEqual(weapon["balance_score"], floor - 0.2)
            self.assertLessEqual(weapon["balance_score"], weapon["budget"])
            self.assertLessEqual(server.weapon_score(weapon), weapon["budget"] + 0.2)

    def test_invalid_runtime_values_are_clamped(self):
        raw = server.offline_weapon("测试", level=1)
        raw.update(color="red", projectile_count=999, cooldown=-1, delivery="code")
        weapon, _ = server.rebalance_weapon(raw, level=1)
        self.assertEqual(weapon["delivery"], "projectile")
        self.assertEqual(weapon["color"], "#ff4f8b")
        self.assertEqual(weapon["projectile_count"], 8)
        self.assertEqual(weapon["cooldown"], 0.18)

    def test_strict_schema_requires_every_property(self):
        self.assertFalse(server.WEAPON_SCHEMA["additionalProperties"])
        self.assertEqual(
            set(server.WEAPON_SCHEMA["properties"]),
            set(server.WEAPON_SCHEMA["required"]),
        )

    def test_melee_weapon_has_visible_form_and_runtime_limits(self):
        weapon, _ = server.rebalance_weapon(server.offline_weapon("近战双刀刺客", 2), 2)
        self.assertEqual(weapon["delivery"], "melee")
        self.assertEqual(weapon["visual_form"], "daggers")
        self.assertLessEqual(weapon["range"], 175)
        self.assertGreaterEqual(weapon["spread_degrees"], 35)

    def test_archetype_compiler_builds_complete_runtime_config(self):
        raw = server.offline_archetype("会瞬移并使用毒刃的刺客")
        archetype = server.build_archetype(raw, "会瞬移并使用毒刃的刺客")
        self.assertEqual(archetype["role"], "assassin")
        self.assertEqual(archetype["trait"], "blink")
        self.assertIn("starting_weapon", archetype)
        self.assertIn(archetype["starting_weapon"]["visual_form"], server.WEAPON_SCHEMA["properties"]["visual_form"]["enum"])
        self.assertRegex(archetype["primary_color"], r"^#[0-9a-fA-F]{6}$")

    def test_explicit_archetype_words_override_model_misclassification(self):
        raw = server.offline_archetype("重火狙击手")
        raw.update(role="warrior", trait="fortress", weapon_visual="orb")
        archetype = server.build_archetype(raw, "能够连续瞬移的双刀刺客")
        self.assertEqual(archetype["role"], "assassin")
        self.assertEqual(archetype["trait"], "blink")
        self.assertEqual(archetype["starting_weapon"]["visual_form"], "daggers")

    def test_archetype_schema_is_strict(self):
        self.assertFalse(server.ARCHETYPE_SCHEMA["additionalProperties"])
        self.assertEqual(
            set(server.ARCHETYPE_SCHEMA["properties"]),
            set(server.ARCHETYPE_SCHEMA["required"]),
        )

    def test_openai_request_uses_responses_structured_output(self):
        generated = server.offline_weapon("测试武器", level=2)
        api_response = {
            "output": [{
                "type": "message",
                "content": [{"type": "output_text", "text": json.dumps(generated, ensure_ascii=False)}],
            }]
        }
        captured = {}

        class FakeResponse(io.BytesIO):
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                self.close()

        def fake_urlopen(request, timeout):
            captured["url"] = request.full_url
            captured["payload"] = json.loads(request.data.decode("utf-8"))
            captured["timeout"] = timeout
            return FakeResponse(json.dumps(api_response, ensure_ascii=False).encode("utf-8"))

        with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-test", "OPENAI_MODEL": "gpt-5.6-terra"}):
            with patch("server.urllib.request.urlopen", side_effect=fake_urlopen):
                result = server.call_openai("测试武器", 2, [], "test-session")

        self.assertEqual(result["name"], generated["name"])
        self.assertEqual(captured["url"], "https://api.openai.com/v1/responses")
        self.assertEqual(captured["payload"]["text"]["format"]["type"], "json_schema")
        self.assertTrue(captured["payload"]["text"]["format"]["strict"])
        self.assertFalse(captured["payload"]["store"])
        context = json.loads(captured["payload"]["input"])
        self.assertEqual(context["forge_tier"], 1)
        self.assertEqual(context["target_power_budget"], 72.0)

    def test_mutation_schema_and_offline_compiler_return_three_choices(self):
        self.assertFalse(server.MUTATION_SCHEMA["additionalProperties"])
        self.assertEqual(
            set(server.MUTATION_SCHEMA["properties"]),
            set(server.MUTATION_SCHEMA["required"]),
        )
        weapons = [server.rebalance_weapon(server.offline_weapon("星尘步枪", 2), 2, 1)[0]]
        raw = server.offline_mutations(weapons, ["ballistic", "precision"], 1)
        choices = server.sanitize_mutation_choices(raw, weapons, 1)
        self.assertEqual(len(choices), 3)
        self.assertEqual(len({choice["mechanic"] for choice in choices}), 3)
        for choice in choices:
            self.assertEqual(choice["target_index"], 0)
            self.assertIn(choice["mechanic"], server.MUTATION_COMPATIBILITY["projectile"])

    def test_mutation_sanitizer_rejects_incompatible_and_duplicate_mechanics(self):
        weapons = [{"name": "折光裁决", "delivery": "beam", "mutations": [{"mechanic": "fork"}]}]
        invalid = {"choices": [{
            "target_index": 3,
            "evolution_name": "越界造物",
            "title": "非法分裂",
            "description": "不应被接受",
            "mechanic": "split",
            "accent_color": "not-a-color",
            "tradeoff": "none",
            "tradeoff_text": "无",
            "tags": ["测试"],
        }] * 3}
        choices = server.sanitize_mutation_choices(invalid, weapons, 2)
        mechanics = [choice["mechanic"] for choice in choices]
        self.assertEqual(len(set(mechanics)), 3)
        self.assertNotIn("split", mechanics)
        self.assertNotIn("fork", mechanics)
        self.assertTrue(all(choice["accent_color"].startswith("#") for choice in choices))
        self.assertTrue(all(choice["mutation_round"] == 2 for choice in choices))
        self.assertTrue(all(
            choice["title"] == server.MUTATION_DEFAULTS[choice["mechanic"]][0]
            for choice in choices
        ))

    def test_mutation_openai_context_exposes_only_fixed_attack_grammar(self):
        weapons = [{
            "name": "相位双匕", "delivery": "melee", "visual_form": "daggers",
            "tags": ["近战"], "mutations": [{"mechanic": "chain"}],
        }]
        with patch("server.call_structured_openai", return_value={"choices": []}) as mocked:
            server.call_mutation_openai(
                weapons, ["mobility", "precision"],
                {"role": "assassin", "trait": "blink", "level": 7},
                "test-session", 2,
            )
        args = mocked.call_args.args
        context = args[1]
        self.assertIs(args[2], server.MUTATION_SCHEMA)
        self.assertEqual(args[3], "attack_mutation_choices")
        self.assertEqual(context["mutation_round"], 2)
        self.assertEqual(context["weapons"][0]["existing_mutations"], ["chain"])
        self.assertEqual(
            context["weapons"][0]["compatible_mechanics"],
            server.MUTATION_COMPATIBILITY["melee"],
        )
        self.assertNotIn("split", context["weapons"][0]["compatible_mechanics"])

    def test_mutation_copy_rejects_synthetic_vocabulary_and_long_titles(self):
        self.assertEqual(server.mutation_copy("量子超频协议", "虫卵弹", 7, title=True), "虫卵弹")
        self.assertEqual(server.mutation_copy("一个长得明显不像卡名的标题", "死星花", 7, title=True), "死星花")
        self.assertEqual(server.mutation_copy("骨头开花", "死星花", 7, title=True), "骨头开花")
        for title, description, *_ in server.MUTATION_DEFAULTS.values():
            self.assertLessEqual(len(title), 7)
            self.assertFalse(any(
                word in title + description for word in server.MUTATION_BANNED_VOCABULARY
            ))


if __name__ == "__main__":
    unittest.main()
