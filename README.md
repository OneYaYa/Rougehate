<div align="center">
  <img src="assets/branding/rouge-hate-icon-256.png" width="168" alt="ROUGE HATE 紫色奇点游戏图标">
  <h1>ROUGE HATE</h1>
  <p><strong>说出你的武器，活过这片星海。</strong></p>
  <p>一款让玩家用自然语言创造角色与攻击方式的宇宙幸存者肉鸽。</p>
</div>

[![ROUGE HATE 14 秒实机宣传片](assets/branding/rouge-hate-trailer-preview.gif)](trailer-output/rouge-hate-trailer-14s-final.mp4)

<p align="center">
  <a href="trailer-output/rouge-hate-trailer-14s-final.mp4"><strong>▶ 观看 / 下载 1080p 完整宣传片</strong></a>
</p>

## 你的话，会成为真正的武器

这里没有只负责聊天的 AI。

你可以输入：

> 制造一颗吞噬全屏敌人，再分裂成雷暴的微型恒星。

游戏会把这句话变成一件拥有实体外形、攻击节奏、弹道、范围、状态与代价的武器，并立刻加入战斗。它不会生成或执行任意代码；所有结果都必须通过游戏预先定义的战斗语法和强度预算。

开局同样可以描述自己想玩的角色，例如“挥舞重剑的恒星勇士”“用毒箭繁殖孢子的猎人”或“操纵星核与引力的星图法师”。角色会获得对应外观、初始武器、专属被动和 `Space` 技能。

## 核心体验

- **一句话构建角色**：勇士、猎人、法师三个预设，也允许完全自由输入。
- **一句话创造武器**：每阶段清除首波敌群后获得一次武器愿望，一局最终拥有 1 件初始武器与 3 件自创武器。
- **攻击方式真的会改变**：投射物、光束、领域、环绕物与扇形近战可以继续产生虫卵弹、归巢骨钩、折射光束、雷链、死亡新星与时间回声。
- **110 件遗物与赐福**：7 位宇宙赐福者、3 个不规则遗物池、双神前置、传奇赐福、神髓强化与 8 个隐藏变身。
- **18 类宇宙星兽**：追击、远射、自爆、冲锋、孵化、护盾、狙击和环形弹幕等职责会随阶段逐渐混编。
- **约 12 分钟一局**：三个逐渐失控的星域，最终面对紫色星核 Boss“憎恨奇点”。
- **AI 不可用也能玩**：没有 API Key 时自动启用本地规则编译器，完整战斗闭环不受影响。

## 一局远征

1. 描述角色流派，获得初始武器与专属技能。
2. 从普通星兽群中升级，结识最多 4 位宇宙赐福者。
3. 每第 3 次升级进入一次“武器异梦”，改造已有武器的攻击形态。
4. 清除阶段首波后，说出下一件武器。
5. 在第 3 星域把四件武器、遗物、双神赐福与隐藏变身组合成夸张的终局火力。
6. 击穿憎恨奇点，带着残响进入下一次远征。

## 开始游戏

需要 Python 3.10+，不需要 npm 或 pip 依赖。

```powershell
git clone https://github.com/OneYaYa/Rougehate.git
cd Rougehate
Copy-Item .env.example .env
python server.py
```

然后打开 <http://127.0.0.1:8787>。

配置 OpenAI 后可以生成更贴合愿望的角色与武器：

```dotenv
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.6-terra
```

API Key 只由本地 Python 服务读取，不会进入浏览器。暂时不配置 Key 也可以直接游玩。

## 操作

| 操作 | 按键 |
|---|---|
| 移动 | `WASD` / 方向键 / 触屏拖动 |
| 专属技能 | `Space` |
| 选择升级 | `1` / `2` / `3` 或点击卡牌 |
| 暂停 | `Esc` |
| 攻击 | 自动瞄准与自动释放 |

## 当前版本

这是一个可从开局完整游玩到最终 Boss 的浏览器原型。战绩、设置、武器图鉴和局外残响保存在浏览器本地。

目前尚未提供云存档、手柄支持、账号系统与正式发行安装包。开发服务器适合本机体验，不应不加保护地直接暴露到公网。

<details>
<summary><strong>AI 安全边界与开发验证</strong></summary>

- OpenAI Responses API + Structured Outputs，模型只能返回严格 JSON Schema 中允许的字段。
- 服务端会再次裁剪数值、校验攻击机制并执行 72 / 104 / 140 三档武器预算。
- 模型永远不会生成或执行 JavaScript / Python。
- 玩家可见的异梦文案会过滤批量生成式词汇；模型失败时回退到手写规则结果。

```powershell
python -m unittest discover -s tests -v
python -m py_compile server.py
```

</details>

<details>
<summary><strong>重新录制宣传片</strong></summary>

导演模式位于 `?trailer=1`，只用于确定性实机录制，不会影响正常游戏。最终成片使用本地生成的原创 BGM 与转场音效。

```powershell
python -m pip install --target .trailer_tools numpy imageio-ffmpeg playwright
$env:PYTHONPATH=(Resolve-Path '.trailer_tools')
python tools\render_trailer.py
```

</details>
