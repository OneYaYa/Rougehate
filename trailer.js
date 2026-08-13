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
  const baseBurst = burst;
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
  burst = function trailerBurstBudget(x, y, color, count, speed) {
    return baseBurst(x, y, color, Math.min(Number(count) || 0, 6), speed);
  };

  const layer = document.createElement("div");
  layer.innerHTML = `
    <div class="rh-trailer-vignette"></div>
    <div class="rh-trailer-badge">实机画面</div>
    <div class="rh-trailer-copy"><span class="kicker"></span><strong></strong><p></p></div>
    <section class="rh-trailer-patrons" aria-label="七位宇宙赐福者">
      <div class="rh-patron-roster">
        <figure class="patron-blind-star"><img src="assets/patrons/blind-star.webp" alt=""><figcaption>盲星</figcaption></figure>
        <figure class="patron-white-raven"><img src="assets/patrons/white-raven.webp" alt=""><figcaption>白鸦</figcaption></figure>
        <figure class="patron-red-sun"><img src="assets/patrons/red-sun.webp" alt=""><figcaption>赤日</figcaption></figure>
        <figure class="patron-sleeping-moon"><img src="assets/patrons/sleeping-moon.webp" alt=""><figcaption>眠月</figcaption></figure>
        <figure class="patron-spore-mother"><img src="assets/patrons/spore-mother.webp" alt=""><figcaption>孢母</figcaption></figure>
        <figure class="patron-thunder-beast"><img src="assets/patrons/thunder-beast.webp" alt=""><figcaption>雷兽</figcaption></figure>
        <figure class="patron-stargazer"><img src="assets/patrons/stargazer.webp" alt=""><figcaption>观星人</figcaption></figure>
      </div>
      <div class="rh-patron-roster-copy">
        <span>COSMIC PATRONS / 宇宙赐福者</span>
        <strong>7 位独特宇宙神祇</strong>
        <p>63 项专属赐福 · 双神联动 · 传奇赐福</p>
      </div>
    </section>
    <div class="rh-trailer-flash"></div>
    <div class="rh-trailer-end">
      <div>
        <h1>ROUGE <i>HATE</i></h1>
        <small>立即试玩</small>
      </div>
    </div>`;
  document.body.append(layer);

  const copy = layer.querySelector(".rh-trailer-copy");
  const patronRoster = layer.querySelector(".rh-trailer-patrons");
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

  function clearCombatResidue() {
    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    effects = [];
    particles = [];
    pendingAttacks = [];
    currentBoss = null;
  }

  function showPatronRoster() {
    state.paused = true;
    hideModals();
    clearCaption();
    patronRoster.classList.add("visible");
  }

  function hidePatronRoster() {
    patronRoster.classList.remove("visible");
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
      enemy.speed *= .62;
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

  function seedEnemyBarrage(colors, ringCount = 4, shotsPerRing = 18, speed = 108) {
    enemyProjectiles = [];
    for (let ring = 0; ring < ringCount; ring += 1) {
      const radius = 245 + ring * 112;
      const count = shotsPerRing + ring * 2;
      for (let index = 0; index < count; index += 1) {
        const angle = index / count * Math.PI * 2 + ring * .31;
        const curve = (index % 2 ? 1 : -1) * (.09 + ring * .015);
        const velocityAngle = angle + Math.PI + curve;
        const projectileSpeed = speed + ring * 14;
        enemyProjectiles.push({
          x: player.x + Math.cos(angle) * radius,
          y: player.y + Math.sin(angle) * radius * .72,
          vx: Math.cos(velocityAngle) * projectileSpeed,
          vy: Math.sin(velocityAngle) * projectileSpeed * .72,
          radius: 5 + ring * .32,
          damage: 0,
          color: colors[(index + ring) % colors.length],
          life: 7,
          phase: angle,
          dead: false,
        });
      }
    }
  }

  function trailerNoise(index, salt = 0) {
    const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  function seedAmbushBarrage() {
    enemyProjectiles = [];
    const lanes = [
      { angle: -2.48, count: 11, color: "#ff5a72", distance: 440 },
      { angle: -.18, count: 9, color: "#ff9b54", distance: 525 },
      { angle: 1.88, count: 8, color: "#b66cff", distance: 485 },
    ];
    lanes.forEach((lane, laneIndex) => {
      for (let index = 0; index < lane.count; index += 1) {
        const lateral = (index - (lane.count - 1) / 2) * (19 + laneIndex * 3);
        const distance = lane.distance + trailerNoise(index, laneIndex + 8) * 190;
        const normalX = -Math.sin(lane.angle);
        const normalY = Math.cos(lane.angle);
        const x = player.x + Math.cos(lane.angle) * distance + normalX * lateral;
        const y = player.y + Math.sin(lane.angle) * distance + normalY * lateral;
        const aim = Math.atan2(player.y - y, player.x - x) + (trailerNoise(index, laneIndex + 14) - .5) * .16;
        const speed = 104 + trailerNoise(index, laneIndex + 21) * 82;
        enemyProjectiles.push({
          x, y,
          vx: Math.cos(aim) * speed,
          vy: Math.sin(aim) * speed,
          radius: 4.2 + trailerNoise(index, laneIndex + 31) * 2.2,
          damage: 0,
          color: lane.color,
          life: 6.5,
          phase: index * .47 + laneIndex,
          dead: false,
        });
      }
    });
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
    spawnHorde(56, false);
    const packs = [
      { angle: -2.5, spread: .78, near: 235, speed: 108 },
      { angle: -.12, spread: .58, near: 330, speed: 91 },
      { angle: 1.9, spread: .72, near: 285, speed: 99 },
      { angle: 2.72, spread: .34, near: 465, speed: 126 },
    ];
    enemies.forEach((enemy, index) => {
      const pack = packs[index % packs.length];
      const angle = pack.angle + (trailerNoise(index, 2) - .5) * pack.spread;
      const radius = pack.near + trailerNoise(index, 5) * 310 + Math.floor(index / packs.length) * 4;
      enemy.x = player.x + Math.cos(angle) * radius;
      enemy.y = player.y + Math.sin(angle) * radius;
      if (index % 9 === 0) enemy.behavior = "charger";
      else if (index % 5 === 0) enemy.behavior = "flanker";
      else enemy.behavior = "chaser";
      enemy.speed = pack.speed * (.78 + trailerNoise(index, 11) * .48);
      enemy.abilityTimer = .35 + trailerNoise(index, 19) * 1.4;
      enemy.hp = enemy.maxHp = 360;
      enemy.damage = 0;
    });
    seedAmbushBarrage();
    player.hp = 18;
    player.invulnerable = 999;
    updateLoadoutUI();
    updateHUD();
  }

  function stageForgedComeback() {
    configureRun(2, false);
    weapons = [starSwarmWeapon()];
    weapons[0].cooldown = .72;
    weapons[0].projectile_count = 3;
    weapons[0].damage = 88;
    weapons[0].explosion_radius = 28;
    weapons[0].timer = .3;
    bonuses.damage = 1.64;
    bonuses.cooldown = .82;
    bonuses.area = 1.28;
    bonuses.projectiles = 0;
    bonuses.pierce = 2;
    bonuses.chainChance = 0;
    bonuses.chainTargets = 0;
    bonuses.chainDamage = .72;
    bonuses.explosion = 12;
    bonuses.singularityPull = 0;
    bonuses.mutationAmp = .12;
    spawnHorde(34, false);
    const comebackPacks = [
      { x: -245, y: -145, spreadX: 250, spreadY: 175 },
      { x: 65, y: -285, spreadX: 265, spreadY: 155 },
      { x: 305, y: -55, spreadX: 235, spreadY: 190 },
      { x: 185, y: 255, spreadX: 270, spreadY: 175 },
      { x: -220, y: 230, spreadX: 235, spreadY: 185 },
    ];
    enemies.forEach((enemy, index) => {
      const pack = comebackPacks[index % comebackPacks.length];
      enemy.x = player.x + pack.x + (trailerNoise(index, 41) - .5) * pack.spreadX;
      enemy.y = player.y + pack.y + (trailerNoise(index, 47) - .5) * pack.spreadY;
      enemy.speed = 74 + trailerNoise(index, 53) * 52;
      enemy.behavior = index % 7 === 0 ? "charger" : index % 4 === 0 ? "flanker" : "chaser";
      enemy.hp = enemy.maxHp = index % 5 === 0 ? 90 : 1800;
      enemy.damage = 0;
    });
    player.hp = 9;
    player.invulnerable = 999;
    updateLoadoutUI();
    invalidateSynergies();
    updateSynergyUI();
    updateHUD();
  }

  function prepareLateBuild(arsenal, colors, includeBoss = false, count = 52) {
    configureRun(3, includeBoss);
    weapons = arsenal;
    for (const item of weapons) item.forgeTier = 3;
    bonuses.damage = 1.52;
    bonuses.cooldown = .88;
    bonuses.area = 1.42;
    bonuses.range = 1.2;
    bonuses.projectiles = 0;
    bonuses.pierce = 3;
    bonuses.crit = .38;
    bonuses.chainChance = .24;
    bonuses.chainTargets = 1;
    bonuses.chainDamage = .7;
    bonuses.explosion = 28;
    bonuses.singularityPull = 28;
    bonuses.singularityDeath = .42;
    bonuses.mutationAmp = .28;
    spawnHorde(count, includeBoss);
    enemies.forEach((enemy, index) => {
      if (enemy.boss) return;
      const angle = index / count * Math.PI * 2 + (index % 5) * .18;
      const radius = 165 + (index % 10) * 48;
      enemy.x = player.x + Math.cos(angle) * radius;
      enemy.y = player.y + Math.sin(angle) * radius * .72;
      enemy.speed = 112 + (index % 7) * 9;
      enemy.hp = enemy.maxHp = index % 6 === 0 ? 180 : 1900 + (index % 5) * 240;
      enemy.damage = 0;
      if (index % 5 === 0) {
        enemy.behavior = "radial";
        enemy.shootTimer = .08 + (index % 3) * .08;
      }
    });
    seedEnemyBarrage(colors, 1, 10, 112);
    player.hp = player.maxHp;
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

  function stageHunterBuild() {
    const swarm = starSwarmWeapon();
    swarm.cooldown = .58;
    swarm.projectile_count = 4;
    swarm.damage = 132;
    swarm.explosion_radius = 42;
    prepareLateBuild([swarm], ["#ff365f", "#ff9b54"], false, 18);
  }

  function stageStormBuild() {
    const forkedBeam = weapon({
      name: "万伏雷鳗", delivery: "beam", visual_form: "staff", visual_variant: 6,
      secondary_color: "#f1ffff", visual_motif: "横穿星海的雷鳗脊骨",
      damage: 128, cooldown: .46, range: 1040, projectile_size: 16, color: "#63efff",
      mutations: [
        mutation("fork", "三叉雷脊", "#63efff"),
        mutation("chain", "万伏回响", "#ffffff"),
        mutation("aftershock", "余雷", "#a66bff"),
      ],
    });
    prepareLateBuild([forkedBeam], ["#ff5a72", "#ffb347", "#b66cff"], false, 18);
  }

  function stageSingularityBuild() {
    const eventHorizon = weapon({
      name: "事件视界", delivery: "aura", visual_form: "orb", visual_variant: 21,
      secondary_color: "#050208", visual_motif: "向内坍缩的紫黑引力井",
      damage: 148, cooldown: .68, range: 390, projectile_size: 30,
      explosion_radius: 92, slow_percent: .38, color: "#b66cff",
      mutations: [mutation("aftershock", "二次坍缩", "#b66cff"), mutation("nova", "终焉脉冲", "#ff5fc8")],
    });
    prepareLateBuild([eventHorizon], ["#ff365f", "#ff5fc8", "#9b5cff"], true, 18);
  }

  function stageOpeningHook() {
    configureRun(1, false);
    state.stageIndex = 2;
    state.time = 705;
    state.level = 38;
    const swarm = starSwarmWeapon();
    swarm.cooldown = .62;
    swarm.projectile_count = 4;
    swarm.damage = 112;
    const voidEyes = weapon({
      name: "七颗虚空之眼", delivery: "orbit", visual_form: "drone", visual_variant: 21,
      secondary_color: "#130922", visual_motif: "错层环绕的奇点眼",
      damage: 112, cooldown: .65, projectile_count: 3, projectile_size: 18,
      range: 188, color: "#8b72ff",
      mutations: [mutation("orbit_salvo", "群星齐射", "#73efff")],
    });
    weapons = [swarm, voidEyes];
    bonuses.damage = 1.48;
    bonuses.cooldown = .86;
    bonuses.area = 1.34;
    bonuses.projectiles = 0;
    bonuses.pierce = 2;
    bonuses.crit = .36;
    bonuses.chainChance = .3;
    bonuses.chainTargets = 2;
    bonuses.chainDamage = .68;
    bonuses.explosion = 28;
    bonuses.singularityPull = 24;
    bonuses.singularityDeath = .32;
    bonuses.mutationAmp = .22;
    spawnHorde(14, true);
    const openingRoute = [
      { x: 130, y: -125 }, { x: 190, y: -185 }, { x: 248, y: -238 },
      { x: 305, y: -282 }, { x: 350, y: -235 }, { x: 405, y: -190 },
      { x: 455, y: -145 }, { x: 505, y: -98 }, { x: 560, y: -45 },
      { x: 615, y: 12 }, { x: 230, y: -305 }, { x: 285, y: -180 },
      { x: 390, y: -95 }, { x: 470, y: -35 }, { x: 540, y: 35 },
      { x: 640, y: 80 },
    ];
    enemies.filter((enemy) => !enemy.boss).forEach((enemy, index) => {
      const waypoint = openingRoute[index % openingRoute.length];
      enemy.x = player.x + waypoint.x + (trailerNoise(index, 61) - .5) * 34;
      enemy.y = player.y + waypoint.y + (trailerNoise(index, 67) - .5) * 34;
      enemy.speed = 28 + trailerNoise(index, 71) * 24;
      enemy.hp = enemy.maxHp = 1450;
      enemy.damage = 0;
    });
    if (currentBoss) {
      currentBoss.x = player.x + 500;
      currentBoss.y = player.y - 112;
    }
    seedEnemyBarrage(["#ff365f", "#b66cff"], 1, 8, 106);
    player.invulnerable = 999;
    updateLoadoutUI();
    invalidateSynergies();
    updateSynergyUI();
    updateHUD();
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
    state.encounterTriggered = Array(ENCOUNTER_SLOT_COUNT).fill(true);
    state.encounterTypes = Array(ENCOUNTER_SLOT_COUNT).fill("director");
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

  function startTrailer() {
    // Build the opening combat tableau while the capture mask is still up.
    // This keeps one-time entity/VFX allocation out of the first visible beat.
    ui.intro.classList.add("dismissed");
    selectedArchetype = defaultArchetype("会瞬移并用引力短刃切开虫洞的相位刺客");
    body.classList.add("trailer-focus-combat");
    zoom("void");
    resizeCanvas();
    stageOpeningHook();
    document.documentElement.classList.remove("trailer-capture-boot");
    document.documentElement.dataset.trailerStarted = "1";
    const auditStarted = performance.now();
    let lastAuditFrame = performance.now();
    let maxFrameGap = 0;
    let slowFrameCount = 0;
    const slowestFrames = [];
    const slowFramesByWindow = {};
    let frameAudit = requestAnimationFrame(function auditFrame(now) {
      const gap = now - lastAuditFrame;
      const elapsed = (now - auditStarted) / 1000;
      if (particles.length > 50) particles = particles.slice(-50);
      if (effects.length > 72) {
        const protectedEffects = effects.filter((effect) => effect.source === "enemy" || effect.type === "screen").slice(-24);
        const friendlyEffects = effects.filter((effect) => effect.source !== "enemy" && effect.type !== "screen").slice(-48);
        effects = protectedEffects.concat(friendlyEffects).slice(-72);
      }
      if (projectiles.length > 64) projectiles = projectiles.slice(-64);
      if (elapsed > .75) maxFrameGap = Math.max(maxFrameGap, gap);
      if (elapsed > .75 && gap > 52) {
        slowFrameCount += 1;
        const windowStart = Math.floor(elapsed / 5) * 5;
        slowFramesByWindow[`${windowStart}-${windowStart + 5}`] = (slowFramesByWindow[`${windowStart}-${windowStart + 5}`] || 0) + 1;
      }
      if (elapsed > .75 && gap > 80) {
        slowestFrames.push({ at: elapsed, gap });
        slowestFrames.sort((a, b) => b.gap - a.gap);
        slowestFrames.length = Math.min(12, slowestFrames.length);
      }
      lastAuditFrame = now;
      frameAudit = requestAnimationFrame(auditFrame);
    });

  // 00.0–03.0 — Cold-open on the payoff. The avatar crosses the frame,
  // changes direction and dashes twice before the trailer asks for attention.
  drive("KeyD", "KeyW");
  cameraMove(-155, 72, 150, -48, 3.05);
  later(.28, () => caption("", "写下武器。杀出去。", "", "#78eaff", "hero-copy"));
  later(1.72, clearCaption);
  later(.86, () => dash("KeyD", "KeyW"));
  later(1.58, () => drive("KeyD", "KeyS"));
  later(2.18, () => dash("KeyD", "KeyS"));

  // 03.0–06.2 — Rewind to the player's fantasy becoming a playable identity.
  later(3.0, () => {
    hit("#d8f7ff");
    drive();
    zoom();
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    state.running = false;
    state.paused = true;
    clearCombatResidue();
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
  later(3.34, () => typeInto(ui.archetypeInput, "会瞬移，用引力短刃切开虫洞的相位刺客。", 1.42));
  later(4.9, () => {
    ui.archetypeStatus.hidden = false;
    ui.archetypeConfirm.disabled = true;
    ui.archetypeConfirmLabel.textContent = "生成中…";
  });

  // 06.2–10.5 — Honest early-run survival with a long traversal and dash arc.
  later(6.15, () => {
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
    cameraMove(-145, 46, 138, -36, 4.1);
    caption("", "走位。冲刺。活下去。", "", "#58e6ff", "compact-hero-copy");
  });
  later(6.98, () => dash("KeyD", "KeyW"));
  later(7.8, () => drive("KeyD", "KeyS"));
  later(8.14, clearCaption);
  later(8.68, () => dash("KeyD", "KeyS"));
  later(9.42, () => drive("KeyD", "KeyW"));
  later(10.02, () => dash("KeyD", "KeyW"));

  // 10.5–13.7 — Establish the patron roster, then hold long enough to read
  // one concrete boon and understand what it changes in combat.
  later(10.5, () => {
    hit("#ffd166");
    drive();
    cameraMove(0, 0, 0, 0, .2);
    zoom();
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    clearCombatResidue();
    showPatronRoster();
  });
  later(11.75, () => {
    hidePatronRoster();
    hit("#ff754f", "soft");
    body.classList.add("trailer-boon-focus");
    void showCeremony({
      type: "patron",
      profile: ceremonyProfiles.blaze,
      seed: "trailer-red-sun-boon",
      kicker: "PATRON BOON / 赤日",
      title: "太阳的指纹",
      subtitle: "击杀后留下太阳残焰，持续灼烧附近敌群 · 普通赐福",
      sigil: "♨",
      patron: patronDefinitions.blaze,
      duration: 1550,
    });
  });

  // 13.7–17.8 — Three staggered packs cut off a moving player from different
  // lanes. Uneven speeds and flanking behavior keep the pressure organic.
  later(13.65, () => {
    hit("#ff365f");
    hidePatronRoster();
    body.classList.remove("trailer-boon-focus");
    clearCaption();
    stageLastStand();
    body.classList.add("trailer-focus-combat");
    body.classList.add("trailer-critical");
    zoom("chaos");
    resizeCanvas();
    drive("KeyA", "KeyW");
    cameraMove(-34, 14, 38, -16, 4.0);
    caption("", "撤离路线被切断。", "", "#ff5a72", "compact-hero-copy");
  });
  later(14.4, () => dash("KeyA", "KeyW"));
  later(15.05, () => drive("KeyD", "KeyW"));
  later(15.62, () => dash("KeyD", "KeyW"));
  later(15.86, clearCaption);
  later(16.25, () => {
    player.hp = 9;
    updateHUD();
    hit("#ff365f", "soft");
    caption("", "只剩一个愿望。", "", "#ff5a72", "compact-hero-copy");
  });
  later(16.82, () => drive("KeyA", "KeyS"));
  later(17.42, () => {
    drive();
    clearCaption();
  });

  // 17.8–25.2 — Cut from the failed escape into the actual AI forge UI. The
  // title, input field, character counter and submit affordance stay visible.
  later(17.8, () => {
    hit("#ff365f");
    drive();
    zoom("forge");
    body.classList.add("trailer-forge-input-closeup");
    body.classList.remove("trailer-critical");
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    clearCombatResidue();
    openForge(4);
    ui.forge.querySelector(".forge-rail span").textContent = "异梦";
    ui.forgeTitle.textContent = "最后一次锻造";
    ui.forge.querySelector(".forge-header .chapter").textContent = "AI 武器锻造";
    ui.forge.querySelector(".forge-header p").hidden = true;
    ui.forge.querySelector(".wish-form label").textContent = "描述你想要的武器";
    ui.wishInput.placeholder = "";
    ui.forgeButton.querySelector("span:not(.button-icon)").textContent = "开始锻造";
    ui.forgeButton.querySelector("small").textContent = "";
  });
  later(18.32, () => typeInto(ui.wishInput, "八颗幼星主动追猎，贯穿折返，沿途孵化雷暴。", 3.45));
  later(22.08, () => {
    ui.forgeButton.classList.add("trailer-ready");
    hit("#f3e9ff", "soft");
  });
  later(22.7, () => {
    clearCaption();
    body.classList.remove("trailer-forge-input-closeup");
    body.classList.add("trailer-forge-result");
    zoom();
    ui.forgeButton.classList.remove("trailer-ready");
    ui.wishForm.hidden = true;
    previewWeapon = starSwarmWeapon();
    showWeaponResult(previewWeapon, ["投射数量与追踪强度已按终局预算稳定"]);
    ui.forge.querySelector(".forge-modal").scrollTop = 0;
    ui.forge.querySelector(".forge-main").scrollTop = 0;
    ui.resultName.textContent = "遮天幼星群";
    ui.resultDescription.textContent = "追猎。贯穿。折返。雷暴。";
    ui.resultTradeoff.textContent = "必须持续移动";
    ui.balanceNote.hidden = true;
    ui.accept.textContent = "装备";
    ui.resultDelivery.textContent = "投射武器";
    ["伤害", "间隔", "攻速", "DPS", "数量", "距离", "轨迹", "强度"].forEach((text, index) => {
      const label = ui.resultStats.querySelectorAll(".result-stat span")[index];
      if (label) label.textContent = text;
    });
    const trajectoryValue = ui.resultStats.querySelectorAll(".result-stat strong")[6];
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
    body.classList.remove("trailer-forge-result");
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

  // 31.1–34.4 — The same weapon keeps mutating. Selection cuts into the
  // dedicated blueprint-compilation ceremony before the evolved build fires.
  later(31.05, () => {
    hit("#b06cff");
    drive();
    zoom();
    body.classList.remove("trailer-forge-result");
    body.classList.remove("trailer-focus-combat");
    resizeCanvas();
    clearCombatResidue();
    showMutationChoice();
  });
  later(32.68, () => {
    const cards = ui.upgradeOptions.querySelectorAll(".mutation-card");
    cards[0]?.classList.add("trailer-selected");
  });
  later(32.92, () => {
    const evolvedWeapon = starSwarmWeapon();
    evolvedWeapon.name = "事件视界";
    evolvedWeapon.color = "#b06cff";
    evolvedWeapon.secondary_color = "#f0d8ff";
    evolvedWeapon.visual_variant = 21;
    void playAICeremony({
      title: evolvedWeapon.name,
      subtitle: "追猎协议重构 · 折返轨道锁定",
      color: evolvedWeapon.color,
      mode: "mutation",
      weapon: evolvedWeapon,
      duration: 1240,
    });
  });

  // 34.4–50.1 — Three fully formed late-game weapons get a dedicated five-
  // second showcase, readable nameplate and distinct combat silhouette.
  later(34.35, () => {
    hit("#ffffff");
    stageHunterBuild();
    body.classList.add("trailer-focus-combat");
    zoom("storm");
    resizeCanvas();
    drive("KeyD", "KeyW");
    cameraMove(-142, 48, 128, -42, 4.75);
    caption("终局武器 01 / HUNTER", "遮天幼星群", "主动追猎 · 贯穿折返 · 雷暴孵化", "#f3e9ff", "build-copy");
  });
  later(35.22, () => dash("KeyD", "KeyW"));
  later(36.38, () => drive("KeyD", "KeyS"));
  later(37.32, () => dash("KeyD", "KeyS"));
  later(38.22, () => {
    state.skillCooldown = 0;
    useArchetypeSkill();
  });

  later(39.2, () => {
    hit("#72eaff");
    stageStormBuild();
    zoom("sun");
    resizeCanvas();
    drive("KeyD", "KeyS");
    cameraMove(136, -44, -126, 48, 5.08);
    caption("终局武器 02 / STORM", "万伏雷鳗", "全屏贯穿 · 三叉雷脊 · 连锁回响", "#72eaff", "build-copy");
  });
  later(40.08, () => dash("KeyD", "KeyS"));
  later(41.18, () => drive("KeyD", "KeyW"));
  later(42.08, () => dash("KeyD", "KeyW"));
  later(43.12, () => {
    state.skillCooldown = 0;
    useArchetypeSkill();
  });

  later(44.4, () => {
    hit("#b66cff");
    stageSingularityBuild();
    zoom("boss");
    resizeCanvas();
    drive("KeyD", "KeyW");
    cameraMove(-148, 50, 132, -46, 5.58);
    caption("终局武器 03 / VOID", "事件视界", "范围牵引 · 二次坍缩 · 终焉脉冲", "#c487ff", "build-copy");
  });
  later(45.28, () => dash("KeyD", "KeyW"));
  later(46.42, () => drive("KeyD", "KeyS"));
  later(47.32, () => dash("KeyD", "KeyS"));
  later(48.42, () => {
    drive("KeyD", "KeyW");
    state.skillCooldown = 0;
    useArchetypeSkill();
    effects.push({ type: "screen", color: "#ffffff", life: .16, maxLife: .16 });
    state.shake = Math.max(state.shake, 18);
  });

  // 50.1–54.2 — Clean, legible CTA hold.
  later(50.1, () => {
    hit("#ffffff");
    drive();
    zoom();
    state.paused = true;
    clearCombatResidue();
    hideModals();
    clearCaption();
    body.classList.remove("trailer-boon-focus", "trailer-forge-input-closeup", "trailer-forge-result");
    endCard.classList.add("visible");
  });
  later(54.22, () => {
    window.ROUGE_HATE_TRAILER_CAMERA = { x: 0, y: 0 };
    cancelAnimationFrame(frameAudit);
    document.documentElement.dataset.trailerMaxFrameGap = maxFrameGap.toFixed(1);
    document.documentElement.dataset.trailerSlowFrames = String(slowFrameCount);
    document.documentElement.dataset.trailerSlowestFrames = JSON.stringify(slowestFrames);
    document.documentElement.dataset.trailerSlowFramesByWindow = JSON.stringify(slowFramesByWindow);
    document.documentElement.dataset.trailerComplete = "1";
  });
  }

  window.setTimeout(() => {
    requestAnimationFrame(() => requestAnimationFrame(startTrailer));
  }, 1600);
})();
