# Windows 公网 IP 直连部署

此方案不使用 Render、Vercel、Cloudflare 等网页部署平台，也不修改 `oneyaya.github.io`。当前 Windows 电脑直接运行 ROUGE HATE，访客通过你的公网 IP 访问。

## 必须先满足的网络条件

代码无法绕过运营商或单位网络的 NAT。必须满足以下任一条件：

1. 这台电脑直接拥有可入站的公网 IPv4；或
2. 你能管理上游路由器，把公网端口转发到这台电脑；或
3. 这台电脑拥有可入站的公网 IPv6，并且防火墙允许对应端口。

如果电脑网卡地址和外部查询到的公网地址不同，通常表示中间存在 NAT。需要登录路由器查看 **WAN/Internet IP**：

- WAN IP 与外部公网 IP 相同：可以配置端口转发。
- WAN IP 属于 `10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16` 或 `100.64.0.0/10`：位于私网或运营商 CGNAT 后，必须向网络管理员/运营商申请公网入站或端口映射。
- 无权管理上游网关：仅靠本机代码无法让互联网主动连接进来。

## 1. 本机启动测试

在项目目录运行：

```powershell
$env:ROUGEHATE_HOST = "0.0.0.0"
$env:ROUGEHATE_PORT = "8787"
python server.py
```

同一局域网中的另一台设备访问：

```text
http://本机局域网IP:8787/
```

健康检查：

```text
http://本机局域网IP:8787/api/health
```

只有局域网测试成功后再开放公网。按 `Ctrl+C` 会停止服务；终端关闭、电脑关机或休眠后，网站也会停止。

## 2. Windows 防火墙

确认网络条件和端口转发可配置后，以管理员身份打开 PowerShell：

```powershell
New-NetFirewallRule `
  -DisplayName "ROUGE HATE TCP 8787" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8787
```

需要撤销时：

```powershell
Remove-NetFirewallRule -DisplayName "ROUGE HATE TCP 8787"
```

不要开放 Python 调试器、文件共享、远程桌面或其他无关端口。

## 3. 路由器端口转发

在你有管理权的路由器中创建 TCP 规则：

```text
外部端口 8787  ->  这台电脑的局域网 IP:8787
```

外部访问地址为：

```text
http://你的公网IPv4:8787/
```

如果希望不写端口，可以把外部 TCP 80 转发到本机 TCP 8787，访问地址变成 `http://你的公网IPv4/`。建议在路由器中为电脑创建 DHCP 地址保留，防止本机局域网 IP 改变后转发失效。

必须使用手机蜂窝网络等真正的外部网络测试；部分路由器不支持从局域网内访问自己的公网 IP。

## 4. 开机自动运行

先取得 Python 可执行文件和项目绝对路径：

```powershell
(Get-Command python).Source
(Get-Location).Path
```

然后在 Windows **任务计划程序**中创建任务：

- 触发器：计算机启动时。
- 程序：上一步得到的 `python.exe`。
- 参数：`server.py`。
- 起始于：本项目的绝对路径。
- 勾选“无论用户是否登录都要运行”。
- 如果电脑会自动休眠，在电源设置中关闭服务器运行期间的自动睡眠。

任务停止、电脑关机、网络断开或上游公网地址改变时，网站都会停止。网站在线不代表 OpenAI 一直被调用；只有玩家执行 AI 生成操作时才会请求 API。

## 5. 停止网站或只停止 AI

停止整个网站：结束任务计划程序中的任务，或在运行服务器的终端按 `Ctrl+C`。彻底取消公网访问时，同时删除防火墙规则和路由器端口转发。

只停止 AI：把 `.env` 中的设置改为：

```dotenv
ROUGEHATE_AI_ENABLED=false
```

然后重启 `server.py`。网页仍可玩，但生成内容改用本地规则，不再调用 OpenAI。

## 安全说明

- `.env` 和真实 API Key 不能提交到 GitHub，也不能放入网页 JavaScript。
- `http://IP` 的传输没有加密，访客与服务器之间的内容可能被网络中的第三方看到或修改。
- Let’s Encrypt 已支持公网 IPv4/IPv6 的短期证书，但需要自动续期并正确配置 80/443 入站。在公网 HTTP 已验证可达之前，不要先增加这层复杂度。
- 面向陌生人公开家庭或单位网络会增加攻击面。保持 Windows、Python 和依赖更新，只开放游戏实际使用的端口。
