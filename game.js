"use strict";

const $ = (selector) => document.querySelector(selector);
const canvas = $("#gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  intro: $("#introOverlay"),
  start: $("#startButton"),
  startLabel: $("#startButtonLabel"),
  archetypeModal: $("#archetypeModal"),
  archetypeConfirm: $("#confirmArchetypeButton"),
  archetypeConfirmLabel: $("#confirmArchetypeLabel"),
  archetypeBack: $("#archetypeBackButton"),
  archetypeInput: $("#archetypeInput"),
  archetypeCount: $("#archetypeCount"),
  archetypePresets: $("#archetypePresets"),
  archetypeStatus: $("#archetypeStatus"),
  pauseCard: $("#pauseCard"),
  resume: $("#resumeButton"),
  restart: $("#restartButton"),
  gameOver: $("#gameOverModal"),
  playAgain: $("#playAgainButton"),
  changeBuild: $("#changeBuildButton"),
  level: $("#levelValue"),
  healthFill: $("#healthFill"),
  healthText: $("#healthText"),
  xpFill: $("#xpFill"),
  xpText: $("#xpText"),
  time: $("#timeValue"),
  kills: $("#killsValue"),
  finalTime: $("#finalTime"),
  finalKills: $("#finalKills"),
  runId: $("#runId"),
  apiPill: $("#apiPill"),
  apiStatus: $("#apiStatus"),
  weaponList: $("#weaponList"),
  slotCount: $("#slotCount"),
  eventLog: $("#eventLog"),
  forge: $("#forgeModal"),
  forgeLevel: $("#forgeLevelRail"),
  forgeTitle: $("#forgeTitle"),
  budget: $("#budgetValue"),
  quickWishes: $("#quickWishes"),
  wishForm: $("#wishForm"),
  wishInput: $("#wishInput"),
  charCount: $("#charCount"),
  skip: $("#skipButton"),
  forgeButton: $("#forgeButton"),
  forgeLoading: $("#forgeLoading"),
  loadingStatus: $("#loadingStatus"),
  weaponResult: $("#weaponResult"),
  resultGlow: $("#resultGlow"),
  resultGlyph: $("#resultGlyph"),
  resultDelivery: $("#resultDelivery"),
  resultName: $("#resultName"),
  resultDescription: $("#resultDescription"),
  resultWeaponCanvas: $("#resultWeaponCanvas"),
  resultStats: $("#resultStats"),
  resultTags: $("#resultTags"),
  resultTradeoff: $("#resultTradeoff"),
  balanceNote: $("#balanceNote"),
  accept: $("#acceptButton"),
  forgeError: $("#forgeError"),
  forgeErrorText: $("#forgeErrorText"),
  retry: $("#retryButton"),
  sound: $("#soundButton"),
  stageLabel: $("#stageLabel"),
  stageFill: $("#stageFill"),
  stageTimer: $("#stageTimer"),
  bossHud: $("#bossHud"),
  bossName: $("#bossName"),
  bossFill: $("#bossFill"),
  skillFill: $("#skillFill"),
  skillName: $("#skillName"),
  announcement: $("#stageAnnouncement"),
  announcementKicker: $("#announcementKicker"),
  announcementTitle: $("#announcementTitle"),
  synergyList: $("#synergyList"),
  profileBest: $("#profileBest"),
  profileKills: $("#profileKills"),
  profileWeapons: $("#profileWeapons"),
  difficultyPicker: $("#difficultyPicker"),
  upgrade: $("#upgradeModal"),
  upgradeTitle: $("#upgradeTitle"),
  upgradeSubtitle: $("#upgradeSubtitle"),
  upgradeOptions: $("#upgradeOptions"),
  upgradeRerolls: $("#upgradeRerolls"),
  reroll: $("#rerollButton"),
  gameOverTitle: $("#gameOverTitle"),
  gameOverSummary: $("#gameOverSummary"),
  finalLevel: $("#finalLevel"),
  finalScore: $("#finalScore"),
  finalEchoes: $("#finalEchoes"),
  newRecord: $("#newRecord"),
  archiveButton: $("#archiveButton"),
  echoBalance: $("#echoBalance"),
  profileEchoes: $("#profileEchoes"),
  archive: $("#archiveModal"),
  archiveClose: $("#archiveClose"),
  archiveEchoes: $("#archiveEchoes"),
  metaUpgrades: $("#metaUpgrades"),
  identityCard: $("#identityCard"),
  identityRole: $("#identityRole"),
  identityName: $("#identityName"),
  identityPassive: $("#identityPassive"),
};

const deliveryMeta = {
  projectile: { label: "投射武器", glyph: "➤" },
  beam: { label: "瞬时光束", glyph: "╱" },
  aura: { label: "近身领域", glyph: "◎" },
  orbit: { label: "环绕武器", glyph: "✣" },
  melee: { label: "近战武器", glyph: "⚔" },
};

const visualMeta = {
  rifle: { label: "步枪", glyph: "⌁" }, cannon: { label: "重炮", glyph: "▰" },
  blade: { label: "长刃", glyph: "†" }, daggers: { label: "双匕", glyph: "⋈" },
  bow: { label: "猎弓", glyph: "⋊" }, staff: { label: "法杖", glyph: "⚚" },
  orb: { label: "法球", glyph: "◉" }, tome: { label: "魔典", glyph: "▱" },
  drone: { label: "无人机", glyph: "◇" },
};

const STAGE_DURATION = 240;
const RUN_DURATION = STAGE_DURATION * 3;
const BOSS_TIMES = [220, 460, 700];
const stages = [
  { label: "星域 I · 坠入边境", color: "#58e6ff" },
  { label: "星域 II · 星兽迁徙", color: "#a78bfa" },
  { label: "星域 III · 憎恨奇点", color: "#ff5a72" },
];
const forgeTiers = [
  { tier: 1, roman: "I", budget: 72, label: "第一件异想", hint: "稳定、清晰地建立第一种攻击循环" },
  { tier: 2, roman: "II", budget: 104, label: "第二件异想", hint: "补齐短板，或与第一件武器形成状态协同" },
  { tier: 3, roman: "III", budget: 140, label: "最后的异想", hint: "高风险、高上限，用于击穿憎恨奇点" },
];
const openingWaveSizes = [8];
const stageHealthScales = [1.08, 1.62, 2.75];
const stageSpawnPressure = [1.28, 1.08, 1];
const stageEncounters = [
  { offset: 75, type: "migration", kicker: "MIGRATION SURGE", title: "高速星兽迁徙潮" },
  { offset: 150, type: "elite", kicker: "ELITE HUNT", title: "雷鸣核心狩猎" },
];
const roleSkills = {
  warrior: { name: "恒星震荡", cooldown: 6.8, description: "震开近身星兽并获得短暂无敌" },
  assassin: { name: "虫洞连闪", cooldown: 3.4, description: "沿移动方向瞬移并切割路径目标" },
  hunter: { name: "腐化箭雨", cooldown: 7.2, description: "向四周释放自动追猎的剧毒箭矢" },
  mage: { name: "星云坍缩", cooldown: 8.5, description: "牵引大范围敌人并施加冻结" },
  sniper: { name: "终焉星轨", cooldown: 7.8, description: "向最危险方向发射全屏贯穿射线" },
};
const roleRecommendedWishes = {
  warrior: "一把能横扫大群敌人的星核巨剑，挥砍宽阔并有强击退",
  assassin: "一对攻击极快的相位双匕，近距离连续暴击",
  hunter: "一把发射剧毒追踪箭的异星猎弓，能够贯穿目标",
  mage: "一根释放星云贯穿光束的法杖，命中会引发爆炸",
  sniper: "一把贯穿五个敌人的狙，威力巨大但射速很慢",
};

const cosmicBestiary = {
  asteroid_mite: { name: "棘岩星螨", stage: 0, unlock: 0, weight: 24, behavior: "chaser", hp: 28, speed: 52, radius: 16, damage: 11, xp: 2, color: "#8f75c9", accent: "#d9c8ff", rank: "common" },
  azure_beetle: { name: "蓝晶甲虫", stage: 0, unlock: 0, weight: 20, behavior: "chaser", hp: 42, speed: 48, radius: 17, damage: 12, xp: 3, color: "#19bdf2", accent: "#8effff", rank: "common" },
  survey_drone: { name: "失控勘探机", stage: 0, unlock: 28, weight: 14, behavior: "shooter", hp: 34, speed: 47, radius: 16, damage: 10, xp: 3, color: "#394560", accent: "#ff365f", rank: "ranged", preferredRange: 235, attackCooldown: 2.25 },
  void_octopus: { name: "翡翠虚空章", stage: 0, unlock: 55, weight: 12, behavior: "orbiter", hp: 46, speed: 55, radius: 18, damage: 12, xp: 4, color: "#26d980", accent: "#f5dd55", rank: "controller" },
  pulse_wasp: { name: "脉冲晶蜂", stage: 0, unlock: 90, weight: 10, behavior: "shooter", hp: 27, speed: 72, radius: 14, damage: 9, xp: 3, color: "#da2ebc", accent: "#ffc8ff", rank: "ranged", preferredRange: 270, attackCooldown: 1.72 },
  shield_jelly: { name: "蓝幕盾水母", stage: 0, unlock: 135, weight: 6, behavior: "shielder", hp: 82, speed: 38, radius: 21, damage: 9, xp: 6, color: "#2ac9ef", accent: "#b8fbff", rank: "support" },

  nebula_hound: { name: "苍蓝星云犬", stage: 1, unlock: 0, weight: 21, behavior: "flanker", hp: 38, speed: 101, radius: 14, damage: 12, xp: 3, color: "#169e9d", accent: "#8eeeff", rank: "swift" },
  comet_larva: { name: "熔尾彗虫", stage: 1, unlock: 0, weight: 18, behavior: "exploder", hp: 30, speed: 94, radius: 13, damage: 22, xp: 3, color: "#e64a3f", accent: "#ffb52e", rank: "swift" },
  prism_fox: { name: "棱光巡界犬", stage: 1, unlock: 32, weight: 16, behavior: "flanker", hp: 46, speed: 91, radius: 15, damage: 13, xp: 4, color: "#f6a916", accent: "#fff08a", rank: "swift" },
  void_boar: { name: "赤核星野猪", stage: 1, unlock: 62, weight: 11, behavior: "charger", hp: 126, speed: 39, radius: 23, damage: 20, xp: 7, color: "#8b493d", accent: "#ff6d57", rank: "heavy" },
  spore_mother: { name: "紫孢育母", stage: 1, unlock: 105, weight: 7, behavior: "spawner", hp: 168, speed: 29, radius: 25, damage: 15, xp: 10, color: "#7c3db5", accent: "#f0a8ff", rank: "support", spawnCooldown: 7.5 },
  phase_manta: { name: "相位星蝠", stage: 1, unlock: 145, weight: 8, behavior: "shooter", hp: 84, speed: 61, radius: 22, damage: 14, xp: 7, color: "#176bc5", accent: "#78eaff", rank: "ranged", preferredRange: 295, attackCooldown: 1.38 },

  thunder_orb: { name: "雷鸣恒星球", stage: 2, unlock: 0, weight: 6, behavior: "radial", hp: 265, speed: 43, radius: 30, damage: 23, xp: 14, color: "#29374e", accent: "#ffb31f", rank: "elite", preferredRange: 245, attackCooldown: 2.8 },
  singularity_eye: { name: "奇点凝视者", stage: 2, unlock: 0, weight: 14, behavior: "sniper", hp: 118, speed: 36, radius: 22, damage: 17, xp: 8, color: "#186fce", accent: "#bca8ff", rank: "ranged", preferredRange: 340, attackCooldown: 2.65 },
  void_bulwark: { name: "虚空壁垒兽", stage: 2, unlock: 38, weight: 10, behavior: "shielder", hp: 290, speed: 27, radius: 27, damage: 22, xp: 13, color: "#423262", accent: "#d14dff", rank: "heavy" },
  hate_weaver: { name: "憎恨织网者", stage: 2, unlock: 72, weight: 9, behavior: "buffer", hp: 152, speed: 49, radius: 23, damage: 18, xp: 10, color: "#8e293b", accent: "#ff526b", rank: "support" },
  null_reaper: { name: "零域收割者", stage: 2, unlock: 108, weight: 10, behavior: "charger", hp: 104, speed: 74, radius: 20, damage: 25, xp: 10, color: "#d9d8dc", accent: "#a88cff", rank: "swift" },
  star_leech: { name: "噬星寄生体", stage: 2, unlock: 145, weight: 8, behavior: "orbiter", hp: 178, speed: 66, radius: 24, damage: 21, xp: 11, color: "#158579", accent: "#ff9c42", rank: "controller" },
};
const enemySpriteCells = {
  asteroid_mite: [0, 0], azure_beetle: [1, 0], survey_drone: [2, 0], void_octopus: [3, 0], pulse_wasp: [4, 0], shield_jelly: [5, 0],
  nebula_hound: [0, 1], comet_larva: [1, 1], prism_fox: [2, 1], void_boar: [3, 1], spore_mother: [4, 1], phase_manta: [5, 1],
  thunder_orb: [0, 2], singularity_eye: [1, 2], void_bulwark: [2, 2], hate_weaver: [3, 2], null_reaper: [4, 2], star_leech: [5, 2],
};
const enemyAtlas = new Image();
enemyAtlas.decoding = "async";
enemyAtlas.src = "assets/enemies/cosmic-bestiary-v2.png";
const difficultyModes = {
  normal: { label: "标准航线", health: 1, damage: 1, spawn: 1, reward: 1 },
  hate: { label: "憎恨航线", health: 1.35, damage: 1.25, spawn: 1.35, reward: 1.5 },
};

function loadProfile() {
  const fallback = { runs: 0, victories: 0, bestTime: 0, bestKills: 0, totalKills: 0, echoes: 0, blueprints: [], sound: true };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem("rougehate-profile") || "{}") };
  } catch {
    return fallback;
  }
}

const profile = loadProfile();
if (!Array.isArray(profile.blueprints)) profile.blueprints = [];
if (!profile.meta || typeof profile.meta !== "object" || Array.isArray(profile.meta)) profile.meta = {};
profile.meta = { vitality: 0, power: 0, foresight: 0, ...profile.meta };
let selectedDifficulty = "normal";
let selectedArchetype = null;

function saveProfile() {
  localStorage.setItem("rougehate-profile", JSON.stringify(profile));
}

class SynthAudio {
  constructor(enabled) {
    this.enabled = enabled;
    this.context = null;
    this.lastHit = 0;
    this.lastShot = 0;
    this.lastPickup = 0;
  }

  wake() {
    if (!this.enabled) return;
    this.context ||= new (window.AudioContext || window.webkitAudioContext)();
    if (this.context.state === "suspended") this.context.resume();
  }

