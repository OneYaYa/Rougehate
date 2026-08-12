(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("trailer") !== "1") return;

  const body = document.body;
  body.classList.add("trailer-mode");
  audio.enabled = false;

  // Director mode records genuine Canvas combat, but protects the export from
  // showcase-only stat combinations ever producing non-finite damage text.
  let lastDamageCall = null;
  const baseDamageEnemy = damageEnemy;
  const baseFloatText = floatText;
  const baseKillEnemy = killEnemy;
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
  killEnemy = function trailerDropGuard(...args) {
    const result = baseKillEnemy(...args);
    // Drops are real gameplay, but a random cache modal can interrupt the
    // authored comeback shot. Director mode keeps the combat chain unbroken.
    pickups = [];
    xpGems = [];
    return result;
  };

  const layer = document.createElement("div");
  layer.innerHTML = `
    <div class="rh-trailer-letterbox top"></div>
    <div class="rh-trailer-letterbox bottom"></div>
    <div class="rh-trailer-vignette"></div>
    <div class="rh-trailer-badge">实机画面</div>
    <div class="rh-trailer-copy"><span class="kicker"></span><strong></strong><p></p></div>
    <div class="rh-trailer-flash"></div>
    <div class="rh-trailer-end">
      <div>
        <h1>ROUGE <i>HATE</i></h1>
        <small>立即试玩</small>
      </div>
    </div>`;
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
    }, 90);
  }

  function clearCaption() {
    copy.classList.remove("visible");
  }

  function hit(color = "#ffffff", strength = "") {
    flash.style.setProperty("--flash-color", color);
    flash.className = `rh-trailer-flash ${strength}`.trim();
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

  let cameraAnimation = 0;
  window.ROUGE_HATE_TRAILER_CAMERA = { x: 0, y: 0 };
  function cameraMove(fromX, fromY, toX, toY, duration) {
    cancelAnimationFrame(cameraAnimation);
    const started = performance.now();
    const tick = () => {
      const raw = Math.min(1, (performance.now() - started) / (duration * 1000));
      const eased = raw < .5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      window.ROUGE_HATE_TRAILER_CAMERA.x = fromX + (toX - fromX) * eased;
      window.ROUGE_HATE_TRAILER_CAMERA.y = fromY + (toY - fromY) * eased;
      if (raw < 1) cameraAnimation = requestAnimationFrame(tick);
    };
    tick();
  }

  function drive(...codes) {
    keys.clear();
    for (const code of codes) keys.add(code);
  }

  function dash(...codes) {
    drive(...codes);
    state.skillCooldown = 0;
    useArchetypeSkill();
  }

  function hideModals() {
    ui.archetypeModal.hidden = true;
    ui.upgrade.hidden = true;
    ui.forge.hidden = true;
    ui.gameOver.hidden = true;
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
    const types = [
      "asteroid_mite", "nebula_hound", "azure_beetle", "comet_larva",
      "null_reaper", "thunder_orb", "spore_mother", "singularity_eye",
    ];
    for (let index = 0; index < count; index += 1) {
      spawnEnemy(false, 0, types[index % types.length]);
      const enemy = enemies.at(-1);
      const lane = index % 8;
      const angle = index * 2.39996 + lane * .16;
      const radius = 112 + lane * 67 + (index % 3) * 18;
      enemy.x = player.x + Math.cos(angle) * radius;
      enemy.y = player.y + Math.sin(angle) * radius * .65;
      enemy.speed *= .24;
      enemy.hp = index % 4 === 0 ? 68 : 430 + lane * 48;
      enemy.maxHp = enemy.hp;
      enemy.damage = 0;
    }
    if (includeBoss) {
      spawnBoss(2);
      ui.announcement.hidden = true;
      currentBoss.x = player.x + 305;
      currentBoss.y = player.y - 70;
      currentBoss.color = "#ff5a72";
      currentBoss.damage = 0;
      currentBoss.speed = 10;
      currentBoss.hp = currentBoss.maxHp = 125000;
    }
  }

  function stageLastStand() {
    configureRun(0, false);
    weapons = [weapon({
      name: "相位残刃", delivery: "melee", visual_form: "daggers", visual_variant: 2,
      secondary_color: "#58e6ff", visual_motif: "即将熄灭的虫洞短刃",
      damage: 3, cooldown: 1.6, projectile_count: 1, projectile_size: 11,
      range: 118, spread_degrees: 45, color: "#b9f7ff", mutations: [],
    })];
    bonuses.damage = .72;
    bonuses.cooldown = 1.2;
    bonuses.area = .82;
    bonuses.projectiles = 0;
    bonuses.pierce = 0;
    spawnHorde(72, false);
    enemies.forEach((enemy, index) => {
      const angle = index / enemies.length * Math.PI * 2 + (index % 3) * .08;
      const radius = 420 + (index % 6) * 48;
      enemy.x = player.x + Math.cos(angle) * radius;
      enemy.y = player.y + Math.sin(angle) * radius * .72;
      enemy.behavior = "chaser";
      enemy.speed = 72 + (index % 5) * 8;
      enemy.hp = enemy.maxHp = 360;
      enemy.damage = 0;
    });
    player.hp = 18;
    player.invulnerable = 999;
    updateLoadoutUI();
    updateHUD();
  }

  function stageForgedComeback() {
    configureRun(2, false);
    weapons = [starSwarmWeapon()];
    bonuses.damage = 1.82;
    bonuses.cooldown = .52;
    bonuses.area = 1.42;
    bonuses.projectiles = 3;
    bonuses.pierce = 5;
    bonuses.chainChance = 1;
    bonuses.chainTargets = 8;
    bonuses.chainDamage = .88;
    bonuses.explosion = 62;
    bonuses.singularityPull = 34;
    bonuses.mutationAmp = .42;
    spawnHorde(78, false);
    enemies.forEach((enemy, index) => {
      const angle = index / enemies.length * Math.PI * 2 + (index % 4) * .11;
      const radius = 128 + (index % 9) * 43;
      enemy.x = player.x + Math.cos(angle) * radius;
      enemy.y = player.y + Math.sin(angle) * radius * .7;
      enemy.hp = enemy.maxHp = index % 3 === 0 ? 52 : 210;
      enemy.damage = 0;
    });
    player.hp = 9;
    player.invulnerable = 999;
    updateLoadoutUI();
    invalidateSynergies();
    updateSynergyUI();
    updateHUD();
  }

  function weapon(raw) {
    return hydrateWeapon({
      tradeoff: "none", tradeoff_text: "以走位维持输出窗口", homing: .35,
      pierce: 4, crit_chance: .28, knockback: 10, ...raw,
    });
  }

  function starSwarmWeapon() {
    return weapon({
      name: "遮天幼星群", delivery: "projectile", visual_form: "bow", visual_variant: 23,
      secondary_color: "#78eaff", visual_motif: "孵化后各自追猎的幼星",
      behavior_summary: "八颗幼星主动追猎敌群，命中后折返，并把雷暴留在沿途。",
      damage: 56, cooldown: .24, projectile_count: 8, projectile_speed: 680,
      projectile_size: 9, spread_degrees: 145, range: 880, homing: .72,
      trajectory: "homing", targeting: "cluster", explosion_radius: 48,
      color: "#f3e9ff", tags: ["主动追猎", "幼星", "折返", "雷暴"],
      balance_score: 181, budget: 184,
      mutations: [
        mutation("return", "归巢骨钩", "#f3e9ff"),
        mutation("ricochet", "猎犬子弹", "#b29cff"),
        mutation("split", "虫卵裂", "#8ae9ff"),
      ],
    });
  }

  function configureRun(tier, includeBoss = false) {
    hideModals();
    state.paused = false;
    state.forging = false;
    state.rewardOpen = false;
    state.running = true;
    state.stageIndex = tier >= 3 ? 2 : tier >= 2 ? 1 : 0;
    state.time = tier >= 3 ? 705 : tier >= 2 ? 438 : 164;
    state.level = tier >= 3 ? 38 : tier >= 2 ? 24 : 12;
    state.xp = 0;
    state.xpNeed = 1_000_000_000;
    state.rewardQueue = [];
    state.bossSpawned = [true, true, Boolean(includeBoss)];
    state.forgeOpened = [true, true, true, true];
    state.encounterTriggered = Array(6).fill(true);
    state.openingWaveRemaining = 0;
    player.invulnerable = 999;
    player.hp = player.maxHp;
    bonuses = createBonuses();
    bonuses.damage = tier >= 3 ? 1.38 : 1.12;
    bonuses.cooldown = tier >= 3 ? .62 : .78;
    bonuses.area = tier >= 3 ? 1.48 : 1.2;
    bonuses.range = 1.12;
    bonuses.projectiles = tier >= 3 ? 2 : 1;
    bonuses.pierce = tier >= 3 ? 3 : 1;
    bonuses.crit = tier >= 3 ? .34 : .16;
    bonuses.chainChance = tier >= 2 ? .82 : .24;
    bonuses.chainTargets = tier >= 3 ? 7 : 4;
    bonuses.chainDamage = .76;
    bonuses.explosion = tier >= 3 ? 54 : 18;
    bonuses.singularityPull = tier >= 3 ? 38 : 0;
    bonuses.singularityDeath = tier >= 3 ? .68 : 0;
    bonuses.mutationAmp = tier >= 3 ? .38 : .12;
    bonuses.moveSpeed = 1.12;

    weapons = [
      weapon({
        name: "相位双匕·归航", delivery: "melee", visual_form: "daggers", visual_variant: 2,
        secondary_color: "#58e6ff", visual_motif: "切开虫洞的双层月刃",
        damage: 64, cooldown: .31, projectile_count: 3, projectile_size: 15,
        range: 188, spread_degrees: 145, color: "#d9fbff",
        mutations: [mutation("crescent", "飞出去的赤月", "#f3e9ff"), mutation("echo", "昨天的刀光", "#58e6ff")],
      }),
      starSwarmWeapon(),
    ];
    if (tier >= 2) weapons.push(weapon({
      name: "双螺旋雷鳗", delivery: "beam", visual_form: "staff", visual_variant: 6,
      secondary_color: "#e9ffff", visual_motif: "缠绕的雷鳗脊骨",
      damage: 52, cooldown: .25, range: 920, projectile_size: 13, color: "#72eaff",
      mutations: [mutation("fork", "三叉镰", "#72eaff"), mutation("chain", "雷鳗脊骨", "#9ffcff")],
    }));
    if (tier >= 3) {
      weapons.push(weapon({
        name: "九颗虚空之眼", delivery: "orbit", visual_form: "drone", visual_variant: 21,
        secondary_color: "#160d2b", visual_motif: "沿轨道凝视的奇点眼",
        damage: 42, cooldown: .2, projectile_count: 9, projectile_size: 15,
        range: 168, color: "#73efff",
        mutations: [mutation("orbit_salvo", "发怒的卫星", "#73efff"), mutation("nova", "死星花", "#b66cff")],
      }));
      weapons.push(weapon({
        name: "没有外面的世界", delivery: "aura", visual_form: "orb", visual_variant: 21,
        secondary_color: "#0a0614", visual_motif: "吞光的奇点眼",
        damage: 70, cooldown: .36, range: 330, projectile_size: 20,
        explosion_radius: 88, slow_percent: .32, color: "#a66bff",
        mutations: [mutation("aftershock", "第二次心跳", "#a66bff"), mutation("nova", "死星花", "#ff5fc8")],
      }));
    }
    for (const item of weapons) item.forgeTier = Math.min(3, tier);
    spawnHorde(tier >= 3 ? 66 : tier >= 2 ? 48 : 28, includeBoss);
    updateLoadoutUI();
    invalidateSynergies();
    updateSynergyUI();
    updateHUD();
  }

  function showMutationChoice() {
    state.paused = true;
    state.rewardOpen = true;
    state.rewardType = "mutation";
    state.mutationRound = 3;
    ui.upgrade.hidden = false;
    ui.upgradeTitle.textContent = "选择武器进化";
    ui.upgradeSubtitle.textContent = "三选一";
    currentMutationWish = "命中后撕开虫洞，把敌群拖进雷暴。";
    currentMutationChoices = [
      {
        target_index: 1, target_name: "遮天幼星群", title: "事件视界",
        description: "把敌群拖向同一次撞击。",
        tradeoff: "cooldown_up", tradeoff_text: "攻击间隔 +10%", evolution_name: "事件视界",
        accent_color: "#a66bff", tags: ["奇点", "牵引"], mutation_round: 3, effects: [],
      },
      {
        target_index: 1, target_name: "遮天幼星群", title: "折返星潮",
        description: "贯穿后折返，再次命中。",
        tradeoff: "damage_down", tradeoff_text: "伤害 -12%", evolution_name: "折返星潮",
        accent_color: "#78eaff", tags: ["折返", "穿透"], mutation_round: 3, effects: [],
      },
      {
        target_index: 1, target_name: "遮天幼星群", title: "雷暴孵化",
        description: "每次命中都会孵化连锁雷暴。",
        tradeoff: "range_down", tradeoff_text: "距离 -10%", evolution_name: "雷暴孵化",
        accent_color: "#d8fbff", tags: ["连锁", "雷暴"], mutation_round: 3, effects: [],
      },
    ];
    renderMutationChoices();
    ui.upgrade.querySelector(".chapter").textContent = "武器异变";
    ui.upgradeSubtitle.textContent = "三选一";
    ui.upgradeOptions.querySelectorAll(".mutation-card").forEach((card, index) => {
      card.querySelector(".upgrade-icon").textContent = ["一", "二", "三"][index];
      card.querySelector(".upgrade-rarity").textContent = "进化";
    });
  }

  // 00.0–03.2 — Cold-open on the payoff. The avatar crosses the frame,
  // changes direction and dashes twice before the trailer asks for attention.
  ui.intro.classList.add("dismissed");
  selectedArchetype = defaultArchetype("会瞬移并用引力短刃切开虫洞的相位刺客");
  body.classList.add("trailer-focus-combat");
  zoom("void");
  resizeCanvas();
  configureRun(3, true);
  drive("KeyD", "KeyW");
  cameraMove(-155, 72, 150, -48, 3.05);
  later(.28, () => caption("", "写下武器。杀出去。", "", "#78eaff", "hero-copy"));
  later(1.72, clearCaption);
  later(.86, () => dash("KeyD", "KeyW"));
  later(1.58, () => drive("KeyD", "KeyS"));
  later(2.18, () => dash("KeyD", "KeyS"));

  // 03.2–06.4 — Rewind to the player's fantasy becoming a playable identity.
  later(3.18, () => {
    hit("#d8f7ff");
    drive();
    zoom();
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    state.running = false;
    state.paused = true;
    openArchetypeSelection();
    ui.archetypeInput.value = "";
    ui.archetypeCount.textContent = "0";
    ui.archetypeModal.querySelector(".chapter").textContent = "定义角色";
    ui.archetypeModal.querySelector("header h2").textContent = "你想成为什么";
    ui.archetypeModal.querySelector("header p").hidden = true;
    ui.archetypeModal.querySelector(".archetype-status span").textContent = "正在生成…";
    ui.archetypeBack.textContent = "返回";
    ui.archetypeConfirmLabel.textContent = "确认";
    ui.archetypeModal.querySelector(".archetype-heading label").textContent = "或者，描述你的角色";
    ui.archetypeModal.querySelector(".archetype-heading span").textContent = "一句话生成";
    ui.archetypeModal.querySelectorAll(".archetype-template-grid strong").forEach((label, index) => {
      label.textContent = ["近战勇士", "异星猎人", "星图术士"][index];
    });
  });
  later(3.52, () => typeInto(ui.archetypeInput, "会瞬移，用引力短刃切开虫洞的相位刺客。", 1.45));
  later(5.05, () => {
    ui.archetypeStatus.hidden = false;
    ui.archetypeConfirm.disabled = true;
    ui.archetypeConfirmLabel.textContent = "生成中…";
  });

  // 06.4–10.9 — Honest early-run survival with a long traversal and dash arc.
  later(6.38, () => {
    hit("#58e6ff");
    clearCaption();
    hideModals();
    ui.archetypeStatus.hidden = true;
    ui.archetypeConfirm.disabled = false;
    selectedArchetype = defaultArchetype("会瞬移并用引力短刃切开虫洞的相位刺客");
    resetGame();
    weapons[0].visual_variant = 13;
    weapons[0].secondary_color = "#d8f7ff";
    weapons[0].visual_motif = "旋转星图与虫洞刻痕";
    player.invulnerable = 30;
    state.time = 18;
    spawnHorde(16, false);
    body.classList.add("trailer-focus-combat");
    zoom("chaos");
    resizeCanvas();
    drive("KeyD");
    cameraMove(-150, 48, 145, -38, 4.35);
    caption("", "走位。冲刺。活下去。", "", "#58e6ff", "compact-hero-copy");
  });
  later(7.22, () => dash("KeyD", "KeyW"));
  later(8.08, () => drive("KeyD", "KeyS"));
  later(8.38, clearCaption);
  later(8.92, () => dash("KeyD", "KeyS"));
  later(9.72, () => drive("KeyD", "KeyW"));
  later(10.32, () => dash("KeyD", "KeyW"));

  // 10.9–13.9 — A readable roguelite decision instead of another smash cut.
  later(10.88, () => {
    hit("#ffd166");
    drive();
    cameraMove(0, 0, 0, 0, .2);
    zoom();
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    state.level = 7;
    openUpgrade("upgrade");
    ui.upgrade.querySelector(".chapter").textContent = "选择强化";
    ui.upgradeTitle.textContent = "构筑本局";
    ui.upgradeSubtitle.textContent = "三选一";
    ui.upgradeOptions.querySelectorAll(".upgrade-rarity").forEach((label) => {
      label.textContent = label.textContent.split("/").at(-1).trim();
    });
  });

  // 13.9–19.3 — The fantasy collapses into a last stand: the build stalls,
  // health is nearly gone, and a dense ring visibly closes around the player.
  later(13.88, () => {
    hit("#ff365f");
    clearCaption();
    stageLastStand();
    body.classList.add("trailer-focus-combat");
    body.classList.add("trailer-critical");
    zoom("chaos");
    resizeCanvas();
    drive("KeyD");
    cameraMove(-112, -18, 96, 32, 5.1);
    caption("", "退无可退。", "", "#ff5a72", "compact-hero-copy");
  });
  later(14.64, () => dash("KeyD", "KeyW"));
  later(15.42, clearCaption);
  later(15.55, () => drive("KeyS"));
  later(16.18, () => dash("KeyS"));
  later(16.92, () => drive("KeyA", "KeyS"));
  later(17.42, () => {
    player.hp = 9;
    updateHUD();
    hit("#ff365f", "soft");
    caption("", "只剩一个愿望。", "", "#ff5a72", "compact-hero-copy");
  });
  later(18.54, () => {
    drive();
    clearCaption();
  });

  // 19.3–25.2 — The player writes the answer, AI forges it, and the result lands.
  later(19.28, () => {
    hit("#ff365f");
    drive();
    zoom("forge");
    body.classList.remove("trailer-critical");
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    openForge(4);
    ui.forge.querySelector(".forge-rail span").textContent = "异梦";
    ui.forgeTitle.textContent = "最后一次锻造";
    ui.forge.querySelector(".forge-header .chapter").textContent = "AI 武器锻造";
    ui.forge.querySelector(".forge-header p").hidden = true;
    ui.forge.querySelector(".wish-form label").textContent = "描述你想要的武器";
    ui.forgeButton.querySelector("span:not(.button-icon)").textContent = "开始锻造";
    ui.forgeButton.querySelector("small").textContent = "";
  });
  later(19.78, () => typeInto(ui.wishInput, "八颗幼星主动追猎，贯穿折返，沿途孵化雷暴。", 2.02));
  later(22.02, () => {
    ui.forgeButton.classList.add("trailer-ready");
    hit("#f3e9ff", "soft");
  });
  later(22.48, () => {
    clearCaption();
    ui.forgeButton.classList.remove("trailer-ready");
    ui.wishForm.hidden = true;
    previewWeapon = starSwarmWeapon();
    showWeaponResult(previewWeapon, ["投射数量与追踪强度已按终局预算稳定"]);
    ui.resultName.textContent = "遮天幼星群";
    ui.resultDescription.textContent = "追猎。贯穿。折返。雷暴。";
    ui.resultTradeoff.textContent = "必须持续移动";
    ui.balanceNote.hidden = true;
    ui.accept.textContent = "装备";
    ui.resultDelivery.textContent = "投射武器";
    ["伤害", "间隔", "数量", "距离", "轨迹", "强度"].forEach((text, index) => {
      const label = ui.resultStats.querySelectorAll(".result-stat span")[index];
      if (label) label.textContent = text;
    });
    const trajectoryValue = ui.resultStats.querySelectorAll(".result-stat strong")[4];
    if (trajectoryValue) trajectoryValue.textContent = "主动追踪";
    ["# 追猎", "# 幼星", "# 折返", "# 雷暴"].forEach((text, index) => {
      const tag = ui.resultTags.children[index];
      if (tag) tag.textContent = text;
    });
    const costLabel = ui.resultTradeoff.parentElement?.querySelector("span");
    if (costLabel) costLabel.textContent = "代价";
  });

  // 25.2–31.1 — Return to the same low-health pressure and let the forged
  // weapon tear open the encirclement on its own.
  later(25.15, () => {
    hit("#78eeff");
    clearCaption();
    stageForgedComeback();
    body.classList.add("trailer-focus-combat");
    zoom("storm");
    resizeCanvas();
    drive("KeyD", "KeyW");
    cameraMove(-165, 62, 158, -55, 5.55);
    caption("", "反击开始。", "", "#78eeff", "compact-hero-copy");
  });
  later(25.92, () => dash("KeyD", "KeyW"));
  later(26.72, clearCaption);
  later(26.84, () => drive("KeyD", "KeyS"));
  later(27.62, () => dash("KeyD", "KeyS"));
  later(28.42, () => drive("KeyD", "KeyW"));
  later(29.18, () => dash("KeyD", "KeyW"));
  later(30.02, () => drive("KeyD", "KeyS"));
  later(30.58, () => dash("KeyD", "KeyS"));

  // 31.1–34.4 — The same weapon can keep mutating during the run.
  later(31.05, () => {
    hit("#b06cff");
    drive();
    zoom();
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    showMutationChoice();
  });
  later(33.74, () => {
    const cards = ui.upgradeOptions.querySelectorAll(".mutation-card");
    cards[0]?.classList.add("trailer-selected");
  });

  // 34.4–40.1 — Final escalation: five weapons, full movement and the boss.
  later(34.35, () => {
    hit("#ffffff");
    clearCaption();
    configureRun(3, true);
    body.classList.add("trailer-focus-combat");
    zoom("boss");
    resizeCanvas();
    drive("KeyD", "KeyS");
    cameraMove(-168, -58, 160, 48, 5.05);
    caption("", "五件武器。杀出去。", "", "#ff5a72", "boss-copy");
  });
  later(35.08, () => dash("KeyD", "KeyS"));
  later(36.12, clearCaption);
  later(36.02, () => drive("KeyD", "KeyW"));
  later(36.82, () => dash("KeyD", "KeyW"));
  later(37.62, () => drive("KeyD", "KeyS"));
  later(38.28, () => dash("KeyD", "KeyS"));
  later(39.12, () => {
    drive("KeyD", "KeyW");
    state.skillCooldown = 0;
    useArchetypeSkill();
    effects.push({ type: "screen", color: "#ffffff", life: .16, maxLife: .16 });
    state.shake = Math.max(state.shake, 18);
  });

  // 40.1–43.2 — Clean, legible CTA hold.
  later(40.1, () => {
    hit("#ffffff");
    drive();
    zoom();
    state.paused = true;
    hideModals();
    clearCaption();
    endCard.classList.add("visible");
  });
  later(43.22, () => {
    window.ROUGE_HATE_TRAILER_CAMERA = { x: 0, y: 0 };
    document.documentElement.dataset.trailerComplete = "1";
  });
})();
