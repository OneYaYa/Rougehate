# 从 GitHub 仓库直接部署

此方案不会修改 `oneyaya.github.io` 个人主页。Render 直接连接 `OneYaYa/Rougehate`，在同一个 Web Service 中提供游戏页面和 `/api/*` Python 接口，因此浏览器中不需要、也不会包含 OpenAI API Key。

## 一次性上线

1. 合并仓库中的部署配置后，点击 README 中的 **Deploy to Render**。
2. 登录 Render 并授权它读取 `OneYaYa/Rougehate`。
3. 创建 Blueprint 时填写 `OPENAI_API_KEY`。这是秘密变量，不会写回 GitHub。
4. 部署配置默认使用付费 `starter` 实例，以满足长久在线且不因空闲休眠的要求。确认创建前请在 Render 页面核对实例价格和付款方式。
5. 等待部署完成，使用 Render 显示的 `onrender.com` 地址访问游戏。服务名配置为 `rougehate-oneyaya`，最终地址以 Render 控制台显示为准。

健康检查地址为：

```text
https://你的-render-地址.onrender.com/api/health
```

应返回 `"ok": true` 和 `"aiConfigured": true`，响应中绝不会出现 API Key。

## 自动更新

Render 会跟踪 `main` 分支。合并或推送新提交后会自动构建、运行健康检查并部署；不需要改个人主页，也不需要手动上传文件。

## 网站会不会永远运行

- 付费实例会持续等待访问，但没有玩家时不会自动开始游戏或调用 OpenAI。
- 战斗在玩家浏览器内运行；玩家关闭页面后，本局计算随之停止。
- 只有身份生成、AI 锻造和异变生成等操作会调用 OpenAI。

## 停止与恢复

只停用 AI、保留网页：

1. 在 Render 服务的 **Environment** 中把 `ROUGEHATE_AI_ENABLED` 改为 `false`。
2. 保存并部署。游戏会改用本地规则，不再请求 OpenAI。

停止整个网站：在 Render Dashboard 选中服务并执行 **Suspend**。需要恢复时执行 **Resume**。若要永久删除服务和后续计算费用，在确认不再需要后从服务设置中删除它；删除前先核对 Render 的当月账单。

紧急停止 API 调用时，还可以在 OpenAI 项目中撤销这个游戏专用 Key。不要把 Key 放入仓库、Issue、日志截图或聊天消息。

## 免费测试选项

如果只是临时测试，可以在 Render 创建页面把实例改为 `free`。免费 Web Service 空闲一段时间会休眠，下一位玩家首次打开时需要等待唤醒，因此不满足“随时立即打开”的长期上线要求。
