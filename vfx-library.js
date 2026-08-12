"use strict";

// 24 hand-authored visual signatures × 9 weapon chassis = 216 auditable VFX
// recipes. A signature changes silhouette, motion trace, cast tell, impact and
// decay; color is intentionally not part of recipe identity.
(() => {
  const chassis = ["rifle", "cannon", "blade", "daggers", "bow", "staff", "orb", "tome", "drone"];
  const profiles = [
    ["needle", "星针", "needle", "streak", "tracer", "pin", "snap", "precision", "reticle", "dart"],
    ["broadhead", "宽刃", "broadhead", "feathers", "arrow", "cross", "draw", "cleave", "petals", "wing"],
    ["crescent", "月牙", "crescent", "ribbon", "crescent", "mooncut", "sweep", "crescent", "moons", "arc"],
    ["comet", "彗核", "comet", "embers", "lance", "crater", "charge", "breaker", "shockwave", "flare"],
    ["crystal", "晶簇", "shard", "shards", "prism", "shatter", "fracture", "shards", "crystals", "facet"],
    ["spore", "孢囊", "orb", "spores", "spores", "bloom", "pulse", "petals", "spores", "pod"],
    ["helix", "双螺旋", "helix", "spiral", "helix", "coil", "coil", "helix", "spiral", "double"],
    ["saw", "星锯", "saw", "sparks", "saw", "sawburst", "rev", "serrated", "gears", "tooth"],
    ["thorn", "棘芽", "thorn", "droplets", "segmented", "thornburst", "sprout", "thorn", "bramble", "barb"],
    ["moth", "星蛾", "butterfly", "motes", "petals", "wingburst", "flutter", "butterfly", "wings", "antenna"],
    ["serpent", "蛇电", "serpent", "zigzag", "chain", "bite", "hiss", "whip", "scales", "fang"],
    ["satellite", "伴星", "satellite", "rings", "orbit", "satellite", "deploy", "orbit", "orbits", "dish"],
    ["meteor", "天坠", "meteor", "smoke", "rail", "pillar", "descend", "breaker", "crater", "fin"],
    ["rune", "古字", "rune", "glyphs", "runes", "glyph", "inscribe", "sigil", "runes", "script"],
    ["tidal", "潮汐", "wave", "bubbles", "tidal", "splash", "surge", "wave", "ripples", "crest"],
    ["halo", "圣环", "ring", "afterimage", "braid", "halo", "open", "halo", "halos", "crown"],
    ["drill", "穿星钻", "drill", "dust", "drill", "bore", "bore", "drill", "gears", "auger"],
    ["star", "裂星", "star", "constellation", "constellation", "starburst", "flare", "star", "stars", "ray"],
    ["fang", "噬月牙", "fang", "scales", "ember", "fang", "bite", "fang", "teeth", "jaw"],
    ["prism", "棱镜", "prism", "echo", "prism", "refraction", "refract", "facet", "prisms", "lens"],
    ["capsule", "弹仓", "capsule", "streak", "capsule", "casing", "eject", "burst", "cartridges", "magazine"],
    ["void", "空洞", "singularity", "void", "singularity", "implode", "collapse", "void", "singularity", "eye"],
    ["trident", "三叉星", "trident", "braid", "wave", "trident", "fork", "trident", "currents", "fork"],
    ["swarm", "幼星群", "swarm", "motes", "segmented", "swarm", "hatch", "swarm", "swarms", "hive"],
  ].map(([id, label, projectile, trail, beam, impact, cast, slash, aura, attachment], index) => ({
    id, label, index, projectile, trail, beam, impact, cast, slash, aura, attachment,
    timing: ["snap", "linger", "pulse", "accelerate"][index % 4],
    valueShape: ["hard", "soft", "core", "hollow"][Math.floor(index / 4) % 4],
  }));

  const recipes = Object.freeze(Object.fromEntries(chassis.flatMap((form) => profiles.map((profile) => {
    const key = `${form}:${profile.index}`;
    return [key, Object.freeze({
      ...profile,
      key,
      form,
      signature: `${form}/${profile.id}/${profile.projectile}/${profile.trail}/${profile.beam}/${profile.impact}`,
    })];
  }))));

  function getRecipe(weapon = {}) {
    const form = chassis.includes(weapon.visual_form) ? weapon.visual_form : "rifle";
    const variant = Math.max(0, Math.min(23, Number(weapon.visual_variant) || 0));
    return recipes[`${form}:${variant}`];
  }

  window.ROUGE_VFX_LIBRARY = Object.freeze({
    chassis: Object.freeze(chassis),
    profiles: Object.freeze(profiles),
    recipes,
    count: Object.keys(recipes).length,
    getRecipe,
  });
})();