  tone(frequency, duration = 0.08, type = "sine", volume = 0.025, slide = 0) {
    if (!this.enabled) return;
    this.wake();
    if (!this.context) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  shoot(delivery) {
    const now = performance.now();
    if (now - this.lastShot < 85) return;
    this.lastShot = now;
    const tones = { projectile: [180, "square"], beam: [520, "sawtooth"], aura: [110, "sine"], melee: [260, "sawtooth"] };
    const [frequency, type] = tones[delivery] || tones.projectile;
    this.tone(frequency, 0.055, type, 0.012, delivery === "beam" ? 240 : -35);
  }

  hit(critical = false) {
    const now = performance.now();
    if (now - this.lastHit < 45) return;
    this.lastHit = now;
    this.tone(critical ? 760 : 95, critical ? 0.1 : 0.045, critical ? "triangle" : "square", critical ? 0.028 : 0.009, critical ? 130 : -25);
  }

  pickup() {
    const now = performance.now();
    if (now - this.lastPickup < 70) return;
    this.lastPickup = now;
    this.tone(620, 0.055, "sine", 0.018, 180);
  }
  level() { this.tone(330, 0.24, "triangle", 0.035, 550); }
  dash() { this.tone(240, 0.11, "sawtooth", 0.022, 460); }
  hurt() { this.tone(115, 0.18, "sawtooth", 0.04, -65); }
  boss() { this.tone(70, 0.55, "sawtooth", 0.045, -25); }
  victory() { [0, 120, 240].forEach((delay, index) => setTimeout(() => this.tone([330, 494, 659][index], 0.35, "triangle", 0.035, 90), delay)); }
}

const audio = new SynthAudio(profile.sound);

function createBonuses() {
  return {
    damage: 1, cooldown: 1, range: 1, moveSpeed: 1, armor: 0, magnet: 155,
    crit: 0, regen: 0, projectiles: 0, pierce: 0, area: 1, explosion: 0,
    burn: 0, poison: 0, slow: 0, venomAmp: 0, shatter: 0, chainChance: 0,
    chainDamage: 0, chainTargets: 0, execute: 0, singularityPull: 0,
    skillCooldown: 1, xp: 1, closeDamage: 0, farDamage: 0, bossDamage: 0,
    eliteDamage: 0, lowHpDamage: 0, fullHpCrit: 0, movingDamage: 0,
    stationaryArmor: 0, killHeal: 0, killHealEvery: 24, skillRefund: 0,
    burnSpread: 0, frostBurst: 0, singularityDeath: 0, executeRefund: 0,
    critBlast: 0, pickupHeal: 0, mutationAmp: 0, projectileSpeed: 1,
    statusDuration: 1, knockback: 1,
  };
}

let bonuses = createBonuses();
let upgradeLevels = {};

const keys = new Set();
let width = 800;
let height = 600;
let dpr = 1;
let lastFrame = performance.now();
let entityId = 1;
let previewWeapon = null;
let loadingTimer = null;

const sessionId = (() => {
  const stored = localStorage.getItem("rougehate-session");
  if (stored) return stored;
  const created = crypto.randomUUID ? crypto.randomUUID() : `rh-${Date.now()}-${Math.random()}`;
  localStorage.setItem("rougehate-session", created);
  return created;
})();

const state = {
  running: false,
  paused: true,
  forging: false,
  time: 0,
  kills: 0,
  level: 1,
  xp: 0,
  xpNeed: 18,
  spawnClock: 0,
  wave: 0,
  difficulty: "normal",
  rewardOpen: false,
  rewardQueue: [],
  rewardType: "upgrade",
  rerolls: 1,
  bossSpawned: [false, false, false],
  bossesDefeated: 0,
  stageIndex: 0,
  skillCooldown: 0,
  dashTimer: 0,
  dashX: 0,
  dashY: -1,
  shake: 0,
  damageDealt: 0,
  victory: false,
  seenSpecies: new Set(),
  activeForgeTier: 1,
  forgeOpened: [false, false, false],
  openingWaveTier: 0,
  openingWaveRemaining: 0,
  encounterTriggered: Array(6).fill(false),
  upgradePicks: 0,
  mutationRound: 0,
  mutationCount: 0,
  harvestKills: 0,
  isMoving: false,
  activePatrons: new Set(),
  transformations: new Set(),
  finalBossForgeAt: 0,
};

const player = {
  x: 0,
  y: 0,
  radius: 15,
  speed: 238,
  hp: 100,
  maxHp: 100,
  invulnerable: 0,
  moveX: 0,
  moveY: -1,
};

let enemies = [];
let projectiles = [];
let xpGems = [];
let pickups = [];
let particles = [];
let effects = [];
let mutationZones = [];
let weapons = [];
let enemyProjectiles = [];
let pendingAttacks = [];
let currentBoss = null;
let currentUpgradeChoices = [];
let currentMutationChoices = [];
let currentMutationWish = "";
let synergyCache = null;

const touch = { active: false, id: null, startX: 0, startY: 0, x: 0, y: 0 };

const rarityMeta = {
  common: { label: "COMMON / 常规", color: "#d7d5dc" },
  rare: { label: "RARE / 稀有", color: "#58e6ff" },
  epic: { label: "EPIC / 史诗", color: "#a78bfa" },
  legendary: { label: "MYTHIC / 质变", color: "#ffd166" },
};

const coreUpgrades = [
  { id: "damage", family: "漂流遗物 · 武器", title: "磨损的枪管", icon: "↗", rarity: "common", max: 6, description: "它已经打过很多仗。所有攻击伤害提高 15%。", apply: () => { bonuses.damage *= 1.15; } },
  { id: "cooldown", family: "漂流遗物 · 时间", title: "提前两秒的表", icon: "⌁", rarity: "common", max: 6, description: "每根指针都很着急。攻击间隔缩短 9%。", apply: () => { bonuses.cooldown *= 0.91; } },
  { id: "range", family: "漂流遗物 · 观测", title: "有裂缝的望远镜", icon: "⇥", rarity: "common", max: 5, description: "裂缝让远方看起来更近。射程与挥砍半径提高 12%。", apply: () => { bonuses.range *= 1.12; } },
  { id: "vitality", family: "漂流遗物 · 肉身", title: "备用肺", icon: "+", rarity: "common", max: 4, description: "不知道原主人是谁。最大生命提高 20，并恢复 20。", apply: () => { player.maxHp += 20; player.hp = Math.min(player.maxHp, player.hp + 20); } },
  { id: "movement", family: "漂流遗物 · 机动", title: "彗星鞋带", icon: "»", rarity: "common", max: 4, description: "系紧以后很难停下。移速 +10%，专属技能冷却 -8%。", apply: () => { bonuses.moveSpeed *= 1.10; bonuses.skillCooldown *= 0.92; } },
  { id: "magnet", family: "漂流遗物 · 拾取", title: "装满铁屑的糖", icon: "◇", rarity: "common", max: 4, description: "甜得发苦。拾取范围扩大 45。", apply: () => { bonuses.magnet += 45; } },
  { id: "armor", family: "漂流遗物 · 肉身", title: "蜕下的甲壳", icon: "⬡", rarity: "rare", max: 4, description: "里面还残留着体温。受到伤害降低 8%。", apply: () => { bonuses.armor = Math.min(0.4, bonuses.armor + 0.08); } },
  { id: "critical", family: "漂流遗物 · 观测", title: "画歪的准星", icon: "✦", rarity: "rare", max: 4, description: "歪得刚刚好。暴击率提高 8%。", apply: () => { bonuses.crit += 0.08; } },
  { id: "projectiles", family: "漂流遗物 · 武器", title: "多出来的扳机", icon: "≋", rarity: "epic", max: 3, description: "没人知道它原本装在哪里。投射、连斩与环绕数量 +1。", apply: () => { bonuses.projectiles += 1; } },
  { id: "pierce", family: "漂流遗物 · 武器", title: "空心钉", icon: "→", rarity: "rare", max: 3, description: "穿进去以后不愿停下。投射物与光束额外贯穿 1 个目标。", apply: () => { bonuses.pierce += 1; } },
  { id: "area", family: "漂流遗物 · 空间", title: "吹不破的泡泡", icon: "◎", rarity: "rare", max: 4, description: "它把周围空间也撑大了。范围与弹体尺寸提高 15%。", apply: () => { bonuses.area *= 1.15; } },
  { id: "regen", family: "漂流遗物 · 肉身", title: "温热输血袋", icon: "♥", rarity: "rare", max: 4, description: "血液仍在轻轻搏动。每秒恢复 0.7 生命。", apply: () => { bonuses.regen += 0.7; } },
  { id: "ignite", family: "赤日的礼物", title: "永不熄灭的火柴", icon: "♨", rarity: "rare", max: 4, description: "所有命中附加每秒 3 点燃烧，持续 2.2 秒。", apply: () => { bonuses.burn += 3; } },
  { id: "frost", family: "眠月的礼物", title: "装着冬天的罐头", icon: "❄", rarity: "rare", max: 4, description: "打开以后，所有命中额外减速 9%。", apply: () => { bonuses.slow = Math.min(.45, bonuses.slow + .09); } },
  { id: "venom", family: "孢母的礼物", title: "会呼吸的霉斑", icon: "☣", rarity: "epic", max: 3, description: "所有命中附加每秒 3 点中毒；受感染目标承受更多直接伤害。", apply: () => { bonuses.poison += 3; bonuses.venomAmp += .09; } },
  { id: "chain", family: "雷兽的礼物", title: "雷鳗的脊骨", icon: "ϟ", rarity: "epic", max: 3, description: "命中有 22% 概率把电流送往附近敌人。", apply: () => { bonuses.chainChance = Math.min(.7, bonuses.chainChance + .22); bonuses.chainDamage += .18; bonuses.chainTargets += 1; } },
  { id: "shatter", family: "眠月的礼物", title: "冻裂的乳牙", icon: "✧", rarity: "epic", max: 3, description: "对减速目标造成额外 14% 伤害。", apply: () => { bonuses.shatter += .14; } },
  { id: "explosion", family: "盲星的礼物", title: "怀孕的弹壳", icon: "※", rarity: "epic", max: 3, description: "每次命中都想再生一次爆炸。所有攻击获得 18 爆炸半径。", apply: () => { bonuses.explosion += 18; } },
  { id: "gravity", family: "盲星的礼物", title: "很重的黑纽扣", icon: "◉", rarity: "epic", max: 3, description: "爆炸会把周围星兽拽向中心。", apply: () => { bonuses.explosion += 10; bonuses.singularityPull += 8; } },
  { id: "execute", family: "孢母的礼物", title: "吃剩一半的月亮", icon: "◐", rarity: "epic", max: 3, description: "非 Boss 敌人生命低于 6% 时被直接吞掉。", apply: () => { bonuses.execute = Math.min(.22, bonuses.execute + .06); } },
];

function tradeMaxHp(amount) {
  player.maxHp = Math.max(40, player.maxHp - amount);
  player.hp = Math.min(player.hp, player.maxHp);
}

const upgradeFamilyBlueprints = [
  {
    id: "ballistic", label: "白鸦", icon: "➤", partner: "gravity",
    nodes: [
      ["白羽膛线", "common", 3, "白鸦替子弹梳顺羽毛。弹速提高 14%，击退提高。", () => { bonuses.projectileSpeed *= 1.14; bonuses.knockback *= 1.08; }],
      ["铁喙", "common", 3, "弹头长出一层鸟喙，额外贯穿 1 个目标。", () => { bonuses.pierce += 1; }],
      ["地平线上的羽毛", "rare", 3, "白羽落在远处目标头顶。对 360 距离外敌人伤害提高 12%。", () => { bonuses.farDamage += .12; }],
      ["枪管里的鸟巢", "rare", 2, "每次开火都有东西跟着飞出。投射、连斩与环绕数量 +1。", () => { bonuses.projectiles += 1; }],
      ["死鸦的眼睛", "rare", 3, "它总比你早一点看见伤口。暴击率 +5%，技能冷却 -5%。", () => { bonuses.crit += .05; bonuses.skillCooldown *= .95; }],
      ["啄心", "epic", 2, "让白鸦从你的胸口取走饲料。伤害 +24%，最大生命 -10。", () => { bonuses.damage *= 1.24; tradeMaxHp(10); }],
      ["会孵化的弹片", "epic", 2, "暴击留下的碎片偶尔会突然破壳，制造小范围冲击。", () => { bonuses.critBlast += .16; }],
      ["坠星之喙", "epic", 2, "白鸦与盲星共同啄穿尸体；爆炸击杀会拉扯并轰击附近目标。", () => { bonuses.singularityDeath += .18; }],
      ["遮天鸦群", "legendary", 1, "远距命中会周期性唤来一枚较弱的影子弹体。", () => { bonuses.ballisticMastery = 1; }],
    ],
  },
  {
    id: "blaze", label: "赤日", icon: "♨", partner: "toxin",
    nodes: [
      ["太阳的指纹", "common", 3, "赤日在弹头上按了一下。命中附加 2 点燃烧。", () => { bonuses.burn += 2; }],
      ["烧不完的裹尸布", "common", 3, "火焰会在尸布上多停留一会儿。状态持续时间 +14%。", () => { bonuses.statusDuration *= 1.14; }],
      ["烫手拥抱", "rare", 3, "离得越近，赤日笑得越响。近距离伤害 +11%。", () => { bonuses.closeDamage += .11; }],
      ["肿胀火球", "rare", 3, "火焰在破裂前会鼓起肚子。爆炸半径 +14。", () => { bonuses.explosion += 14; }],
      ["披着火跑", "rare", 3, "燃烧伤害提高，移动速度小幅提高。别停，停下会闻到自己。", () => { bonuses.burn += 2; bonuses.moveSpeed *= 1.05; }],
      ["烧掉明天", "epic", 2, "赤日收走你愈合的未来。全伤害 +20%，自愈效率降低。", () => { bonuses.damage *= 1.20; bonuses.regen *= .72; }],
      ["尸体接火", "epic", 2, "燃烧目标死亡时，会把最后一口火吐向邻近敌人。", () => { bonuses.burnSpread += .7; }],
      ["发霉的太阳", "epic", 2, "赤日与孢母交换了病。火焰传播，同时增强中毒增伤。", () => { bonuses.burnSpread += .5; bonuses.venomAmp += .10; }],
      ["众生火葬", "legendary", 1, "燃烧目标死亡时，会短暂变成一颗会伤人的小太阳。", () => { bonuses.solarFuneral = 1; }],
    ],
  },
  {
    id: "cryo", label: "眠月", icon: "❄", partner: "precision",
    nodes: [
      ["月背的霜", "common", 3, "眠月把永远见不到光的那一面抹在武器上。命中减速 +6%。", () => { bonuses.slow = Math.min(.55, bonuses.slow + .06); }],
      ["停走的雪花", "common", 3, "它悬在半空，不肯落地。状态持续 +12%，范围 +5%。", () => { bonuses.statusDuration *= 1.12; bonuses.area *= 1.05; }],
      ["冻裂的影子", "rare", 3, "敌人的影子先碎了。对减速目标额外造成 10% 伤害。", () => { bonuses.shatter += .10; }],
      ["月兔旧皮", "rare", 3, "裹上去以后很冷，却能保命。护甲 +5%，每秒恢复 0.25 生命。", () => { bonuses.armor += .05; bonuses.regen += .25; }],
      ["长大的雪盲", "rare", 3, "寒意沿着视线扩散。范围 +12%，减速再提高 3%。", () => { bonuses.area *= 1.12; bonuses.slow = Math.min(.6, bonuses.slow + .03); }],
      ["陪月亮睡一觉", "epic", 2, "攻击稍慢，但减速与碎裂伤害显著提高。醒来时少了一点时间。", () => { bonuses.cooldown *= 1.06; bonuses.slow += .06; bonuses.shatter += .16; }],
      ["碎掉的冬天", "epic", 2, "减速目标死亡时，体内的冬天会轰击附近敌人。", () => { bonuses.frostBurst += .22; }],
      ["瞄准镜里的月亮", "epic", 2, "眠月与观星人共享一只眼睛；暴击延长寒霜并提高碎裂伤害。", () => { bonuses.fullHpCrit += .06; bonuses.shatter += .12; }],
      ["世界睡着以后", "legendary", 1, "碎冰爆发会把幸存目标冻结在原地。只有你还醒着。", () => { bonuses.absoluteZero = 1; }],
    ],
  },
  {
    id: "toxin", label: "孢母", icon: "☣", partner: "blaze",
    nodes: [
      ["弹仓里的蘑菇", "common", 3, "每次开火都会惊醒一点菌丝。中毒伤害 +2。", () => { bonuses.poison += 2; bonuses.venomAmp += .02; }],
      ["绿牙", "common", 3, "孢母教伤口继续咀嚼。受持续伤害目标承受额外 6% 直伤。", () => { bonuses.venomAmp += .06; }],
      ["闻到死亡", "rare", 3, "敌人虚弱时会散发甜味。处决阈值 +2%。", () => { bonuses.execute = Math.min(.25, bonuses.execute + .02); }],
      ["借来的脐带", "rare", 3, "脐带接在死者身上。每隔一批击杀恢复生命。", () => { bonuses.killHeal += 2; bonuses.killHealEvery = Math.max(12, bonuses.killHealEvery - 2); }],
      ["咳嗽也会传染", "rare", 3, "状态持续更久，死亡传播概率提高。", () => { bonuses.statusDuration *= 1.12; bonuses.burnSpread += .28; }],
      ["把自己种下去", "epic", 2, "孢母借走一块活肉。中毒伤害显著提高，最大生命 -8。", () => { bonuses.venomAmp += .16; bonuses.poison += 3; tradeMaxHp(8); }],
      ["尸花", "epic", 2, "中毒目标死亡时开花，感染更大范围。", () => { bonuses.burnSpread += .75; }],
      ["太阳霉斑", "epic", 2, "孢母在赤日脸上种下一块斑；同时燃烧和中毒的敌人更易被处决。", () => { bonuses.venomAmp += .12; bonuses.execute += .025; }],
      ["所有嘴巴一起呼吸", "legendary", 1, "传播会在敌群间连续跳跃一次，仿佛它们共用一片肺。", () => { bonuses.hiveMind = 1; }],
    ],
  },
  {
    id: "storm", label: "雷兽", icon: "ϟ", partner: "precision",
    nodes: [
      ["雷兽乳牙", "common", 3, "它咬中一个敌人时，会试着再咬一个。雷链概率 +12%。", () => { bonuses.chainChance = Math.min(.8, bonuses.chainChance + .12); }],
      ["分叉舌头", "common", 3, "雷兽多舔到 1 个目标。", () => { bonuses.chainTargets += 1; }],
      ["喉咙里的雷", "rare", 3, "它把一声咆哮含在嘴里。雷链伤害提高。", () => { bonuses.chainDamage += .14; }],
      ["追尾巴", "rare", 3, "雷兽越转越快。攻击间隔 -6%，技能冷却 -5%。", () => { bonuses.cooldown *= .94; bonuses.skillCooldown *= .95; }],
      ["竖起来的鬃毛", "rare", 3, "电场向外炸开。范围 +8%，拾取范围 +25。", () => { bonuses.range *= 1.08; bonuses.magnet += 25; }],
      ["让它咬你一口", "epic", 2, "雷链更凶，但被咬掉的皮让护甲降低 4%。", () => { bonuses.chainDamage += .28; bonuses.chainChance += .12; bonuses.armor -= .04; }],
      ["吞下心跳", "epic", 2, "雷兽会吃掉死者最后一次心跳，返还专属技能冷却。", () => { bonuses.skillRefund += .045; }],
      ["被标记的猎物", "epic", 2, "观星人指出弱点，雷兽扑上去；暴击显著提高雷链概率与伤害。", () => { bonuses.crit += .05; bonuses.chainChance += .16; bonuses.chainDamage += .12; }],
      ["咬住整片天空", "legendary", 1, "雷链抵达最后一个目标后，有概率掉头再咬回来。", () => { bonuses.stormMastery = 1; }],
    ],
  },
  {
    id: "gravity", label: "盲星", icon: "◉", partner: "storm",
    nodes: [
      ["口袋里的小洞", "common", 3, "别把手指伸进去。所有攻击获得 9 爆炸半径。", () => { bonuses.explosion += 9; }],
      ["很重的眼泪", "common", 3, "盲星哭出的东西会把周围压宽。范围 +8%。", () => { bonuses.area *= 1.08; }],
      ["看不见的舌头", "rare", 3, "爆炸会伸出舌头，更用力地拉扯敌人。", () => { bonuses.singularityPull += 7; }],
      ["尸体的潮汐", "rare", 3, "敌人被拖近时替你挡住一部分伤害。近距离伤害 +8%，护甲 +4%。", () => { bonuses.closeDamage += .08; bonuses.armor += .04; }],
      ["甩出去的行星", "rare", 3, "盲星把弹体绕着自己甩了一圈。弹速、击退和射程提高。", () => { bonuses.projectileSpeed *= 1.10; bonuses.knockback *= 1.12; bonuses.range *= 1.05; }],
      ["背上一颗死星", "epic", 2, "爆炸与范围大幅提高，但移动速度降低。它比看起来更重。", () => { bonuses.explosion += 22; bonuses.area *= 1.12; bonuses.moveSpeed *= .94; }],
      ["尸体向里倒下", "epic", 2, "爆炸击杀时，尸体会向内坍缩第二次。", () => { bonuses.singularityDeath += .28; }],
      ["雷兽掉进井里", "epic", 2, "雷兽在盲星腹中咆哮；坍缩中心会额外触发雷链。", () => { bonuses.singularityDeath += .18; bonuses.chainChance += .12; bonuses.chainTargets += 1; }],
      ["没有外面的世界", "legendary", 1, "二次坍缩可直接吞掉濒死的普通敌人。", () => { bonuses.eventHorizon = 1; }],
    ],
  },
  {
    id: "precision", label: "观星人", icon: "✦", partner: "ballistic",
    nodes: [
      ["画在眼皮里的星", "common", 3, "闭眼也能看见它。暴击率 +5%。", () => { bonuses.crit += .05; }],
      ["折叠望远镜", "common", 3, "只剩指甲大小，却还能看见尽头。射程 +9%。", () => { bonuses.range *= 1.09; }],
      ["第一眼", "rare", 3, "身体完整时，观星人愿意借你那只好眼睛。满生命暴击率 +8%。", () => { bonuses.fullHpCrit += .08; }],
      ["巨兽的星座图", "rare", 3, "那些连线恰好穿过每个器官。对 Boss 伤害 +11%。", () => { bonuses.bossDamage += .11; }],
      ["写满名字的黑册", "rare", 3, "被记下来的强敌都活不长。对精英与支援型敌人伤害 +12%。", () => { bonuses.eliteDamage += .12; }],
      ["眨眼就输", "epic", 2, "攻击稍慢，但暴击率与伤害潜力提高。观星人从不眨眼。", () => { bonuses.crit += .10; bonuses.cooldown *= 1.07; bonuses.damage *= 1.12; }],
      ["伤口里的烟花", "epic", 2, "暴击有更高概率在伤口里制造冲击波。", () => { bonuses.critBlast += .24; }],
      ["白鸦替你校准", "epic", 2, "白鸦衔走偏差；远距攻击获得额外贯穿和暴击。", () => { bonuses.farDamage += .14; bonuses.pierce += 1; bonuses.crit += .05; }],
      ["只有一个答案", "legendary", 1, "首次击中满生命敌人时，必定视作强化弱点命中。", () => { bonuses.omniscientAim = 1; }],
    ],
  },
  {
    id: "survival", label: "尸船", icon: "⬡", partner: "cryo",
    nodes: [
      ["第二颗心", "common", 3, "最大生命提高 14 并恢复等量生命。", () => { player.maxHp += 14; player.hp += 14; }],
      ["寄居蟹的旧壳", "common", 3, "受到的伤害降低 5%。", () => { bonuses.armor += .05; }],
      ["温热输血袋", "rare", 3, "每秒恢复 0.45 生命。", () => { bonuses.regen += .45; }],
      ["不肯熄灭的灯", "rare", 3, "静止时额外获得 7% 减伤。", () => { bonuses.stationaryArmor += .07; }],
      ["星兽骨哨", "rare", 3, "每 20 次左右击杀恢复生命。", () => { bonuses.killHeal += 3; bonuses.killHealEvery = Math.max(14, bonuses.killHealEvery - 1); }],
      ["咬住舌头", "epic", 2, "低生命时伤害显著提高。", () => { bonuses.lowHpDamage += .28; }],
      ["痛觉电池", "epic", 2, "生命越低，技能恢复越快。", () => { bonuses.painEngine = (bonuses.painEngine || 0) + .18; }],
      ["裹着霜的甲片", "epic", 2, "护甲与寒霜碎裂互相增强。", () => { bonuses.armor += .06; bonuses.shatter += .10; bonuses.frostBurst += .10; }],
      ["最后一口气", "legendary", 1, "每局第一次致命伤会保留 1 点生命并震开敌群。", () => { bonuses.deathRefusal = 1; }],
    ],
  },
  {
    id: "mobility", label: "漂流者", icon: "»", partner: "survival",
    nodes: [
      ["偷来的推进靴", "common", 3, "移动速度提高 7%。", () => { bonuses.moveSpeed *= 1.07; }],
      ["折断的秒针", "common", 3, "专属技能冷却缩短 7%。", () => { bonuses.skillCooldown *= .93; }],
      ["红色彗尾", "rare", 3, "移动时伤害提高 10%。", () => { bonuses.movingDamage += .10; }],
      ["拾荒者地图", "rare", 3, "拾取范围增加 40，经验获取提高 5%。", () => { bonuses.magnet += 40; bonuses.xp *= 1.05; }],
      ["半张虫洞票", "rare", 3, "使用专属技能后获得更长无敌时间。", () => { bonuses.skillShield = (bonuses.skillShield || 0) + .16; }],
      ["过热引擎", "epic", 2, "移动和攻速提高，但最大生命 -7。", () => { bonuses.moveSpeed *= 1.12; bonuses.cooldown *= .92; tradeMaxHp(7); }],
      ["鞋底的地雷", "epic", 2, "释放专属技能时在原地制造冲击。", () => { bonuses.dashNova = (bonuses.dashNova || 0) + .28; }],
      ["跑起来的甲壳", "epic", 2, "移动时增伤，静止时减伤。", () => { bonuses.movingDamage += .13; bonuses.stationaryArmor += .06; }],
      ["回不去的航迹", "legendary", 1, "高速移动会周期性留下伤害性星轨。", () => { bonuses.endlessTrail = 1; }],
    ],
  },
  {
    id: "economy", label: "黑市", icon: "◇", partner: "mobility",
    nodes: [
      ["生锈的磁铁", "common", 3, "拾取范围增加 55。", () => { bonuses.magnet += 55; }],
      ["压扁的记忆", "common", 3, "经验获取提高 9%。", () => { bonuses.xp *= 1.09; }],
      ["回血软糖", "rare", 3, "拾取经验晶体时有概率恢复少量生命。", () => { bonuses.pickupHeal += .035; }],
      ["多印了一张票", "rare", 2, "立即获得 1 次强化刷新。", () => { state.rerolls += 1; }],
      ["巨兽的乳牙", "rare", 3, "精英伤害和经验获取提高。", () => { bonuses.eliteDamage += .08; bonuses.xp *= 1.07; }],
      ["高利贷", "epic", 2, "全伤害 +18%，但失去 12 当前生命。", () => { bonuses.damage *= 1.18; player.hp = Math.max(1, player.hp - 12); }],
      ["变异录音带", "epic", 2, "武器异梦产生的派生攻击更强。", () => { bonuses.mutationAmp += .12; }],
      ["跑丢的零钱", "epic", 2, "高速拾取会返还技能冷却。", () => { bonuses.pickupSkillRefund = (bonuses.pickupSkillRefund || 0) + .025; }],
      ["吃不完的苹果", "legendary", 1, "每次武器异梦后随机强化一个已选流派。", () => { bonuses.adaptiveEvolution = 1; }],
    ],
  },
];

const patronDefinitions = {
  ballistic: { name: "白鸦", epithet: "把距离变成伤口", color: "#e7edf5" },
  blaze: { name: "赤日", epithet: "喜欢看尸体继续燃烧", color: "#ff754f" },
  cryo: { name: "眠月", epithet: "让一切慢到碎裂", color: "#8fdfff" },
  toxin: { name: "孢母", epithet: "每个敌人都是下一个宿主", color: "#8ee66b" },
  storm: { name: "雷兽", epithet: "一口咬住整片敌群", color: "#76dfff" },
  gravity: { name: "盲星", epithet: "看不见，但能把万物拉近", color: "#b49aff" },
  precision: { name: "观星人", epithet: "只承认完美的一击", color: "#ffd166" },
};

const neutralPoolNames = {
  survival: "尸船遗物池",
  mobility: "漂流者遗物池",
  economy: "黑市遗物池",
};

const PATRON_LIMIT = 4;

function familyProgress(familyId) {
  return Object.entries(upgradeLevels)
    .filter(([id]) => id.startsWith(`${familyId}_`))
    .reduce((total, [, level]) => total + level, 0);
}

function buildFamilyUpgrades() {
  return upgradeFamilyBlueprints.flatMap((family) => family.nodes.map((node, index) => {
    const [title, rarity, max, description, apply] = node;
    const thresholds = [0, 0, 1, 2, 3, 4, 5, 4, 8];
    const patron = patronDefinitions[family.id] || null;
    const partner = patronDefinitions[family.partner] || null;
    const tierLabel = index <= 1 ? "核心祝福" : index <= 4 ? "二阶祝福" : index === 5 ? "代价祝福" : index === 6 ? "恩宠" : index === 7 ? "双神祝福" : "传奇祝福";
    const familyLabel = patron
      ? index === 7 && partner
        ? `${tierLabel} · ${patron.name} × ${partner.name}`
        : `${tierLabel} · ${patron.name}`
      : `遗物 · ${neutralPoolNames[family.id]}`;
    return {
      id: `${family.id}_${index + 1}`,
      family: familyLabel,
      title,
      icon: family.icon,
      rarity,
      max,
      description,
      tags: [family.id, family.label],
      patron: patron ? family.id : null,
      tier: index + 1,
      offerType: patron ? (index === 7 ? "duo" : index === 8 ? "legendary" : "boon") : "relic",
      weight: [100, 88, 58, 54, 50, 26, 22, 16, 7][index],
      requires: () => familyProgress(family.id) >= thresholds[index]
        && (index !== 7 || familyProgress(family.partner) >= 2),
      apply,
    };
  }));
}

const upgrades = [...coreUpgrades, ...buildFamilyUpgrades()];

function familyItemCount(familyId) {
  return upgrades.filter((upgrade) => tagsForUpgrade(upgrade).includes(familyId)
    && (upgradeLevels[upgrade.id] || 0) > 0).length;
}

const transformationDefinitions = [
  {
    id: "glass_saint", name: "玻璃圣徒", color: "#f5e7bd",
    hint: "远射遗物与弱点赐福在皮肤下拼出透明翅膀。",
    requires: () => familyItemCount("ballistic") >= 2 && familyItemCount("precision") >= 2,
    apply: () => { bonuses.crit += .08; bonuses.farDamage += .12; tradeMaxHp(8); },
  },
  {
    id: "rotten_sun", name: "腐烂的太阳", color: "#b9e85a",
    hint: "火焰学会生病，疾病也学会燃烧。",
    requires: () => familyItemCount("blaze") >= 2 && familyItemCount("toxin") >= 2,
    apply: () => { bonuses.burnSpread += .6; bonuses.venomAmp += .08; },
  },
  {
    id: "shrouded_moon", name: "裹尸月", color: "#a8e8ff",
    hint: "甲壳里的低温不再保护你，它开始保护死亡。",
    requires: () => familyItemCount("cryo") >= 3 && familyItemCount("survival") >= 1,
    apply: () => { bonuses.armor += .05; bonuses.frostBurst += .15; },
  },
  {
    id: "thunder_walker", name: "走雷的人", color: "#83efff",
    hint: "你跑过的地方比雷声更早抵达。",
    requires: () => familyItemCount("storm") >= 3 && familyItemCount("mobility") >= 1,
    apply: () => { bonuses.skillRefund += .05; bonuses.movingDamage += .08; },
  },
  {
    id: "bottomless_child", name: "无底胃", color: "#b59aff",
    hint: "爆炸没有散开，而是向里咬了一口。",
    requires: () => familyItemCount("gravity") >= 3 && (upgradeLevels.explosion || 0) > 0,
    apply: () => { bonuses.singularityDeath += .20; bonuses.area *= 1.08; },
  },
  {
    id: "scrap_king", name: "捡破烂的王", color: "#f0d37a",
    hint: "每件垃圾都开始缴税。",
    requires: () => familyItemCount("economy") >= 3 && familyItemCount("survival") >= 1,
    apply: () => { bonuses.xp *= 1.08; bonuses.killHeal += 2; },
  },
  {
    id: "four_whispers", name: "四重低语", color: "#f4b8ff",
    hint: "四位赐福者同时开口，武器听见了第五种声音。",
    requires: () => state.activePatrons.size >= PATRON_LIMIT,
    apply: () => { bonuses.mutationAmp += .12; bonuses.damage *= 1.05; },
  },
  {
    id: "faceless_larva", name: "无脸幼体", color: "#ff87ad",
    hint: "三次武器异梦以后，你也不再保持原来的形状。",
    requires: () => state.mutationCount >= 3 && familyItemCount("toxin") >= 1 && familyItemCount("gravity") >= 1,
    apply: () => { bonuses.execute = Math.min(.28, bonuses.execute + .03); bonuses.mutationAmp += .08; },
  },
];

function checkTransformations() {
  for (const transformation of transformationDefinitions) {
    if (state.transformations.has(transformation.id) || !transformation.requires()) continue;
    state.transformations.add(transformation.id);
    transformation.apply();
    invalidateSynergies();
    announce("SOMETHING CHANGED", transformation.name);
    addLog(`隐藏变身「${transformation.name}」完成：${transformation.hint}`, true);
    burst(player.x, player.y, transformation.color, 38, 190);
  }
}

const metaUpgradeDefinitions = [
  { id: "vitality", title: "稳定躯壳", label: "BODY CACHE", max: 5, costs: [10, 18, 28, 40, 55], description: "每级让远征初始最大生命提高 5。" },
  { id: "power", title: "武器预热", label: "FORGE CACHE", max: 5, costs: [12, 22, 34, 48, 64], description: "每级让远征初始全伤害提高 4%。" },
  { id: "foresight", title: "先见缓存", label: "CHOICE CACHE", max: 3, costs: [25, 45, 70], description: "每级让每局强化刷新次数增加 1。" },
];

function activeSynergies() {
  if (synergyCache) return synergyCache;
  const result = [];
  const hasBurn = bonuses.burn > 0 || weapons.some((weapon) => weapon.burn_damage > 0);
  const hasPoison = bonuses.poison > 0 || weapons.some((weapon) => weapon.poison_damage > 0);
  const hasSlow = bonuses.slow > 0 || weapons.some((weapon) => weapon.slow_percent > 0);
  const deliveries = new Set(weapons.map((weapon) => weapon.delivery));
  if (hasBurn && hasSlow) result.push({ id: "thermal", label: "温差崩解 · 双状态 +25% 伤害" });
  if (hasBurn && hasPoison) result.push({ id: "plaguefire", label: "疫火共生 · 双重持续伤害" });
  if (deliveries.size >= 3) result.push({ id: "spectrum", label: "全谱武装 · 全伤害 +10%" });
  if (weapons.some((weapon) => weapon.delivery === "aura") && weapons.some((weapon) => weapon.delivery === "orbit")) {
    result.push({ id: "fortress", label: "近域堡垒 · 接触伤害 -10%" });
  }
  if (weapons.some((weapon) => weapon.explosion_radius + bonuses.explosion > 0) && weapons.some((weapon) => weapon.pierce + bonuses.pierce > 1)) {
    result.push({ id: "breach", label: "贯穿爆破 · 爆炸范围 +20%" });
  }
  const mutationTotal = weapons.reduce((total, weapon) => total + (weapon.mutations?.length || 0), 0);
  if (mutationTotal >= 3) result.push({ id: "adaptive", label: "自适应武装 · 三重异变共鸣" });
  if (weapons.some((weapon) => (weapon.mutations?.length || 0) >= 2)) result.push({ id: "ascendant", label: "升格武器 · 单武器双重形态" });
  for (const transformation of transformationDefinitions) {
    if (state.transformations.has(transformation.id)) result.push({ id: transformation.id, label: `变身 · ${transformation.name}` });
  }
  synergyCache = result;
  return synergyCache;
}

function invalidateSynergies() { synergyCache = null; }

function hasSynergy(id) {
  return activeSynergies().some((synergy) => synergy.id === id);
}

function weaponMutation(weapon, mechanic) {
  return weapon?.mutations?.find((mutation) => mutation.mechanic === mechanic) || null;
}

function mutationPower(scale) {
  return scale * (1 + bonuses.mutationAmp);
}

function runtimeDamage(weapon) {
  return weapon.damage * (weapon.mutationDamageScale || 1) * bonuses.damage * (hasSynergy("spectrum") ? 1.10 : 1);
}

function runtimeCooldown(weapon) {
  return Math.max(0.11, weapon.cooldown * (weapon.mutationCooldownScale || 1) * bonuses.cooldown);
}

function runtimeCount(weapon) {
  if (["projectile", "orbit", "melee"].includes(weapon.delivery)) return Math.min(12, weapon.projectile_count + bonuses.projectiles);
  return weapon.projectile_count;
}

function runtimeRange(weapon) {
  const areaScale = ["aura", "orbit", "melee"].includes(weapon.delivery) ? bonuses.area : 1;
  return weapon.range * (weapon.mutationRangeScale || 1) * bonuses.range * areaScale;
}

function runtimeExplosion(weapon) {
  const base = (Number(weapon.explosion_radius) || 0) + bonuses.explosion;
  return base * bonuses.area * (hasSynergy("breach") ? 1.2 : 1);
}

function beamStyleForWeapon(weapon) {
  const form = inferVisualForm(weapon);
  if (["staff", "orb", "tome"].includes(form)) return "ribbon";
  if (form === "cannon") return "lance";
  if (form === "bow") return "arrow";
  return "tracer";
}

function ringStyleForWeapon(weapon) {
  const form = inferVisualForm(weapon);
  if (form === "tome") return "runes";
  if (form === "orb" || weapon.delivery === "aura") return "field";
  if (form === "drone" || weapon.delivery === "orbit") return "orbit";
  return "pulse";
}

function slashStyleForWeapon(weapon) {
  const form = inferVisualForm(weapon);
  if (form === "daggers") return "daggers";
  if (weaponMutation(weapon, "crescent")) return "crescent";
  return "cleave";
}

function damageReduction() {
  const stationary = state.isMoving ? 0 : bonuses.stationaryArmor;
  return Math.min(0.65, bonuses.armor + stationary + (hasSynergy("fortress") ? 0.10 : 0));
}

function starterWeapon() {
  return {
    name: "制式脉冲器",
    description: "自动锁定最近的异常体。",
    delivery: "projectile",
    visual_form: "rifle",
    trajectory: "straight",
    targeting: "nearest",
    visual_variant: 0,
    secondary_color: "#18213a",
    behavior_summary: "向最近的异常体发射直线脉冲。",
    visual_motif: "制式枪身与蓝白脉冲核心",
    damage: 16,
    cooldown: 0.58,
    projectile_count: 1,
    projectile_speed: 490,
    projectile_size: 5,
    range: 520,
    spread_degrees: 0,
    pierce: 0,
    crit_chance: 0.06,
    knockback: 4,
    explosion_radius: 0,
    burn_damage: 0,
    poison_damage: 0,
    slow_percent: 0,
    homing: 0.14,
    color: "#f1f0eb",
    tradeoff: "none",
    tradeoff_text: "属性均衡",
    tags: ["制式", "脉冲"],
    timer: 0,
    starter: true,
  };
}

function inferVisualForm(weapon) {
  if (visualMeta[weapon.visual_form]) return weapon.visual_form;
  const text = `${weapon.name || ""} ${(weapon.tags || []).join(" ")}`.toLowerCase();
  if (/匕|双刀|dagger/.test(text)) return "daggers";
  if (/剑|刀|刃|blade/.test(text) || weapon.delivery === "melee") return "blade";
  if (/弓|箭|bow/.test(text)) return "bow";
  if (/炮|霰弹|cannon|shotgun/.test(text)) return "cannon";
  if (/法杖|staff/.test(text) || weapon.delivery === "beam") return "staff";
  if (/魔典|书|tome/.test(text)) return "tome";
  if (/球|orb/.test(text) || weapon.delivery === "aura") return "orb";
  if (/无人机|卫星|drone/.test(text) || weapon.delivery === "orbit") return "drone";
  return "rifle";
}

function hydrateWeapon(raw, starter = false) {
  const weapon = { ...starterWeapon(), ...raw, timer: 0, recoil: 0 };
  weapon.visual_form = inferVisualForm(weapon);
  weapon.tags = Array.isArray(weapon.tags) ? weapon.tags : ["武器"];
  weapon.mutations = Array.isArray(raw?.mutations) ? raw.mutations.map((mutation) => ({ ...mutation })) : [];
  weapon.mutationDamageScale = Number(raw?.mutationDamageScale) || 1;
  weapon.mutationCooldownScale = Number(raw?.mutationCooldownScale) || 1;
  weapon.mutationRangeScale = Number(raw?.mutationRangeScale) || 1;
  weapon.trajectory = ["straight", "homing", "boomerang", "spiral", "wave", "skyfall"].includes(raw?.trajectory) ? raw.trajectory : "straight";
  weapon.targeting = ["nearest", "strongest", "cluster", "random"].includes(raw?.targeting) ? raw.targeting : "nearest";
  const hash = [...String(weapon.name)].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
  weapon.visual_variant = Number.isInteger(raw?.visual_variant) ? Math.max(0, Math.min(11, raw.visual_variant)) : hash % 12;
  weapon.secondary_color = /^#[0-9a-f]{6}$/i.test(raw?.secondary_color || "") ? raw.secondary_color : ["#f1f0eb", "#18213a", "#ffd166", "#58e6ff"][(hash >>> 4) % 4];
  weapon.poison_damage = Number(raw?.poison_damage) || 0;
  weapon.behavior_summary = String(raw?.behavior_summary || weapon.description || "");
  weapon.visual_motif = String(raw?.visual_motif || "异星合金与发光核心");
  weapon.starter = starter;
  return weapon;
}

function defaultArchetype(concept = "使用巴雷特的远程狙击手") {
  const lower = concept.toLowerCase();
  let role = "sniper";
  if (/刺客|瞬移|双刀|匕首|assassin/.test(lower)) role = "assassin";
  else if (/猎人|毒|弓|hunter/.test(lower)) role = "hunter";
  else if (/法师|法术|魔法|mage/.test(lower)) role = "mage";
  else if (/勇士|战士|近战|重甲|warrior/.test(lower)) role = "warrior";
  const configs = {
    warrior: ["赤曜", "星铠勇士", "fortress", "#d94b4b", "#ffd166", 125, 220, 3, "恒星壁垒", "减伤 12%，最大生命更高", { name: "猩红断刃", delivery: "melee", visual_form: "blade", damage: 38, cooldown: .7, range: 112, spread_degrees: 82, pierce: 4, knockback: 18, color: "#ffd166", tags: ["近战", "斩击"] }],
    assassin: ["夜隼", "相位行者", "blink", "#7c4dff", "#58e6ff", 90, 275, 1.65, "虫洞跃迁", "专属技能冷却 -18%", { name: "相位双匕", delivery: "melee", visual_form: "daggers", damage: 21, cooldown: .32, projectile_count: 2, range: 88, spread_degrees: 60, pierce: 2, crit_chance: .24, color: "#58e6ff", tags: ["近战", "双持"] }],
    hunter: ["绿痕", "异星猎人", "venom", "#45b85c", "#d8ff72", 100, 245, 2.7, "外星毒理", "所有武器附加腐蚀伤害", { name: "苔痕猎弓", delivery: "projectile", visual_form: "bow", trajectory: "homing", targeting: "nearest", damage: 25, cooldown: .62, projectile_speed: 500, range: 600, pierce: 1, poison_damage: 7, homing: .25, color: "#d8ff72", tags: ["弓箭", "剧毒"] }],
    mage: ["星烬", "星图术士", "arcane", "#526dff", "#d78bff", 92, 235, 2.8, "星云超载", "范围 +18%，爆炸半径提升", { name: "折光裁决", delivery: "beam", visual_form: "staff", damage: 45, cooldown: 1.08, range: 480, pierce: 3, projectile_size: 6, color: "#d78bff", tags: ["奥术", "贯穿"] }],
    sniper: ["白鸦", "深空狙击手", "deadeye", "#d9e4ef", "#ff4f63", 95, 225, 3, "星轨准星", "暴击率 +12%，重弹更稳定", { name: "寂静·巴雷特", delivery: "projectile", visual_form: "rifle", damage: 82, cooldown: 1.8, projectile_speed: 720, projectile_size: 8, range: 700, pierce: 4, crit_chance: .28, knockback: 22, color: "#ff4f63", tags: ["重型", "狙击"] }],
  };
  const [display_name, title, trait, primary_color, accent_color, max_hp, move_speed, dash_cooldown, passive_name, passive_text, rawWeapon] = configs[role];
  return { display_name, title, role, trait, primary_color, accent_color, max_hp, move_speed, dash_cooldown, passive_name, passive_text, fantasy: `以「${concept.slice(0, 38)}」为核心的战斗流派。`, starting_weapon: hydrateWeapon(rawWeapon, true) };
}

function applyArchetypeIdentity() {
  const archetype = selectedArchetype || defaultArchetype();
  const skill = roleSkills[archetype.role] || roleSkills.sniper;
  ui.identityCard.style.setProperty("--identity-primary", archetype.primary_color);
  ui.identityCard.style.setProperty("--identity-accent", archetype.accent_color);
  ui.identityRole.textContent = `${archetype.role.toUpperCase()} · ${archetype.passive_name}`;
  ui.identityName.textContent = `${archetype.display_name} / ${archetype.title}`;
  ui.identityPassive.textContent = `${archetype.passive_text} · SPACE「${skill.name}」`;
  ui.skillName.textContent = skill.name;
  ui.skillName.title = skill.description;
}

function showUnselectedIdentity() {
  ui.identityRole.textContent = "COMBAT ARCHETYPE";
  ui.identityName.textContent = "等待接入";
  ui.identityPassive.textContent = "开始游戏后选择三种模板或自由输入";
  ui.skillName.textContent = "专属技能";
  ui.skillName.title = "选择流派后解锁";
}

function openArchetypeSelection() {
  if (state.running) return;
  ui.archetypeModal.hidden = false;
  setTimeout(() => ui.archetypeInput.focus(), 60);
}

function closeArchetypeSelection() {
  if (ui.archetypeConfirm.disabled) return;
  ui.archetypeModal.hidden = true;
}

async function compileArchetypeAndStart() {
  if (ui.archetypeConfirm.disabled) return;
  const concept = ui.archetypeInput.value.trim();
  if (!concept) { ui.archetypeInput.focus(); return; }
  audio.wake();
  ui.archetypeConfirm.disabled = true;
  ui.archetypeConfirmLabel.textContent = "正在塑造战斗身份";
  ui.archetypeStatus.hidden = false;
  try {
    const response = await fetch("/api/generate-archetype", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, sessionId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `服务器返回 ${response.status}`);
    selectedArchetype = data.archetype;
    ui.archetypeModal.hidden = true;
    resetGame();
  } catch (error) {
    selectedArchetype = defaultArchetype(concept);
    ui.archetypeModal.hidden = true;
    resetGame();
    addLog(`远方没有回应，已启用安全原型：${error instanceof Error ? error.message : "连接失败"}`, true);
  } finally {
    ui.archetypeConfirm.disabled = false;
    ui.archetypeConfirmLabel.textContent = "确认流派并进入阶段 I";
    ui.archetypeStatus.hidden = true;
  }
}

function resetGame() {
  audio.wake();
  selectedArchetype ||= defaultArchetype(ui.archetypeInput?.value || undefined);
  state.running = true;
  state.paused = false;
  state.forging = false;
  state.time = 0;
  state.kills = 0;
  state.level = 1;
  state.xp = 0;
  state.xpNeed = 18;
  state.spawnClock = 0;
  state.wave = 0;
  state.difficulty = selectedDifficulty;
  state.rewardOpen = false;
  state.rewardQueue = [];
  state.rewardType = "upgrade";
  state.rerolls = 1 + profile.meta.foresight;
  state.bossSpawned = [false, false, false];
  state.bossesDefeated = 0;
  state.stageIndex = 0;
  state.skillCooldown = 0;
  state.dashTimer = 0;
  state.shake = 0;
  state.damageDealt = 0;
  state.victory = false;
  state.seenSpecies = new Set();
  state.activeForgeTier = 1;
  state.forgeOpened = [false, false, false];
  state.openingWaveTier = 0;
  state.openingWaveRemaining = 0;
  state.encounterTriggered = Array(6).fill(false);
  state.upgradePicks = 0;
  state.mutationRound = 0;
  state.mutationCount = 0;
  state.harvestKills = 0;
  state.isMoving = false;
  state.trailClock = 0;
  state.deathRefusalUsed = false;
  state.activePatrons = new Set();
  state.transformations = new Set();
  state.finalBossForgeAt = 0;
  bonuses = createBonuses();
  bonuses.damage *= 1 + profile.meta.power * 0.04;
  if (selectedArchetype.trait === "fortress") bonuses.armor += 0.12;
  if (selectedArchetype.trait === "blink") bonuses.skillCooldown *= 0.82;
  if (selectedArchetype.trait === "arcane") { bonuses.area *= 1.18; bonuses.explosion += 10; }
  if (selectedArchetype.trait === "deadeye") bonuses.crit += 0.12;
  if (selectedArchetype.trait === "venom") { bonuses.poison += 4; bonuses.venomAmp += .06; }
  upgradeLevels = {};
  player.x = 0;
  player.y = 0;
  player.maxHp = (selectedArchetype.max_hp || 100) + profile.meta.vitality * 5;
  player.hp = player.maxHp;
  player.speed = selectedArchetype.move_speed || 238;
  player.invulnerable = 0;
  player.moveX = 0;
  player.moveY = -1;
  enemies = [];
  projectiles = [];
  xpGems = [];
  pickups = [];
  particles = [];
  effects = [];
  mutationZones = [];
  enemyProjectiles = [];
  pendingAttacks = [];
  weapons = [hydrateWeapon(selectedArchetype.starting_weapon || starterWeapon(), true)];
  weapons[0].forgeTier = 0;
  invalidateSynergies();
  currentBoss = null;
  currentUpgradeChoices = [];
  currentMutationChoices = [];
  currentMutationWish = "";
  entityId = 1;
  ui.gameOver.hidden = true;
  ui.forge.hidden = true;
  ui.upgrade.hidden = true;
  ui.bossHud.hidden = true;
  ui.pauseCard.hidden = true;
  ui.intro.classList.add("dismissed");
  ui.runId.textContent = `RH—${String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0")}`;
  ui.eventLog.replaceChildren();
  applyArchetypeIdentity();
  addLog(`「${selectedArchetype.title}」${selectedArchetype.display_name} 接入：${selectedArchetype.passive_name}。`, true);
  addLog(`${difficultyModes[state.difficulty].label}启动。SPACE 可释放角色专属技能。`);
  startOpeningWave(0);
  updateLoadoutUI();
  updateSynergyUI();
  updateHUD();
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  width = Math.max(320, bounds.width);
  height = Math.max(300, bounds.height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function currentSkill() {
  return roleSkills[selectedArchetype?.role] || roleSkills.sniper;
}

function skillCooldownDuration() {
  return currentSkill().cooldown * bonuses.skillCooldown;
}

function addLog(message, hot = false) {
  const item = document.createElement("li");
  item.textContent = `[${formatTime(state.time)}] ${message}`;
  item.classList.toggle("hot", hot);
  ui.eventLog.prepend(item);
  while (ui.eventLog.children.length > 7) ui.eventLog.lastElementChild.remove();
}

function updateHUD() {
  const hpRatio = Math.max(0, player.hp / player.maxHp);
  ui.healthFill.style.width = `${hpRatio * 100}%`;
  ui.healthText.textContent = `${Math.ceil(Math.max(0, player.hp))} / ${player.maxHp}`;
  ui.xpFill.style.width = `${Math.min(100, state.xp / state.xpNeed * 100)}%`;
  ui.xpText.textContent = `${state.xp} / ${state.xpNeed}`;
  ui.level.textContent = String(state.level);
  ui.time.textContent = formatTime(state.time);
  ui.kills.textContent = String(state.kills).padStart(3, "0");
  const stageIndex = state.stageIndex;
  const stageElapsed = Math.max(0, state.time - stageIndex * STAGE_DURATION);
  const stageProgress = state.time >= RUN_DURATION ? 1 : Math.min(1, stageElapsed / STAGE_DURATION);
  const stageLockedByBoss = currentBoss && !currentBoss.dead && Math.floor(state.time / STAGE_DURATION) > stageIndex;
  ui.stageLabel.textContent = stages[stageIndex].label;
  ui.stageFill.style.width = `${stageProgress * 100}%`;
  ui.stageFill.style.background = stages[stageIndex].color;
  ui.stageTimer.textContent = state.openingWaveTier === stageIndex + 1
    ? `首波 ${String(state.openingWaveRemaining).padStart(2, "0")}`
    : stageLockedByBoss ? "首领锁定"
    : state.time >= RUN_DURATION ? "核心暴露" : formatTime(Math.max(0, STAGE_DURATION - stageElapsed));
  const skillDuration = skillCooldownDuration();
  ui.skillFill.style.width = `${Math.max(0, Math.min(1, 1 - state.skillCooldown / skillDuration)) * 100}%`;
  if (currentBoss && !currentBoss.dead) {
    ui.bossHud.hidden = false;
    ui.bossName.textContent = currentBoss.name;
    ui.bossFill.style.width = `${Math.max(0, currentBoss.hp / currentBoss.maxHp) * 100}%`;
  } else {
    ui.bossHud.hidden = true;
  }
}

function createWeaponCard(weapon) {
  const meta = deliveryMeta[weapon.delivery] || deliveryMeta.projectile;
  const visual = visualMeta[inferVisualForm(weapon)] || visualMeta.rifle;
  const card = document.createElement("article");
  card.className = "weapon-card";
  card.style.setProperty("--weapon-color", weapon.color);

  const icon = document.createElement("canvas");
  icon.className = "weapon-icon weapon-model-icon";
  icon.width = 96;
  icon.height = 72;
  icon.title = `${visual.label} · ${meta.label}`;
  requestAnimationFrame(() => drawWeaponIconCanvas(icon, weapon));

  const body = document.createElement("div");
  body.className = "weapon-meta";
  const name = document.createElement("h3");
  name.textContent = weapon.name;
  const description = document.createElement("p");
  description.textContent = weapon.description;
  const stats = document.createElement("div");
  stats.className = "weapon-mini-stats";
  const dps = (runtimeDamage(weapon) / runtimeCooldown(weapon)).toFixed(1);
  stats.append(makeMiniStat("伤害", runtimeDamage(weapon).toFixed(0)), makeMiniStat("频率", `${dps}/s`));
  if (weapon.mutations?.length) stats.append(makeMiniStat("异变", weapon.mutations.length));
  else if (weapon.starter) stats.append(makeMiniStat("来源", "角色自带"));
  else if (weapon.forged) stats.append(makeMiniStat("重构", `阶段 ${forgeTiers[(weapon.forgeTier || weapon.level || 1) - 1]?.roman || "I"}`));
  body.append(name, description, stats);
  card.append(icon, body);
  return card;
}

function makeMiniStat(label, value) {
  const span = document.createElement("span");
  span.append(`${label} `);
  const strong = document.createElement("b");
  strong.textContent = String(value);
  span.append(strong);
  return span;
}

function updateLoadoutUI() {
  ui.weaponList.replaceChildren(...weapons.map(createWeaponCard));
  ui.slotCount.textContent = `${weapons.length} / 4`;
}

function updateSynergyUI() {
  const synergies = activeSynergies();
  ui.synergyList.replaceChildren();
  if (synergies.length === 0) {
    const empty = document.createElement("span");
    empty.className = "empty-synergy";
    empty.textContent = "等待武器产生共鸣";
    ui.synergyList.append(empty);
    return;
  }
  for (const synergy of synergies) {
    const chip = document.createElement("span");
    chip.textContent = synergy.label;
    ui.synergyList.append(chip);
  }
}

function updateProfileUI() {
  ui.profileBest.textContent = formatTime(profile.bestTime || 0);
  ui.profileKills.textContent = String(profile.totalKills || 0);
  ui.profileWeapons.textContent = String((profile.blueprints || []).length);
  ui.profileEchoes.textContent = String(profile.echoes || 0);
  ui.echoBalance.textContent = String(profile.echoes || 0);
  ui.archiveEchoes.textContent = String(profile.echoes || 0);
  ui.sound.classList.toggle("muted", !audio.enabled);
  ui.sound.classList.toggle("active", audio.enabled);
  ui.sound.textContent = audio.enabled ? "◉ 声音" : "○ 静音";
}

function renderMetaUpgrades() {
  ui.metaUpgrades.replaceChildren();
  for (const definition of metaUpgradeDefinitions) {
    const level = profile.meta[definition.id] || 0;
    const maxed = level >= definition.max;
    const cost = maxed ? 0 : definition.costs[level];
    const card = document.createElement("article");
    card.className = "meta-card";
    const label = document.createElement("span");
    label.textContent = definition.label;
    const title = document.createElement("h3");
    title.textContent = definition.title;
    const description = document.createElement("p");
    description.textContent = definition.description;
    const levels = document.createElement("div");
    levels.className = "meta-level";
    for (let index = 0; index < definition.max; index += 1) {
      const dot = document.createElement("i");
      dot.classList.toggle("filled", index < level);
      levels.append(dot);
    }
    const buy = document.createElement("button");
    buy.type = "button";
    buy.dataset.metaId = definition.id;
    buy.disabled = maxed || profile.echoes < cost;
    if (maxed) buy.textContent = "已达到最高等级";
    else {
      buy.append(`升级至 ${level + 1} 级 · `);
      const amount = document.createElement("strong");
      amount.textContent = `${cost} 残响`;
      buy.append(amount);
    }
    card.append(label, title, description, levels, buy);
    ui.metaUpgrades.append(card);
  }
}

function openArchive() {
  if (state.running || !ui.gameOver.hidden) return;
  renderMetaUpgrades();
  ui.archive.hidden = false;
}

function buyMetaUpgrade(id) {
  const definition = metaUpgradeDefinitions.find((item) => item.id === id);
  if (!definition) return;
  const level = profile.meta[id] || 0;
  if (level >= definition.max) return;
  const cost = definition.costs[level];
  if (profile.echoes < cost) return;
  profile.echoes -= cost;
  profile.meta[id] = level + 1;
  saveProfile();
  updateProfileUI();
  renderMetaUpgrades();
  audio.tone(380, .18, "triangle", .03, 360);
}

function getMovement() {
  let x = 0;
  let y = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) y -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) y += 1;
  if (touch.active) {
    x += Math.max(-1, Math.min(1, (touch.x - touch.startX) / 48));
    y += Math.max(-1, Math.min(1, (touch.y - touch.startY) / 48));
  }
  const length = Math.hypot(x, y);
  if (length > 1) return { x: x / length, y: y / length };
  return { x, y };
}

function skillWeapon(color, overrides = {}) {
  return { crit_chance: .08, knockback: 8, slow_percent: 0, burn_damage: 0, poison_damage: 0, explosion_radius: 0, color, ...overrides };
}

function useArchetypeSkill() {
  if (!state.running || state.paused || state.skillCooldown > 0) return;
  const role = selectedArchetype?.role || "sniper";
  const accent = selectedArchetype?.accent_color || "#58e6ff";
  const primary = selectedArchetype?.primary_color || "#ff365f";
  state.skillCooldown = skillCooldownDuration();
  if (bonuses.skillShield > 0) player.invulnerable = Math.max(player.invulnerable, bonuses.skillShield);

  if (role === "warrior") {
    const weapon = skillWeapon(accent, { knockback: 34, crit_chance: .12 });
    const radius = 190 * bonuses.area;
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance <= radius + enemy.radius) damageEnemy(enemy, (54 + state.level * 4) * bonuses.damage, weapon, dx / distance, dy / distance);
    }
    player.invulnerable = Math.max(player.invulnerable, .85);
    effects.push({ type: "ring", x: player.x, y: player.y, radius, color: accent, life: .48, maxLife: .48 });
    for (let index = 0; index < 3; index += 1) effects.push({ type: "slash", x: player.x, y: player.y, angle: index / 3 * Math.PI * 2, radius: radius * .8, arc: Math.PI * .8, color: primary, life: .38, maxLife: .38, heavy: true });
    burst(player.x, player.y, accent, 32, 210);
    state.shake = Math.max(state.shake, 12);
    audio.tone(88, .28, "sawtooth", .045, -25);
  } else if (role === "assassin") {
    const movement = getMovement();
    const moving = Math.hypot(movement.x, movement.y) > 0.05;
    state.dashX = moving ? movement.x : player.moveX;
    state.dashY = moving ? movement.y : player.moveY;
    state.dashTimer = .2;
    player.invulnerable = Math.max(player.invulnerable, .36);
    const weapon = skillWeapon(accent, { knockback: 8, crit_chance: .28 });
    for (const enemy of enemies) {
      const ex = enemy.x - player.x;
      const ey = enemy.y - player.y;
      const along = ex * state.dashX + ey * state.dashY;
      const side = Math.abs(ex * state.dashY - ey * state.dashX);
      if (!enemy.dead && along >= -16 && along <= 175 && side <= enemy.radius + 20) damageEnemy(enemy, (31 + state.level * 2.4) * bonuses.damage, weapon, state.dashX, state.dashY);
    }
    effects.push({ type: "beam", x1: player.x - state.dashX * 24, y1: player.y - state.dashY * 24, x2: player.x + state.dashX * 180, y2: player.y + state.dashY * 180, width: 13, color: accent, life: .24, maxLife: .24 });
    burst(player.x, player.y, accent, 18, 150);
    audio.dash();
  } else if (role === "hunter") {
    const weapon = skillWeapon("#9cff68", { poison_damage: 8, crit_chance: .12, knockback: 4, homing: .95, trajectory: "homing" });
    const count = 10 + Math.min(4, bonuses.projectiles);
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2;
      projectiles.push({ x: player.x + Math.cos(angle) * 22, y: player.y + Math.sin(angle) * 22, angle, speed: 480, radius: 6 * bonuses.area, life: 1.45, damage: (24 + state.level * 2.2) * bonuses.damage, pierceLeft: 1 + bonuses.pierce, weapon, color: weapon.color, hitIds: new Set(), dead: false });
    }
    effects.push({ type: "ring", x: player.x, y: player.y, radius: 92, color: weapon.color, life: .36, maxLife: .36 });
    burst(player.x, player.y, weapon.color, 24, 170);
    audio.tone(420, .18, "triangle", .03, 260);
  } else if (role === "mage") {
    const radius = 275 * bonuses.area;
    const weapon = skillWeapon(accent, { slow_percent: .52, knockback: 18, crit_chance: .1 });
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > radius + enemy.radius) continue;
      damageEnemy(enemy, (38 + state.level * 3.2) * bonuses.damage, weapon, -dx / distance, -dy / distance);
      if (!enemy.boss) { enemy.x -= dx / distance * 24; enemy.y -= dy / distance * 24; }
    }
    effects.push({ type: "ring", x: player.x, y: player.y, radius, color: accent, life: .62, maxLife: .62 });
    effects.push({ type: "screen", color: primary, life: .22, maxLife: .22 });
    burst(player.x, player.y, accent, 30, 220);
    state.shake = Math.max(state.shake, 8);
    audio.tone(125, .42, "sine", .04, 520);
  } else {
    const target = nearestEnemy(1100);
    const angle = target ? Math.atan2(target.y - player.y, target.x - player.x) : Math.atan2(player.moveY, player.moveX);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const weapon = skillWeapon(accent, { knockback: 28, crit_chance: .32 });
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const ex = enemy.x - player.x;
      const ey = enemy.y - player.y;
      const projection = ex * dx + ey * dy;
      const perpendicular = Math.abs(ex * dy - ey * dx);
      if (projection >= 0 && projection <= 1100 && perpendicular <= enemy.radius + 15) damageEnemy(enemy, (92 + state.level * 6) * bonuses.damage, weapon, dx, dy);
    }
    player.moveX = dx;
    player.moveY = dy;
    effects.push({ type: "beam", x1: player.x, y1: player.y, x2: player.x + dx * 1100, y2: player.y + dy * 1100, width: 15, color: accent, life: .32, maxLife: .32 });
    effects.push({ type: "screen", color: accent, life: .13, maxLife: .13 });
    burst(player.x, player.y, accent, 22, 190);
    state.shake = Math.max(state.shake, 11);
    audio.tone(180, .24, "square", .045, -90);
  }
  if (bonuses.dashNova > 0) {
    const novaWeapon = skillWeapon(primary, { knockback: 14, explosion_radius: 0 });
    const novaRadius = 105 * bonuses.area;
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance <= novaRadius + enemy.radius) damageEnemy(enemy, (22 + state.level * 1.4) * bonuses.dashNova, novaWeapon, dx / distance, dy / distance, false);
    }
    effects.push({ type: "ring", x: player.x, y: player.y, radius: novaRadius, color: primary, life: .3, maxLife: .3 });
  }
  updateHUD();
}

