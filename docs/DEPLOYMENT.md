# Deployment

当前是「hackathon MVP」级部署:阿里云 ECS 单机,手动部署。
后续要做 CI/CD 见 [ROADMAP.md](./ROADMAP.md)。

---

## 当前部署

| 项 | 值 |
|---|---|
| Host | 阿里云 ECS, hostname `iZt4ndrpwkv8scket90755Z` |
| 公网 IP | `47.82.1.197` |
| 公网端口 | 80 (HTTP only, no HTTPS 暂时) |
| OS | Alibaba Cloud Linux 8 (`5.10.134-19.2.al8.x86_64`) |
| Runtime | Bun 1.3.12 |
| Repo path | `/home/jump/smartloop` |
| Repo remote | https://github.com/Binzaga/SmartLoop |

---

## 拓扑

```
                Internet
                   │
                   │ HTTP :80
                   ▼
              ┌──────────┐
              │  nginx   │ (1.20.1)
              │   :80    │ ← /etc/nginx/conf.d/smartloop.conf
              └─────┬────┘
                    │
        ┌───────────┼───────────────┐
        │ /healthz                  │ /
        │ /readyz                   │ /_next/*
        │ /v1/*                     │ /products/*
        │ /admin/*                  │
        ▼                           ▼
   ┌──────────┐               ┌──────────┐
   │  Fastify │ :8088         │  Next.js │ :3001
   │   API    │ 127.0.0.1     │   Web    │
   └────┬─────┘               └────┬─────┘
        │                          │
        └──────────┬───────────────┘
                   │
            ┌──────┴───────┐
            │   Postgres   │ :5433 (docker)
            │   Redis      │ :6380 (docker)
            └──────────────┘
```

---

## 进程当前是怎么跑的

**目前是手动起的,需要改成 systemd。**

API:
```bash
cd /home/jump/smartloop/apps/api
setsid bun run src/server.ts > /tmp/smartloop-api.log 2>&1 < /dev/null &
disown
```

Web:
```bash
cd /home/jump/smartloop/apps/web
nohup bun run dev > /tmp/smartloop-web.log 2>&1 &
disown
```

**TODO(高优先级)**:写两份 systemd unit 让它们 boot 自启 + crash 自动重启。详见下面「Systemd 部署(推荐)」。

---

## 阿里云 Security Group(云防火墙)

只开了 **80** 端口。22 / 8088 / 3001 / 5433 / 6380 都被 SG 屏蔽,**这是正确的**(只暴露 nginx)。

如果要开 HTTPS,需要让运维在 SG 加 **443** 端口规则。

---

## nginx 配置

```
/etc/nginx/conf.d/smartloop.conf
/etc/nginx/conf.d/smartloop-proxy.inc   ← 共用 proxy headers
```

主要分流逻辑:
- `/healthz`, `/readyz` → API
- `/v1/`, `/admin/` → API
- 其他全部 → Web(包括 `/_next/static/*`)

修改后:
```bash
nginx -t                  # 验证语法
systemctl reload nginx    # 不中断 reload
```

日志:
- access: `/var/log/nginx/smartloop_access.log`
- error: `/var/log/nginx/smartloop_error.log`

---

## Postgres / Redis (Docker)

```bash
cd /home/jump/smartloop
docker compose ps
# 应该看到 smartloop-postgres (healthy) + smartloop-redis (healthy)
```

数据持久化在 docker named volume:
```bash
docker volume ls | grep smartloop
# smartloop_smartloop-pg-data
# smartloop_smartloop-redis-data
```

**备份 Postgres**(临时方案,需要 cron 化):
```bash
docker exec smartloop-postgres pg_dump -U smartloop smartloop | gzip > /backup/smartloop-$(date +%F).sql.gz
```

---

## 配置文件位置

| 文件 | 内容 |
|---|---|
| `/home/jump/smartloop/apps/api/.env` | API 的所有 env(DB URL、token、DashScope key) |
| `/home/jump/smartloop/apps/web/.env.local` | Web 用的 API URL + admin token |
| `/root/.git-creds/smartloop` | GitHub PAT(让 git push 不用每次输入) |
| `/etc/nginx/conf.d/smartloop.conf` | nginx 反代配置 |

---

## Deploy(更新代码)流程(当前手动)

