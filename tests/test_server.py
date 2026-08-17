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

    def test_ai_authored_tracking_flying_sword_semantics_are_preserved(self):
        raw = server.offline_weapon("自动追踪敌人的飞剑", level=4)
        raw.update(
            delivery="projectile", visual_form="blade", trajectory="homing", homing=.96,
            behavior_summary="飞剑离开角色并主动追击敌人。",
        )
        weapon, _ = server.rebalance_weapon(raw, level=4, forge_tier=2, wish="自动追踪敌人的飞剑")
        self.assertEqual(weapon["delivery"], "projectile")
        self.assertEqual(weapon["visual_form"], "blade")
        self.assertEqual(weapon["trajectory"], "homing")
        self.assertEqual(weapon["homing"], .96)
        self.assertIn("主动追击", weapon["behavior_summary"])
        self.assertLessEqual(weapon["balance_score"], weapon["budget"])

    def test_orbiting_tracking_flying_swords_release_and_retarget(self):
        wish = "围绕我旋转的三根飞剑，可以自动追踪穿透敌人"
        weapon, _ = server.rebalance_weapon(server.offline_weapon(wish, level=2), 2, 1, wish)
        self.assertEqual(weapon["delivery"], "projectile")
        self.assertEqual(weapon["visual_form"], "blade")
        self.assertEqual(weapon["trajectory"], "homing")
        self.assertEqual(weapon["projectile_count"], 3)
        self.assertGreaterEqual(weapon["homing"], .9)
        self.assertGreaterEqual(weapon["pierce"], 3)
        self.assertTrue(weapon["orbit_launch"])
        self.assertIn("离体", weapon["behavior_summary"])
        self.assertIn("下一名未命中敌人", weapon["behavior_summary"])

    def test_fixed_orbit_is_not_confused_with_tracking_release(self):
        wish = "三根飞剑固定围绕我旋转并切割靠近的敌人"
        weapon, _ = server.rebalance_weapon(server.offline_weapon(wish, level=2), 2, 1, wish)
        self.assertEqual(weapon["delivery"], "orbit")
        self.assertNotEqual(weapon["trajectory"], "homing")
        self.assertFalse(weapon["orbit_launch"])

    def test_system_recommendation_uses_combat_pressure_and_build_gaps(self):
        combat_state = server.sanitize_combat_state({
            "stage": 2, "enemy_count": 28, "elite_count": 2, "hp_ratio": .7,
            "build_tags": ["ballistic"],
        })
        wish = server.recommended_weapon_wish(
            combat_state,
            [{"delivery": "beam", "trajectory": "straight", "pierce": 0}],
            2,
        )
        self.assertIn("自动追踪", wish)
        self.assertIn("环阵", wish)

    def test_poison_and_fire_are_separate_numeric_statuses(self):
        poisoned, _ = server.rebalance_weapon(server.offline_weapon("孢子剧毒猎弓", 2), 2, 1, "孢子剧毒猎弓")
        burning, _ = server.rebalance_weapon(server.offline_weapon("燃烧猎弓", 2), 2, 1, "燃烧猎弓")
        self.assertGreater(poisoned["poison_damage"], 0)
        self.assertEqual(poisoned["burn_damage"], 0)
        self.assertGreater(burning["burn_damage"], 0)

    def test_balance_budget_reduces_extreme_damage(self):
        raw = server.offline_weapon("普通武器", level=1)
        raw.update(damage=160, cooldown=0.18, projectile_count=8, pierce=7,
                   explosion_radius=120, homing=1, crit_chance=0.45)
        weapon, adjustments = server.rebalance_weapon(raw, level=1)
        self.assertLess(weapon["damage"], 160)
        self.assertTrue(adjustments)
        self.assertLessEqual(weapon["balance_score"], weapon["budget"])

    def test_four_forge_bands_are_strictly_increasing(self):
        raw = server.offline_weapon("稳定的星尘步枪", level=1)
        weapons = [server.rebalance_weapon(raw, level=1, forge_tier=tier)[0] for tier in (1, 2, 3, 4)]
        self.assertEqual([weapon["budget"] for weapon in weapons], [72.0, 104.0, 140.0, 184.0])
        for earlier, later in zip(weapons, weapons[1:]):
            self.assertLess(earlier["balance_score"], later["balance_score"])
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

    def test_mutation_schema_and_offline_compiler_return_one_choice(self):
        self.assertFalse(server.MUTATION_SCHEMA["additionalProperties"])
        self.assertEqual(
            set(server.MUTATION_SCHEMA["properties"]),
            set(server.MUTATION_SCHEMA["required"]),
        )
        weapons = [server.rebalance_weapon(server.offline_weapon("星尘步枪", 2), 2, 1)[0]]
        raw = server.offline_mutations(weapons, ["ballistic", "precision"], 1, "让攻击像活着的星鱼一样追猎")
        choices = server.sanitize_mutation_choices(raw, weapons, 1, "让攻击像活着的星鱼一样追猎")
        self.assertEqual(len(choices), 1)
        for choice in choices:
            self.assertEqual(choice["target_index"], 0)
            self.assertTrue(choice["effects"])
            self.assertNotIn("mechanic", choice)
        choice_schema = server.MUTATION_SCHEMA["properties"]["choices"]["items"]
        effect_schema = choice_schema["properties"]["effects"]["items"]
        self.assertEqual(set(effect_schema["properties"]), set(effect_schema["required"]))

    def test_mutation_sanitizer_preserves_ai_copy_and_valid_effect_graphs(self):
        weapons = [{"name": f"武器{i}", "delivery": "beam", "mutations": []} for i in range(5)]
        rule = {
            "trigger": "on_hit", "action": "spawn_projectiles", "target": "strongest",
            "trajectory": "homing", "status": "mark", "visual": "blade", "amount": .42,
            "count": 4, "radius": 96, "delay": .1, "duration": 2.4, "chance": .85,
        }
        raw = {"choices": [{
            "target_index": 4,
            "evolution_name": "自由造物",
            "title": "玩家想法变体",
            "description": "完全由 AI 写出的攻击行为",
            "effects": [{**rule, "count": 4}],
            "accent_color": "not-a-color",
            "tradeoff": "none", "tradeoff_text": "由 AI 决定", "tags": ["测试"],
        }]}
        choices = server.sanitize_mutation_choices(raw, weapons, 2)
        self.assertTrue(all(choice["accent_color"].startswith("#") for choice in choices))
        self.assertTrue(all(choice["mutation_round"] == 2 for choice in choices))
        self.assertEqual(choices[0]["title"], "玩家想法变体")
        self.assertEqual(choices[0]["effects"][0]["count"], 4)
        self.assertTrue(all(choice["target_index"] == 4 for choice in choices))

    def test_three_shot_burst_is_enforced_as_two_runtime_repeats(self):
        weapons = [{"name": "寂静步枪", "delivery": "projectile", "mutations": []}]
        raw = server.offline_mutations(weapons, [], 1, "把当前武器改成三连射")
        choice = server.sanitize_mutation_choices(raw, weapons, 1, "把当前武器改成三连射")[0]
        repeats = [
            rule for rule in choice["effects"]
            if rule["trigger"] == "on_attack" and rule["action"] == "repeat_attack"
        ]
        self.assertEqual(len(repeats), 1)
        self.assertEqual(repeats[0]["count"], 2)
        self.assertEqual(repeats[0]["chance"], 1)
        self.assertEqual(server.requested_burst_shots("连射三发"), 3)

    def test_mutation_recommendation_uses_live_combat_pressure(self):
        combat = server.sanitize_combat_state({"boss_active": True, "enemy_count": 8})
        wish = server.recommended_mutation_wish(
            combat, [{"name": "星轨枪", "delivery": "projectile", "mutations": []}], ["precision"], 1,
        )
        self.assertIn("星轨枪", wish)
        self.assertIn("三连射", wish)

    def test_mutation_recommendation_does_not_repeat_existing_behavior(self):
        combat = server.sanitize_combat_state({"boss_active": True, "enemy_count": 2})
        wish = server.recommended_mutation_wish(
            combat,
            [{
                "name": "脉冲器",
                "delivery": "projectile",
                "mutations": [{"effects": [{"action": "repeat_attack"}]}],
            }],
            ["precision"],
            2,
        )
        self.assertNotIn("三连射", wish)

    def test_offline_recommendation_compiles_to_matching_visible_behavior(self):
        weapons = [{"name": "星轨枪", "delivery": "projectile", "mutations": []}]
        wish = "让星轨枪命中后折返并追击另一名敌人"
        raw = server.offline_mutations(weapons, [], 2, wish)
        choice = server.sanitize_mutation_choices(raw, weapons, 2, wish)[0]
        self.assertEqual(choice["title"], "折返追击")
        self.assertEqual(choice["effects"][0]["action"], "chain")

    def test_mutation_openai_context_exposes_composable_effect_language_without_catalogue(self):
        weapons = [{
            "name": "相位双匕", "delivery": "melee", "visual_form": "daggers",
            "tags": ["近战"], "mutations": [{"title": "旧梦", "description": "一次旧异变", "effects": []}],
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
        self.assertEqual(context["weapons"][0]["existing_evolutions"][0]["title"], "旧梦")
        self.assertIs(context["effect_language"], server.EFFECT_LANGUAGE)
        self.assertNotIn("mechanic_dictionary", context)
        self.assertNotIn("compatible_mechanics", context["weapons"][0])

    def test_mutation_copy_keeps_ai_language_without_vocabulary_filters(self):
        self.assertEqual(server.mutation_copy("量子超频协议", "后备", 16, title=True), "量子超频协议")
        self.assertEqual(server.mutation_copy("一个非常长但属于玩家想法的标题", "后备", 7, title=True), "一个非常长但属")
        self.assertEqual(server.mutation_copy("", "后备", 7), "后备")


if __name__ == "__main__":
    unittest.main()