function chooseEnemyType(stageIndex, stageElapsed) {
  const candidates = Object.entries(cosmicBestiary)
    .filter(([, template]) => template.stage <= stageIndex && (template.stage < stageIndex || template.unlock <= stageElapsed))
    .map(([type, template]) => ({
      type,
      weight: template.weight * (template.stage === stageIndex ? 1 : 0.28),
    }));
  const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.type;
  }
  return candidates.at(-1)?.type || "asteroid_mite";
}

function spawnEnemy(initial = false, openingWaveTier = 0, forcedType = null) {
  const angle = Math.random() * Math.PI * 2;
  const edge = Math.hypot(width, height) * 0.56 + (initial ? -40 : 70 + Math.random() * 80);
  const stageElapsed = Math.max(0, state.time - state.stageIndex * STAGE_DURATION);
  const type = forcedType || chooseEnemyType(state.stageIndex, stageElapsed);
  const template = cosmicBestiary[type];
  const difficulty = difficultyModes[state.difficulty] || difficultyModes.normal;
  const stageIndex = state.stageIndex;
  const stageHealthScale = stageHealthScales[stageIndex] || stageHealthScales.at(-1);
  const stageCombatTime = Math.max(0, Math.min(STAGE_DURATION, state.time - stageIndex * STAGE_DURATION));
  const scale = (1 + stageCombatTime / (STAGE_DURATION * 3)) * stageHealthScale * difficulty.health;
  const enemy = {
    id: entityId++,
    type,
    x: player.x + Math.cos(angle) * edge,
    y: player.y + Math.sin(angle) * edge,
    hp: template.hp * scale,
    maxHp: template.hp * scale,
    speed: template.speed * (1 + Math.min(1, state.time / RUN_DURATION) * .48),
    radius: template.radius,
    damage: template.damage * difficulty.damage,
    xp: template.xp,
    color: template.color,
    accent: template.accent,
    speciesName: template.name,
    rank: template.rank,
    behavior: template.behavior,
    elite: template.rank === "elite",
    hitFlash: 0,
    slowUntil: 0,
    slowPercent: 0,
    burnUntil: 0,
    burnDamage: 0,
    burnTickAt: 0,
    poisonUntil: 0,
    poisonDamage: 0,
    poisonTickAt: 0,
    poisonStacks: 0,
    dead: false,
    rotation: Math.random() * Math.PI,
    openingWaveTier,
    shootTimer: (template.attackCooldown || 2.4) * (0.55 + Math.random() * .45),
    attackWindup: 0,
    aimAngle: 0,
    abilityTimer: 1.4 + Math.random() * 1.8,
    chargeTimer: 0,
    fuseTimer: 0,
    spawnTimer: (template.spawnCooldown || 8) * (0.65 + Math.random() * .35),
    shielded: false,
    speedAura: 1,
  };
  enemies.push(enemy);
  if (!state.seenSpecies.has(type)) {
    state.seenSpecies.add(type);
    addLog(`星兽图鉴更新：${template.name}。`, template.rank === "elite");
  }
  return enemy;
}

function startOpeningWave(stageIndex) {
  if (stageIndex !== 0) return;
  const tier = stageIndex + 1;
  if (state.forgeOpened[stageIndex] || state.openingWaveTier === tier) return;
  const count = openingWaveSizes[stageIndex] || openingWaveSizes.at(-1);
  state.wave = 1;
  state.openingWaveTier = tier;
  state.openingWaveRemaining = count;
  state.spawnClock = 0;
  const compositions = [
    ["asteroid_mite", "azure_beetle", "survey_drone"],
    ["nebula_hound", "comet_larva", "prism_fox"],
    ["singularity_eye", "void_bulwark", "null_reaper"],
  ];
  const types = compositions[stageIndex] || compositions.at(-1);
  for (let index = 0; index < count; index += 1) spawnEnemy(true, tier, types[index % types.length]);
  announce("OPENING WAVE", `${stages[stageIndex].label} · 清除 ${count} 个目标`);
  addLog(`${stages[stageIndex].label}首波来袭：清除 ${count} 个标记目标后开放武器重构。`, true);
}

function triggerStageEncounter(stageIndex, encounterIndex) {
  const encounter = stageEncounters[encounterIndex];
  const triggerIndex = stageIndex * stageEncounters.length + encounterIndex;
  if (!encounter || state.encounterTriggered[triggerIndex]) return;
  state.encounterTriggered[triggerIndex] = true;
  state.wave += 1;
  announce(encounter.kicker, encounter.title);
  if (encounter.type === "migration") {
    const migrationPools = [
      ["pulse_wasp", "asteroid_mite", "azure_beetle"],
      ["nebula_hound", "comet_larva", "prism_fox", "phase_manta"],
      ["null_reaper", "star_leech", "singularity_eye"],
    ];
    const swiftTypes = migrationPools[stageIndex] || migrationPools.at(-1);
    const count = 10 + stageIndex * 3;
    for (let index = 0; index < count; index += 1) {
      spawnEnemy(false, 0, swiftTypes[index % swiftTypes.length]);
    }
    addLog(`${encounter.title}：${count} 个高速目标同时进入战区。`, true);
  } else {
    const eliteProfiles = [
      { type: "shield_jelly", count: 1, title: "蓝幕护盾结阵" },
      { type: "spore_mother", count: 2, title: "紫孢育母入侵" },
      { type: "thunder_orb", count: 3, title: "雷鸣核心狩猎" },
    ];
    const profile = eliteProfiles[stageIndex] || eliteProfiles.at(-1);
    for (let index = 0; index < profile.count; index += 1) spawnEnemy(false, 0, profile.type);
    ui.announcementTitle.textContent = profile.title;
    addLog(`${profile.title}：击破 ${profile.count} 个高危目标可获取高密度经验。`, true);
  }
  state.shake = Math.max(state.shake, 8);
  audio.boss();
}

function announce(kicker, title) {
  ui.announcementKicker.textContent = kicker;
  ui.announcementTitle.textContent = title;
  ui.announcement.hidden = false;
  ui.announcement.style.animation = "none";
  void ui.announcement.offsetWidth;
  ui.announcement.style.animation = "announce-in 2.6s ease both";
  setTimeout(() => { ui.announcement.hidden = true; }, 2650);
}

function compassDirection(angle) {
  const names = ["东", "东南", "南", "西南", "西", "西北", "北", "东北"];
  return names[Math.round((angle + Math.PI * 2) / (Math.PI / 4)) % 8];
}

function spawnBoss(index) {
  const definitions = [
    { name: "环月监视者 · K-01", hp: 1950, speed: 32, radius: 39, damage: 18, color: "#58e6ff", xp: 45 },
    { name: "星云织梦母体 · M-07", hp: 7350, speed: 38, radius: 46, damage: 24, color: "#a78bfa", xp: 70 },
    { name: "憎恨奇点 · HATE", hp: 18000, speed: 44, radius: 54, damage: 29, color: "#ff5a72", xp: 110 },
  ];
  const template = definitions[index];
  const difficulty = difficultyModes[state.difficulty] || difficultyModes.normal;
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.hypot(width, height) * 0.58 + 60;
  const boss = {
    id: entityId++, type: "boss", boss: true, bossIndex: index, name: template.name,
    x: player.x + Math.cos(angle) * distance,
    y: player.y + Math.sin(angle) * distance,
    hp: template.hp * difficulty.health,
    maxHp: template.hp * difficulty.health,
    speed: template.speed,
    radius: template.radius,
    damage: template.damage * difficulty.damage,
    xp: template.xp,
    color: template.color,
    hitFlash: 0,
    slowUntil: 0,
    slowPercent: 0,
    burnUntil: 0,
    burnDamage: 0,
    burnTickAt: 0,
    poisonUntil: 0,
    poisonDamage: 0,
    poisonTickAt: 0,
    poisonStacks: 0,
    dead: false,
    rotation: 0,
    shootTimer: 1.1,
    pattern: 0,
  };
  enemies.push(boss);
  currentBoss = boss;
  state.bossSpawned[index] = true;
  if (index === 2) state.finalBossForgeAt = state.time + 10;
  const direction = compassDirection(angle);
  announce("THREAT DETECTED", `${template.name} · ${direction}侧接近`);
  addLog(`检测到高危意识体「${template.name}」，位于当前坐标${direction}侧。跟随屏幕箭头。`, true);
  state.shake = 16;
  audio.boss();
}

function bossAttack(boss) {
  const enraged = boss.hp / boss.maxHp < 0.42;
  const count = 8 + boss.bossIndex * 2 + (enraged ? 4 : 0);
  const aim = Math.atan2(player.y - boss.y, player.x - boss.x);
  const offset = boss.pattern % 2 ? aim : state.time * 0.55;
  const speed = 135 + boss.bossIndex * 22 + (enraged ? 25 : 0);
  for (let index = 0; index < count; index += 1) {
    const angle = offset + index / count * Math.PI * 2;
    enemyProjectiles.push({
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: boss.bossIndex === 2 ? 7 : 6,
      damage: (8 + boss.bossIndex * 3) * difficultyModes[state.difficulty].damage,
      color: boss.color,
      life: 6,
      phase: Math.random() * Math.PI,
      dead: false,
    });
  }
  boss.pattern += 1;
  effects.push({ type: "ring", x: boss.x, y: boss.y, radius: boss.radius * 2.2, color: boss.color, life: 0.3, maxLife: 0.3 });
  audio.tone(85, 0.15, "sawtooth", 0.025, -25);
}

function nearestEnemy(range, fromX = player.x, fromY = player.y) {
  let nearest = null;
  let best = range * range;
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dx = enemy.x - fromX;
    const dy = enemy.y - fromY;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq < best) {
      best = distanceSq;
      nearest = enemy;
    }
  }
  return nearest;
}

function weaponTarget(weapon, range, fromX = player.x, fromY = player.y) {
  const candidates = enemies.filter((enemy) => !enemy.dead && Math.hypot(enemy.x - fromX, enemy.y - fromY) <= range);
  if (!candidates.length) return null;
  if (weapon?.targeting === "strongest") return candidates.reduce((best, enemy) => enemy.hp > best.hp ? enemy : best);
  if (weapon?.targeting === "random") return candidates[Math.floor(Math.random() * candidates.length)];
  if (weapon?.targeting === "cluster") {
    return candidates.slice(0, 72).reduce((best, enemy) => {
      const score = candidates.reduce((count, other) => count + (Math.hypot(other.x - enemy.x, other.y - enemy.y) < 105 ? 1 : 0), 0);
      return score > best.score ? { enemy, score } : best;
    }, { enemy: candidates[0], score: 0 }).enemy;
  }
  return candidates.reduce((best, enemy) => Math.hypot(enemy.x - fromX, enemy.y - fromY) < Math.hypot(best.x - fromX, best.y - fromY) ? enemy : best);
}

function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

function fireProjectile(weapon, damageScale = 1) {
  const target = weaponTarget(weapon, runtimeRange(weapon));
  if (!target) return false;
  const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
  player.moveX = Math.cos(baseAngle);
  player.moveY = Math.sin(baseAngle);
  const count = weaponMutation(weapon, "wall") ? Math.max(5, runtimeCount(weapon)) : runtimeCount(weapon);
  const spread = Math.max(weapon.spread_degrees, weaponMutation(weapon, "wall") ? 72 : 0) * Math.PI / 180;
  for (let index = 0; index < count; index += 1) {
    const ratio = count === 1 ? 0 : index / (count - 1) - 0.5;
    const angle = baseAngle + spread * ratio + (weapon.trajectory === "spiral" || weaponMutation(weapon, "spiral_dance") ? Math.sin(state.time * 4 + index) * .18 : 0);
    const skyfall = weapon.trajectory === "skyfall" || weaponMutation(weapon, "starfall");
    const spawnX = skyfall ? target.x + (index - (count - 1) / 2) * 24 : player.x + Math.cos(angle) * 20;
    const spawnY = skyfall ? target.y - Math.min(340, runtimeRange(weapon) * .58) - Math.abs(index - (count - 1) / 2) * 12 : player.y + Math.sin(angle) * 20;
    const flightAngle = skyfall ? Math.PI / 2 : angle;
    projectiles.push({
      x: spawnX,
      y: spawnY,
      angle: flightAngle,
      baseAngle: flightAngle,
      age: 0,
      wavePhase: index * 1.7,
      speed: weapon.projectile_speed * bonuses.projectileSpeed,
      radius: weapon.projectile_size * bonuses.area,
      life: skyfall ? 1.35 : runtimeRange(weapon) / (weapon.projectile_speed * bonuses.projectileSpeed),
      damage: runtimeDamage(weapon) * damageScale,
      pierceLeft: weapon.pierce + bonuses.pierce + (weaponMutation(weapon, "drill") ? 4 : 0),
      ricochetsLeft: weaponMutation(weapon, "ricochet") ? 2 : 0,
      weapon,
      color: weapon.color,
      hitIds: new Set(),
      mutationChild: false,
      canProc: true,
      dead: false,
    });
  }
  burst(player.x, player.y, weapon.color, 4, 45);
  weapon.recoil = 1;
  audio.shoot("projectile");
  return true;
}

function fireBeam(weapon, damageScale = 1) {
  const target = weaponTarget(weapon, runtimeRange(weapon));
  if (!target) return false;
  const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
  player.moveX = Math.cos(baseAngle);
  player.moveY = Math.sin(baseAngle);
  const forked = Boolean(weaponMutation(weapon, "fork"));
  const rays = forked ? [[0, 1], [-.22, mutationPower(.48)], [.22, mutationPower(.48)]] : [[0, 1]];
  for (const [offset, rayScale] of rays) {
    const angle = baseAngle + offset;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const hits = [];
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const ex = enemy.x - player.x;
      const ey = enemy.y - player.y;
      const projection = ex * dx + ey * dy;
      if (projection < 0 || projection > runtimeRange(weapon)) continue;
      const perpendicular = Math.abs(ex * dy - ey * dx);
      if (perpendicular <= enemy.radius + weapon.projectile_size) hits.push({ enemy, projection });
    }
    hits.sort((a, b) => a.projection - b.projection);
    for (const hit of hits.slice(0, weapon.pierce + bonuses.pierce + 1)) {
      damageEnemy(hit.enemy, runtimeDamage(weapon) * damageScale * rayScale, weapon, dx, dy);
    }
    effects.push({
      type: "beam", x1: player.x, y1: player.y,
      x2: player.x + dx * runtimeRange(weapon), y2: player.y + dy * runtimeRange(weapon),
      width: weapon.projectile_size * (offset ? .68 : 1), color: weapon.color,
      life: 0.13, maxLife: 0.13,
      source: "weapon", form: inferVisualForm(weapon), style: beamStyleForWeapon(weapon), fork: offset !== 0,
    });
  }
  audio.shoot("beam");
  weapon.recoil = 1;
  return true;
}

function fireAura(weapon, damageScale = 1) {
  let hit = false;
  for (const enemy of enemies) {
    if (!enemy.dead && Math.hypot(enemy.x - player.x, enemy.y - player.y) <= runtimeRange(weapon) + enemy.radius) {
      const length = Math.hypot(enemy.x - player.x, enemy.y - player.y) || 1;
      damageEnemy(enemy, runtimeDamage(weapon) * damageScale, weapon, (enemy.x - player.x) / length, (enemy.y - player.y) / length);
      hit = true;
    }
  }
  effects.push({
    type: "ring", x: player.x, y: player.y, radius: runtimeRange(weapon), color: weapon.color,
    life: 0.34, maxLife: 0.34, source: "weapon", form: inferVisualForm(weapon), style: ringStyleForWeapon(weapon),
  });
  audio.shoot("aura");
  weapon.recoil = .45;
  return hit || enemies.length > 0;
}

function fireMelee(weapon, damageScale = 1) {
  const range = runtimeRange(weapon);
  const target = weaponTarget(weapon, range + 24);
  if (!target) return false;
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  player.moveX = Math.cos(angle);
  player.moveY = Math.sin(angle);
  const warriorSwing = selectedArchetype?.role === "warrior";
  const arc = Math.max(warriorSwing ? 105 : 35, weapon.spread_degrees || 70) * Math.PI / 180;
  const hits = [];
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.hypot(dx, dy);
    const delta = Math.abs(normalizeAngle(Math.atan2(dy, dx) - angle));
    if (distance <= range + enemy.radius && delta <= arc / 2 + enemy.radius / Math.max(50, distance)) hits.push({ enemy, distance, dx, dy });
  }
  hits.sort((a, b) => a.distance - b.distance);
  const limit = Math.min(hits.length, 1 + weapon.pierce + bonuses.pierce + runtimeCount(weapon));
  for (const hit of hits.slice(0, limit)) {
    const length = hit.distance || 1;
    damageEnemy(hit.enemy, runtimeDamage(weapon) * damageScale, weapon, hit.dx / length, hit.dy / length);
  }
  const slashLife = warriorSwing ? .38 : .26;
  const slashStyle = slashStyleForWeapon(weapon);
  if (slashStyle === "daggers") {
    for (const offset of [-.18, .18]) {
      effects.push({
        type: "slash", x: player.x, y: player.y, angle: angle + offset, radius: range * .86,
        arc: Math.min(arc * .58, .72), color: weapon.color, life: .22, maxLife: .22,
        heavy: false, source: "weapon", form: inferVisualForm(weapon), style: "daggers",
      });
    }
  } else {
    effects.push({
      type: "slash", x: player.x, y: player.y, angle, radius: range * (warriorSwing ? 1.14 : 1), arc, color: weapon.color,
      life: slashLife, maxLife: slashLife, heavy: warriorSwing, source: "weapon", form: inferVisualForm(weapon), style: slashStyle,
    });
  }
  if (warriorSwing) {
    effects.push({ type: "slash", x: player.x, y: player.y, angle: angle - .11, radius: range * .94, arc: arc * .86, color: selectedArchetype.accent_color, life: .3, maxLife: .3, heavy: true, source: "weapon", form: inferVisualForm(weapon), style: "cleave" });
    effects.push({ type: "ring", x: player.x + Math.cos(angle) * range * .48, y: player.y + Math.sin(angle) * range * .48, radius: range * .68, color: weapon.color, life: .24, maxLife: .24, source: "weapon", form: inferVisualForm(weapon), style: "impact" });
    state.shake = Math.max(state.shake, 5.5);
  }
  weapon.recoil = 1;
  burst(player.x + Math.cos(angle) * range * .62, player.y + Math.sin(angle) * range * .62, weapon.color, warriorSwing ? 20 : 8, warriorSwing ? 155 : 90);
  if (weaponMutation(weapon, "crescent")) {
    projectiles.push({
      x: player.x + Math.cos(angle) * 24, y: player.y + Math.sin(angle) * 24, angle,
      speed: 335 * bonuses.projectileSpeed, radius: weapon.projectile_size * bonuses.area * 1.35,
      life: Math.max(.45, runtimeRange(weapon) * 1.75 / 335),
      damage: runtimeDamage(weapon) * damageScale * mutationPower(.52),
      pierceLeft: 2 + bonuses.pierce, ricochetsLeft: 0, weapon, color: weapon.color,
      hitIds: new Set(), mutationChild: true, canProc: true, dead: false,
    });
    effects.push({ type: "slash", x: player.x, y: player.y, angle, radius: range * 1.65, arc: .32, color: weapon.color, life: .3, maxLife: .3, source: "weapon", form: inferVisualForm(weapon), style: "crescent" });
  }
  audio.shoot("melee");
  return true;
}

