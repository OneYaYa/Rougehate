<div align="center">
  <img src="assets/branding/rouge-hate-icon-256.png" width="168" alt="ROUGE HATE 游戏图标">
  <h1>ROUGE HATE</h1>
  <p><strong>说出你的武器，在群星中活下来。</strong></p>
</div>

一款可以用自然语言创造角色、武器和异变的宇宙幸存者肉鸽网页游戏。

![ROUGE HATE 实机宣传预览](assets/branding/rouge-hate-trailer-preview.gif)

## 宣传设定图

![七位宇宙神祇立绘](assets/concepts/cosmic-patrons-roster.png)

![AI 宇宙武器概念图](assets/weapons/cosmic-weapon-concept-sheet-v2.png)

## 本地启动

需要 Python 3.10 或更高版本，不需要安装 npm 或 pip 依赖。

```powershell
git clone https://github.com/OneYaYa/Rougehate.git
cd Rougehate
python server.py
```

浏览器打开 <http://127.0.0.1:8787>。不配置 API Key 也能完整游玩，生成内容会使用本地规则。

## 可选：启用 OpenAI 生成

```powershell
Copy-Item .env.example .env
```

在 `.env` 中填入专用的 `OPENAI_API_KEY`，然后重新运行 `python server.py`。`.env` 已被 Git 忽略，密钥只会由 Python 服务读取，不会发送到浏览器。

## 部署到 Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/OneYaYa/Rougehate)

1. 点击上方按钮，登录 Render 并授权读取本仓库。
2. 在 Blueprint 页面填入 `OPENAI_API_KEY`。它是 Render 的秘密环境变量，不会写回 GitHub。
3. 点击 **Deploy Blueprint**，完成后访问 Render 提供的 `onrender.com` 地址。

当前 [`render.yaml`](render.yaml) 使用免费 Web Service。免费服务空闲后会休眠，下次访问需要等待唤醒。如果需要持续在线，可以之后在 Render 中升级实例。

## 文件结构

```text
Rougehate/
├─ assets/          # 游戏图像与 README 宣传图
├─ index.html       # 页面结构
├─ styles.css       # 页面样式
├─ game.js          # 游戏逻辑
├─ vfx-library.js   # 视觉效果配置
├─ server.py        # 静态文件与 AI API 服务
├─ render.yaml      # Render Blueprint
└─ .env.example     # 可选环境变量模板
```

玩家记录保存在各自浏览器的 `localStorage` 中，服务端不保存个人存档。
