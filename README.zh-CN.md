<p align="center">
  <strong>简体中文</strong> · <a href="README.md">English</a>
</p>

<div align="center">
  <img src="assets/branding/rouge-hate-icon-256.png" width="168" alt="ROUGE HATE 紫色奇点图标">
  <h1>ROUGE HATE</h1>
  <p><strong>说出你的武器，在群星中活下来。</strong></p>
  <p>一款让想象真正进入战斗的宇宙幸存者肉鸽。</p>
</div>

[![ROUGE HATE 实机宣传预览](assets/branding/rouge-hate-trailer-preview.gif)](trailer-output/rouge-hate-gameplay-trailer-final.mp4)

<p align="center">
  <a href="trailer-output/rouge-hate-gameplay-trailer-final.mp4"><strong>▶ 观看 / 下载 1080p 完整实机宣传片</strong></a>
</p>

## 你的话，会变成武器

> 创造一颗吞噬全屏敌人的微缩恒星，然后裂解成覆盖战场的雷暴。

ROUGE HATE 会把一句话编译成真正进入战斗的构筑：武器形态、攻击节奏、飞行轨迹、索敌方式、异常效果、视觉语言与代价。你也可以自由描述开局身份，并在远征中通过「武器异梦」重写已经拥有的攻击。

这不是摆在游戏旁边的聊天机器人。语言会直接改变战场。

## 把不可能锻造成流派

- **一句话创造战斗身份** —— 战士、猎人、法师，或任何只属于你的设想。
- **用自然语言锻造攻击** —— 追踪飞剑、塌缩恒星、连锁雷暴、轨道武器、活体弹丸与更奇怪的想法。
- **在局内重写武器** —— 描述现有攻击如何进化，先看实战预演，再决定是否接入。
- **遇见七位宇宙神祇** —— 每位神祇都用专属赐福改造构筑，还有罕见的双神组合。
- **发现 110 项遗物与赐福** —— 叠加联动、解锁隐藏转化，把五件武器推向极端终局形态。
- **对抗 18 种宇宙生物** —— 群居、狙击、冲锋、孵化、护盾、炮击、精英与阶段 Boss。
- **穿过九分钟远征** —— 三个逐步失控的星域、四次武器锻造、动态事件与「憎恨奇点」。
- **没有 API Key 也能完整游玩** —— 本地规则编译器会保留完整的远征循环。

## 七位神祇，七种撕裂天空的方式

![七位原创宇宙神祇](assets/concepts/cosmic-patrons-roster.png)

盲星 · 白乌 · 赤日 · 眠月 · 菌母 · 雷兽 · 观星者

每次远征只有部分神祇会回应。他们的赐福会与遗物、武器及彼此碰撞，让同一个开局构想在每局走向不同的战争机器。

## 用自然语言书写的武器库

![AI 宇宙武器概念图](assets/weapons/cosmic-weapon-concept-sheet-v2.png)

每件生成武器都会被翻译为安全、有边界的战斗蓝图，而不是任意代码。幻想属于你；游戏只负责让数值可以存活、效果可以读懂、构筑值得继续。

## 一次远征

1. 描述你是谁，带着匹配的初始武器与专属技能进入第一星域。
2. 切开星兽群，收集经验，选择遗物或神祇赐福。
3. 进入武器异梦，重写已在武器库中的攻击。
4. 在关键战斗节点，用自己的句子锻造新武器。
5. 带着五件武器与一张联动网进入最终星域。
6. 摧毁憎恨奇点——或为下一次远征留下残响。

## 发布你自己的网页版

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/OneYaYa/Rougehate)

仓库自带的 Render Blueprint 会把游戏与 Python API 发布成同一个可分享网站。默认使用免费 Web Service；免费实例空闲时会休眠，下次访问自动唤醒。`OPENAI_API_KEY` 只会作为 Render 秘密保存，不会提交到 GitHub 或暴露给浏览器。

<details>
<summary><strong>本地启动</strong></summary>

需要 Python 3.10 或更高版本，不需要 npm 或 pip 依赖。

```powershell
git clone https://github.com/OneYaYa/Rougehate.git
cd Rougehate
python server.py
```

浏览器打开 <http://127.0.0.1:8787>。如需启用 OpenAI 生成，把 `.env.example` 复制为 `.env`，填入专用的 `OPENAI_API_KEY`，然后重启服务。不配置密钥时，游戏会自动使用本地生成规则。

</details>

玩家记录保存在各自浏览器的 `localStorage` 中，服务端不保存个人存档。