function updateOrbitWeapon(weapon, dt) {
  weapon.orbitAngle = (weapon.orbitAngle || 0) + dt * (1.25 + 150 / Math.max(80, weapon.range));
  weapon.orbitHits ||= new Map();
  weapon.orbitPositions = [];
  const count = runtimeCount(weapon);
  for (let index = 0; index < count; index += 1) {
    const angle = weapon.orbitAngle + index / count * Math.PI * 2;
    const x = player.x + Math.cos(angle) * runtimeRange(weapon);
    const y = player.y + Math.sin(angle) * runtimeRange(weapon);
    weapon.orbitPositions.push({ x, y, angle });
    for (const enemy of enemies) {
      if (enemy.dead || Math.hypot(enemy.x - x, enemy.y - y) > enemy.radius + weapon.projectile_size * bonuses.area) continue;
      const key = `${enemy.id}:${index}`;
      if ((weapon.orbitHits.get(key) || 0) > state.time) continue;
      weapon.orbitHits.set(key, state.time + runtimeCooldown(weapon));
      const length = Math.hypot(enemy.x - player.x, enemy.y - player.y) || 1;
      damageEnemy(enemy, runtimeDamage(weapon), weapon, (enemy.x - player.x) / length, (enemy.y - player.y) / length);
    }
  }
  if (weapon.orbitHits.size > 300) {
    for (const [key, until] of weapon.orbitHits) if (until < state.time - 2) weapon.orbitHits.delete(key);
  }
  if (weaponMutation(weapon, "orbit_salvo")) {
    weapon.salvoTimer = (weapon.salvoTimer || .35) - dt;
    if (weapon.salvoTimer <= 0 && weapon.orbitPositions.length) {
      weapon.salvoTimer = Math.max(1.15, runtimeCooldown(weapon) * 2.4);
      for (const orb of weapon.orbitPositions) {
        const angle = Math.atan2(orb.y - player.y, orb.x - player.x);
        projectiles.push({
          x: orb.x, y: orb.y, angle, speed: 360 * bonuses.projectileSpeed,
          radius: Math.max(3, weapon.projectile_size * bonuses.area * .58), life: .78,
          damage: runtimeDamage(weapon) * mutationPower(.42), pierceLeft: bonuses.pierce,
          ricochetsLeft: 0, weapon, color: weapon.color, hitIds: new Set(),
          mutationChild: true, canProc: true, dead: false,
        });
      }
      burst(player.x, player.y, weapon.color, 9, 70);
    }
  }
}

function dispatchWeapon(weapon, damageScale = 1, scheduleMutations = true) {
  let fired = false;
  if (weapon.delivery === "beam") fired = fireBeam(weapon, damageScale);
  else if (weapon.delivery === "aura") fired = fireAura(weapon, damageScale);
  else if (weapon.delivery === "melee") fired = fireMelee(weapon, damageScale);
  else fired = fireProjectile(weapon, damageScale);
  if (!fired || !scheduleMutations) return fired;
  if (weaponMutation(weapon, "echo")) {
    pendingAttacks.push({ at: state.time + .29, weapon, scale: mutationPower(.54), kind: "echo" });
  }
  if (weaponMutation(weapon, "aftershock")) {
    pendingAttacks.push({ at: state.time + .38, weapon, scale: mutationPower(.58), kind: "aftershock" });
  }
  if (weaponMutation(weapon, "barrage")) {
    pendingAttacks.push({ at: state.time + .11, weapon, scale: mutationPower(.40), kind: "barrage" });
    pendingAttacks.push({ at: state.time + .23, weapon, scale: mutationPower(.34), kind: "barrage" });
  }
  if (weaponMutation(weapon, "phantom_double")) {
    pendingAttacks.push({ at: state.time + .16, weapon, scale: mutationPower(.56), kind: "phantom" });
  }
  const needsShard = (weaponMutation(weapon, "fork") && weapon.delivery !== "beam")
    || (weaponMutation(weapon, "crescent") && weapon.delivery !== "melee")
    || (weaponMutation(weapon, "orbit_salvo") && weapon.delivery !== "orbit")
    || (weaponMutation(weapon, "split") && weapon.delivery !== "projectile");
  if (needsShard) pendingAttacks.push({ at: state.time + .08, weapon, scale: mutationPower(.42), kind: "shard" });
  if (weaponMutation(weapon, "starfall") && weapon.delivery !== "projectile") {
    pendingAttacks.push({ at: state.time + .18, weapon, scale: mutationPower(.62), kind: "starfall" });
  }
  return fired;
}

function updatePendingAttacks() {
  const due = pendingAttacks.filter((attack) => attack.at <= state.time);
  pendingAttacks = pendingAttacks.filter((attack) => attack.at > state.time);
  for (const attack of due) {
    if (attack.kind === "mine") {
      const mineWeapon = { ...attack.weapon, mutations: [], crit_chance: 0, explosion_radius: 0, burn_damage: 0, poison_damage: 0 };
      for (const enemy of enemies) {
        const dx = enemy.x - attack.x;
        const dy = enemy.y - attack.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (!enemy.dead && distance <= 78 * bonuses.area) damageEnemy(enemy, runtimeDamage(attack.weapon) * mutationPower(.38), mineWeapon, dx / distance, dy / distance, false);
      }
      effects.push({ type: "ring", x: attack.x, y: attack.y, radius: 78 * bonuses.area, color: attack.weapon.color, life: .34, maxLife: .34, style: "impact" });
      burst(attack.x, attack.y, attack.weapon.color, 16, 125);
      continue;
    }
    effects.push({ type: "ring", x: player.x, y: player.y, radius: 32, color: attack.weapon.color, life: .22, maxLife: .22 });
    if (["shard", "starfall"].includes(attack.kind)) {
      const derived = { ...attack.weapon, delivery: "projectile", trajectory: attack.kind === "starfall" ? "skyfall" : "straight", projectile_count: attack.kind === "shard" ? 3 : 1, mutations: [] };
      fireProjectile(derived, attack.scale);
    } else dispatchWeapon(attack.weapon, attack.scale, false);
  }
}

function updateWeapons(dt) {
  for (const weapon of weapons) {
    weapon.recoil = Math.max(0, (weapon.recoil || 0) - dt * 6.5);
    if (weapon.delivery === "orbit") {
      updateOrbitWeapon(weapon, dt);
      continue;
    }
    weapon.timer = (weapon.timer || 0) - dt;
    if (weapon.timer > 0) continue;
    const fired = dispatchWeapon(weapon);
    if (fired) weapon.timer = runtimeCooldown(weapon);
  }
  updatePendingAttacks();
}

function explode(projectile, excludedId) {
  const radius = runtimeExplosion(projectile.weapon);
  if (radius <= 0) return;
  const blastWeapon = { ...projectile.weapon, explosion_radius: 0, crit_chance: 0, knockback: projectile.weapon.knockback * 0.5 };
  for (const enemy of enemies) {
    if (enemy.dead || enemy.id === excludedId) continue;
    const dx = enemy.x - projectile.x;
    const dy = enemy.y - projectile.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= radius + enemy.radius) {
      damageEnemy(enemy, projectile.damage * 0.45, blastWeapon, dx / (distance || 1), dy / (distance || 1));
      if (bonuses.singularityPull > 0 && !enemy.boss) {
        enemy.x -= dx / (distance || 1) * bonuses.singularityPull;
        enemy.y -= dy / (distance || 1) * bonuses.singularityPull;
      }
    }
  }
  effects.push({ type: "ring", x: projectile.x, y: projectile.y, radius, color: projectile.color, life: 0.25, maxLife: 0.25 });
  burst(projectile.x, projectile.y, projectile.color, 10, 120);
}

function nearestUnhitEnemy(projectile, maxRange = 420) {
  let target = null;
  let best = maxRange * maxRange;
  for (const enemy of enemies) {
    if (enemy.dead || projectile.hitIds.has(enemy.id)) continue;
    const dx = enemy.x - projectile.x;
    const dy = enemy.y - projectile.y;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq < best) { best = distanceSq; target = enemy; }
  }
  return target;
}

function splitProjectile(projectile) {
  if (projectile.mutationChild || projectile.splitDone || !weaponMutation(projectile.weapon, "split")) return;
  projectile.splitDone = true;
  for (const offset of [-.42, .42]) {
    projectiles.push({
      x: projectile.x, y: projectile.y, angle: projectile.angle + offset,
      speed: projectile.speed * 1.06, radius: Math.max(2.5, projectile.radius * .72),
      life: Math.max(.36, projectile.life * .82),
      damage: projectile.damage * mutationPower(.46), pierceLeft: Math.max(0, Math.floor(projectile.pierceLeft * .5)),
      ricochetsLeft: 0, weapon: projectile.weapon, color: projectile.color,
      hitIds: new Set(projectile.hitIds), mutationChild: true, canProc: true, dead: false,
    });
  }
  burst(projectile.x, projectile.y, projectile.color, 6, 70);
}

function updateProjectiles(dt) {
  for (const projectile of projectiles) {
    projectile.age = (projectile.age || 0) + dt;
    projectile.life -= dt;
    if (projectile.life <= 0) {
      if ((projectile.weapon.trajectory === "boomerang" || weaponMutation(projectile.weapon, "return")) && !projectile.returning && !projectile.mutationChild) {
        projectile.returning = true;
        projectile.life = Math.max(.65, runtimeRange(projectile.weapon) / Math.max(220, projectile.speed));
        projectile.hitIds = new Set();
      } else {
        projectile.dead = true;
        continue;
      }
    }
    if (projectile.returning) {
      const desired = Math.atan2(player.y - projectile.y, player.x - projectile.x);
      projectile.angle += normalizeAngle(desired - projectile.angle) * Math.min(1, dt * 9);
      if (Math.hypot(player.x - projectile.x, player.y - projectile.y) < 22) {
        projectile.dead = true;
        continue;
      }
    } else if (projectile.weapon.trajectory === "wave") {
      projectile.angle = (projectile.baseAngle ?? projectile.angle) + Math.sin(projectile.age * 12 + (projectile.wavePhase || 0)) * .42;
    } else if (projectile.weapon.trajectory === "spiral" || weaponMutation(projectile.weapon, "spiral_dance")) {
      projectile.angle += dt * 3.8 * (Math.sin(projectile.wavePhase || 1) >= 0 ? 1 : -1);
    } else if (projectile.weapon.homing > 0 || projectile.weapon.trajectory === "homing" || weaponMutation(projectile.weapon, "seeking")) {
      const target = weaponTarget(projectile.weapon, Math.max(520, runtimeRange(projectile.weapon)), projectile.x, projectile.y);
      if (target) {
        const desired = Math.atan2(target.y - projectile.y, target.x - projectile.x);
        const tracking = Math.max(.55, projectile.weapon.homing || 0, projectile.weapon.trajectory === "homing" ? .92 : 0, weaponMutation(projectile.weapon, "seeking") ? 1 : 0);
        projectile.angle += normalizeAngle(desired - projectile.angle) * Math.min(1, dt * tracking * 8.5);
      }
    }
    projectile.x += Math.cos(projectile.angle) * projectile.speed * dt;
    projectile.y += Math.sin(projectile.angle) * projectile.speed * dt;

    for (const enemy of enemies) {
      if (enemy.dead || projectile.hitIds.has(enemy.id)) continue;
      if (Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y) > enemy.radius + projectile.radius) continue;
      projectile.hitIds.add(enemy.id);
      damageEnemy(enemy, projectile.damage, projectile.weapon, Math.cos(projectile.angle), Math.sin(projectile.angle), projectile.canProc !== false);
      explode(projectile, enemy.id);
      splitProjectile(projectile);
      if (projectile.ricochetsLeft > 0) {
        const next = nearestUnhitEnemy(projectile);
        if (next) {
          projectile.angle = Math.atan2(next.y - projectile.y, next.x - projectile.x);
          projectile.ricochetsLeft -= 1;
          effects.push({ type: "beam", x1: projectile.x, y1: projectile.y, x2: next.x, y2: next.y, width: 1.5, color: projectile.color, life: .1, maxLife: .1, source: "weapon", form: inferVisualForm(projectile.weapon), style: "chain" });
          break;
        }
      }
      if (projectile.pierceLeft <= 0) {
        if ((projectile.weapon.trajectory === "boomerang" || weaponMutation(projectile.weapon, "return")) && !projectile.returning && !projectile.mutationChild) {
          projectile.returning = true;
          projectile.life = Math.max(.65, runtimeRange(projectile.weapon) / Math.max(220, projectile.speed));
          projectile.hitIds = new Set();
        } else {
          projectile.dead = true;
        }
        break;
      }
      projectile.pierceLeft -= 1;
    }
  }
  projectiles = projectiles.filter((item) => !item.dead);
}

function addMutationZone(type, x, y, weapon) {
  if (mutationZones.length >= 36) mutationZones.shift();
  mutationZones.push({ type, x, y, weapon, radius: (type === "poison" ? 76 : 68) * bonuses.area, expires: state.time + 3.2, tickAt: 0 });
}

function applyMutationHitEffects(enemy, baseDamage, weapon) {
  const stripped = { ...weapon, mutations: [], crit_chance: 0, explosion_radius: 0, burn_damage: 0, poison_damage: 0, slow_percent: 0 };
  if (weaponMutation(weapon, "poison_cloud") && state.time >= (enemy.poisonCloudAt || 0)) {
    enemy.poisonCloudAt = state.time + .8;
    addMutationZone("poison", enemy.x, enemy.y, weapon);
  }
  if (weaponMutation(weapon, "burning_ground") && state.time >= (enemy.burningGroundAt || 0)) {
    enemy.burningGroundAt = state.time + .8;
    addMutationZone("burn", enemy.x, enemy.y, weapon);
  }
  if (weaponMutation(weapon, "gravity_well")) {
    for (const target of enemies) {
      if (target.dead || target.boss || target.id === enemy.id) continue;
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance <= 130) { target.x -= dx / distance * 17; target.y -= dy / distance * 17; }
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 130, color: "#b28cff", life: .3, maxLife: .3, style: "field" });
  }
  if (weaponMutation(weapon, "frost_shatter") && enemy.slowUntil > state.time) {
    for (const target of enemies) {
      if (target.dead || target.id === enemy.id) continue;
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance <= 86) damageEnemy(target, baseDamage * mutationPower(.26), stripped, dx / distance, dy / distance, false);
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 86, color: "#9deaff", life: .22, maxLife: .22, style: "shards" });
  }
  if (weaponMutation(weapon, "blood_drain") && enemy.hp / enemy.maxHp < .5) {
    const healing = Math.min(enemy.boss ? 1.2 : .5, baseDamage * .012);
    player.hp = Math.min(player.maxHp, player.hp + healing);
    effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: player.x, y2: player.y, width: 1.7, color: "#ff5d73", life: .18, maxLife: .18, source: "weapon", style: "ember" });
  }
  if (weaponMutation(weapon, "execution_mark")) {
    enemy.executionMarks = Math.min(5, (enemy.executionMarks || 0) + 1);
    if (!enemy.boss && enemy.executionMarks >= 3 && enemy.hp / enemy.maxHp <= .16) enemy.hp = 0;
  }
  if (weaponMutation(weapon, "tether")) {
    const target = enemies.find((candidate) => !candidate.dead && candidate.id !== enemy.id && Math.hypot(candidate.x - enemy.x, candidate.y - enemy.y) <= 145);
    if (target) {
      const dx = target.x - enemy.x; const dy = target.y - enemy.y; const distance = Math.hypot(dx, dy) || 1;
      effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, width: 2, color: "#58e6ff", life: .18, maxLife: .18, source: "weapon", style: "tether" });
      damageEnemy(target, baseDamage * mutationPower(.24), stripped, dx / distance, dy / distance, false);
    }
  }
  if (weaponMutation(weapon, "minefield") && state.time >= (enemy.mineAt || 0)) {
    enemy.mineAt = state.time + 1.2;
    pendingAttacks.push({ at: state.time + .58, weapon, x: enemy.x, y: enemy.y, kind: "mine" });
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 24, color: weapon.color, life: .58, maxLife: .58, style: "telegraph" });
  }
  if (weaponMutation(weapon, "time_freeze")) {
    for (const target of enemies) {
      if (!target.dead && Math.hypot(target.x - enemy.x, target.y - enemy.y) <= 105) {
        target.slowPercent = Math.max(target.slowPercent, .48);
        target.slowUntil = Math.max(target.slowUntil, state.time + 1.25);
      }
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 105, color: "#7dd3fc", life: .26, maxLife: .26, style: "field" });
  }
  if (weaponMutation(weapon, "swarm") && state.time >= (enemy.swarmAt || 0)) {
    enemy.swarmAt = state.time + .65;
    for (let index = 0; index < 3; index += 1) {
      const angle = index / 3 * Math.PI * 2 + state.time;
      projectiles.push({ x: enemy.x, y: enemy.y, angle, baseAngle: angle, age: 0, wavePhase: index, speed: 330, radius: 3.2, life: 1.15, damage: baseDamage * mutationPower(.18), pierceLeft: 0, ricochetsLeft: 0, weapon: { ...stripped, trajectory: "homing", homing: 1, visual_form: "drone" }, color: weapon.color, hitIds: new Set([enemy.id]), mutationChild: true, canProc: false, dead: false });
    }
  }
  if (weaponMutation(weapon, "ricochet") && weapon.delivery !== "projectile") {
    const target = enemies.filter((candidate) => !candidate.dead && candidate.id !== enemy.id && Math.hypot(candidate.x - enemy.x, candidate.y - enemy.y) <= 165)
      .sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y))[0];
    if (target) {
      const dx = target.x - enemy.x; const dy = target.y - enemy.y; const distance = Math.hypot(dx, dy) || 1;
      effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, width: 1.6, color: weapon.color, life: .12, maxLife: .12, source: "weapon", style: "tracer" });
      damageEnemy(target, baseDamage * mutationPower(.28), stripped, dx / distance, dy / distance, false);
    }
  }
}

function damageEnemy(enemy, baseDamage, weapon, directionX = 0, directionY = 0, canProc = true) {
  if (enemy.dead) return;
  const fullHealthCrit = player.hp >= player.maxHp - .1 ? bonuses.fullHpCrit : 0;
  const forcedWeakpoint = bonuses.omniscientAim && enemy.hp >= enemy.maxHp * .99;
  const critical = forcedWeakpoint || Math.random() < Math.min(0.82, weapon.crit_chance + bonuses.crit + fullHealthCrit);
  const thermal = hasSynergy("thermal") && enemy.burnUntil > state.time && enemy.slowUntil > state.time;
  const afflicted = enemy.burnUntil > state.time || enemy.poisonUntil > state.time;
  const chilled = enemy.slowUntil > state.time;
  const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
  let conditional = 1;
  if (distance <= 175) conditional *= 1 + bonuses.closeDamage;
  if (distance >= 360) conditional *= 1 + bonuses.farDamage;
  if (enemy.boss) conditional *= 1 + bonuses.bossDamage;
  if (enemy.elite || ["support", "heavy"].includes(enemy.rank)) conditional *= 1 + bonuses.eliteDamage;
  if (player.hp / player.maxHp <= .38) conditional *= 1 + bonuses.lowHpDamage;
  if (state.isMoving) conditional *= 1 + bonuses.movingDamage;
  let damage = baseDamage * conditional * (critical ? 1.85 : 1) * (thermal ? 1.25 : 1) * (afflicted ? 1 + bonuses.venomAmp : 1) * (chilled ? 1 + bonuses.shatter : 1) * (enemy.shielded ? .68 : 1);
  enemy.hp -= damage;
  if (enemy.bossIndex === 2 && !state.forgeOpened[2]) enemy.hp = Math.max(enemy.hp, enemy.maxHp * .42);
  let executed = false;
  if (!enemy.boss && bonuses.execute > 0 && enemy.hp > 0 && enemy.hp / enemy.maxHp <= bonuses.execute) {
    damage += enemy.hp;
    enemy.hp = 0;
    executed = true;
  }
  state.damageDealt += damage;
  enemy.hitFlash = 0.09;
  const knockbackScale = enemy.boss ? 0.16 : 1;
  enemy.x += directionX * weapon.knockback * bonuses.knockback * knockbackScale;
  enemy.y += directionY * weapon.knockback * bonuses.knockback * knockbackScale;
  const appliedSlow = Math.min(.6, Math.max(weapon.slow_percent || 0, bonuses.slow));
  if (appliedSlow > 0) {
    enemy.slowPercent = Math.max(enemy.slowPercent, appliedSlow);
    enemy.slowUntil = Math.max(enemy.slowUntil, state.time + 1.6 * bonuses.statusDuration);
    if (Math.random() < .35) burst(enemy.x, enemy.y, "#9deaff", 1, 32);
  }
  const appliedBurn = Math.min(24, (weapon.burn_damage || 0) + bonuses.burn);
  if (appliedBurn > 0) {
    if (enemy.burnUntil <= state.time) enemy.burnTickAt = state.time + .35;
    enemy.burnDamage = Math.max(enemy.burnDamage, appliedBurn);
    enemy.burnUntil = Math.max(enemy.burnUntil, state.time + 2.2 * bonuses.statusDuration);
    enemy.burnColor = "#ff6b35";
    enemy.burnSource = weapon;
  }
  const appliedPoison = Math.min(24, (weapon.poison_damage || 0) + bonuses.poison);
  if (appliedPoison > 0) {
    if (enemy.poisonUntil <= state.time) { enemy.poisonTickAt = state.time + .5; enemy.poisonStacks = 0; }
    enemy.poisonDamage = Math.max(enemy.poisonDamage, appliedPoison);
    enemy.poisonUntil = Math.max(enemy.poisonUntil, state.time + 3.2 * bonuses.statusDuration);
    enemy.poisonStacks = Math.min(5, (enemy.poisonStacks || 0) + 1);
    enemy.poisonSource = weapon;
  }
  if (canProc) applyMutationHitEffects(enemy, baseDamage, weapon);
  if (canProc && bonuses.chainTargets > 0 && Math.random() < bonuses.chainChance) {
    const candidates = enemies
      .filter((target) => !target.dead && target.id !== enemy.id && Math.hypot(target.x - enemy.x, target.y - enemy.y) <= 175)
      .sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y))
      .slice(0, bonuses.chainTargets + (bonuses.stormMastery ? 1 : 0));
    const chainWeapon = { ...weapon, crit_chance: 0, knockback: 2, burn_damage: 0, slow_percent: 0, color: "#8ee8ff" };
    for (const target of candidates) {
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, width: 2.5, color: "#8ee8ff", life: .14, maxLife: .14, source: "weapon", form: inferVisualForm(weapon), style: "chain" });
      damageEnemy(target, baseDamage * (.14 + bonuses.chainDamage), chainWeapon, dx / length, dy / length, false);
    }
  }
  if (canProc && weaponMutation(weapon, "chain")) {
    const candidates = enemies
      .filter((target) => !target.dead && target.id !== enemy.id && Math.hypot(target.x - enemy.x, target.y - enemy.y) <= 205)
      .sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y))
      .slice(0, 2);
    const chainWeapon = { ...weapon, crit_chance: 0, knockback: 2, burn_damage: 0, slow_percent: 0, color: weapon.color };
    for (const target of candidates) {
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, width: 2.8, color: weapon.color, life: .15, maxLife: .15, source: "weapon", form: inferVisualForm(weapon), style: "chain" });
      damageEnemy(target, baseDamage * mutationPower(.38), chainWeapon, dx / length, dy / length, false);
    }
  }
  if (canProc && bonuses.ballisticMastery && distance >= 360 && Math.random() < .18) {
    const echoTarget = enemies.find((target) => !target.dead && target.id !== enemy.id && Math.hypot(target.x - enemy.x, target.y - enemy.y) <= 180);
    if (echoTarget) {
      const dx = echoTarget.x - enemy.x;
      const dy = echoTarget.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      const echoWeapon = { ...weapon, crit_chance: 0, explosion_radius: 0, mutations: [] };
      effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: echoTarget.x, y2: echoTarget.y, width: 2, color: "#f1f0eb", life: .12, maxLife: .12, source: "weapon", form: inferVisualForm(weapon), style: "tracer" });
      damageEnemy(echoTarget, baseDamage * .36, echoWeapon, dx / length, dy / length, false);
    }
  }
  if (canProc && critical && bonuses.critBlast > 0 && Math.random() < bonuses.critBlast) {
    const critWeapon = { ...weapon, crit_chance: 0, explosion_radius: 0, mutations: [] };
    for (const target of enemies) {
      if (target.dead || target.id === enemy.id) continue;
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      if (length <= 72 * bonuses.area) damageEnemy(target, baseDamage * .28, critWeapon, dx / length, dy / length, false);
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 72 * bonuses.area, color: "#ffd166", life: .2, maxLife: .2 });
  }
  const blastRadius = runtimeExplosion(weapon);
  if (canProc && weapon.delivery !== "projectile" && blastRadius > 0) {
    const blastWeapon = { ...weapon, crit_chance: 0, explosion_radius: 0, burn_damage: 0, slow_percent: 0, knockback: (weapon.knockback || 0) * .35 };
    for (const target of enemies) {
      if (target.dead || target.id === enemy.id) continue;
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > blastRadius + target.radius) continue;
      damageEnemy(target, baseDamage * .32, blastWeapon, dx / distance, dy / distance, false);
      if (bonuses.singularityPull > 0 && !target.boss) {
        target.x -= dx / distance * bonuses.singularityPull;
        target.y -= dy / distance * bonuses.singularityPull;
      }
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: blastRadius, color: weapon.color, life: .24, maxLife: .24 });
  }
  const shattering = chilled && bonuses.shatter > 0;
  floatText(enemy.x, enemy.y - enemy.radius, Math.round(damage), thermal || shattering ? "#d8fbff" : critical ? "#ffd166" : weapon.color, critical || thermal || shattering);
  burst(enemy.x, enemy.y, weapon.color, critical ? 7 : 3, critical ? 90 : 45);
  if (critical || enemy.boss) state.shake = Math.max(state.shake, critical ? 3 : 1.4);
  audio.hit(critical);
  if (enemy.hp <= 0) killEnemy(enemy, weapon, { critical, executed, canProc });
}

function killEnemy(enemy, weapon = null, proc = {}) {
  if (enemy.dead) return;
  enemy.dead = true;
  state.kills += 1;
  if (enemy.openingWaveTier && enemy.openingWaveTier === state.openingWaveTier) {
    state.openingWaveRemaining = Math.max(0, state.openingWaveRemaining - 1);
    if (state.openingWaveRemaining === 0) {
      const clearedTier = state.openingWaveTier;
      state.openingWaveTier = 0;
      state.wave = 2;
      announce("WAVE CLEARED", `阶段 ${forgeTiers[clearedTier - 1].roman} · 武器重构已开放`);
      addLog(`阶段 ${forgeTiers[clearedTier - 1].roman} 首波已清除，获得本阶段武器重构机会。`, true);
      if (!state.forgeOpened[clearedTier - 1]) queueReward("forge", clearedTier);
    }
  }
  state.harvestKills += 1;
  if (bonuses.killHeal > 0 && state.harvestKills % Math.max(1, Math.round(bonuses.killHealEvery)) === 0) {
    player.hp = Math.min(player.maxHp, player.hp + bonuses.killHeal);
    floatText(player.x, player.y - 28, `+${Math.round(bonuses.killHeal)}`, "#7cf29a", true);
  }
  if (bonuses.skillRefund > 0) state.skillCooldown = Math.max(0, state.skillCooldown - bonuses.skillRefund);
  if (proc.executed && bonuses.executeRefund > 0) {
    state.skillCooldown = Math.max(0, state.skillCooldown - bonuses.executeRefund);
    for (const ownedWeapon of weapons) ownedWeapon.timer = Math.max(0, (ownedWeapon.timer || 0) - bonuses.executeRefund * .35);
  }

  const allowDeathProcs = proc.canProc !== false && Boolean(weapon || enemy.burnSource || enemy.poisonSource);
  const sourceWeapon = weapon || enemy.poisonSource || enemy.burnSource || weapons[0];
  if (allowDeathProcs && sourceWeapon && weaponMutation(sourceWeapon, "nova")) {
    const count = 6;
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2;
      projectiles.push({
        x: enemy.x, y: enemy.y, angle, speed: 325 * bonuses.projectileSpeed,
        radius: Math.max(3, sourceWeapon.projectile_size * .62 * bonuses.area), life: .82,
        damage: runtimeDamage(sourceWeapon) * mutationPower(.34), pierceLeft: 0,
        ricochetsLeft: 0, weapon: sourceWeapon, color: sourceWeapon.color,
        hitIds: new Set([enemy.id]), mutationChild: true, canProc: false, dead: false,
      });
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 72, color: sourceWeapon.color, life: .28, maxLife: .28 });
  }

  if (allowDeathProcs && enemy.burnUntil > state.time && bonuses.burnSpread > 0) {
    const spreadRange = 105 + bonuses.burnSpread * 55;
    const targets = enemies
      .filter((target) => !target.dead && target.id !== enemy.id && Math.hypot(target.x - enemy.x, target.y - enemy.y) <= spreadRange)
      .slice(0, bonuses.hiveMind ? 7 : 4);
    for (const target of targets) {
      if (target.burnUntil <= state.time) target.burnTickAt = state.time + .35;
      target.burnDamage = Math.max(target.burnDamage, enemy.burnDamage * Math.min(.9, .42 + bonuses.burnSpread * .16));
      target.burnUntil = Math.max(target.burnUntil, state.time + 1.8 * bonuses.statusDuration);
      target.burnColor = enemy.burnColor;
      target.burnSource = sourceWeapon;
      effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, width: 1.6, color: enemy.burnColor || "#7cf29a", life: .18, maxLife: .18, source: "weapon", form: inferVisualForm(sourceWeapon), style: "ember" });
    }
  }

  if (allowDeathProcs && enemy.poisonUntil > state.time && bonuses.burnSpread > 0) {
    const spreadRange = 115 + bonuses.burnSpread * 60;
    const targets = enemies.filter((target) => !target.dead && target.id !== enemy.id && Math.hypot(target.x - enemy.x, target.y - enemy.y) <= spreadRange).slice(0, bonuses.hiveMind ? 8 : 4);
    for (const target of targets) {
      if (target.poisonUntil <= state.time) { target.poisonTickAt = state.time + .5; target.poisonStacks = 0; }
      target.poisonDamage = Math.max(target.poisonDamage, enemy.poisonDamage * Math.min(.95, .48 + bonuses.burnSpread * .16));
      target.poisonUntil = Math.max(target.poisonUntil, state.time + 2.6 * bonuses.statusDuration);
      target.poisonStacks = Math.min(5, target.poisonStacks + 1);
      target.poisonSource = sourceWeapon;
      effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, width: 1.8, color: "#67e86f", life: .2, maxLife: .2, source: "weapon", form: inferVisualForm(sourceWeapon), style: "spores" });
    }
  }

  if (allowDeathProcs && sourceWeapon && weaponMutation(sourceWeapon, "black_hole")) {
    const pulseWeapon = { ...sourceWeapon, mutations: [], crit_chance: 0, explosion_radius: 0, burn_damage: 0, poison_damage: 0 };
    for (const target of enemies) {
      if (target.dead || target.id === enemy.id) continue;
      const dx = target.x - enemy.x; const dy = target.y - enemy.y; const distance = Math.hypot(dx, dy) || 1;
      if (distance > 145) continue;
      if (!target.boss) { target.x -= dx / distance * 24; target.y -= dy / distance * 24; }
      damageEnemy(target, runtimeDamage(sourceWeapon) * mutationPower(.22), pulseWeapon, -dx / distance, -dy / distance, false);
    }
    effects.push({ type: "status", status: "void", x: enemy.x, y: enemy.y, radius: 145, color: "#9b72ff", life: .6, maxLife: .6 });
  }

  if (allowDeathProcs && sourceWeapon && enemy.slowUntil > state.time && bonuses.frostBurst > 0) {
    const pulseWeapon = { ...sourceWeapon, crit_chance: 0, explosion_radius: 0, burn_damage: 0, slow_percent: bonuses.absoluteZero ? .42 : .18, mutations: [] };
    for (const target of enemies) {
      if (target.dead || target.id === enemy.id) continue;
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      if (length <= 92 * bonuses.area) damageEnemy(target, runtimeDamage(sourceWeapon) * bonuses.frostBurst, pulseWeapon, dx / length, dy / length, false);
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 92 * bonuses.area, color: "#9deaff", life: .3, maxLife: .3 });
  }

  const singularityProc = allowDeathProcs && sourceWeapon && Number.isFinite(sourceWeapon.damage)
    && bonuses.singularityDeath > 0 && runtimeExplosion(sourceWeapon) > 0;
  const solarProc = allowDeathProcs && sourceWeapon && bonuses.solarFuneral && enemy.burnUntil > state.time;
  if (singularityProc || solarProc) {
    const radius = (singularityProc ? 108 : 82) * bonuses.area;
    const pulseWeapon = { ...sourceWeapon, crit_chance: 0, explosion_radius: 0, mutations: [] };
    for (const target of enemies) {
      if (target.dead || target.id === enemy.id) continue;
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      if (length > radius) continue;
      damageEnemy(target, runtimeDamage(sourceWeapon) * (solarProc ? .34 : bonuses.singularityDeath), pulseWeapon, dx / length, dy / length, false);
      if (bonuses.eventHorizon && !target.dead && !target.boss && target.hp / target.maxHp <= .12) {
        target.hp = 0;
        killEnemy(target, pulseWeapon, { canProc: false, executed: true });
      }
      if (singularityProc && !target.boss) {
        target.x -= dx / length * (12 + bonuses.singularityPull);
        target.y -= dy / length * (12 + bonuses.singularityPull);
      }
    }
    effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius, color: solarProc ? "#ff8a4c" : "#a78bfa", life: .32, maxLife: .32 });
  }
  const rareDrop = enemy.elite || enemy.boss;
  xpGems.push({ x: enemy.x, y: enemy.y, value: enemy.xp, radius: rareDrop ? 7 : 4, phase: Math.random() * Math.PI * 2 });
  const missingHealth = 1 - player.hp / Math.max(1, player.maxHp);
  if (!enemy.boss && Math.random() < .025 + missingHealth * .055) pickups.push({ type: "heal", x: enemy.x + 8, y: enemy.y, value: 12, phase: Math.random() * Math.PI * 2 });
  if (!enemy.elite && !enemy.boss && Math.random() < .0035) pickups.push({ type: "cache", reward: "upgrade", x: enemy.x, y: enemy.y + 8, phase: Math.random() * Math.PI * 2 });
  if (enemy.elite && Math.random() < .5) pickups.push({ type: "cache", reward: "artifact", x: enemy.x, y: enemy.y, phase: Math.random() * Math.PI * 2, elite: true });
  if (enemy.boss && enemy.bossIndex < 2) pickups.push({ type: "cache", reward: "artifact", x: enemy.x, y: enemy.y, phase: Math.random() * Math.PI * 2, mythic: true });
  burst(enemy.x, enemy.y, enemy.color, rareDrop ? 24 : 9, rareDrop ? 170 : 95);
  if (enemy.elite) addLog(`精英星兽「${enemy.speciesName}」已清除。高密度认知掉落。`, true);
  if (enemy.boss) {
    state.bossesDefeated += 1;
    currentBoss = null;
    enemyProjectiles = [];
    ui.bossHud.hidden = true;
    state.shake = 20;
    addLog(`高危意识体「${enemy.name}」已瓦解。`, true);
    announce("TARGET ELIMINATED", `${enemy.name} 已瓦解`);
    if (enemy.bossIndex === 2) {
      player.invulnerable = 2;
      finishRun(true);
    } else if (enemy.bossIndex === 0 && !state.forgeOpened[1]) {
      queueReward("forge", 2);
    }
  }
}

