(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("trailer") !== "1") return;

  const body = document.body;
  body.classList.add("trailer-mode");
  audio.enabled = false;

  // Keep capture frames clean and expose the exact source if a showcase-only
  // combination ever produces a non-finite combat number.
  let lastDamageCall = null;
  const baseDamageEnemy = damageEnemy;
  const baseFloatText = floatText;
  damageEnemy = function trailerDamageGuard(enemy, amount, sourceWeapon, ...rest) {
    lastDamageCall = {
      amount, weapon: sourceWeapon?.name, delivery: sourceWeapon?.delivery,
      damage: sourceWeapon?.damage, crit: sourceWeapon?.crit_chance,
    };
    if (!Number.isFinite(amount)) {
      document.documentElement.dataset.trailerBadDamage = JSON.stringify(lastDamageCall);
      return;
    }
    return baseDamageEnemy(enemy, amount, sourceWeapon, ...rest);
  };
  floatText = function trailerFloatGuard(x, y, text, color, large) {
    if (String(text) === "NaN") {
      document.documentElement.dataset.trailerBadDamage = JSON.stringify(lastDamageCall || {});
      return;
    }
    return baseFloatText(x, y, text, color, large);
  };

  const layer = document.createElement("div");
  layer.innerHTML = `
    <div class="rh-trailer-letterbox top"></div>
    <div class="rh-trailer-letterbox bottom"></div>
    <div class="rh-trailer-vignette"></div>
    <div class="rh-trailer-badge">REAL-TIME GAMEPLAY</div>
    <div class="rh-trailer-copy"><span class="kicker"></span><strong></strong><p></p></div>
    <div class="rh-trailer-flash"></div>
    <div class="rh-trailer-end"><div><h1>ROUGE <i>HATE</i></h1><p>说出你的武器</p></div></div>`;
  document.body.append(layer);

  const copy = layer.querySelector(".rh-trailer-copy");
  const flash = layer.querySelector(".rh-trailer-flash");
  const endCard = layer.querySelector(".rh-trailer-end");
  const later = (seconds, task) => window.setTimeout(task, seconds * 1000);

  function caption(kicker, title, subtitle = "", accent = "#58e6ff", placement = "") {
    copy.classList.remove("visible");
    window.setTimeout(() => {
      copy.className = `rh-trailer-copy ${placement}`.trim();
      copy.style.setProperty("--copy-accent", accent);
      copy.querySelector(".kicker").textContent = kicker;
      copy.querySelector("strong").textContent = title;
      copy.querySelector("p").textContent = subtitle;
      copy.classList.add("visible");
    }, 70);
  }

  function hit(color = "#ffffff") {
    flash.style.setProperty("--flash-color", color);
    flash.classList.remove("fire");
    void flash.offsetWidth;
    flash.classList.add("fire");
    body.classList.add("trailer-punch");
    window.setTimeout(() => body.classList.remove("trailer-punch"), 520);
  }

  const zoomClasses = [
    "trailer-zoom-chaos", "trailer-zoom-boss", "trailer-zoom-forge",
    "trailer-zoom-storm", "trailer-zoom-sun", "trailer-zoom-void",
  ];

  function zoom(mode = "") {
    body.classList.remove(...zoomClasses);
    if (mode) body.classList.add("trailer-zoom-" + mode);
  }

  function typeInto(input, text, duration) {
    input.value = "";
    const started = performance.now();
    const tick = () => {
      const ratio = Math.min(1, (performance.now() - started) / (duration * 1000));
      input.value = text.slice(0, Math.ceil(text.length * ratio));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      if (ratio < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  function mutation(mechanic, title, color) {
    return { mechanic, title, color, round: 3 };
  }

  function spawnHorde(count, includeBoss = false) {
    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    effects = [];
    particles = [];
    pendingAttacks = [];
    currentBoss = null;
    const types = ["asteroid_mite", "nebula_hound", "azure_beetle", "comet_larva", "null_reaper", "thunder_orb", "spore_mother", "singularity_eye"];
    for (let index = 0; index < count; index += 1) {
      spawnEnemy(false, 0, types[index % types.length]);
      const enemy = enemies.at(-1);
      const lane = index % 7;
      const angle = index * 2.39996 + lane * .19;
      const radius = 118 + lane * 74 + (index % 3) * 22;
      enemy.x = player.x + Math.cos(angle) * radius;
      enemy.y = player.y + Math.sin(angle) * radius * .66;
      enemy.speed *= .22;
      const fragile = index % 4 === 0;
      enemy.hp = fragile ? 60 : 520 + lane * 55;
      enemy.maxHp = enemy.hp;
      enemy.damage = 0;
    }
    if (includeBoss) {
      spawnBoss(2);
      ui.announcement.hidden = true;
      currentBoss.x = player.x + 285;
      currentBoss.y = player.y - 55;
      currentBoss.color = "#ad58ff";
      currentBoss.damage = 0;
      currentBoss.speed = 8;
      currentBoss.hp = currentBoss.maxHp = 120000;
    }
  }

  function weapon(raw) {
    return hydrateWeapon({
      tradeoff: "none", tradeoff_text: "预告片导演模式", homing: .35,
      pierce: 4, crit_chance: .28, knockback: 10, ...raw,
    });
  }

  function setBuild(kind) {
    state.paused = false;
    state.forging = false;
    state.rewardOpen = false;
    state.running = true;
    state.stageIndex = 2;
    state.time = 705;
    state.level = 38;
    state.xp = 0;
    state.xpNeed = 1_000_000_000;
    state.rewardQueue = [];
    state.bossSpawned = [true, true, true];
    state.forgeOpened = [true, true, true, true];
    state.encounterTriggered = Array(6).fill(true);
    state.openingWaveRemaining = 0;
    player.invulnerable = 999;
    player.hp = player.maxHp;
    ui.upgrade.hidden = true;
    bonuses = createBonuses();
    bonuses.damage = 1.28;
    bonuses.cooldown = .7;
    bonuses.area = 1.32;
    bonuses.range = 1.12;
    bonuses.projectiles = 2;
    bonuses.pierce = 3;
    bonuses.crit = .34;
    bonuses.chainChance = .88;
    bonuses.chainTargets = 7;
    bonuses.chainDamage = .82;
    bonuses.explosion = 26;
    bonuses.burnSpread = .9;
    bonuses.singularityPull = 18;
    bonuses.singularityDeath = .46;
    bonuses.mutationAmp = .38;

    if (kind === "storm") {
      weapons = [
        weapon({ name: "双螺旋雷鳗", delivery: "beam", visual_form: "staff", visual_variant: 6, secondary_color: "#e9ffff", visual_motif: "缠绕的雷鳗脊骨", damage: 52, cooldown: .24, range: 920, projectile_size: 13, color: "#72eaff", mutations: [mutation("fork", "三棱镜", "#72eaff"), mutation("chain", "雷鳗脊骨", "#9ffcff"), mutation("echo", "昨天的枪声", "#c9a5ff")] }),
        weapon({ name: "三叉雷卵炮", delivery: "projectile", visual_form: "cannon", visual_variant: 22, secondary_color: "#7c8cff", visual_motif: "三叉状电浆弹头", damage: 34, cooldown: .28, projectile_count: 7, projectile_speed: 570, projectile_size: 8, spread_degrees: 116, range: 700, color: "#b7ffef", mutations: [mutation("split", "虫卵弹", "#b7ffef"), mutation("ricochet", "猎犬子弹", "#7cf29a")] }),
        weapon({ name: "伴星雷暴阵列", delivery: "orbit", visual_form: "drone", visual_variant: 11, secondary_color: "#f3f7ff", visual_motif: "环形伴星天线", damage: 31, cooldown: .22, projectile_count: 7, projectile_size: 13, range: 112, color: "#8aa7ff", mutations: [mutation("orbit_salvo", "发怒的卫星", "#8aa7ff"), mutation("chain", "雷鳗脊骨", "#72eaff")] }),
        weapon({ name: "裂星雷心", delivery: "aura", visual_form: "orb", visual_variant: 17, secondary_color: "#ff9fe7", visual_motif: "八芒星雷电核心", damage: 46, cooldown: .46, range: 245, projectile_size: 12, color: "#bd7dff", mutations: [mutation("aftershock", "第二次心跳", "#bd7dff"), mutation("nova", "死星花", "#ff8aef")] }),
      ];
    } else if (kind === "sun") {
      bonuses.explosion = 72;
      bonuses.burn = 12;
      bonuses.burnSpread = 1.4;
      weapons = [
        weapon({ name: "怀孕的彗核", delivery: "projectile", visual_form: "cannon", visual_variant: 3, secondary_color: "#fff5b8", visual_motif: "拖曳日珥的彗星核心", damage: 76, cooldown: .34, projectile_count: 9, projectile_speed: 430, projectile_size: 12, spread_degrees: 210, range: 650, explosion_radius: 92, burn_damage: 16, color: "#ffb347", mutations: [mutation("split", "虫卵弹", "#ffd166"), mutation("nova", "死星花", "#ff6f45")] }),
        weapon({ name: "众生圣环火葬", delivery: "aura", visual_form: "orb", visual_variant: 15, secondary_color: "#ffd166", visual_motif: "重叠的日冕圣环", damage: 62, cooldown: .38, range: 270, projectile_size: 16, explosion_radius: 70, burn_damage: 20, color: "#ff4f63", mutations: [mutation("aftershock", "第二次心跳", "#ff4f63"), mutation("nova", "死星花", "#ffb347")] }),
        weapon({ name: "飞出去的赤月", delivery: "melee", visual_form: "blade", visual_variant: 2, secondary_color: "#ff5e44", visual_motif: "燃烧的双层月牙", damage: 94, cooldown: .3, projectile_count: 3, projectile_size: 18, range: 210, spread_degrees: 150, explosion_radius: 46, color: "#ffe0a3", mutations: [mutation("crescent", "飞出去的月牙", "#ffe0a3"), mutation("echo", "昨天的刀光", "#ff8066")] }),
        weapon({ name: "日冕星蛾群", delivery: "orbit", visual_form: "drone", visual_variant: 9, secondary_color: "#fff4c2", visual_motif: "张合发光翅翼的星蛾", damage: 40, cooldown: .2, projectile_count: 8, projectile_size: 14, range: 145, explosion_radius: 38, burn_damage: 12, color: "#ff8a38", mutations: [mutation("orbit_salvo", "发怒的卫星", "#ff8a38"), mutation("nova", "死星花", "#ffe36a")] }),
      ];
    } else {
      bonuses.area = 1.55;
      bonuses.explosion = 48;
      bonuses.singularityPull = 42;
      bonuses.singularityDeath = .72;
      weapons = [
        weapon({ name: "没有外面的世界", delivery: "aura", visual_form: "orb", visual_variant: 21, secondary_color: "#0a0614", visual_motif: "吞光的奇点眼", damage: 70, cooldown: .34, range: 330, projectile_size: 20, explosion_radius: 88, slow_percent: .32, color: "#a66bff", mutations: [mutation("aftershock", "第二次心跳", "#a66bff"), mutation("nova", "死星花", "#ff5fc8"), mutation("chain", "雷鳗脊骨", "#6ee7ff")] }),
        weapon({ name: "遮天幼星群", delivery: "projectile", visual_form: "bow", visual_variant: 23, secondary_color: "#78eaff", visual_motif: "孵化后各自追猎的幼星", damage: 56, cooldown: .22, projectile_count: 8, projectile_speed: 680, projectile_size: 9, spread_degrees: 145, range: 880, homing: .72, explosion_radius: 48, color: "#f3e9ff", mutations: [mutation("return", "归巢骨钩", "#f3e9ff"), mutation("ricochet", "猎犬子弹", "#b29cff"), mutation("split", "虫卵弹", "#8ae9ff")] }),
        weapon({ name: "盲星棱镜", delivery: "beam", visual_form: "staff", visual_variant: 19, secondary_color: "#7edcff", visual_motif: "分光的深空晶棱", damage: 64, cooldown: .26, range: 980, projectile_size: 16, color: "#cf73ff", mutations: [mutation("fork", "三棱镜", "#cf73ff"), mutation("echo", "昨天的枪声", "#7edcff"), mutation("chain", "雷鳗脊骨", "#7edcff")] }),
        weapon({ name: "九颗虚空之眼", delivery: "orbit", visual_form: "drone", visual_variant: 21, secondary_color: "#160d2b", visual_motif: "沿轨道凝视的奇点眼", damage: 42, cooldown: .18, projectile_count: 9, projectile_size: 15, range: 168, color: "#73efff", mutations: [mutation("orbit_salvo", "发怒的卫星", "#73efff"), mutation("nova", "死星花", "#b66cff")] }),
      ];
    }

    for (const item of weapons) item.forgeTier = 3;
    spawnHorde(kind === "void" ? 68 : 58, kind === "void");
    updateLoadoutUI();
    invalidateSynergies();
    updateSynergyUI();
    updateHUD();
    useArchetypeSkill();
  }

  // 0.0–0.52: a micro cold-open from the payoff. Short-form trailers need
  // their strongest readable image before asking the viewer to follow setup.
  ui.intro.classList.add("dismissed");
  selectedArchetype = defaultArchetype("操纵星核、雷电与引力的星图法师");
  body.classList.add("trailer-focus-combat");
  zoom("chaos");
  resizeCanvas();
  setBuild("void");
  copy.classList.remove("visible");

  // 0.52–1.9: rewind to the player's fantasy becoming a role.
  later(.52, () => {
    hit("#d8f7ff");
    zoom();
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    state.running = false;
    state.paused = true;
    openArchetypeSelection();
    ui.archetypeInput.value = "";
    ui.archetypeCount.textContent = "0";
    copy.classList.remove("visible");
  });
  later(.64, () => typeInto(ui.archetypeInput, "操纵星核、雷电与引力的星图法师", .74));
  later(1.38, () => {
    ui.archetypeStatus.hidden = false;
    ui.archetypeConfirm.disabled = true;
    ui.archetypeConfirmLabel.textContent = "正在让幻想拥有形状";
  });

  // 1.9–3.8: honest early-game footage.
  later(1.86, () => {
    hit("#d8f7ff");
    ui.archetypeStatus.hidden = true;
    ui.archetypeConfirm.disabled = false;
    ui.archetypeModal.hidden = true;
    selectedArchetype = defaultArchetype("操纵星核、雷电与引力的星图法师");
    resetGame();
    weapons[0].visual_variant = 13;
    weapons[0].secondary_color = "#d8f7ff";
    weapons[0].visual_motif = "旋转星图与古代符文";
    player.invulnerable = 30;
    state.time = 17;
    keys.add("KeyD");
    keys.add("KeyW");
    copy.classList.remove("visible");
  });
  later(3.45, () => keys.clear());

  // 3.8–5.25: the final singularity and closing horde.
  later(3.78, () => {
    hit("#a95cff");
    zoom("boss");
    body.classList.add("trailer-focus-combat");
    resizeCanvas();
    state.stageIndex = 2;
    state.time = 700;
    state.bossSpawned = [true, true, false];
    state.encounterTriggered = Array(6).fill(true);
    state.openingWaveRemaining = 0;
    spawnHorde(38, true);
    state.bossSpawned = [true, true, true];
    player.invulnerable = 999;
    copy.classList.remove("visible");
  });

  // 5.25–7.35: type a weapon wish over the surrounded battlefield.
  later(5.18, () => {
    hit("#ff365f");
    zoom("forge");
    openForge(4);
    copy.classList.remove("visible");
  });
  later(5.58, () => typeInto(ui.wishInput, "制造一颗吞噬全屏敌人，再分裂成雷暴的微型恒星", 1.28));
  later(6.86, () => ui.forgeButton.classList.add("trailer-ready"));

  // 7.35–12.75: three increasingly loud endgame builds.
  later(7.28, () => {
    hit("#78eeff");
    ui.forgeButton.classList.remove("trailer-ready");
    ui.forge.hidden = true;
    zoom("storm");
    setBuild("storm");
    caption("01", "雷暴", "", "#72eaff", "compact-copy");
  });
  later(9.05, () => {
    hit("#ffb347");
    zoom("sun");
    setBuild("sun");
    caption("02", "恒星", "", "#ff9c45", "compact-copy");
  });
  later(10.82, () => {
    hit("#b06cff");
    zoom("void");
    setBuild("void");
    caption("03", "奇点", "", "#c477ff", "compact-copy");
  });

  // 12.75–14.15: clean logo hold.
  later(12.72, () => {
    hit("#ffffff");
    zoom();
    state.paused = true;
    ui.upgrade.hidden = true;
    ui.forge.hidden = true;
    copy.classList.remove("visible");
    endCard.classList.add("visible");
  });
  later(14.18, () => {
    document.documentElement.dataset.trailerComplete = "1";
  });
})();
