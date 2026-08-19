# ROUGE HATE 网页长期部署

本文适用于自有 Linux 服务器；示例域名 `game.example.com` 必须替换成你实际拥有 DNS 权限的域名。使用当前 Windows 电脑和公网 IP 直连的方案见 [WINDOWS_IP_DEPLOY.md](WINDOWS_IP_DEPLOY.md)。

## 部署后究竟会一直运行什么

- 服务器会长期等待 HTTP 请求；没有访客时不会运行一局游戏，也不会自动请求 OpenAI。
- 战斗模拟运行在玩家自己的浏览器里，关闭页面或标签页后，该玩家的本局运行就停止。
- Python 服务只在玩家创建身份、锻造武器或生成异变时请求 OpenAI，因此“网站在线”不等于“API 一直花钱”。
- 玩家记录当前保存在各自浏览器的 `localStorage`，服务器没有云存档数据库。

## 前提

1. 一台有公网 IP 的 Linux 服务器，已安装 Docker Engine 与 Docker Compose。
2. 域名 DNS 的 `A`/`AAAA` 记录已经指向该服务器。
3. 服务器防火墙允许 TCP 80、TCP 443 和 UDP 443。
4. OpenAI Key 必须是该游戏专用项目的服务器端 Key，并在 OpenAI 项目中设置预算/限额。

## 1. 配置环境变量

在服务器的项目目录创建 `.env`，不要把它提交到 Git：

```dotenv
OPENAI_API_KEY=sk-你的专用项目Key
OPENAI_MODEL=gpt-5.6-terra

ROUGEHATE_AI_ENABLED=true
ROUGEHATE_DOMAIN=game.example.com
ROUGEHATE_RATE_LIMIT=12
ROUGEHATE_RATE_WINDOW_SECONDS=60
```

限制文件权限：

```bash
chmod 600 .env
```

不要在网页、`game.js`、Git 仓库、个人网站 HTML 或聊天截图里放 API Key。浏览器只访问本站 `/api/*`，真正的 Key 只由 Python 服务读取。

## 2A. 服务器尚未运行其他网站/反向代理

项目自带 Caddy，负责自动申请和续期 HTTPS 证书：

```bash
docker compose up -d --build
docker compose ps
curl https://game.example.com/api/health
```

健康接口应返回 `"ok": true`；启用 AI 时还会返回 `"aiConfigured": true`。

## 2B. 服务器已有个人网站、Nginx 或 Caddy

不要再启动本项目的 `caddy` 服务，以免争用 80/443 端口。只启动游戏后端：

```bash
docker compose up -d --build game
curl http://127.0.0.1:8787/api/health
```

然后在现有反向代理中把 `game.example.com` 转发到 `127.0.0.1:8787`。

Caddy 示例：

```caddyfile
game.example.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8787
}
```

Nginx 示例：

```nginx
server {
    listen 443 ssl http2;
    server_name game.example.com;

    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

证书部分继续使用个人网站当前的 Certbot、面板或 Caddy 配置。

## 3. 从个人网站分享

推荐直接链接，不使用 iframe：

```html
<a href="https://game.example.com/" target="_blank" rel="noopener">
  玩 ROUGE HATE
</a>
```

当前安全策略禁止第三方 iframe 嵌入，这是为了避免页面被其他网站套壳并消耗你的 API 配额。

## 日常操作

查看状态和健康：

```bash
docker compose ps
curl https://game.example.com/api/health
```

查看日志：

```bash
docker compose logs -f --tail=200 game
docker compose logs -f --tail=100 caddy
```

更新代码：

```bash
git pull --ff-only
docker compose up -d --build
```

## 如何停止

只停止 AI、游戏网页仍保持可用：

1. 把 `.env` 中的 `ROUGEHATE_AI_ENABLED` 改成 `false`。
2. 重建游戏容器：

```bash
docker compose up -d --force-recreate game
```

此时身份、武器和异变会使用本地规则，不再调用 OpenAI。重新设为 `true` 并执行同一命令即可恢复。

临时停止整个网站：

```bash
docker compose stop
```

恢复：

```bash
docker compose start
```

下线并移除运行容器：

```bash
docker compose down
```

`restart: unless-stopped` 的含义是服务崩溃或服务器重启时自动恢复，但你手动 `stop` 或 `down` 后不会自己再次启动。紧急情况下还可以在 OpenAI 控制台撤销该项目 Key；撤销后所有新 API 请求都会失败，网页则会回退或显示生成失败。

## 上线前检查

- `.env` 没有进入 Git：`git status --short` 不应显示 `.env`。
- `https://域名/api/health` 正常，但响应中绝不出现 Key。
- 从手机网络和桌面网络各完成一次身份生成、武器锻造和异变。
- OpenAI 项目的预算告警、项目限额和模型限额已经启用。
- `ROUGEHATE_RATE_LIMIT` 不要轻易调得很大；同一学校或公司出口 IP 的玩家较多时再逐步提高。