function burst(x, y, color, count, speed) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (0.3 + Math.random() * 0.7);
    particles.push({
      type: "spark",
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      color,
      life: 0.24 + Math.random() * 0.38,
      maxLife: 0.62,
      size: 1 + Math.random() * 2,
    });
  }
}

function floatText(x, y, text, color, large = false) {
  particles.push({ type: "text", x, y, vx: 0, vy: -30, color, text: String(text), life: 0.65, maxLife: 0.65, size: large ? 15 : 10 });
}

function gainXp(amount) {
  state.xp += amount * bonuses.xp;
  while (state.xp >= state.xpNeed) {
    state.xp -= state.xpNeed;
    state.level += 1;
    state.xpNeed = Math.floor(18 + Math.pow(state.level, 1.34) * 7);
    queueReward("upgrade");
  }
  updateHUD();
}

function fireEnemyVolley(enemy) {
  const radial = enemy.behavior === "radial";
  const sniper = enemy.behavior === "sniper";
  const count = radial ? 10 : enemy.type === "phase_manta" ? 3 : enemy.type === "pulse_wasp" ? 2 : 1;
  const baseAngle = radial ? state.time * .42 : enemy.aimAngle;
  const speed = sniper ? 330 : radial ? 155 : enemy.type === "phase_manta" ? 205 : 180;
  for (let index = 0; index < count; index += 1) {
    const spread = radial ? index / count * Math.PI * 2 : (index - (count - 1) / 2) * .16;
    const angle = baseAngle + spread;
    enemyProjectiles.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: sniper ? 6 : radial ? 5.5 : 4.5,
      damage: enemy.damage * (sniper ? .9 : radial ? .52 : .68),
      color: enemy.accent,
      life: sniper ? 3.4 : 5,
      phase: Math.random() * Math.PI,
      dead: false,
    });
  }
  effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: enemy.radius * 1.7, color: enemy.accent, life: .22, maxLife: .22 });
  audio.tone(radial ? 105 : sniper ? 180 : 250, .08, "sine", .012, 80);
}

function updateEnemyAttack(enemy, dt) {
  const template = cosmicBestiary[enemy.type];
  if (enemy.attackWindup > 0) {
    enemy.attackWindup -= dt;
    if (enemy.attackWindup <= 0) fireEnemyVolley(enemy);
    return;
  }
  enemy.shootTimer -= dt;
  if (enemy.shootTimer > 0) return;
  enemy.aimAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
  enemy.attackWindup = enemy.behavior === "sniper" ? .72 : .42;
  enemy.shootTimer = (template.attackCooldown || 2.3) * (.9 + Math.random() * .18);
  const telegraphRange = enemy.behavior === "sniper" ? 520 : 250;
  effects.push({
    type: "beam",
    x1: enemy.x,
    y1: enemy.y,
    x2: enemy.x + Math.cos(enemy.aimAngle) * telegraphRange,
    y2: enemy.y + Math.sin(enemy.aimAngle) * telegraphRange,
    width: enemy.behavior === "sniper" ? 2.2 : 1.2,
    color: enemy.accent,
    life: enemy.attackWindup,
    maxLife: enemy.attackWindup,
    source: "enemy",
    style: "telegraph",
  });
}

function updateMutationZones() {
  for (const zone of mutationZones) {
    if (state.time < zone.tickAt) continue;
    zone.tickAt = state.time + .45;
    const zoneWeapon = {
      ...zone.weapon, mutations: [], crit_chance: 0, explosion_radius: 0,
      burn_damage: zone.type === "burn" ? Math.max(5, (zone.weapon.burn_damage || 0) + 3) : 0,
      poison_damage: zone.type === "poison" ? Math.max(5, (zone.weapon.poison_damage || 0) + 3) : 0,
      slow_percent: 0, knockback: 0,
    };
    for (const enemy of enemies) {
      if (enemy.dead || Math.hypot(enemy.x - zone.x, enemy.y - zone.y) > zone.radius + enemy.radius) continue;
      damageEnemy(enemy, runtimeDamage(zone.weapon) * mutationPower(.08), zoneWeapon, 0, 0, false);
    }
    effects.push({ type: "ring", x: zone.x, y: zone.y, radius: zone.radius, color: zone.type === "burn" ? "#ff7a38" : "#67e86f", life: .5, maxLife: .5, style: zone.type === "burn" ? "embers" : "spores" });
  }

  mutationZones = mutationZones.filter((zone) => zone.expires > state.time);
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    enemy.shielded = false;
    enemy.speedAura = 1;
  }
  for (const source of enemies) {
    if (source.dead || !["shielder", "buffer"].includes(source.behavior)) continue;
    const auraRadius = source.behavior === "shielder" ? 155 : 185;
    for (const target of enemies) {
      if (target.dead || target.id === source.id || Math.hypot(target.x - source.x, target.y - source.y) > auraRadius) continue;
      if (source.behavior === "shielder") target.shielded = true;
      else target.speedAura = Math.max(target.speedAura, 1.28);
    }
  }

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    if (enemy.burnUntil > state.time && state.time >= enemy.burnTickAt) {
      const tick = enemy.burnDamage * .35;
      enemy.burnTickAt = state.time + .35;
      enemy.hp -= tick;
      state.damageDealt += tick;
      floatText(enemy.x - 8, enemy.y - enemy.radius - 5, `♨${Math.max(1, Math.round(tick))}`, "#ff7a38");
      burst(enemy.x, enemy.y, "#ff7a38", 3, 48);
      effects.push({ type: "status", status: "burn", x: enemy.x, y: enemy.y, radius: enemy.radius + 7, color: "#ff7a38", life: .34, maxLife: .34 });
    }
    if (enemy.poisonUntil > state.time && state.time >= enemy.poisonTickAt) {
      const tick = enemy.poisonDamage * .5 * (1 + Math.min(.4, (enemy.poisonStacks - 1) * .1));
      enemy.poisonTickAt = state.time + .5;
      enemy.hp -= tick;
      state.damageDealt += tick;
      floatText(enemy.x + 8, enemy.y - enemy.radius - 5, `☣${Math.max(1, Math.round(tick))}`, "#67e86f");
      burst(enemy.x, enemy.y, "#67e86f", 3, 38);
      effects.push({ type: "status", status: "poison", x: enemy.x, y: enemy.y, radius: enemy.radius + 9, color: "#67e86f", life: .48, maxLife: .48 });
    }
    if (enemy.bossIndex === 2 && !state.forgeOpened[2]) enemy.hp = Math.max(enemy.hp, enemy.maxHp * .42);
    if (enemy.hp <= 0) {
      killEnemy(enemy, enemy.poisonUntil > state.time ? enemy.poisonSource : enemy.burnSource || weapons[0], { canProc: true });
      continue;
    }
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;
    const slowStrength = enemy.boss ? enemy.slowPercent * 0.45 : enemy.slowPercent;
    const slow = enemy.slowUntil > state.time ? 1 - slowStrength : 1;
    if (enemy.boss) {
      const approach = distance > 235 ? 1 : distance < 155 ? -0.45 : 0.08;
      const strafe = Math.sin(state.time * 0.9 + enemy.bossIndex) * 0.72;
      enemy.x += (dx / distance * approach - dy / distance * strafe) * enemy.speed * slow * dt;
      enemy.y += (dy / distance * approach + dx / distance * strafe) * enemy.speed * slow * dt;
      enemy.shootTimer -= dt;
      if (enemy.shootTimer <= 0) {
        bossAttack(enemy);
        const enraged = enemy.hp / enemy.maxHp < 0.42;
        enemy.shootTimer = Math.max(0.65, 1.65 - enemy.bossIndex * 0.17 - (enraged ? 0.35 : 0));
      }
    } else if (["shooter", "sniper", "radial"].includes(enemy.behavior)) {
      const preferredRange = cosmicBestiary[enemy.type].preferredRange || 245;
      const approach = distance > preferredRange ? 1 : distance < preferredRange * .68 ? -.72 : 0;
      const strafe = Math.sin(state.time * 1.7 + enemy.id) * .58;
      const speed = enemy.speed * slow * enemy.speedAura;
      enemy.x += (dx / distance * approach - dy / distance * strafe) * speed * dt;
      enemy.y += (dy / distance * approach + dx / distance * strafe) * speed * dt;
      updateEnemyAttack(enemy, dt);
    } else if (enemy.behavior === "charger") {
      if (enemy.chargeTimer > 0) {
        enemy.chargeTimer -= dt;
        enemy.x += Math.cos(enemy.aimAngle) * enemy.speed * 3.7 * slow * enemy.speedAura * dt;
        enemy.y += Math.sin(enemy.aimAngle) * enemy.speed * 3.7 * slow * enemy.speedAura * dt;
      } else if (enemy.attackWindup > 0) {
        enemy.attackWindup -= dt;
        if (enemy.attackWindup <= 0) enemy.chargeTimer = .48;
      } else {
        enemy.x += dx / distance * enemy.speed * slow * enemy.speedAura * dt;
        enemy.y += dy / distance * enemy.speed * slow * enemy.speedAura * dt;
        enemy.abilityTimer -= dt;
        if (enemy.abilityTimer <= 0 && distance < 390) {
          enemy.aimAngle = Math.atan2(dy, dx);
          enemy.attackWindup = .58;
          enemy.abilityTimer = 3.4 + Math.random() * 1.4;
          effects.push({ type: "beam", x1: enemy.x, y1: enemy.y, x2: enemy.x + Math.cos(enemy.aimAngle) * 230, y2: enemy.y + Math.sin(enemy.aimAngle) * 230, width: 3, color: enemy.accent, life: .58, maxLife: .58, source: "enemy", style: "telegraph" });
          effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: enemy.radius * 1.8, color: enemy.accent, life: .58, maxLife: .58 });
        }
      }
    } else if (enemy.behavior === "exploder") {
      if (enemy.fuseTimer > 0) {
        enemy.fuseTimer -= dt;
        if (enemy.fuseTimer <= 0) {
          const blastRadius = 88;
          effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: blastRadius, color: enemy.accent, life: .35, maxLife: .35 });
          burst(enemy.x, enemy.y, enemy.accent, 18, 145);
          if (distance <= blastRadius + player.radius && player.invulnerable <= 0) {
            const taken = Math.max(1, Math.round(enemy.damage * (1 - damageReduction())));
            player.hp -= taken;
            player.invulnerable = .68;
            effects.push({ type: "screen", color: enemy.accent, life: .15, maxLife: .15 });
            if (player.hp <= 0) finishRun(false);
          }
          killEnemy(enemy);
          continue;
        }
      } else if (distance < 76) {
        enemy.fuseTimer = .72;
        effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 88, color: enemy.accent, life: .72, maxLife: .72 });
      } else {
        enemy.x += dx / distance * enemy.speed * slow * enemy.speedAura * dt;
        enemy.y += dy / distance * enemy.speed * slow * enemy.speedAura * dt;
      }
    } else if (enemy.behavior === "spawner") {
      enemy.x += dx / distance * enemy.speed * slow * enemy.speedAura * .65 * dt;
      enemy.y += dy / distance * enemy.speed * slow * enemy.speedAura * .65 * dt;
      enemy.spawnTimer -= dt;
      if (enemy.spawnTimer <= 0 && enemies.length < 240) {
        enemy.spawnTimer = cosmicBestiary[enemy.type].spawnCooldown || 8;
        for (let index = 0; index < 2; index += 1) {
          const child = spawnEnemy(false, 0, "comet_larva");
          child.x = enemy.x + (index ? 1 : -1) * (enemy.radius + 10);
          child.y = enemy.y + Math.sin(enemy.id + index) * 18;
          child.maxHp *= .65;
          child.hp = child.maxHp;
        }
        effects.push({ type: "ring", x: enemy.x, y: enemy.y, radius: 72, color: enemy.accent, life: .5, maxLife: .5 });
      }
    } else if (["flanker", "orbiter"].includes(enemy.behavior)) {
      const orbitDistance = enemy.behavior === "orbiter" ? 130 : 92;
      const approach = distance > orbitDistance * 1.18 ? 1 : distance < orbitDistance * .72 ? -.35 : .08;
      const strafe = enemy.behavior === "orbiter" ? 1.05 : .72;
      const side = enemy.id % 2 ? 1 : -1;
      const speed = enemy.speed * slow * enemy.speedAura;
      enemy.x += (dx / distance * approach - dy / distance * strafe * side) * speed * dt;
      enemy.y += (dy / distance * approach + dx / distance * strafe * side) * speed * dt;
    } else if (["shielder", "buffer"].includes(enemy.behavior)) {
      const preferred = enemy.behavior === "shielder" ? 150 : 175;
      const approach = distance > preferred ? .72 : distance < preferred * .65 ? -.38 : 0;
      const strafe = Math.sin(state.time + enemy.id) * .32;
      enemy.x += (dx / distance * approach - dy / distance * strafe) * enemy.speed * slow * enemy.speedAura * dt;
      enemy.y += (dy / distance * approach + dx / distance * strafe) * enemy.speed * slow * enemy.speedAura * dt;
    } else {
      enemy.x += dx / distance * enemy.speed * slow * enemy.speedAura * dt;
      enemy.y += dy / distance * enemy.speed * slow * enemy.speedAura * dt;
    }
    enemy.rotation += dt * (enemy.rank === "swift" ? 3 : 0.8);

    if (distance <= player.radius + enemy.radius && player.invulnerable <= 0) {
      const taken = Math.max(1, Math.round(enemy.damage * (1 - damageReduction())));
      player.hp -= taken;
      player.invulnerable = 0.72;
      player.x -= dx / distance * 16;
      player.y -= dy / distance * 16;
      effects.push({ type: "screen", color: "#ff365f", life: 0.18, maxLife: 0.18 });
      state.shake = Math.max(state.shake, 8);
      audio.hurt();
      addLog(`受到 ${taken} 点接触伤害。`, player.hp <= 28);
      if (player.hp <= 0) finishRun(false);
    }
  }
  enemies = enemies.filter((enemy) => !enemy.dead);
}

function updateEnemyProjectiles(dt) {
  for (const projectile of enemyProjectiles) {
    projectile.life -= dt;
    projectile.phase += dt * 6;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    if (projectile.life <= 0) projectile.dead = true;
    if (projectile.dead || player.invulnerable > 0) continue;
    if (Math.hypot(projectile.x - player.x, projectile.y - player.y) <= projectile.radius + player.radius) {
      projectile.dead = true;
      const taken = Math.max(1, Math.round(projectile.damage * (1 - damageReduction())));
      player.hp -= taken;
      player.invulnerable = 0.58;
      state.shake = Math.max(state.shake, 7);
      effects.push({ type: "screen", color: projectile.color, life: 0.16, maxLife: 0.16 });
      audio.hurt();
      addLog(`弹幕命中，受到 ${taken} 点伤害。`, player.hp <= 28);
      if (player.hp <= 0) finishRun(false);
    }
  }
  enemyProjectiles = enemyProjectiles.filter((projectile) => !projectile.dead);
}

function updateGems(dt) {
  for (const gem of xpGems) {
    gem.phase += dt * 4;
    const dx = player.x - gem.x;
    const dy = player.y - gem.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < bonuses.magnet) {
      const speed = 130 + (bonuses.magnet - distance) * 4.2;
      gem.x += dx / distance * speed * dt;
      gem.y += dy / distance * speed * dt;
    }
    if (distance < player.radius + 9) {
      gem.collected = true;
      audio.pickup();
      gainXp(gem.value);
      if (bonuses.pickupHeal > 0 && Math.random() < bonuses.pickupHeal) {
        player.hp = Math.min(player.maxHp, player.hp + 1);
        floatText(player.x, player.y - 24, "+1", "#7cf29a");
      }
      if (bonuses.pickupSkillRefund > 0) state.skillCooldown = Math.max(0, state.skillCooldown - bonuses.pickupSkillRefund);
    }
  }
  xpGems = xpGems.filter((gem) => !gem.collected);
}

function updatePickups(dt) {
  for (const pickup of pickups) {
    pickup.phase += dt * (pickup.type === "heal" ? 4 : 2);
    const dx = player.x - pickup.x;
    const dy = player.y - pickup.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < Math.min(135, bonuses.magnet * .7)) {
      pickup.x += dx / distance * 150 * dt;
      pickup.y += dy / distance * 150 * dt;
    }
    if (distance >= player.radius + 15) continue;
    if (pickup.type === "heal") {
      if (player.hp >= player.maxHp - .1) continue;
      const healed = Math.min(pickup.value, player.maxHp - player.hp);
      player.hp += healed;
      floatText(player.x, player.y - 28, `+${Math.round(healed)}`, "#67e86f", true);
      addLog(`拾取星兽血肉：恢复 ${Math.round(healed)} 生命。`);
    } else {
      queueReward(pickup.reward || "upgrade");
      announce(pickup.mythic ? "BOSS CACHE" : "ALIEN CACHE", pickup.reward === "artifact" ? "发现高级质变强化" : "发现强化宝箱");
      addLog(pickup.reward === "artifact" ? "打开高密度宝箱：高级强化三选一。" : "打开异星宝箱：获得额外强化。", true);
    }
    pickup.collected = true;
    audio.level();
    burst(pickup.x, pickup.y, pickup.type === "heal" ? "#67e86f" : "#ffd166", 18, 130);
  }
  pickups = pickups.filter((pickup) => !pickup.collected);
}

function updateParticles(dt) {
  for (const particle of particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= Math.pow(0.05, dt);
    particle.vy *= Math.pow(0.05, dt);
  }
  particles = particles.filter((particle) => particle.life > 0);
  for (const effect of effects) effect.life -= dt;
  effects = effects.filter((effect) => effect.life > 0);
}

function update(dt) {
  state.time += dt;
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  const missingHealth = 1 - player.hp / Math.max(1, player.maxHp);
  state.skillCooldown = Math.max(0, state.skillCooldown - dt * (1 + (bonuses.painEngine || 0) * missingHealth));
  state.shake = Math.max(0, state.shake - dt * 34);
  if (bonuses.regen > 0 && player.hp > 0) player.hp = Math.min(player.maxHp, player.hp + bonuses.regen * dt);

  const movement = getMovement();
  state.isMoving = Math.hypot(movement.x, movement.y) > .08;
  const selfSlowCount = weapons.filter((weapon) => weapon.tradeoff === "self_slow").length;
  const speedModifier = Math.max(0.68, 1 - selfSlowCount * 0.10) * bonuses.moveSpeed;
  if (state.dashTimer > 0) {
    state.dashTimer -= dt;
    player.x += state.dashX * 720 * dt;
    player.y += state.dashY * 720 * dt;
    if (Math.random() < dt * 45) particles.push({ type: "spark", x: player.x, y: player.y, vx: -state.dashX * 45, vy: -state.dashY * 45, color: "#58e6ff", life: .22, maxLife: .22, size: 2 });
  } else {
    player.x += movement.x * player.speed * speedModifier * dt;
    player.y += movement.y * player.speed * speedModifier * dt;
  }
  if (Math.hypot(movement.x, movement.y) > 0.05) {
    player.moveX = movement.x;
    player.moveY = movement.y;
  }
  if (bonuses.endlessTrail && state.isMoving) {
    state.trailClock -= dt;
    if (state.trailClock <= 0) {
      state.trailClock = .72;
      const trailX = player.x - player.moveX * 34;
      const trailY = player.y - player.moveY * 34;
      const trailWeapon = skillWeapon(selectedArchetype?.accent_color || "#58e6ff", { knockback: 3 });
      for (const enemy of enemies) {
        const dx = enemy.x - trailX;
        const dy = enemy.y - trailY;
        const distance = Math.hypot(dx, dy) || 1;
        if (!enemy.dead && distance <= 58 * bonuses.area) damageEnemy(enemy, (12 + state.level) * bonuses.damage, trailWeapon, dx / distance, dy / distance, false);
      }
      effects.push({ type: "ring", x: trailX, y: trailY, radius: 58 * bonuses.area, color: trailWeapon.color, life: .42, maxLife: .42 });
    }
  }

  state.spawnClock -= dt;
  const difficulty = difficultyModes[state.difficulty] || difficultyModes.normal;
  if (state.openingWaveTier === 0 && state.spawnClock <= 0 && enemies.length < 260) {
    const count = state.stageIndex > 0 && Math.random() < 0.25 ? 2 : 1;
    for (let i = 0; i < count; i += 1) spawnEnemy();
    const runProgress = Math.min(1, state.time / RUN_DURATION);
    const pressure = stageSpawnPressure[state.stageIndex] || 1;
    state.spawnClock = Math.max(0.24, (0.78 - runProgress * 0.52) / (difficulty.spawn * pressure));
  }
  const timedStageIndex = Math.min(2, Math.floor(state.time / STAGE_DURATION));
  if (timedStageIndex > state.stageIndex && state.openingWaveTier === 0 && state.bossesDefeated >= state.stageIndex + 1 && !currentBoss) {
    state.stageIndex += 1;
    announce("PROTOCOL SHIFT", stages[state.stageIndex].label);
    addLog(`${stages[state.stageIndex].label}启动，敌群发生变异。`, true);
  }
  const stageCombatReady = state.stageIndex === 0 ? state.forgeOpened[0] : true;
  if (state.openingWaveTier === 0 && stageCombatReady) {
    const stageElapsed = state.time - state.stageIndex * STAGE_DURATION;
    for (let encounterIndex = 0; encounterIndex < stageEncounters.length; encounterIndex += 1) {
      const triggerIndex = state.stageIndex * stageEncounters.length + encounterIndex;
      if (stageElapsed >= stageEncounters[encounterIndex].offset && !state.encounterTriggered[triggerIndex]) {
        triggerStageEncounter(state.stageIndex, encounterIndex);
        break;
      }
    }
  }
  for (let index = 0; index < BOSS_TIMES.length; index += 1) {
    const forgeReady = index === 0 ? state.forgeOpened[0] : index === 1 ? state.forgeOpened[1] : true;
    if (state.time >= BOSS_TIMES[index] && index <= state.stageIndex && state.openingWaveTier === 0 && forgeReady && !state.bossSpawned[index] && !currentBoss) {
      spawnBoss(index);
      break;
    }
  }
  if (currentBoss?.bossIndex === 2 && state.finalBossForgeAt > 0 && state.time >= state.finalBossForgeAt && !state.forgeOpened[2]) {
    state.finalBossForgeAt = 0;
    announce("LAST FORGE", "终极意识暴露弱点 · 最后一次武器构建");
    addLog("憎恨奇点现身 10 秒：最后一次武器重构强制接入。", true);
    queueReward("forge", 3);
  }

  updateWeapons(dt);
  updateProjectiles(dt);
  updateEnemies(dt);
  updateEnemyProjectiles(dt);
  updateGems(dt);
  updatePickups(dt);
  updateMutationZones();
  updateParticles(dt);
  updateHUD();
}

function worldToScreen(x, y) {
  return { x: x - player.x + width / 2, y: y - player.y + height / 2 };
}

function drawGrid() {
  const stageColors = ["#07101d", "#100a20", "#170811"];
  const gradient = ctx.createRadialGradient(width * .5, height * .5, 20, width * .5, height * .5, Math.max(width, height) * .8);
  gradient.addColorStop(0, stageColors[state.stageIndex] || stageColors[0]);
  gradient.addColorStop(1, "#03040a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const nebulaColors = [
    ["rgba(18,118,166,.13)", "rgba(61,44,143,.08)"],
    ["rgba(114,47,167,.16)", "rgba(31,105,157,.08)"],
    ["rgba(184,31,82,.14)", "rgba(91,34,146,.1)"],
  ][state.stageIndex] || ["rgba(18,118,166,.13)", "rgba(61,44,143,.08)"];
  const nebulae = [
    { x: width * .18 - player.x * .018, y: height * .28 - player.y * .012, r: Math.max(width, height) * .48, color: nebulaColors[0] },
    { x: width * .78 - player.x * .01, y: height * .72 - player.y * .02, r: Math.max(width, height) * .4, color: nebulaColors[1] },
  ];
  for (const cloud of nebulae) {
    const nebula = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
    nebula.addColorStop(0, cloud.color); nebula.addColorStop(.42, cloud.color.replace(/\.[0-9]+\)/, ".045)")); nebula.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = nebula; ctx.fillRect(0, 0, width, height);
  }

  ctx.save();
  for (let i = 0; i < 92; i += 1) {
    const layer = 0.012 + (i % 4) * .008;
    const sx = ((i * 173.31 - player.x * layer) % (width + 40) + width + 40) % (width + 40) - 20;
    const sy = ((i * i * 47.17 + i * 61.7 - player.y * layer) % (height + 40) + height + 40) % (height + 40) - 20;
    const twinkle = .34 + Math.sin(state.time * (1 + i % 3) + i) * .18;
    const size = i % 19 === 0 ? 1.8 : i % 7 === 0 ? 1.15 : .65;
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = i % 11 === 0 ? "#91eaff" : i % 13 === 0 ? "#d8b8ff" : "#ffffff";
    ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
    if (size > 1.5) { ctx.fillRect(sx - 4, sy - .35, 8, .7); ctx.fillRect(sx - .35, sy - 4, .7, 8); }
  }
  ctx.restore();

  const planetX = width * .82 - player.x * .006;
  const planetY = height * .18 - player.y * .006;
  const planetRadius = Math.min(width, height) * .105;
  ctx.save(); ctx.globalAlpha = .22;
  ctx.strokeStyle = stages[state.stageIndex].color; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(planetX, planetY, planetRadius * 1.75, planetRadius * .38, -.25, 0, Math.PI * 2); ctx.stroke();
  const planet = ctx.createRadialGradient(planetX - planetRadius * .35, planetY - planetRadius * .4, 0, planetX, planetY, planetRadius);
  planet.addColorStop(0, `${stages[state.stageIndex].color}aa`); planet.addColorStop(.58, "#172239"); planet.addColorStop(1, "#03050a");
  ctx.fillStyle = planet; ctx.beginPath(); ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const grid = 56;
  const offsetX = ((-player.x % grid) + grid) % grid;
  const offsetY = ((-player.y % grid) + grid) % grid;
  ctx.strokeStyle = "rgba(126,197,235,.026)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = offsetX; x < width; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
  for (let y = offsetY; y < height; y += grid) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
  ctx.stroke();

  const major = grid * 4;
  const majorX = ((-player.x % major) + major) % major;
  const majorY = ((-player.y % major) + major) % major;
  ctx.strokeStyle = state.stageIndex === 2 ? "rgba(255,138,61,.05)" : state.stageIndex === 1 ? "rgba(167,139,250,.045)" : "rgba(255,54,95,.034)";
  ctx.beginPath();
  for (let x = majorX; x < width; x += major) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
  for (let y = majorY; y < height; y += major) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
  ctx.stroke();
}

function polygon(x, y, radius, sides, rotation = 0) {
  ctx.beginPath();
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + index / sides * Math.PI * 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawGems() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const gem of xpGems) {
    const point = worldToScreen(gem.x, gem.y);
    if (point.x < -20 || point.y < -20 || point.x > width + 20 || point.y > height + 20) continue;
    const pulse = 1 + Math.sin(gem.phase) * 0.14;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#58e6ff";
    ctx.fillStyle = "#58e6ff";
    polygon(point.x, point.y, gem.radius * pulse, 4, Math.PI / 4);
    ctx.fill();
  }
  ctx.restore();
}

function drawPickups() {
  for (const pickup of pickups) {
    const point = worldToScreen(pickup.x, pickup.y);
    if (point.x < -30 || point.y < -30 || point.x > width + 30 || point.y > height + 30) continue;
    const pulse = 1 + Math.sin(pickup.phase) * .08;
    ctx.save();
    ctx.translate(point.x, point.y + Math.sin(pickup.phase) * 3);
    ctx.scale(pulse, pulse);
    if (pickup.type === "heal") {
      ctx.shadowBlur = 16; ctx.shadowColor = "#67e86f"; ctx.fillStyle = "#183b2b"; ctx.strokeStyle = "#8cff9e"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#8cff9e"; ctx.fillRect(-2.5, -7, 5, 14); ctx.fillRect(-7, -2.5, 14, 5);
    } else {
      const color = pickup.mythic ? "#ffd166" : pickup.elite ? "#a78bfa" : "#58e6ff";
      ctx.shadowBlur = 18; ctx.shadowColor = color; ctx.fillStyle = "#202432"; ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-13, -10, 26, 20, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.fillRect(-13, -2, 26, 4); ctx.fillRect(-3, -10, 6, 20);
      drawSingularityCore(ctx, 0, 0, 3.5, color, pickup.phase, .6);
    }
    ctx.restore();
  }
}

function drawCosmicEyes(x, y, gap, size, color) {
  ctx.fillStyle = "#0b1020";
  for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(x + side * gap, y, size * 1.55, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = color;
  ctx.shadowBlur = 8; ctx.shadowColor = color;
  for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(x + side * gap, y, size, 0, Math.PI * 2); ctx.fill(); }
  ctx.shadowBlur = 0;
}