```bash
cd /home/jump/smartloop
git pull
bun install                      # 万一新增了依赖

# 重启 API
ps -ef | grep 'bun run src/server.ts' | grep -v grep | awk '{print $2}' | xargs -r kill -TERM
sleep 1
cd apps/api
setsid bun run src/server.ts > /tmp/smartloop-api.log 2>&1 < /dev/null &
disown

# 重启 Web(如果有改动)
ps -ef | grep 'next dev' | grep -v grep | awk '{print $2}' | xargs -r kill -TERM
sleep 1
cd ../web
nohup bun run dev > /tmp/smartloop-web.log 2>&1 &
disown

# 如果改了 schema:
cd ../api
bun run db:migrate
```

⚠️ **明显不可持续**——见下面 systemd 方案。

---

## Systemd 部署(推荐做,还没做)

### `/etc/systemd/system/smartloop-api.service`
```ini
[Unit]
Description=SmartLoop API
After=docker.service
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/jump/smartloop/apps/api
EnvironmentFile=/home/jump/smartloop/apps/api/.env
ExecStart=/root/.bun/bin/bun run src/server.ts
Restart=always
RestartSec=5
StandardOutput=append:/var/log/smartloop/api.log
StandardError=append:/var/log/smartloop/api.err

[Install]
WantedBy=multi-user.target
```

### `/etc/systemd/system/smartloop-web.service`
```ini
[Unit]
Description=SmartLoop Web
After=smartloop-api.service
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/jump/smartloop/apps/web
EnvironmentFile=/home/jump/smartloop/apps/web/.env.local
# 生产环境用 next build + next start,不是 dev:
ExecStartPre=/root/.bun/bin/bun run build
ExecStart=/root/.bun/bin/bun run start
Restart=always
RestartSec=5
StandardOutput=append:/var/log/smartloop/web.log
StandardError=append:/var/log/smartloop/web.err

[Install]
WantedBy=multi-user.target
```

### 安装
```bash
mkdir -p /var/log/smartloop
systemctl daemon-reload
systemctl enable smartloop-api smartloop-web
systemctl start smartloop-api smartloop-web
systemctl status smartloop-api
```

---

## TLS / HTTPS(还没做,要做)

推荐用 certbot + Let's Encrypt:

```bash
# 1. 让运维在阿里云 SG 开 443
# 2. 拿一个子域名 A 记录指到 47.82.1.197
#    (例: smartloop.example.com)
# 3. 装 certbot
dnf install -y certbot python3-certbot-nginx

# 4. 拿证书 + 自动改 nginx
certbot --nginx -d smartloop.example.com

# 5. 自动续期 cron 已经被 certbot 装好,但建议手动验证一次:
certbot renew --dry-run
```

证书续期是每 60 天自动跑 `certbot renew`。

---

## Health check / Monitor

最简单:
```bash
# 跑在另一台机器上的 cron
*/5 * * * * curl -sf http://47.82.1.197/healthz > /dev/null || echo "smartloop down" | mail -s "ALERT" oncall@xxx
```

完整方案:接入 your existing monitoring(Grafana / Prometheus)。

---

## 备份恢复

### Postgres 备份(手动)
```bash
docker exec smartloop-postgres pg_dump -U smartloop smartloop > /backup/sl-$(date +%F).sql
```

### Postgres 恢复
```bash
cat /backup/sl-2026-05-13.sql | docker exec -i smartloop-postgres psql -U smartloop -d smartloop
```

### 全量恢复(灾备)
```bash
# 1. 装 Docker + Bun + nginx + git
# 2. clone repo
git clone https://github.com/Binzaga/SmartLoop /home/jump/smartloop
cd /home/jump/smartloop

# 3. docker compose up -d
# 4. 恢复 .env (从加密备份 / 1Password 拿)
# 5. cd apps/api && bun install && bun run db:migrate
# 6. 恢复 dump:
#    cat dump.sql | docker exec -i smartloop-postgres psql -U smartloop -d smartloop
# 7. cd ../web && bun install && bun run build
# 8. nginx -s reload
# 9. systemctl start smartloop-api smartloop-web
```

---

## 安全检查清单(生产前必做)

- [ ] 轮换所有 hackathon 期间 leak 过的 secret(详见 [SECRETS.md](./SECRETS.md))
- [ ] 装 HTTPS + 强制 80 → 443 redirect
- [ ] 给 Postgres 开非默认密码
- [ ] 把 admin 接口从 token 升级到 SSO
- [ ] 用 systemd 跑(替代当前 setsid + disown)
- [ ] 日志接入 your main log system
- [ ] 设置告警(API 5xx > N、judge worker 落后、磁盘满)
- [ ] 备份 cron(日 backup + 7 天保留)
- [ ] Web 用 `next build + next start`,不是 `dev`
- [ ] CI/CD(GitHub Actions 触发 deploy)