function drawSingularityCore(renderCtx, x, y, radius, color, phase = 0, intensity = 1) {
  const r = Math.max(3, radius);
  renderCtx.save();
  renderCtx.translate(x, y);
  renderCtx.lineCap = "round";
  renderCtx.lineJoin = "round";

  renderCtx.save();
  renderCtx.rotate(-.18 + Math.sin(phase * .37) * .08);
  renderCtx.globalCompositeOperation = "lighter";
  const ringColors = ["#ff9f43", "#b14cff", "#42ddff"];
  ringColors.forEach((ringColor, index) => {
    renderCtx.strokeStyle = ringColor;
    renderCtx.globalAlpha = (.22 + index * .07) * intensity;
    renderCtx.lineWidth = Math.max(.8, r * (.18 - index * .035));
    renderCtx.shadowBlur = r * .65;
    renderCtx.shadowColor = ringColor;
    renderCtx.beginPath();
    renderCtx.ellipse(0, 0, r * (1.48 + index * .18), r * (.42 + index * .07), phase * (.13 + index * .03), 0, Math.PI * 2);
    renderCtx.stroke();
  });
  renderCtx.restore();

  const sphere = renderCtx.createRadialGradient(-r * .28, -r * .32, r * .04, 0, 0, r);
  sphere.addColorStop(0, "#182453");
  sphere.addColorStop(.3, "#050616");
  sphere.addColorStop(.62, "#020208");
  sphere.addColorStop(.82, color);
  sphere.addColorStop(1, "#06030b");
  renderCtx.fillStyle = sphere;
  renderCtx.shadowBlur = r * .75 * intensity;
  renderCtx.shadowColor = color;
  renderCtx.beginPath(); renderCtx.arc(0, 0, r, 0, Math.PI * 2); renderCtx.fill();

  renderCtx.save();
  renderCtx.beginPath(); renderCtx.arc(0, 0, r * .96, 0, Math.PI * 2); renderCtx.clip();
  renderCtx.globalCompositeOperation = "lighter";
  for (let index = 0; index < 5; index += 1) {
    const ribbonColor = ringColors[index % ringColors.length];
    renderCtx.strokeStyle = ribbonColor;
    renderCtx.globalAlpha = (.18 + index * .025) * intensity;
    renderCtx.lineWidth = Math.max(.6, r * .09);
    renderCtx.beginPath();
    renderCtx.arc(Math.sin(index * 2.1 + phase) * r * .16, Math.cos(index * 1.7 - phase) * r * .12, r * (.48 + index * .11), phase + index, phase + index + Math.PI * 1.22);
    renderCtx.stroke();
  }
  renderCtx.fillStyle = "rgba(255,255,255,.75)";
  for (let index = 0; index < 7; index += 1) {
    const angle = index * 2.399 + phase * .12;
    const distance = r * (.28 + (index % 3) * .18);
    renderCtx.beginPath(); renderCtx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, Math.max(.45, r * .025), 0, Math.PI * 2); renderCtx.fill();
  }
  renderCtx.restore();

  renderCtx.globalCompositeOperation = "lighter";
  const flare = renderCtx.createLinearGradient(-r * 2.65, 0, r * 2.65, 0);
  flare.addColorStop(0, "rgba(88,230,255,0)");
  flare.addColorStop(.28, "rgba(88,230,255,.55)");
  flare.addColorStop(.48, "rgba(255,255,255,.95)");
  flare.addColorStop(.52, "rgba(255,255,255,.95)");
  flare.addColorStop(.72, "rgba(187,73,255,.55)");
  flare.addColorStop(1, "rgba(187,73,255,0)");
  renderCtx.fillStyle = flare;
  renderCtx.globalAlpha = Math.min(1, .72 * intensity);
  renderCtx.fillRect(-r * 2.65, -Math.max(.55, r * .045), r * 5.3, Math.max(1.1, r * .09));
  renderCtx.shadowBlur = r * 1.1; renderCtx.shadowColor = "#ffffff";
  renderCtx.fillStyle = "white";
  renderCtx.beginPath(); renderCtx.arc(0, 0, r * .12, 0, Math.PI * 2); renderCtx.fill();
  renderCtx.strokeStyle = "#7df3ff"; renderCtx.lineWidth = Math.max(.65, r * .055);
  renderCtx.beginPath(); renderCtx.arc(0, 0, r * .22, 0, Math.PI * 2); renderCtx.stroke();
  renderCtx.fillStyle = "#050612"; renderCtx.beginPath(); renderCtx.arc(0, 0, r * .065, 0, Math.PI * 2); renderCtx.fill();
  renderCtx.restore();
}

function drawCosmicBoss(enemy, r, phase, color) {
  if (enemy.bossIndex === 0) {
    ctx.save(); ctx.rotate(state.time * .45);
    ctx.strokeStyle = enemy.color; ctx.lineWidth = r * .12;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.45, r * .56, .25, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 3; i += 1) { const a = i / 3 * Math.PI * 2; ctx.fillStyle = i ? "#eafcff" : enemy.color; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.22, Math.sin(a) * r * .48, r * .13, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = "#273449"; ctx.beginPath(); ctx.arc(0, 0, r * .82, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(-r * .13, -r * .12, r * .48, .4, Math.PI * 1.65); ctx.fill();
    ctx.strokeStyle = "#0b1020"; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * .48, 0, Math.PI * 2); ctx.stroke();
    drawCosmicEyes(0, 0, 0, r * .15, "#ffffff");
  } else if (enemy.bossIndex === 1) {
    ctx.strokeStyle = enemy.color; ctx.lineWidth = r * .09;
    for (let i = -3; i <= 3; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * r * .17, r * .22); ctx.bezierCurveTo(i * r * .28 + Math.sin(phase + i) * 8, r * .75, i * r * .34, r * .92, i * r * .24 + Math.sin(phase * 1.4 + i) * 9, r * 1.28); ctx.stroke();
    }
    ctx.fillStyle = "#251d42"; ctx.beginPath(); ctx.arc(0, 0, r * .82, Math.PI, 0); ctx.quadraticCurveTo(r * .7, r * .45, 0, r * .55); ctx.quadraticCurveTo(-r * .7, r * .45, -r * .82, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.globalAlpha = .55; ctx.beginPath(); ctx.ellipse(-r * .16, -r * .18, r * .35, r * .2, -.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    drawCosmicEyes(0, r * .12, r * .2, r * .1, "#f5eaff");
  } else {
    ctx.save(); ctx.rotate(state.time * -.35);
    ctx.fillStyle = "#182031";
    for (let i = 0; i < 12; i += 1) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(r * .58, -r * .16); ctx.lineTo(r * 1.28, 0); ctx.lineTo(r * .58, r * .16); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    drawSingularityCore(ctx, 0, 0, r * .76, color, phase, 1.32);
  }
}

function drawEnemySprite(enemy, flash) {
  const cell = enemySpriteCells[enemy.type];
  if (!cell || !enemyAtlas.complete || !enemyAtlas.naturalWidth) return false;
  const cellWidth = enemyAtlas.naturalWidth / 6;
  const cellHeight = enemyAtlas.naturalHeight / 3;
  const sizeScale = enemy.rank === "elite" ? 3.65 : enemy.rank === "heavy" ? 3.5 : enemy.rank === "support" ? 3.35 : 3.15;
  const drawSize = enemy.radius * sizeScale;

  if (enemy.shielded) {
    ctx.save();
    ctx.rotate(-Math.atan2(player.y - enemy.y, player.x - enemy.x) - Math.PI / 2);
    ctx.strokeStyle = "rgba(116,235,255,.72)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.arc(0, 0, enemy.radius * 1.38, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (enemy.speedAura > 1) {
    ctx.save();
    ctx.rotate(state.time * 2.2);
    ctx.strokeStyle = "rgba(255,82,107,.62)";
    ctx.lineWidth = 2;
    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath(); ctx.arc(0, 0, enemy.radius * 1.22, index * 2.1, index * 2.1 + .82); ctx.stroke();
    }
    ctx.restore();
  }
  if (enemy.attackWindup > 0 || enemy.fuseTimer > 0) {
    const pulse = 1 + Math.sin(state.time * 26) * .12;
    ctx.strokeStyle = enemy.accent;
    ctx.globalAlpha = .82;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, enemy.radius * 1.35 * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.shadowBlur = flash ? 22 : enemy.elite ? 18 : 8;
  ctx.shadowColor = flash ? "#ffffff" : enemy.color;
  ctx.globalAlpha = flash ? .78 : 1;
  ctx.drawImage(
    enemyAtlas,
    cell[0] * cellWidth,
    cell[1] * cellHeight,
    cellWidth,
    cellHeight,
    -drawSize / 2,
    -drawSize / 2,
    drawSize,
    drawSize,
  );
  ctx.restore();
  return true;
}

function drawEnemyModel(enemy) {
  const r = enemy.radius;
  const phase = state.time * (enemy.rank === "swift" ? 11 : 6) + enemy.id * 1.7;
  const flash = enemy.hitFlash > 0;
  const color = flash ? "#ffffff" : enemy.color;
  const accent = flash ? "#ffffff" : (enemy.accent || enemy.color);
  const bob = Math.sin(phase) * (enemy.type === "void_octopus" ? 2 : 1);
  ctx.fillStyle = "rgba(0,0,0,.5)";
  ctx.beginPath(); ctx.ellipse(0, r * .72, r * .9, r * .28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = enemy.boss ? 28 : enemy.elite ? 20 : 10;
  ctx.shadowColor = enemy.color;
  ctx.strokeStyle = flash ? "#ffffff" : "rgba(225,239,255,.42)";
  ctx.lineWidth = Math.max(1, r / 15);
  if (enemy.boss) { drawCosmicBoss(enemy, r, phase, color); return; }
  if (drawEnemySprite(enemy, flash)) return;

  if (enemy.type === "asteroid_mite") {
    ctx.fillStyle = "#292238";
    for (let i = -3; i <= 3; i += 1) { const x = i * r * .22; ctx.beginPath(); ctx.moveTo(x - r * .16, -r * .25); ctx.lineTo(x, -r * (1.02 + Math.cos(i) * .12)); ctx.lineTo(x + r * .2, -r * .22); ctx.fill(); ctx.stroke(); }
    ctx.strokeStyle = color; ctx.lineWidth = r * .15;
    for (const side of [-1, 1]) for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.moveTo(side * r * .45, -r * .05 + i * r * .28); ctx.lineTo(side * r * (1 + i * .08), r * (.06 + i * .28) + Math.sin(phase + i) * 2); ctx.stroke(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, r * .05 + bob, r * .68, r * .78, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = accent; for (const p of [[-.25,.22],[.24,.32],[0,-.12]]) { ctx.beginPath(); ctx.arc(p[0] * r, p[1] * r, r * .1, 0, Math.PI * 2); ctx.fill(); }
    drawCosmicEyes(0, -r * .28, r * .22, r * .12, "#f5ecff");
  } else if (enemy.type === "azure_beetle") {
    ctx.strokeStyle = "#111827"; ctx.lineWidth = r * .12;
    for (const side of [-1, 1]) for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.moveTo(side * r * .38, (-.25 + i * .35) * r); ctx.lineTo(side * r * .92, (-.32 + i * .43) * r + Math.sin(phase + i) * 2); ctx.stroke(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, r * .2, r * .66, r * .72, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#105375"; ctx.beginPath(); ctx.moveTo(0, -r * .42); ctx.lineTo(0, r * .78); ctx.stroke();
    ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(-r * .22, 0, r * .17, r * .28, -.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(r * .25, r * .28, r * .14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#17445b"; ctx.beginPath(); ctx.arc(0, -r * .5, r * .44, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    drawCosmicEyes(0, -r * .55, r * .2, r * .11, "#a6ffff");
  } else if (enemy.type === "survey_drone") {
    ctx.fillStyle = "#20283a"; ctx.fillRect(-r * .72, -r * .45, r * 1.44, r * .95); ctx.strokeRect(-r * .72, -r * .45, r * 1.44, r * .95);
    for (const side of [-1, 1]) { ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(side * r * .86, 0, r * .25, r * .48, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#0b1020"; ctx.beginPath(); ctx.ellipse(side * r * .86, 0, r * .1, r * .28, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(0, -r * .46); ctx.lineTo(r * .18, -r * .95); ctx.stroke(); ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(r * .18, -r * .98, r * .11, 0, Math.PI * 2); ctx.fill();
    drawCosmicEyes(0, -r * .05, r * .25, r * .13, accent);
    ctx.fillStyle = color; ctx.fillRect(-r * .28, r * .32, r * .56, r * .12);
  } else if (enemy.type === "void_octopus") {
    ctx.strokeStyle = color; ctx.lineWidth = r * .22;
    for (let i = -2; i <= 2; i += 1) { ctx.beginPath(); ctx.moveTo(i * r * .2, r * .28); ctx.quadraticCurveTo(i * r * .36 + Math.sin(phase + i) * 4, r * .68, i * r * .42, r * 1.02); ctx.stroke(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, -r * .12 + bob, r * .72, r * .72, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#52f59e"; ctx.beginPath(); ctx.ellipse(-r * .18, -r * .34, r * .28, r * .18, -.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#101a20"; ctx.beginPath(); ctx.arc(r * .22, -r * .12, r * .25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = r * .1; ctx.beginPath(); ctx.arc(r * .22, -r * .12, r * .17, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(r * .22, -r * .12, r * .07, 0, Math.PI * 2); ctx.fill();
  } else if (["nebula_hound", "prism_fox"].includes(enemy.type)) {
    const fox = enemy.type === "prism_fox"; const gait = Math.sin(phase) * r * .18;
    ctx.strokeStyle = "#18202e"; ctx.lineWidth = r * .22;
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(side * r * .34, r * .12); ctx.lineTo(side * r * .54 + gait * side, r * .88); ctx.stroke(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, r * .12, r * .55, r * .76, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * .42, -r * .28); ctx.lineTo(-r * .76, -r * .94); ctx.lineTo(-r * .08, -r * .65); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r * .42, -r * .28); ctx.lineTo(r * .76, -r * .94); ctx.lineTo(r * .08, -r * .65); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#172232"; ctx.beginPath(); ctx.ellipse(0, -r * .5, r * .5, r * .38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(0, -r * 1.02); ctx.lineTo(r * .22, -r * .43); ctx.lineTo(-r * .22, -r * .43); ctx.closePath(); ctx.fill();
    drawCosmicEyes(0, -r * .56, r * .22, r * .11, fox ? "#fff7b0" : "#ff5369");
    ctx.strokeStyle = accent; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.moveTo(r * .45, r * .35); ctx.quadraticCurveTo(r * 1.2, r * .45, r * .82, r * .92); ctx.stroke();
  } else if (enemy.type === "comet_larva") {
    ctx.strokeStyle = "#402128"; ctx.lineWidth = r * .16;
    for (const side of [-1, 1]) for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.moveTo(side * r * .38, (-.1 + i * .36) * r); ctx.lineTo(side * r * .83, (.05 + i * .4) * r); ctx.stroke(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, r * .18, r * .58, r * .82, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = accent;
    for (let i = -2; i <= 2; i += 1) { ctx.beginPath(); ctx.moveTo(i * r * .2 - r * .12, -r * .2); ctx.lineTo(i * r * .18, -r * (1.08 + Math.cos(i) * .12)); ctx.lineTo(i * r * .2 + r * .13, -r * .18); ctx.fill(); }
    drawCosmicEyes(0, -r * .38, r * .22, r * .12, "#fff4c2");
  } else if (enemy.type === "void_boar") {
    const gait = Math.sin(phase) * 2;
    ctx.strokeStyle = "#37272a"; ctx.lineWidth = r * .3;
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(side * r * .42, r * .2); ctx.lineTo(side * r * .58 + gait * side, r * .88); ctx.stroke(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, r * .08, r * .86, r * .68, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#5c302e"; ctx.beginPath(); ctx.ellipse(0, -r * .45, r * .63, r * .48, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#241820"; ctx.beginPath(); ctx.ellipse(0, -r * .25, r * .36, r * .25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(-r * .14, -r * .26, r * .06, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(r * .14, -r * .26, r * .06, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e7e0c7"; for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(side * r * .32, -r * .22); ctx.lineTo(side * r * .65, -r * .05); ctx.lineTo(side * r * .4, r * .04); ctx.fill(); }
    drawCosmicEyes(0, -r * .58, r * .3, r * .11, accent);
  } else if (enemy.type === "thunder_orb") {
    ctx.save(); ctx.rotate(state.time * .8);
    ctx.fillStyle = color;
    for (let i = 0; i < 10; i += 1) { ctx.rotate(Math.PI / 5); ctx.beginPath(); ctx.moveTo(r * .52, -r * .18); ctx.lineTo(r * 1.12, 0); ctx.lineTo(r * .52, r * .18); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = "#172235"; ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    drawSingularityCore(ctx, 0, 0, r * .48, accent, phase, .72);
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    const point = worldToScreen(enemy.x, enemy.y);
    if (point.x < -50 || point.y < -50 || point.x > width + 50 || point.y > height + 50) continue;
    ctx.save();
    ctx.translate(point.x, point.y);
    const facesTarget = !enemy.boss && enemy.type !== "thunder_orb";
    ctx.rotate(facesTarget ? Math.atan2(player.y - enemy.y, player.x - enemy.x) + Math.PI / 2 : 0);
    drawEnemyModel(enemy);
    ctx.restore();

    if (enemy.burnUntil > state.time || enemy.poisonUntil > state.time) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      if (enemy.burnUntil > state.time) {
        ctx.strokeStyle = "#ff7a38"; ctx.shadowBlur = 14; ctx.shadowColor = "#ff7a38"; ctx.lineWidth = 2;
        for (let index = 0; index < 3; index += 1) {
          const offset = (index - 1) * enemy.radius * .45;
          const flame = 5 + Math.sin(state.time * 11 + enemy.id + index) * 3;
          ctx.beginPath(); ctx.moveTo(point.x + offset, point.y + enemy.radius * .55); ctx.quadraticCurveTo(point.x + offset - 4, point.y - flame, point.x + offset + 2, point.y - enemy.radius * .8 - flame); ctx.stroke();
        }
      }
      if (enemy.poisonUntil > state.time) {
        ctx.strokeStyle = "#67e86f"; ctx.fillStyle = "#67e86f66"; ctx.shadowBlur = 12; ctx.shadowColor = "#67e86f";
        for (let index = 0; index < 4; index += 1) {
          const angle = state.time * (1 + index * .07) + index * Math.PI * .5 + enemy.id;
          const radius = enemy.radius + 5 + index % 2 * 4;
          ctx.beginPath(); ctx.arc(point.x + Math.cos(angle) * radius, point.y + Math.sin(angle) * radius, 2 + index % 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      }
      ctx.restore();
    }

    if (enemy.openingWaveTier && enemy.openingWaveTier === state.openingWaveTier) {
      const pulse = 1 + Math.sin(state.time * 7 + enemy.id) * .1;
      ctx.save();
      ctx.strokeStyle = stages[enemy.openingWaveTier - 1]?.color || "#58e6ff";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = .55;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, (enemy.radius + 8) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = .9;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y - enemy.radius - 15);
      ctx.lineTo(point.x + 4, point.y - enemy.radius - 11);
      ctx.lineTo(point.x, point.y - enemy.radius - 7);
      ctx.lineTo(point.x - 4, point.y - enemy.radius - 11);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (enemy.hp < enemy.maxHp && (enemy.rank !== "common" || enemy.boss)) {
      const barWidth = enemy.radius * 2;
      ctx.fillStyle = "rgba(0,0,0,.7)";
      ctx.fillRect(point.x - barWidth / 2, point.y - enemy.radius - 9, barWidth, 3);
      ctx.fillStyle = enemy.color;
      ctx.fillRect(point.x - barWidth / 2, point.y - enemy.radius - 9, barWidth * Math.max(0, enemy.hp / enemy.maxHp), 3);
    }
  }
}

function drawEnemyProjectiles() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const projectile of enemyProjectiles) {
    const point = worldToScreen(projectile.x, projectile.y);
    if (point.x < -20 || point.y < -20 || point.x > width + 20 || point.y > height + 20) continue;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(projectile.phase);
    ctx.shadowBlur = 17;
    ctx.shadowColor = projectile.color;
    ctx.strokeStyle = projectile.color;
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 2;
    polygon(0, 0, projectile.radius + 2, 4, Math.PI / 4);
    ctx.stroke();
    polygon(0, 0, Math.max(2, projectile.radius * .45), 4, Math.PI / 4);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawProjectileBody(projectile) {
  const form = inferVisualForm(projectile.weapon || {});
  const r = Math.max(3, projectile.radius);
  const color = projectile.color || "#f1f0eb";
  const secondary = projectile.weapon?.secondary_color || "#f1f0eb";
  const variant = Math.max(0, Math.min(11, Number(projectile.weapon?.visual_variant) || 0));
  ctx.shadowBlur = 14;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(255,255,255,.82)";
  ctx.lineWidth = Math.max(1, r * .22);

  if (form === "bow") {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.3, r * .35);
    ctx.beginPath(); ctx.moveTo(-r * 4.2, 0); ctx.lineTo(r * 3.4, 0); ctx.stroke();
    ctx.fillStyle = "#f5f8ff";
    ctx.beginPath(); ctx.moveTo(r * 4.1, 0); ctx.lineTo(r * 2.2, -r * .9); ctx.lineTo(r * 2.6, 0); ctx.lineTo(r * 2.2, r * .9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = color;
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-r * 2.2, 0); ctx.lineTo(-r * 3.5, side * r * .9); ctx.lineTo(-r * 2.8, 0); ctx.closePath(); ctx.fill(); }
  } else if (form === "cannon") {
    const trail = ctx.createLinearGradient(-r * 6, 0, r * 2, 0);
    trail.addColorStop(0, `${color}00`);
    trail.addColorStop(.5, `${color}33`);
    trail.addColorStop(1, `${color}bb`);
    ctx.fillStyle = trail;
    ctx.fillRect(-r * 6, -r * .45, r * 6, r * .9);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(r * .4, 0, r * 1.35, r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.beginPath(); ctx.arc(r * .85, -r * .22, r * .28, 0, Math.PI * 2); ctx.fill();
  } else if (["staff", "orb", "tome"].includes(form)) {
    ctx.save();
    ctx.rotate(state.time * 5 + projectile.x * .002);
    ctx.strokeStyle = color;
    ctx.globalAlpha = .75;
    polygon(0, 0, r * 1.6, form === "tome" ? 4 : 6, Math.PI / 4);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = form === "orb" ? `${color}cc` : "#eef8ff";
    polygon(0, 0, r * .9, 4, Math.PI / 4);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = .35;
    ctx.fillRect(-r * 4.8, -1, r * 4.4, 2);
    ctx.globalAlpha = 1;
  } else if (["blade", "daggers"].includes(form)) {
    ctx.fillStyle = "#edf3fb";
    ctx.beginPath();
    ctx.moveTo(r * 3.2, 0);
    ctx.lineTo(-r * 1.5, -r * .9);
    ctx.lineTo(-r * .4, 0);
    ctx.lineTo(-r * 1.5, r * .9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * .25);
    ctx.beginPath(); ctx.moveTo(-r * 1.2, 0); ctx.lineTo(r * 2.5, 0); ctx.stroke();
    ctx.globalAlpha = .32;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(-r * 2.3, 0, r * 2.4, r * .36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (form === "drone") {
    ctx.fillStyle = "#222936";
    polygon(0, 0, r * 1.5, 4, Math.PI / 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillRect(-r * 2.8, -r * .2, r * 1.4, r * .4);
    ctx.fillRect(r * 1.4, -r * .2, r * 1.4, r * .4);
    ctx.beginPath(); ctx.arc(0, 0, r * .42, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(-r * 1.7, -r * .5, r * 3.5, r);
    ctx.fillStyle = "#f6f8ff";
    ctx.fillRect(r * .9, -r * .32, r * 1.2, r * .64);
    ctx.globalAlpha = .35;
    ctx.fillStyle = color;
    ctx.fillRect(-r * 5.2, -1, r * 4.6, 2);
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.strokeStyle = secondary; ctx.fillStyle = secondary; ctx.lineWidth = Math.max(1, r * .16); ctx.globalAlpha = .78;
  if (variant % 4 === 0) {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 2.1, r * .82, state.time * 2, 0, Math.PI * 2); ctx.stroke();
  } else if (variant % 4 === 1) {
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-r * .6, 0); ctx.lineTo(-r * 2.2, side * r); ctx.lineTo(r * .2, side * r * .42); ctx.closePath(); ctx.fill(); }
  } else if (variant % 4 === 2) {
    for (let index = 0; index < 3; index += 1) { const angle = state.time * 6 + index / 3 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(angle) * r * 1.7, Math.sin(angle) * r * .8, r * .23, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.beginPath(); for (let index = -2; index <= 2; index += 1) ctx.lineTo(index * r * .8, (index % 2 ? -1 : 1) * r * .75); ctx.stroke();
  }
  if ((projectile.weapon?.burn_damage || 0) + bonuses.burn > 0) {
    ctx.strokeStyle = "#ff7a38"; ctx.beginPath(); ctx.moveTo(-r * 1.2, 0); ctx.quadraticCurveTo(-r * 3, -r, -r * 5, Math.sin(state.time * 16) * r); ctx.stroke();
  }
  if ((projectile.weapon?.poison_damage || 0) + bonuses.poison > 0) {
    ctx.fillStyle = "#67e86f"; for (let index = 0; index < 3; index += 1) { ctx.beginPath(); ctx.arc(-r * (1.5 + index * 1.2), Math.sin(state.time * 9 + index) * r * .7, r * .22, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

function drawProjectiles() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const projectile of projectiles) {
    const point = worldToScreen(projectile.x, projectile.y);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(projectile.angle);
    drawProjectileBody(projectile);
    ctx.restore();
  }
  ctx.restore();
}

function drawWeaponModel(renderCtx, weapon, x, y, angle = 0, scale = 1, alpha = 1) {
  const form = inferVisualForm(weapon);
  const color = weapon.color || "#f1f0eb";
  const secondary = weapon.secondary_color || "#18213a";
  const variant = Math.max(0, Math.min(11, Number(weapon.visual_variant) || 0));
  renderCtx.save();
  renderCtx.translate(x, y);
  renderCtx.rotate(angle);
  renderCtx.scale(scale * (1 + (variant % 3) * .045), scale * (1 + (Math.floor(variant / 3) % 2) * .07));
  renderCtx.globalAlpha *= alpha;
  renderCtx.lineCap = "round";
  renderCtx.lineJoin = "round";
  renderCtx.strokeStyle = "#ecebf0";
  renderCtx.fillStyle = color;
  renderCtx.lineWidth = 1.25;
  renderCtx.shadowBlur = 10;
  renderCtx.shadowColor = color;
  const recoil = (weapon.recoil || 0) * 4;
  renderCtx.translate(-recoil, 0);

  if (form === "rifle" || form === "cannon") {
    const heavy = form === "cannon";
    renderCtx.fillStyle = "#272832";
    renderCtx.beginPath();
    renderCtx.moveTo(-19, -5); renderCtx.lineTo(-8, -7); renderCtx.lineTo(5, -6 - (heavy ? 3 : 0));
    renderCtx.lineTo(16, -3 - (heavy ? 2 : 0)); renderCtx.lineTo(16, 4 + (heavy ? 2 : 0));
    renderCtx.lineTo(-8, 6); renderCtx.lineTo(-21, 3); renderCtx.closePath(); renderCtx.fill(); renderCtx.stroke();
    renderCtx.fillStyle = color;
    renderCtx.fillRect(-7, -4 - (heavy ? 2 : 0), 20, 8 + (heavy ? 4 : 0));
    renderCtx.fillStyle = "#d9d9df";
    renderCtx.fillRect(13, heavy ? -4 : -2, heavy ? 22 : 29, heavy ? 8 : 4);
    renderCtx.fillStyle = color;
    renderCtx.fillRect(heavy ? 29 : 36, heavy ? -6 : -4, 7, heavy ? 12 : 8);
    renderCtx.fillStyle = "#15161d";
    renderCtx.fillRect(-3, 5, 7, 11);
    if (!heavy) {
      renderCtx.strokeStyle = color; renderCtx.lineWidth = 2;
      renderCtx.beginPath(); renderCtx.moveTo(1, -7); renderCtx.lineTo(4, -12); renderCtx.lineTo(15, -12); renderCtx.lineTo(17, -7); renderCtx.stroke();
      renderCtx.fillStyle = "#0c0d12"; renderCtx.fillRect(6, -13, 8, 3);
    } else {
      renderCtx.strokeStyle = color; renderCtx.lineWidth = 2;
      [-1, 1].forEach((side) => { renderCtx.beginPath(); renderCtx.moveTo(36, side * 3); renderCtx.lineTo(43, side * 7); renderCtx.stroke(); });
    }
  } else if (form === "blade" || form === "daggers") {
    const drawBlade = (offsetY = 0, mirror = 1) => {
      renderCtx.save(); renderCtx.translate(-6, offsetY); renderCtx.rotate(mirror * (form === "daggers" ? .13 : 0));
      renderCtx.fillStyle = "#2a2530"; renderCtx.fillRect(-16, -3, 13, 6);
      renderCtx.fillStyle = color; renderCtx.fillRect(-5, -7, 3, 14);
      renderCtx.fillStyle = "#e9edf2";
      renderCtx.beginPath(); renderCtx.moveTo(-1, -5); renderCtx.lineTo(form === "daggers" ? 23 : 42, -2);
      renderCtx.lineTo(form === "daggers" ? 30 : 50, 0); renderCtx.lineTo(form === "daggers" ? 23 : 42, 4); renderCtx.lineTo(-1, 5); renderCtx.closePath(); renderCtx.fill(); renderCtx.stroke();
      renderCtx.strokeStyle = color; renderCtx.beginPath(); renderCtx.moveTo(1, 0); renderCtx.lineTo(form === "daggers" ? 24 : 44, 0); renderCtx.stroke(); renderCtx.restore();
    };
    if (form === "daggers") { drawBlade(-7, 1); drawBlade(7, -1); } else drawBlade();
  } else if (form === "bow") {
    renderCtx.strokeStyle = color; renderCtx.lineWidth = 3;
    renderCtx.beginPath(); renderCtx.moveTo(4, -25); renderCtx.quadraticCurveTo(26, 0, 4, 25); renderCtx.stroke();
    renderCtx.strokeStyle = "rgba(240,240,245,.8)"; renderCtx.lineWidth = 1;
    renderCtx.beginPath(); renderCtx.moveTo(4, -25); renderCtx.lineTo(-6, 0); renderCtx.lineTo(4, 25); renderCtx.stroke();
    renderCtx.fillStyle = "#e9edf2"; renderCtx.fillRect(-8, -1, 43, 2);
    renderCtx.fillStyle = color; renderCtx.beginPath(); renderCtx.moveTo(37, 0); renderCtx.lineTo(29, -4); renderCtx.lineTo(29, 4); renderCtx.closePath(); renderCtx.fill();
  } else if (form === "staff") {
    renderCtx.strokeStyle = "#d6d5dc"; renderCtx.lineWidth = 4;
    renderCtx.beginPath(); renderCtx.moveTo(-26, 0); renderCtx.lineTo(24, 0); renderCtx.stroke();
    renderCtx.strokeStyle = color; renderCtx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      renderCtx.beginPath();
      renderCtx.moveTo(-15, side * 4);
      renderCtx.quadraticCurveTo(3, side * 13, 25, side * 6);
      renderCtx.stroke();
    }
    renderCtx.lineWidth = 2.4;
    renderCtx.beginPath(); renderCtx.arc(32, 0, 11, 0, Math.PI * 2); renderCtx.stroke();
    renderCtx.beginPath(); renderCtx.arc(32, 0, 6, 0, Math.PI * 2); renderCtx.stroke();
    renderCtx.fillStyle = color; polygonWithContext(renderCtx, 32, 0, 5, 6, state.time * 2); renderCtx.fill();
  } else if (form === "orb") {
    drawSingularityCore(renderCtx, 8, 0, 10, color, state.time * 2, .72);
  } else if (form === "tome") {
    renderCtx.fillStyle = "#25222e"; renderCtx.fillRect(-21, -15, 42, 30); renderCtx.strokeRect(-21, -15, 42, 30);
    renderCtx.fillStyle = color; renderCtx.fillRect(-19, -13, 18, 26); renderCtx.fillRect(1, -13, 18, 26);
    renderCtx.strokeStyle = "#ecebf0"; renderCtx.beginPath(); renderCtx.arc(9, 0, 5, 0, Math.PI * 2); renderCtx.stroke();
  } else if (form === "drone") {
    renderCtx.fillStyle = "#202633";
    polygonWithContext(renderCtx, 0, 0, 18, 6, Math.PI / 6); renderCtx.fill(); renderCtx.stroke();
    renderCtx.fillStyle = color;
    for (const side of [-1, 1]) {
      renderCtx.save();
      renderCtx.translate(side * 25, 0);
      renderCtx.rotate(state.time * 4 * side);
      renderCtx.fillRect(-12, -2, 24, 4);
      renderCtx.fillRect(-2, -12, 4, 24);
      renderCtx.restore();
      renderCtx.strokeStyle = `${color}aa`;
      renderCtx.beginPath(); renderCtx.moveTo(side * 9, 0); renderCtx.lineTo(side * 20, 0); renderCtx.stroke();
    }
    renderCtx.fillStyle = "#0c111a"; renderCtx.beginPath(); renderCtx.arc(0, 0, 7, 0, Math.PI * 2); renderCtx.fill();
    renderCtx.fillStyle = color; renderCtx.beginPath(); renderCtx.arc(2, -1, 3, 0, Math.PI * 2); renderCtx.fill();
  } else {
    renderCtx.fillStyle = "#292b34"; polygonWithContext(renderCtx, 0, 0, 21, 6, Math.PI / 6); renderCtx.fill(); renderCtx.stroke();
    renderCtx.fillStyle = color; renderCtx.fillRect(-18, -3, 36, 6);
    renderCtx.beginPath(); renderCtx.arc(10, 0, 6, 0, Math.PI * 2); renderCtx.fill();
    renderCtx.fillStyle = "white"; renderCtx.beginPath(); renderCtx.arc(12, -1, 2, 0, Math.PI * 2); renderCtx.fill();
  }

  // Twelve modular structure genes across nine chassis produce 108 readable
  // physical families. They alter silhouette, not merely color.
  const gene = variant % 6;
  const compact = ["orb", "tome", "drone"].includes(form);
  const anchor = compact ? 0 : 7;
  renderCtx.strokeStyle = secondary; renderCtx.fillStyle = secondary; renderCtx.lineWidth = 2;
  if (gene === 0) {
    renderCtx.beginPath(); renderCtx.arc(anchor, 0, compact ? 15 : 8, 0, Math.PI * 2); renderCtx.stroke();
    renderCtx.fillStyle = color; renderCtx.beginPath(); renderCtx.arc(anchor, 0, 3.2, 0, Math.PI * 2); renderCtx.fill();
  } else if (gene === 1) {
    for (const side of [-1, 1]) { renderCtx.beginPath(); renderCtx.moveTo(-7, side * 5); renderCtx.lineTo(-17, side * 15); renderCtx.lineTo(5, side * 7); renderCtx.closePath(); renderCtx.fill(); }
  } else if (gene === 2) {
    for (const side of [-1, 1]) { renderCtx.beginPath(); renderCtx.roundRect(-2, side * 8 - 3, 22, 6, 3); renderCtx.fill(); renderCtx.stroke(); }
  } else if (gene === 3) {
    renderCtx.beginPath(); renderCtx.moveTo(-22, -7); renderCtx.bezierCurveTo(-5, -18, 13, 18, 31, 7); renderCtx.stroke();
    renderCtx.fillStyle = color; for (const px of [-12, 8, 27]) { renderCtx.beginPath(); renderCtx.arc(px, px === 8 ? 3 : -4, 2.5, 0, Math.PI * 2); renderCtx.fill(); }
  } else if (gene === 4) {
    for (let index = -1; index <= 1; index += 1) { const px = index * 13; renderCtx.beginPath(); renderCtx.moveTo(px - 5, -6); renderCtx.lineTo(px, -16 - Math.abs(index) * 3); renderCtx.lineTo(px + 5, -6); renderCtx.closePath(); renderCtx.fill(); }
  } else {
    renderCtx.fillStyle = color; polygonWithContext(renderCtx, anchor + 5, 0, compact ? 10 : 7, variant >= 6 ? 5 : 4, Math.PI / 4); renderCtx.fill(); renderCtx.stroke();
    renderCtx.strokeStyle = secondary; renderCtx.beginPath(); renderCtx.moveTo(-20, 0); renderCtx.lineTo(anchor - 5, 0); renderCtx.stroke();
  }
  if (variant >= 6) {
    renderCtx.strokeStyle = color; renderCtx.globalAlpha *= .75; renderCtx.setLineDash([3, 3]);
    renderCtx.beginPath(); renderCtx.ellipse(anchor, 0, compact ? 25 : 17, compact ? 12 : 9, 0, 0, Math.PI * 2); renderCtx.stroke(); renderCtx.setLineDash([]);
  }
  renderCtx.restore();
}

function drawWeaponIconCanvas(iconCanvas, weapon) {
  const iconCtx = iconCanvas.getContext("2d");
  const w = iconCanvas.width;
  const h = iconCanvas.height;
  iconCtx.clearRect(0, 0, w, h);
  const color = weapon.color || "#f1f0eb";
  const gradient = iconCtx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "rgba(255,255,255,.035)");
  gradient.addColorStop(.7, `${color}22`);
  iconCtx.fillStyle = gradient;
  iconCtx.fillRect(0, 0, w, h);
  iconCtx.strokeStyle = `${color}66`;
  iconCtx.lineWidth = 1;
  iconCtx.strokeRect(.5, .5, w - 1, h - 1);
  iconCtx.save();
  iconCtx.globalCompositeOperation = "lighter";
  drawWeaponModel(iconCtx, weapon, w * .48, h * .54, 0, 1.05, 1);
  iconCtx.restore();
}

function polygonWithContext(renderCtx, x, y, radius, sides, rotation = 0) {
  renderCtx.beginPath();
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + index / sides * Math.PI * 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) renderCtx.moveTo(px, py); else renderCtx.lineTo(px, py);
  }
  renderCtx.closePath();
}

function drawEquippedWeapons() {
  const held = weapons.filter((weapon) => weapon.delivery !== "orbit");
  const facing = Math.atan2(player.moveY, player.moveX);
  held.slice(1).forEach((weapon, index) => {
    const side = index % 2 ? -1 : 1;
    const row = Math.floor(index / 2);
    const angle = facing + side * (1.45 + row * .2);
    drawWeaponModel(ctx, weapon, width / 2 + Math.cos(angle) * 30, height / 2 + Math.sin(angle) * 30, angle, .64, .62);
  });
  if (held[0]) drawWeaponModel(ctx, held[0], width / 2 + player.moveX * 15, height / 2 + player.moveY * 15, facing, .92, 1);
}

function drawOrbitals() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const weapon of weapons) {
    if (weapon.delivery !== "orbit" || !weapon.orbitPositions) continue;
    for (const orb of weapon.orbitPositions) {
      const point = worldToScreen(orb.x, orb.y);
      drawWeaponModel(ctx, weapon, point.x, point.y, orb.angle + Math.PI / 2, Math.max(.28, weapon.projectile_size / 26) * bonuses.area, 1);
    }
  }
  ctx.restore();
}

function drawBeamEffect(effect, start, end, alpha) {
  const color = effect.color || "#f1f0eb";
  const beamWidth = Math.max(1, Number(effect.width) || 3);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const style = effect.style || (effect.source === "weapon" ? "tracer" : "telegraph");
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.lineCap = "round";

  if (style === "telegraph") {
    ctx.globalAlpha = alpha * .5;
    ctx.lineWidth = beamWidth;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  if (["chain", "ember"].includes(style)) {
    const segments = 7;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(1, beamWidth * 1.2);
    ctx.shadowBlur = style === "ember" ? 12 : 20;
    ctx.beginPath();
    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments;
      const jitter = (Math.sin(t * 19 + state.time * 18 + start.x * .01) + Math.cos(t * 13 + end.y * .01)) * (style === "ember" ? 3 : 7);
      const x = start.x + dx * t + nx * jitter;
      const y = start.y + dy * t + ny * jitter;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = alpha * .45;
    ctx.lineWidth *= 2.4;
    ctx.stroke();
    return;
  }

  if (style === "ribbon") {
    ctx.shadowBlur = 22;
    for (const side of [-1, 1]) {
      ctx.globalAlpha = alpha * .52;
      ctx.lineWidth = Math.max(1, beamWidth * .45);
      ctx.beginPath();
      for (let index = 0; index <= 12; index += 1) {
        const t = index / 12;
        const wave = Math.sin(t * Math.PI * 3 + state.time * 10 + side) * 7 * side;
        const x = start.x + dx * t + nx * wave;
        const y = start.y + dy * t + ny * wave;
        if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(1.5, beamWidth * .55);
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.globalAlpha = alpha * .8;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(end.x, end.y, Math.max(2, (effect.width || 4) * .55), 0, Math.PI * 2); ctx.fill();
    return;
  }

  if (style === "lance") {
    ctx.shadowBlur = 24;
    ctx.globalAlpha = alpha * .8;
    ctx.lineWidth = Math.max(4, beamWidth * 2.4);
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(2, beamWidth);
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * .75;
    ctx.beginPath(); ctx.ellipse(end.x, end.y, Math.max(8, beamWidth * 1.6), Math.max(3, beamWidth * .55), Math.atan2(dy, dx), 0, Math.PI * 2); ctx.fill();
    return;
  }

  if (style === "arrow") {
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 16;
    ctx.lineWidth = Math.max(1.5, beamWidth);
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - dx / length * 15 + nx * 6, end.y - dy / length * 15 + ny * 6);
    ctx.lineTo(end.x - dx / length * 15 - nx * 6, end.y - dy / length * 15 - ny * 6);
    ctx.closePath(); ctx.fill();
    return;
  }

  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 18;
  ctx.lineWidth = Math.max(1, beamWidth * alpha);
  ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  ctx.globalAlpha = alpha * .35;
  ctx.lineWidth = beamWidth * 3;
  ctx.stroke();
}

function drawRingEffect(effect, point, alpha) {
  const progress = 1 - alpha;
  const color = effect.color || "#f1f0eb";
  const style = effect.style || "pulse";
  const radius = effect.radius * (0.82 + progress * .18);
  ctx.strokeStyle = color;
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2 + alpha * 3;

  if (style === "field") {
    for (let layer = 0; layer < 3; layer += 1) {
      ctx.globalAlpha = alpha * (.9 - layer * .22);
      ctx.lineWidth = Math.max(1, 3 - layer * .6);
      ctx.beginPath(); ctx.arc(point.x, point.y, radius * (.78 + layer * .14), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = alpha * .45;
    for (let index = 0; index < 8; index += 1) {
      const angle = state.time * .8 + index / 8 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(point.x + Math.cos(angle) * radius * .2, point.y + Math.sin(angle) * radius * .2);
      ctx.lineTo(point.x + Math.cos(angle) * radius, point.y + Math.sin(angle) * radius);
      ctx.stroke();
    }
    return;
  }

  if (style === "runes") {
    ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(state.time * .6);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * .7;
    for (let index = 0; index < 6; index += 1) {
      const angle = index / 6 * Math.PI * 2;
      ctx.save();
      ctx.translate(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.rotate(angle + Math.PI / 4);
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  if (style === "orbit") {
    for (let index = 0; index < 4; index += 1) {
      const start = state.time * 1.4 + index * Math.PI / 2;
      ctx.beginPath(); ctx.arc(point.x, point.y, radius, start, start + .82); ctx.stroke();
    }
    return;
  }

  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSlashEffect(effect, point, alpha) {
  const progress = 1 - alpha;
  const style = effect.style || "cleave";
  if (style === "daggers") {
    ctx.strokeStyle = effect.color;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 18;
    ctx.shadowColor = effect.color;
    ctx.lineCap = "round";
    for (let layer = 0; layer < 2; layer += 1) {
      ctx.lineWidth = Math.max(1, (5 - layer * 2) * alpha);
      ctx.beginPath();
      ctx.arc(point.x, point.y, effect.radius * (.68 + layer * .16 + progress * .1), effect.angle - effect.arc / 2, effect.angle + effect.arc / 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = Math.max(1, 1.4 * alpha);
    ctx.beginPath();
    ctx.arc(point.x, point.y, effect.radius * (.9 + progress * .08), effect.angle - effect.arc * .3, effect.angle + effect.arc * .3);
    ctx.stroke();
    return;
  }

  if (style === "crescent") {
    ctx.strokeStyle = "rgba(255,255,255,.92)";
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 24;
    ctx.shadowColor = effect.color;
    ctx.lineWidth = Math.max(1, 3.5 * alpha);
    ctx.beginPath();
    ctx.arc(point.x, point.y, effect.radius * (.78 + progress * .1), effect.angle - effect.arc / 2, effect.angle + effect.arc / 2);
    ctx.stroke();
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = Math.max(1, 9 * alpha);
    ctx.globalAlpha = alpha * .34;
    ctx.stroke();
    return;
  }

  if (effect.heavy) {
    const inner = effect.radius * (.24 + progress * .08);
    const outer = effect.radius * (.95 + progress * .08);
    const gradient = ctx.createRadialGradient(point.x, point.y, inner, point.x, point.y, outer);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(.48, `${effect.color}18`);
    gradient.addColorStop(1, `${effect.color}66`);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = alpha * .9;
    ctx.beginPath();
    ctx.moveTo(point.x + Math.cos(effect.angle - effect.arc / 2) * inner, point.y + Math.sin(effect.angle - effect.arc / 2) * inner);
    ctx.arc(point.x, point.y, outer, effect.angle - effect.arc / 2, effect.angle + effect.arc / 2);
    ctx.lineTo(point.x + Math.cos(effect.angle + effect.arc / 2) * inner, point.y + Math.sin(effect.angle + effect.arc / 2) * inner);
    ctx.arc(point.x, point.y, inner, effect.angle + effect.arc / 2, effect.angle - effect.arc / 2, true);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = effect.color;
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = effect.heavy ? 30 : 18;
  ctx.shadowColor = effect.color;
  ctx.lineCap = "round";
  const layers = effect.heavy ? 5 : 3;
  for (let layer = 0; layer < layers; layer += 1) {
    ctx.lineWidth = Math.max(1, ((effect.heavy ? 10 : 5) - layer * 1.5) * alpha);
    ctx.beginPath();
    ctx.arc(point.x, point.y, effect.radius * ((effect.heavy ? .52 : .62) + layer * (effect.heavy ? .1 : .12) + progress * .08), effect.angle - effect.arc / 2, effect.angle + effect.arc / 2);
    ctx.stroke();
  }
  if (effect.heavy) {
    ctx.strokeStyle = "rgba(255,255,255,.92)";
    ctx.lineWidth = Math.max(1, 3 * alpha);
    ctx.beginPath();
    ctx.arc(point.x, point.y, effect.radius * (1 + progress * .08), effect.angle - effect.arc / 2, effect.angle + effect.arc / 2);
    ctx.stroke();
  }
}

function drawEffects() {
  for (const effect of effects) {
    const alpha = Math.max(0, effect.life / effect.maxLife);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (effect.type === "beam") {
      const start = worldToScreen(effect.x1, effect.y1);
      const end = worldToScreen(effect.x2, effect.y2);
      drawBeamEffect(effect, start, end, alpha);
    } else if (effect.type === "ring") {
      const point = worldToScreen(effect.x, effect.y);
      drawRingEffect(effect, point, alpha);
    } else if (effect.type === "slash") {
      const point = worldToScreen(effect.x, effect.y);
      drawSlashEffect(effect, point, alpha);
    } else if (effect.type === "status") {
      const point = worldToScreen(effect.x, effect.y);
      ctx.globalAlpha = alpha * .85;
      ctx.strokeStyle = effect.color; ctx.fillStyle = `${effect.color}22`; ctx.shadowColor = effect.color; ctx.shadowBlur = 22; ctx.lineWidth = Math.max(1, 4 * alpha);
      ctx.beginPath(); ctx.arc(point.x, point.y, effect.radius * (1.05 - alpha * .18), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (effect.status === "void") {
        ctx.fillStyle = "rgba(2,1,8,.72)"; ctx.beginPath(); ctx.arc(point.x, point.y, effect.radius * .22, 0, Math.PI * 2); ctx.fill();
      }
    } else if (effect.type === "screen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = alpha * .14;
      ctx.fillStyle = effect.color;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }
}

function drawParticles() {
  for (const particle of particles) {
    const point = worldToScreen(particle.x, particle.y);
    const alpha = Math.max(0, particle.life / particle.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    if (particle.type === "text") {
      ctx.font = `${particle.size}px ui-monospace, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.shadowBlur = 7;
      ctx.shadowColor = particle.color;
      ctx.fillText(particle.text, point.x, point.y);
    } else {
      ctx.translate(point.x, point.y);
      ctx.rotate(Math.atan2(particle.vy, particle.vx));
      ctx.fillRect(0, -particle.size / 2, particle.size * 3, particle.size);
    }
    ctx.restore();
  }
}

function drawPlayer() {
  const x = width / 2;
  const y = height / 2;
  const flicker = player.invulnerable > 0 && Math.floor(player.invulnerable * 18) % 2 === 0;
  const archetype = selectedArchetype || defaultArchetype();
  const primary = archetype.primary_color || "#ff365f";
  const accent = archetype.accent_color || "#58e6ff";
  const facing = Math.atan2(player.moveY, player.moveX) + Math.PI / 2;
  const moving = Math.hypot(...Object.values(getMovement())) > .05;
  const stride = moving ? Math.sin(state.time * 12) * 3 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = flicker ? .35 : 1;
  const pulse = 1 + Math.sin(state.time * 4) * .04;
  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.beginPath(); ctx.ellipse(0, 12, 19, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `${accent}55`;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, 27 * pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.rotate(facing);
  ctx.shadowBlur = 16;
  ctx.shadowColor = primary;

  ctx.fillStyle = "#172131";
  ctx.fillRect(-13, -5, 26, 14);
  ctx.strokeStyle = `${accent}88`; ctx.strokeRect(-13, -5, 26, 14);
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#29364a";
    ctx.beginPath(); ctx.ellipse(side * 14, 4, 5, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = accent; ctx.globalAlpha = .45 + (moving ? .35 : 0);
    ctx.beginPath(); ctx.moveTo(side * 16, 10); ctx.lineTo(side * 19, 20 + Math.sin(state.time * 18 + side) * 3); ctx.lineTo(side * 11, 11); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = "#25252d";
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-5, 5); ctx.lineTo(-7 + stride, 17); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(7 - stride, 17); ctx.stroke();

  if (archetype.role === "assassin" || archetype.role === "hunter" || archetype.role === "mage") {
    ctx.fillStyle = `${primary}90`;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(-15, 19 + stride); ctx.lineTo(0, 13); ctx.lineTo(15, 19 - stride); ctx.closePath(); ctx.fill();
  }

  const suitGradient = ctx.createLinearGradient(-12, -12, 12, 14);
  suitGradient.addColorStop(0, primary); suitGradient.addColorStop(.58, "#29364b"); suitGradient.addColorStop(1, "#111827");
  ctx.fillStyle = suitGradient;
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(14, -7, 11, 9); ctx.lineTo(5, 14); ctx.lineTo(-7, 13); ctx.lineTo(-11, 7); ctx.quadraticCurveTo(-12, -8, 0, -12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 1; ctx.stroke();

  if (archetype.role === "warrior") {
    ctx.fillStyle = accent;
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(side * 12, -4, 6, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = "#2a2930"; ctx.fillRect(-8, 4, 16, 6);
  } else if (archetype.role === "sniper") {
    ctx.fillStyle = "#25262d"; ctx.fillRect(-10, 0, 20, 10);
    ctx.fillStyle = accent; ctx.fillRect(-7, 3, 14, 2);
  } else if (archetype.role === "mage") {
    ctx.strokeStyle = accent; ctx.globalAlpha = .7; ctx.beginPath(); ctx.ellipse(0, -14, 16 + Math.sin(state.time * 3), 6, state.time * .7, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  } else if (archetype.role === "hunter") {
    ctx.strokeStyle = accent; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i += 1) { ctx.beginPath(); ctx.moveTo(8 + i, 3); ctx.lineTo(13 + i, 15); ctx.stroke(); }
  }

  ctx.strokeStyle = primary; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-14, 5 + stride * .3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(14, 5 - stride * .3); ctx.stroke();

  ctx.fillStyle = "#101827";
  ctx.beginPath(); ctx.arc(0, -14, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `${accent}bb`; ctx.lineWidth = 1.2; ctx.stroke();
  const visor = ctx.createLinearGradient(-7, -19, 7, -9);
  visor.addColorStop(0, "#d9fbff"); visor.addColorStop(.28, accent); visor.addColorStop(1, "#163249");
  ctx.fillStyle = visor; ctx.beginPath(); ctx.ellipse(0, -14, 7.5, 5.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.78)"; ctx.beginPath(); ctx.ellipse(-2.7, -16.2, 2.2, 1.1, -.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = primary; ctx.lineWidth = 2;
  if (archetype.role === "warrior") {
    ctx.beginPath(); ctx.moveTo(-8, -17); ctx.lineTo(-13, -21); ctx.lineTo(-9, -11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -17); ctx.lineTo(13, -21); ctx.lineTo(9, -11); ctx.stroke();
  } else if (archetype.role === "assassin") {
    ctx.fillStyle = primary; ctx.beginPath(); ctx.moveTo(-7, -20); ctx.lineTo(-3, -29); ctx.lineTo(0, -21); ctx.fill(); ctx.beginPath(); ctx.moveTo(7, -20); ctx.lineTo(3, -29); ctx.lineTo(0, -21); ctx.fill();
  } else if (archetype.role === "hunter") {
    ctx.beginPath(); ctx.moveTo(4, -22); ctx.lineTo(9, -28); ctx.stroke(); ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(9, -28, 2, 0, Math.PI * 2); ctx.fill();
  } else if (archetype.role === "sniper") {
    ctx.strokeStyle = accent; ctx.beginPath(); ctx.arc(4, -14, 4.2, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, -14); ctx.lineTo(14, -14); ctx.stroke();
  }

  drawSingularityCore(ctx, 0, 1, 4.5, accent, state.time * 2.2, .5);
  ctx.shadowBlur = 0;
  ctx.restore();

  drawEquippedWeapons();

  if (touch.active) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(touch.startX, touch.startY, 42, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,54,95,.45)";
    ctx.beginPath(); ctx.arc(touch.x, touch.y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function drawBossCompass() {
  if (!currentBoss || currentBoss.dead) return;
  const point = worldToScreen(currentBoss.x, currentBoss.y);
  const margin = 46;
  const onScreen = point.x >= margin && point.x <= width - margin && point.y >= margin && point.y <= height - margin;
  const dx = currentBoss.x - player.x;
  const dy = currentBoss.y - player.y;
  const angle = Math.atan2(dy, dx);
  const pulse = 1 + Math.sin(state.time * 6) * .12;
  if (onScreen) {
    ctx.save();
    ctx.strokeStyle = currentBoss.color; ctx.globalAlpha = .72; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(point.x, point.y, (currentBoss.radius + 13) * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
    return;
  }
  const radiusX = Math.max(20, width / 2 - margin);
  const radiusY = Math.max(20, height / 2 - margin);
  const scale = Math.min(radiusX / Math.max(1, Math.abs(dx)), radiusY / Math.max(1, Math.abs(dy)));
  const x = width / 2 + dx * scale;
  const y = height / 2 + dy * scale;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.shadowBlur = 18; ctx.shadowColor = currentBoss.color;
  ctx.fillStyle = currentBoss.color; ctx.beginPath(); ctx.moveTo(14 * pulse, 0); ctx.lineTo(-9, -8); ctx.lineTo(-5, 0); ctx.lineTo(-9, 8); ctx.closePath(); ctx.fill();
  ctx.rotate(-angle); ctx.textAlign = "center"; ctx.font = "bold 9px ui-monospace, Consolas, monospace"; ctx.fillStyle = "#fff";
  ctx.fillText(`BOSS · ${Math.round(Math.hypot(dx, dy) / 10)}m`, 0, -15); ctx.restore();
}

function render() {
  ctx.save();
  if (state.shake > 0) ctx.translate((Math.random() - .5) * state.shake, (Math.random() - .5) * state.shake);
  drawGrid();
  drawGems();
  drawPickups();
  drawEnemies();
  drawProjectiles();
  drawEnemyProjectiles();
  drawOrbitals();
  drawEffects();
  drawParticles();
  drawPlayer();
  drawBossCompass();

  if (state.running) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.font = "8px ui-monospace, Consolas, monospace";
    ctx.fillText(`X ${Math.round(player.x)}  Y ${Math.round(player.y)}`, 17, height - 18);
    ctx.restore();
  }
  ctx.restore();
}

function loop(now) {
  const dt = Math.min(0.033, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  if (state.running && !state.paused) update(dt);
  else updateParticles(dt);
  render();
  requestAnimationFrame(loop);
}

function pauseGame() {
  if (!state.running || state.rewardOpen || !ui.gameOver.hidden) return;
  state.paused = !state.paused;
  ui.pauseCard.hidden = !state.paused;
  if (!state.paused) canvas.focus();
}

function finishRun(victory) {
  if (!state.running) return;
  if (!victory && bonuses.deathRefusal && !state.deathRefusalUsed) {
    state.deathRefusalUsed = true;
    player.hp = 1;
    player.invulnerable = 2.2;
    for (const enemy of enemies) {
      if (enemy.dead || enemy.boss) continue;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance <= 210) { enemy.x += dx / distance * 85; enemy.y += dy / distance * 85; }
    }
    effects.push({ type: "ring", x: player.x, y: player.y, radius: 210, color: "#f1f0eb", life: .65, maxLife: .65 });
    announce("DEATH REFUSED", "不灭躯壳拒绝了本次致命伤");
    addLog("遗物「最后一口气」已经熄灭，你从致命伤里爬了回来。", true);
    return;
  }
  state.running = false;
  state.paused = true;
  state.victory = victory;
  if (!victory) player.hp = 0;
  state.rewardQueue = [];
  state.rewardOpen = false;
  ui.forge.hidden = true;
  ui.upgrade.hidden = true;
  const difficulty = difficultyModes[state.difficulty] || difficultyModes.normal;
  const score = Math.round((state.kills * 10 + state.level * 80 + state.bossesDefeated * 500 + state.time * 2) * difficulty.reward);
  const echoes = Math.max(1, Math.floor(score / 135));
  const newRecord = state.kills > profile.bestKills || state.time > profile.bestTime || (victory && !profile.victories);
  profile.runs += 1;
  profile.victories += victory ? 1 : 0;
  profile.bestTime = Math.max(profile.bestTime, Math.floor(state.time));
  profile.bestKills = Math.max(profile.bestKills, state.kills);
  profile.totalKills += state.kills;
  profile.echoes += echoes;
  saveProfile();
  updateProfileUI();
  ui.gameOverTitle.textContent = victory ? "憎恨已被改写" : "意识已离线";
  ui.gameOverSummary.textContent = victory ? "三阶段远征完成。你的妄想成功覆盖了原始法则。" : "远征失败，但你见过的武器与星兽都被记了下来。";
  ui.finalTime.textContent = formatTime(state.time);
  ui.finalKills.textContent = String(state.kills);
  ui.finalLevel.textContent = String(state.level);
  ui.finalScore.textContent = score.toLocaleString("zh-CN");
  ui.finalEchoes.textContent = `+${echoes}`;
  ui.newRecord.hidden = !newRecord;
  ui.gameOver.hidden = false;
  ui.gameOver.classList.toggle("victory", victory);
  if (victory) audio.victory(); else audio.hurt();
  updateHUD();
}

function queueReward(type, tier = null) {
  state.rewardQueue.push({ type, tier });
  if (!state.rewardOpen && state.running) openNextReward();
}

function openNextReward() {
  if (state.rewardOpen || !state.running || state.rewardQueue.length === 0) return;
  const reward = state.rewardQueue.shift();
  const type = reward.type;
  state.rewardOpen = true;
  state.paused = true;
  state.rewardType = type;
  audio.level();
  if (type === "forge") openForge(reward.tier || state.stageIndex + 1);
  else if (type === "mutation") openMutation(reward.tier || state.mutationRound || 1);
  else openUpgrade(type);
}

function closeReward() {
  state.forging = false;
  state.rewardOpen = false;
  ui.forge.hidden = true;
  ui.upgrade.hidden = true;
  if (state.rewardQueue.length > 0) {
    setTimeout(openNextReward, 80);
  } else {
    state.paused = false;
    canvas.focus();
  }
}

function forgeSuggestions(tier) {
  const role = selectedArchetype?.role || "sniper";
  if (tier === 1) return [
    ["职业推荐", roleRecommendedWishes[role]],
    ["清群弹幕", "一件能同时清理大群弱小星兽的多重投射武器"],
    ["近身防线", "一组环绕自身并持续切割靠近敌人的防御武器"],
  ];
  if (tier === 2) return [
    ["冰火协同", "一件会冻结敌人并引发燃烧爆炸的中程武器"],
    ["贯穿爆破", "能够贯穿敌群并在最后一个目标处爆炸的重型武器"],
    ["追踪卫星", "三台高速环绕、自动追踪漏网敌人的战斗卫星"],
  ];
  return [
    ["终局重炮", "发射微型恒星的终局重炮，极慢射速换取巨额范围伤害"],
    ["奇点领域", "周期制造引力奇点，把全屏敌人拉向中心并持续瓦解"],
    ["灭绝光束", "一道超远距离的憎恨净化光束，贯穿并处决整条路径"],
  ];
}

function openForge(tier = state.stageIndex + 1) {
  const forge = forgeTiers[Math.max(0, Math.min(2, tier - 1))];
  state.paused = true;
  state.forging = true;
  state.rewardOpen = true;
  state.activeForgeTier = forge.tier;
  state.forgeOpened[forge.tier - 1] = true;
  previewWeapon = null;
  ui.forge.hidden = false;
  ui.forgeLevel.textContent = `0${forge.tier}`;
  ui.forgeTitle.textContent = `阶段 ${forge.roman} · ${forge.label}`;
  ui.budget.textContent = String(forge.budget);
  ui.wishForm.hidden = false;
  ui.quickWishes.hidden = false;
  ui.forgeLoading.hidden = true;
  ui.weaponResult.hidden = true;
  ui.forgeError.hidden = true;
  ui.forgeButton.disabled = false;
  ui.wishInput.value = "";
  ui.charCount.textContent = "0";
  const suggestionButtons = [...ui.quickWishes.querySelectorAll("button[data-wish]")];
  forgeSuggestions(forge.tier).forEach(([label, wish], index) => {
    if (!suggestionButtons[index]) return;
    suggestionButtons[index].textContent = label;
    suggestionButtons[index].dataset.wish = wish;
  });
  setTimeout(() => ui.wishInput.focus(), 60);
  addLog(`阶段 ${forge.roman} 武器重构开放：${forge.hint}。`, true);
}

function closeForge() {
  closeReward();
}

const coreUpgradeTags = {
  damage: ["ballistic"], cooldown: ["storm"], range: ["precision"], vitality: ["survival"],
  movement: ["mobility"], magnet: ["economy"], armor: ["survival"], critical: ["precision"],
  projectiles: ["ballistic"], pierce: ["ballistic"], area: ["gravity"], regen: ["survival"],
  ignite: ["blaze"], frost: ["cryo"], venom: ["toxin"], chain: ["storm"],
  shatter: ["cryo"], explosion: ["gravity"], gravity: ["gravity"], execute: ["toxin"],
};

const corePatronMap = {
  ignite: "blaze", frost: "cryo", venom: "toxin", chain: "storm",
  shatter: "cryo", explosion: "gravity", gravity: "gravity", execute: "toxin",
};

function patronIdForUpgrade(upgrade) {
  const baseId = upgrade.baseId || upgrade.id;
  return upgrade.patron || corePatronMap[baseId] || null;
}

function tagsForUpgrade(upgrade) {
  return upgrade.tags || coreUpgradeTags[upgrade.id] || [];
}

function ownedBuildTags() {
  const tags = new Set();
  for (const upgrade of upgrades) {
    if ((upgradeLevels[upgrade.id] || 0) <= 0) continue;
    for (const tag of tagsForUpgrade(upgrade)) tags.add(tag);
  }
  for (const weapon of weapons) {
    for (const tag of weapon.tags || []) tags.add(String(tag));
    for (const mutation of weapon.mutations || []) tags.add(mutation.mechanic);
  }
  return [...tags];
}

function weightedUpgrade(pool, ownedTags, artifact = false) {
  if (!pool.length) return null;
  const weights = pool.map((upgrade) => {
    const rarityWeight = { common: 100, rare: 55, epic: 24, legendary: 7 }[upgrade.rarity] || 50;
    let weight = upgrade.weight || rarityWeight;
    if (tagsForUpgrade(upgrade).some((tag) => ownedTags.has(tag))) weight *= 1.75;
    if (artifact) weight *= upgrade.rarity === "legendary" ? 5 : upgrade.rarity === "epic" ? 2.5 : upgrade.rarity === "rare" ? 1.25 : .12;
    return Math.max(.1, weight);
  });
  let roll = Math.random() * weights.reduce((sum, weight) => sum + weight, 0);
  for (let index = 0; index < pool.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return pool[index];
  }
  return pool.at(-1);
}

function patronAllowed(upgrade) {
  const patronId = patronIdForUpgrade(upgrade);
  return !patronId || state.activePatrons.has(patronId) || state.activePatrons.size < PATRON_LIMIT;
}

function makePomChoice(upgrade) {
  const patronId = patronIdForUpgrade(upgrade);
  const source = patronId ? patronDefinitions[patronId]?.name : "无名遗物";
  return {
    ...upgrade,
    id: `pom__${upgrade.id}`,
    baseId: upgrade.id,
    title: `神髓：${upgrade.title}`,
    family: `神髓强化 · ${source}`,
    description: `不再塞入一件相同物品，而是强化已有的「${upgrade.title}」。${upgrade.description}`,
    isPom: true,
    weight: 100,
  };
}

function availableUpgrades(artifact = false) {
  let pool = upgrades.filter((upgrade) => (upgradeLevels[upgrade.id] || 0) === 0
    && (!upgrade.requires || upgrade.requires()) && patronAllowed(upgrade));
  if (artifact) {
    const bossPool = pool.filter((upgrade) => ["epic", "legendary"].includes(upgrade.rarity)
      || upgrade.offerType === "duo" || upgrade.tier === 6);
    if (bossPool.length >= 3) pool = bossPool;
  }
  const ownedTags = new Set(ownedBuildTags());
  const choices = [];
  const pomCandidates = upgrades.filter((upgrade) => {
    const level = upgradeLevels[upgrade.id] || 0;
    return level > 0 && level < upgrade.max && patronAllowed(upgrade);
  });
  const pomDue = !artifact && pomCandidates.length > 0 && state.upgradePicks > 0 && state.upgradePicks % 4 === 3;
  if (pomDue) {
    const base = weightedUpgrade(pomCandidates, ownedTags, false);
    if (base) choices.push(makePomChoice(base));
  }
  const affinityPool = pool.filter((upgrade) => tagsForUpgrade(upgrade).some((tag) => ownedTags.has(tag)));
  if (affinityPool.length && ownedTags.size) {
    const affinity = weightedUpgrade(affinityPool, ownedTags, artifact);
    if (affinity) choices.push(affinity);
  }
  while (choices.length < 3 && pool.length) {
    pool = pool.filter((upgrade) => !choices.includes(upgrade));
    const next = weightedUpgrade(pool, ownedTags, artifact);
    if (!next) break;
    choices.push(next);
  }
  return choices;
}

function openUpgrade(type = "upgrade") {
  state.paused = true;
  state.rewardOpen = true;
  state.forging = false;
  ui.upgrade.hidden = false;
  ui.upgradeTitle.textContent = type === "artifact" ? "从尸体里拿走一样东西" : "选择一件遗物或一份赐福";
  ui.upgradeSubtitle.textContent = type === "artifact"
    ? "Boss 遗物池更危险，也更容易出现史诗、传奇与已经满足前置的双神祝福。"
    : `牌库 ${upgrades.length} 件 · 本局赐福者 ${state.activePatrons.size}/${PATRON_LIMIT} · 每第 3 次升级进入武器异梦`;
  currentUpgradeChoices = availableUpgrades(type === "artifact");
  renderUpgradeChoices();
  addLog(type === "artifact" ? "Boss 的残骸里还留着能用的东西。" : `等级提升至 ${state.level}，新的东西找上了你。`, true);
}

const mutationMechanicMeta = {
  split: ["虫卵弹", "✣"], return: ["归巢骨钩", "↩"], ricochet: ["猎犬子弹", "⌁"],
  chain: ["雷鳗脊骨", "ϟ"], nova: ["死星花", "✺"], echo: ["昨天的枪声", "◫"],
  fork: ["三棱镜", "⋔"], crescent: ["飞出去的月牙", "☾"], aftershock: ["第二次心跳", "◎"],
  orbit_salvo: ["发怒的卫星", "✥"],
  seeking: ["闻血飞刃", "◈"], poison_cloud: ["绿肺孢子", "☣"], burning_ground: ["余烬脚印", "♨"],
  frost_shatter: ["碎冰牙床", "❄"], gravity_well: ["沉星胃袋", "◉"], barrage: ["三拍心脏", "≋"],
  spiral_dance: ["螺旋鳍", "@"], starfall: ["倒悬流星", "↓"], phantom_double: ["背面幽灵", "◫"],
  blood_drain: ["吸血水蛭", "♥"], execution_mark: ["断头刻痕", "◐"], tether: ["脐带电索", "⌁"],
  minefield: ["寄生雷卵", "※"], time_freeze: ["停摆眼球", "◷"], swarm: ["幼虫蜂群", "✣"],
  wall: ["横生骨墙", "═"], drill: ["穿骨钻头", "⇥"], black_hole: ["无底瞳孔", "●"],
};

function renderMutationLoading() {
  ui.upgradeOptions.replaceChildren();
  for (let index = 0; index < 3; index += 1) {
    const card = document.createElement("article");
    card.className = "upgrade-card mutation-loading-card";
    card.style.setProperty("--rarity-color", ["#58e6ff", "#a78bfa", "#ffd166"][index]);
    const icon = document.createElement("span");
    icon.className = "upgrade-icon";
    icon.textContent = "梦";
    const label = document.createElement("span");
    label.className = "upgrade-rarity";
    label.textContent = "WEAPON DREAM / 武器异梦";
    const title = document.createElement("h3");
    title.textContent = ["武器开始做梦…", "旧伤口正在说话…", "某种形状正在孵化…"][index];
    const description = document.createElement("p");
    description.textContent = currentMutationWish
      ? `正在回应「${currentMutationWish.slice(0, 28)}」。`
      : "异梦会改变攻击方式，但不会凭空多出一件武器。";
    card.append(icon, label, title, description);
    ui.upgradeOptions.append(card);
  }
}

function mutationWishSuggestions() {
  const suggestions = [];
  if (weapons.some((weapon) => weapon.delivery === "melee")) {
    suggestions.push(["剑气外放", "让近战挥砍甩出能飞行的月牙刃光"]);
  }
  if (weapons.some((weapon) => weapon.delivery === "beam")) {
    suggestions.push(["棱镜折射", "让光束被旧棱镜分成三道不同角度"]);
  }
  if (weapons.some((weapon) => weapon.delivery === "aura")) {
    suggestions.push(["余波心跳", "让领域脉冲结束后在原地再跳一次"]);
  }
  if (weapons.some((weapon) => weapon.delivery === "orbit")) {
    suggestions.push(["卫星齐射", "让环绕武器周期性向外喷出星屑"]);
  }
  suggestions.push(
    ["连锁闪电", "让命中的伤口向附近敌人钻出电弧"],
    ["弹体分裂", "让主弹命中后孵出两枚侧向子弹"],
    ["死亡开花", "让被击杀的目标向四周喷出星屑"],
  );
  return suggestions.slice(0, 3);
}

function renderMutationWishForm(round = state.mutationRound || 1) {
  currentMutationChoices = [];
  ui.upgradeOptions.replaceChildren();
  ui.upgradeTitle.textContent = `武器异梦 · 第 ${round} 夜`;
  ui.upgradeSubtitle.textContent = "写下你希望本轮武器特效如何进化，异梦会把它编译成三种攻击形态。";
  ui.upgradeRerolls.textContent = "输入愿望后生成异变";
  ui.reroll.disabled = true;

  const panel = document.createElement("article");
  panel.className = "mutation-wish-panel";
  panel.style.setProperty("--rarity-color", "#58e6ff");

  const heading = document.createElement("div");
  heading.className = "mutation-wish-heading";
  const label = document.createElement("span");
  label.textContent = "WEAPON DREAM / 玩家输入";
  const title = document.createElement("h3");
  title.textContent = "把这次异梦说清楚";
  heading.append(label, title);

  const weaponRow = document.createElement("div");
  weaponRow.className = "mutation-loadout-row";
  for (const weapon of weapons) {
    const chip = document.createElement("span");
    const visual = visualMeta[inferVisualForm(weapon)] || visualMeta.rifle;
    chip.textContent = `${visual.label} · ${weapon.name}`;
    weaponRow.append(chip);
  }

  const quickRow = document.createElement("div");
  quickRow.className = "mutation-wish-quick";
  for (const [labelText, wish] of mutationWishSuggestions()) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mutationWish = wish;
    button.textContent = labelText;
    quickRow.append(button);
  }

  const form = document.createElement("form");
  form.className = "mutation-wish-form";
  form.dataset.mutationWishForm = "true";
  const frame = document.createElement("div");
  frame.className = "input-frame";
  const textarea = document.createElement("textarea");
  textarea.maxLength = 180;
  textarea.rows = 3;
  textarea.required = true;
  textarea.dataset.mutationWishInput = "true";
  textarea.placeholder = "例如：让巨剑挥出能飞回来的红色月牙，命中后再爆出星屑";
  const count = document.createElement("span");
  count.className = "char-count";
  const countValue = document.createElement("b");
  countValue.dataset.mutationWishCount = "true";
  countValue.textContent = "0";
  count.append(countValue, "/180");
  frame.append(textarea, count);
  const actions = document.createElement("div");
  actions.className = "mutation-wish-actions";
  const submit = document.createElement("button");
  submit.className = "primary-button";
  submit.type = "submit";
  submit.textContent = "让异梦成形";
  actions.append(submit);
  form.append(frame, actions);

  panel.append(heading, weaponRow, quickRow, form);
  ui.upgradeOptions.append(panel);
  setTimeout(() => textarea.focus(), 60);
}

function openMutation(round = 1) {
  state.paused = true;
  state.rewardOpen = true;
  state.forging = false;
  state.rewardType = "mutation";
  state.mutationRound = Math.max(state.mutationRound, round);
  ui.upgrade.hidden = false;
  ui.upgradeTitle.textContent = `武器异梦 · 第 ${round} 夜`;
  ui.upgradeSubtitle.textContent = "写下你希望本轮武器特效如何进化。";
  currentMutationChoices = [];
  currentMutationWish = "";
  renderMutationWishForm(round);
  addLog(`第 ${round} 夜，武器把本局拾到的东西带进了梦里。`, true);
}

async function generateMutations(wish = currentMutationWish) {
  currentMutationWish = String(wish || "").trim().slice(0, 180);
  if (!currentMutationWish) {
    renderMutationWishForm(state.mutationRound);
    return;
  }
  currentMutationChoices = [];
  renderMutationLoading();
  ui.reroll.disabled = true;
  ui.upgradeSubtitle.textContent = `愿望「${currentMutationWish}」正在改变现有武器。`;
  try {
    const response = await fetch("/api/generate-mutations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        wish: currentMutationWish,
        mutationRound: state.mutationRound,
        archetype: { role: selectedArchetype?.role, trait: selectedArchetype?.trait, level: state.level },
        buildTags: ownedBuildTags(),
        weapons: weapons.map((weapon) => ({
          name: weapon.name, delivery: weapon.delivery, visual_form: weapon.visual_form,
          tags: weapon.tags, mutations: weapon.mutations || [],
        })),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `服务器返回 ${response.status}`);
    currentMutationChoices = Array.isArray(data.choices) ? data.choices.slice(0, 3) : [];
    if (currentMutationChoices.length !== 3) throw new Error("异梦没有形成完整的三种结果");
    renderMutationChoices();
    if (data.source !== "openai") addLog("梦境有些模糊，本次武器异梦已由本地规则接管。", true);
  } catch (error) {
    ui.upgradeOptions.replaceChildren();
    const card = document.createElement("article");
    card.className = "upgrade-card mutation-error-card";
    card.style.setProperty("--rarity-color", "#ff365f");
    const title = document.createElement("h3");
    title.textContent = "武器异梦暂时中断";
    const description = document.createElement("p");
    description.textContent = error instanceof Error ? error.message : "未知错误";
    card.append(title, description);
    ui.upgradeOptions.append(card);
  } finally {
    ui.reroll.disabled = state.rerolls <= 0 || currentMutationChoices.length === 0;
    ui.upgradeRerolls.textContent = `刷新次数 ${state.rerolls}`;
  }
}

function renderMutationChoices() {
  ui.upgradeOptions.replaceChildren();
  ui.upgradeSubtitle.textContent = `愿望「${currentMutationWish}」形成了三种攻击形态，选择一个醒来后仍会存在的结果。`;
  currentMutationChoices.forEach((choice, index) => {
    const [mechanicLabel, glyph] = mutationMechanicMeta[choice.mechanic] || [choice.mechanic, "AI"];
    const card = document.createElement("button");
    card.type = "button";
    card.className = "upgrade-card mutation-card";
    card.dataset.mutationIndex = String(index);
    card.style.setProperty("--rarity-color", choice.accent_color);
    const number = document.createElement("span");
    number.className = "upgrade-number";
    number.textContent = `0${index + 1}`;
    const icon = document.createElement("span");
    icon.className = "upgrade-icon";
    icon.textContent = glyph;
    const rarity = document.createElement("span");
    rarity.className = "upgrade-rarity";
    rarity.textContent = "WEAPON DREAM / 形态异变";
    const family = document.createElement("span");
    family.className = "upgrade-family";
    family.textContent = `改造 ${choice.target_name} · ${mechanicLabel}`;
    const title = document.createElement("h3");
    title.textContent = choice.title;
    const description = document.createElement("p");
    description.textContent = `${choice.description} 代价：${choice.tradeoff_text}`;
    const evolved = document.createElement("strong");
    evolved.className = "mutation-evolved-name";
    evolved.textContent = `进化后：${choice.evolution_name}`;
    card.append(number, icon, rarity, family, title, description, evolved);
    ui.upgradeOptions.append(card);
  });
  ui.upgradeRerolls.textContent = `刷新次数 ${state.rerolls}`;
  ui.reroll.disabled = state.rerolls <= 0;
}

function applyAdaptiveEvolution() {
  if (!bonuses.adaptiveEvolution) return;
  const ownedFamilies = upgradeFamilyBlueprints.filter((family) => familyProgress(family.id) > 0);
  if (!ownedFamilies.length) return;
  const family = ownedFamilies[Math.floor(Math.random() * ownedFamilies.length)];
  const effects = {
    ballistic: () => { bonuses.pierce += 1; }, blaze: () => { bonuses.burn += 2; },
    cryo: () => { bonuses.shatter += .06; }, toxin: () => { bonuses.poison += 2; bonuses.venomAmp += .05; },
    storm: () => { bonuses.chainChance += .08; }, gravity: () => { bonuses.explosion += 8; },
    precision: () => { bonuses.crit += .04; }, survival: () => { bonuses.armor += .03; },
    mobility: () => { bonuses.moveSpeed *= 1.04; }, economy: () => { bonuses.xp *= 1.04; },
  };
  effects[family.id]?.();
  addLog(`「吃不完的苹果」又长出一口味道：${family.label}。`, true);
}

function selectMutation(index) {
  const choice = currentMutationChoices[index];
  const weapon = weapons[choice?.target_index];
  if (!choice || !weapon) return;
  weapon.mutations ||= [];
  weapon.mutations.push({
    mechanic: choice.mechanic, title: choice.title, color: choice.accent_color,
    round: choice.mutation_round || state.mutationRound,
  });
  if (choice.tradeoff === "damage_down") weapon.mutationDamageScale *= .88;
  else if (choice.tradeoff === "cooldown_up") weapon.mutationCooldownScale *= 1.10;
  else if (choice.tradeoff === "range_down") weapon.mutationRangeScale *= .90;
  weapon.name = choice.evolution_name;
  weapon.description = choice.description;
  weapon.color = choice.accent_color;
  weapon.tags = [...new Set([...(weapon.tags || []), ...(choice.tags || [])])].slice(-4);
  state.mutationCount += 1;
  applyAdaptiveEvolution();
  checkTransformations();
  invalidateSynergies();
  addLog(`「${choice.target_name}」从异梦中醒来，变成了「${weapon.name}」：${choice.title}。`, true);
  announce("WEAPON DREAM", `${weapon.name} · ${choice.title}`);
  burst(player.x, player.y, choice.accent_color, 34, 210);
  state.shake = Math.max(state.shake, 9);
  updateLoadoutUI();
  updateSynergyUI();
  currentMutationWish = "";
  closeReward();
}

function renderUpgradeChoices() {
  ui.upgradeOptions.replaceChildren();
  currentUpgradeChoices.forEach((upgrade, index) => {
    const rarity = rarityMeta[upgrade.rarity];
    const patronId = patronIdForUpgrade(upgrade);
    const patron = patronDefinitions[patronId];
    const levelId = upgrade.baseId || upgrade.id;
    const level = upgradeLevels[levelId] || 0;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "upgrade-card";
    card.dataset.upgradeId = upgrade.id;
    card.style.setProperty("--rarity-color", rarity.color);
    if (patron) card.style.setProperty("--source-color", patron.color);
    const number = document.createElement("span");
    number.className = "upgrade-number";
    number.textContent = `0${index + 1}`;
    const icon = document.createElement("span");
    icon.className = "upgrade-icon";
    icon.textContent = upgrade.icon;
    const rarityLabel = document.createElement("span");
    rarityLabel.className = "upgrade-rarity";
    rarityLabel.textContent = rarity.label;
    const family = document.createElement("span");
    family.className = "upgrade-family";
    family.textContent = upgrade.family || "通用遗物";
    const voice = document.createElement("span");
    voice.className = "upgrade-voice";
    voice.textContent = patron ? `“${patron.epithet}。”` : "";
    const title = document.createElement("h3");
    title.textContent = upgrade.title;
    const description = document.createElement("p");
    description.textContent = upgrade.description;
    const levels = document.createElement("div");
    levels.className = "upgrade-levels";
    for (let dot = 0; dot < upgrade.max; dot += 1) {
      const marker = document.createElement("i");
      marker.classList.toggle("filled", dot < level);
      levels.append(marker);
    }
    card.append(number, icon, rarityLabel, family);
    if (patron) card.append(voice);
    card.append(title, description, levels);
    ui.upgradeOptions.append(card);
  });
  ui.upgradeRerolls.textContent = `刷新次数 ${state.rerolls}`;
  ui.reroll.disabled = state.rerolls <= 0;
}

function selectUpgrade(id) {
  const upgrade = currentUpgradeChoices.find((item) => item.id === id);
  if (!upgrade) return;
  const levelId = upgrade.baseId || upgrade.id;
  upgrade.apply();
  upgradeLevels[levelId] = (upgradeLevels[levelId] || 0) + 1;
  const patronId = patronIdForUpgrade(upgrade);
  if (patronId) state.activePatrons.add(patronId);
  checkTransformations();
  invalidateSynergies();
  addLog(upgrade.isPom
    ? `神髓渗进「${upgrade.title.replace("神髓：", "")}」，升至 ${upgradeLevels[levelId]} 级。`
    : `获得「${upgrade.title}」。`, true);
  burst(player.x, player.y, rarityMeta[upgrade.rarity].color, 20, 140);
  updateLoadoutUI();
  updateSynergyUI();
  if (state.rewardType === "upgrade") {
    state.upgradePicks += 1;
    if (state.upgradePicks % 3 === 0) {
      state.mutationRound += 1;
      state.rewardQueue.unshift({ type: "mutation", tier: state.mutationRound });
      addLog(`三件东西开始在武器里说梦话。第 ${state.mutationRound} 次武器异梦即将开始。`, true);
    }
  }
  closeReward();
}

function rerollUpgrades() {
  if (state.rerolls <= 0 || ui.upgrade.hidden) return;
  state.rerolls -= 1;
  if (state.rewardType === "mutation") {
    if (!currentMutationChoices.length) {
      state.rerolls += 1;
      return;
    }
    generateMutations(currentMutationWish);
    return;
  }
  currentUpgradeChoices = availableUpgrades(state.rewardType === "artifact");
  renderUpgradeChoices();
  audio.tone(280, .1, "triangle", .025, 220);
}

function showForgeForm() {
  ui.wishForm.hidden = false;
  ui.quickWishes.hidden = false;
  ui.forgeLoading.hidden = true;
  ui.weaponResult.hidden = true;
  ui.forgeError.hidden = true;
  ui.forgeButton.disabled = false;
  ui.wishInput.focus();
}

function setLoading() {
  const messages = ["解析语义结构…", "匹配战斗组件…", "计算强度预算…", "稳定异常参数…"];
  let index = 0;
  ui.loadingStatus.textContent = messages[0];
  clearInterval(loadingTimer);
  loadingTimer = setInterval(() => {
    index = Math.min(messages.length - 1, index + 1);
    ui.loadingStatus.textContent = messages[index];
  }, 1150);
}

async function generateWeapon(wish) {
  ui.wishForm.hidden = true;
  ui.quickWishes.hidden = true;
  ui.forgeLoading.hidden = false;
  ui.weaponResult.hidden = true;
  ui.forgeError.hidden = true;
  setLoading();
  try {
    const response = await fetch("/api/generate-weapon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wish,
        level: state.level,
        forgeTier: state.activeForgeTier,
        archetype: { role: selectedArchetype?.role, trait: selectedArchetype?.trait },
        sessionId,
        loadout: weapons.map(({ name, tags, delivery, visual_form, trajectory, targeting, burn_damage, poison_damage, slow_percent, explosion_radius, pierce }) => ({
          name, tags, delivery, visual_form, trajectory, targeting, burn_damage, poison_damage, slow_percent, explosion_radius, pierce,
        })),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `服务器返回 ${response.status}`);
    previewWeapon = data.weapon;
    showWeaponResult(data.weapon, data.adjustments || []);
    if (data.source === "local-demo") addLog("远方没有回应，本次愿望由本地规则实现。", true);
  } catch (error) {
    ui.forgeLoading.hidden = true;
    ui.forgeError.hidden = false;
    ui.forgeErrorText.textContent = error instanceof Error ? error.message : "未知错误";
  } finally {
    clearInterval(loadingTimer);
  }
}

function addResultStat(label, value) {
  const item = document.createElement("div");
  item.className = "result-stat";
  const name = document.createElement("span");
  name.textContent = label;
  const number = document.createElement("strong");
  number.textContent = String(value);
  item.append(name, number);
  ui.resultStats.append(item);
}

function showWeaponResult(weapon, adjustments) {
  ui.forgeLoading.hidden = true;
  ui.weaponResult.hidden = false;
  const meta = deliveryMeta[weapon.delivery] || deliveryMeta.projectile;
  ui.weaponResult.style.setProperty("--result-color", weapon.color);
  ui.resultGlow.style.background = weapon.color;
  ui.resultGlyph.textContent = meta.glyph;
  ui.resultDelivery.textContent = meta.label;
  ui.resultName.textContent = weapon.name;
  ui.resultDescription.textContent = weapon.behavior_summary || weapon.description;
  ui.resultTradeoff.textContent = weapon.tradeoff_text;
  ui.resultStats.replaceChildren();
  addResultStat("单次伤害", weapon.damage);
  addResultStat("攻击间隔", `${weapon.cooldown}s`);
  addResultStat(weapon.delivery === "orbit" ? "环绕数量" : "投射数量", weapon.projectile_count);
  addResultStat("作用距离", Math.round(weapon.range));
  const trajectoryLabels = { straight: "直线", homing: "主动追踪", boomerang: "折返", spiral: "螺旋", wave: "蛇形", skyfall: "天降" };
  addResultStat("真实轨迹", trajectoryLabels[weapon.trajectory] || "直线");
  addResultStat("强度评级", `${Math.round(weapon.balance_score || 0)} / ${Math.round(weapon.budget || forgeTiers[state.activeForgeTier - 1].budget)}`);
  ui.resultTags.replaceChildren();
  for (const tag of weapon.tags) {
    const chip = document.createElement("span");
    chip.textContent = `# ${tag}`;
    ui.resultTags.append(chip);
  }
  ui.balanceNote.hidden = adjustments.length === 0;
  ui.balanceNote.textContent = adjustments.join("；");
  drawWeaponPreview(weapon);
}

function drawWeaponPreview(weapon) {
  const preview = ui.resultWeaponCanvas;
  const previewCtx = preview.getContext("2d");
  const w = preview.width;
  const h = preview.height;
  previewCtx.clearRect(0, 0, w, h);
  const gradient = previewCtx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#08090e");
  gradient.addColorStop(.58, "#10111a");
  gradient.addColorStop(1, `${weapon.color}22`);
  previewCtx.fillStyle = gradient;
  previewCtx.fillRect(0, 0, w, h);
  previewCtx.strokeStyle = "rgba(255,255,255,.045)";
  previewCtx.lineWidth = 1;
  for (let x = 0; x < w; x += 28) { previewCtx.beginPath(); previewCtx.moveTo(x, 0); previewCtx.lineTo(x, h); previewCtx.stroke(); }
  for (let y = 0; y < h; y += 28) { previewCtx.beginPath(); previewCtx.moveTo(0, y); previewCtx.lineTo(w, y); previewCtx.stroke(); }
  previewCtx.fillStyle = "rgba(255,255,255,.36)";
  previewCtx.font = "10px ui-monospace, Consolas, monospace";
  previewCtx.fillText(`${(visualMeta[inferVisualForm(weapon)] || visualMeta.rifle).label.toUpperCase()} / GENERATED PHYSICAL FORM`, 18, 24);
  drawWeaponModel(previewCtx, weapon, w * .54, h * .57, 0, 2.05, 1);
}

function acceptWeapon() {
  if (!previewWeapon) return;
  previewWeapon = hydrateWeapon(previewWeapon);
  previewWeapon.timer = 0.15;
  previewWeapon.forged = true;
  previewWeapon.level = state.activeForgeTier;
  previewWeapon.forgeTier = state.activeForgeTier;
  if (weapons.length >= 4) {
    addLog("四种攻击手段已全部接入，本次重复重构被拒绝。", true);
    closeForge();
    return;
  }
  weapons.push(previewWeapon);
  invalidateSynergies();
  profile.blueprints ||= [];
  if (!profile.blueprints.some((item) => item.name === previewWeapon.name)) {
    profile.blueprints.push({ name: previewWeapon.name, delivery: previewWeapon.delivery, color: previewWeapon.color, tags: previewWeapon.tags });
    profile.blueprints = profile.blueprints.slice(-40);
    saveProfile();
    updateProfileUI();
  }
  addLog(`武器「${previewWeapon.name}」已经醒来。`, true);
  burst(player.x, player.y, previewWeapon.color, 24, 150);
  updateLoadoutUI();
  updateSynergyUI();
  closeForge();
}

function useRecommendedWeapon() {
  const role = selectedArchetype?.role || "sniper";
  const wish = roleRecommendedWishes[role];
  ui.wishInput.value = wish;
  ui.charCount.textContent = String(wish.length);
  ui.forgeButton.disabled = true;
  generateWeapon(wish);
}

async function checkApi() {
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    if (!response.ok) throw new Error("offline");
    const health = await response.json();
    ui.apiPill.classList.remove("online", "demo", "error");
    if (health.aiConfigured) {
      ui.apiPill.classList.add("online");
      ui.apiStatus.textContent = `OPENAI · ${health.model}`;
    } else {
      ui.apiPill.classList.add("demo");
      ui.apiStatus.textContent = "本地演示 · 等待 API KEY";
    }
  } catch {
    ui.apiPill.classList.add("error");
    ui.apiStatus.textContent = "服务未连接";
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === "Space" && !event.repeat) useArchetypeSkill();
  if (!ui.upgrade.hidden && ["Digit1", "Digit2", "Digit3"].includes(event.code)) {
    const index = Number(event.code.slice(-1)) - 1;
    if (state.rewardType === "mutation") selectMutation(index);
    else if (currentUpgradeChoices[index]) selectUpgrade(currentUpgradeChoices[index].id);
  }
  if (event.code === "Enter" && !state.running && ui.gameOver.hidden && !ui.intro.classList.contains("dismissed")) {
    if (ui.archetypeModal.hidden) openArchetypeSelection();
    else compileArchetypeAndStart();
  }
  if (event.code === "Escape") pauseGame();
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => {
  keys.clear();
  if (state.running && !state.paused && !state.forging) pauseGame();
});

canvas.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  touch.active = true;
  touch.id = event.pointerId;
  touch.startX = touch.x = event.offsetX;
  touch.startY = touch.y = event.offsetY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!touch.active || event.pointerId !== touch.id) return;
  const dx = event.offsetX - touch.startX;
  const dy = event.offsetY - touch.startY;
  const length = Math.hypot(dx, dy);
  const scale = length > 42 ? 42 / length : 1;
  touch.x = touch.startX + dx * scale;
  touch.y = touch.startY + dy * scale;
});
function releaseTouch(event) {
  if (event.pointerId === touch.id) touch.active = false;
}
canvas.addEventListener("pointerup", releaseTouch);
canvas.addEventListener("pointercancel", releaseTouch);

ui.start.addEventListener("click", openArchetypeSelection);
ui.archetypeConfirm.addEventListener("click", compileArchetypeAndStart);
ui.archetypeBack.addEventListener("click", closeArchetypeSelection);
ui.resume.addEventListener("click", pauseGame);
ui.restart.addEventListener("click", () => { if (state.running) resetGame(); else openArchetypeSelection(); });
ui.playAgain.addEventListener("click", resetGame);
ui.changeBuild.addEventListener("click", () => {
  ui.gameOver.hidden = true;
  ui.intro.classList.remove("dismissed");
  selectedArchetype = null;
  weapons = [];
  updateLoadoutUI();
  updateSynergyUI();
  showUnselectedIdentity();
  openArchetypeSelection();
});
ui.archiveButton.addEventListener("click", openArchive);
ui.archiveClose.addEventListener("click", () => { ui.archive.hidden = true; });
ui.archive.addEventListener("click", (event) => { if (event.target === ui.archive) ui.archive.hidden = true; });
ui.metaUpgrades.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-meta-id]");
  if (button) buyMetaUpgrade(button.dataset.metaId);
});
ui.sound.addEventListener("click", () => {
  audio.enabled = !audio.enabled;
  profile.sound = audio.enabled;
  saveProfile();
  if (audio.enabled) { audio.wake(); audio.tone(440, .12, "sine", .025, 180); }
  updateProfileUI();
});
ui.difficultyPicker.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-difficulty]");
  if (!button || state.running) return;
  selectedDifficulty = button.dataset.difficulty;
  for (const item of ui.difficultyPicker.querySelectorAll("button")) item.classList.toggle("active", item === button);
});
ui.archetypeInput.addEventListener("input", () => {
  ui.archetypeCount.textContent = String(ui.archetypeInput.value.length);
  for (const button of ui.archetypePresets.querySelectorAll("button")) button.classList.toggle("active", button.dataset.concept === ui.archetypeInput.value);
});
ui.archetypePresets.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-concept]");
  if (!button) return;
  ui.archetypeInput.value = button.dataset.concept;
  ui.archetypeCount.textContent = String(ui.archetypeInput.value.length);
  for (const item of ui.archetypePresets.querySelectorAll("button")) item.classList.toggle("active", item === button);
});
ui.upgradeOptions.addEventListener("click", (event) => {
  const quickWish = event.target.closest("button[data-mutation-wish]");
  if (quickWish) {
    const input = ui.upgradeOptions.querySelector("[data-mutation-wish-input]");
    const count = ui.upgradeOptions.querySelector("[data-mutation-wish-count]");
    if (input) {
      input.value = quickWish.dataset.mutationWish;
      input.focus();
      if (count) count.textContent = String(input.value.length);
    }
    return;
  }
  const mutation = event.target.closest("button[data-mutation-index]");
  if (mutation) { selectMutation(Number(mutation.dataset.mutationIndex)); return; }
  const card = event.target.closest("button[data-upgrade-id]");
  if (card) selectUpgrade(card.dataset.upgradeId);
});
ui.upgradeOptions.addEventListener("input", (event) => {
  const input = event.target.closest("[data-mutation-wish-input]");
  if (!input) return;
  const count = ui.upgradeOptions.querySelector("[data-mutation-wish-count]");
  if (count) count.textContent = String(input.value.length);
});
ui.upgradeOptions.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-mutation-wish-form]");
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector("[data-mutation-wish-input]");
  const wish = input?.value.trim() || "";
  if (!wish) return;
  generateMutations(wish);
});
ui.reroll.addEventListener("click", rerollUpgrades);
ui.wishInput.addEventListener("input", () => { ui.charCount.textContent = String(ui.wishInput.value.length); });
ui.quickWishes.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-wish]");
  if (!button) return;
  ui.wishInput.value = button.dataset.wish;
  ui.charCount.textContent = String(ui.wishInput.value.length);
  ui.wishInput.focus();
});
ui.wishForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const wish = ui.wishInput.value.trim();
  if (!wish) return;
  ui.forgeButton.disabled = true;
  generateWeapon(wish);
});
ui.skip.addEventListener("click", useRecommendedWeapon);
ui.retry.addEventListener("click", showForgeForm);
ui.accept.addEventListener("click", acceptWeapon);

resizeCanvas();
ui.archetypeCount.textContent = String(ui.archetypeInput.value.length);
selectedArchetype = null;
weapons = [];
showUnselectedIdentity();
updateLoadoutUI();
updateSynergyUI();
updateProfileUI();
updateHUD();
checkApi();
requestAnimationFrame(loop);
