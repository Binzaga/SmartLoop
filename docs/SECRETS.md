# Secrets Management

⚠️ **重要**:这份文档列出所有秘密的位置 + 谁有访问权 + 如何轮换。

---

## 1. 所有秘密一览

| Secret | 用途 | 当前存放 | 暴露范围 |
|---|---|---|---|
| `DASHSCOPE_API_KEY` | 调阿里云 Qwen 模型 | `apps/api/.env` | 服务端 only |
| `ADMIN_TOKEN` | 管理员后台 + Dashboard | `apps/api/.env` + `apps/web/.env.local` | 服务端 only |
| Per-product `apiKey` (sl_xxx) | SDK 上报 | 接入的 AI 产品的 env(他们各自) | 服务端 only |
| GitHub PAT | git push | `/root/.git-creds/smartloop` (chmod 600) | 部署机 only |
| Postgres password | DB 连接 | `apps/api/.env`(`DATABASE_URL` 里) | 服务端 only |
| Redis password(未启用) | Redis 连接 | 暂无 | — |

---

## 2. 命名规则

- 文件名 `.env`、`.env.local`、`.env.production` 一律**不进 git**(`.gitignore` 已配置)
- 只有 `.env.example`(模板)进 git
- 服务器上的 secret 文件 chmod 600 (`-rw-------`)
- 不在日志里 print,不在 git commit message 里写

---

## 3. 哪些秘密已经泄露过

⚠️ **Hackathon 开发期间(2026-04 ~ 2026-05),以下秘密通过 Telegram 传给过 AI 助手**:

1. **DingTalk app `clientSecret`** (用于钉钉机器人项目,SmartLoop 不直接使用)
2. **DashScope API key `sk-c1916cb6...`** ⬅️ 当前 SmartLoop 在用
3. **Admin token `UjKguDXXNF6...`** ⬅️ 当前 SmartLoop 在用
4. **A product SDK key `sl_VIaDgjGQv6sbL...`** ⬅️ in use
5. **GitHub PAT `github_pat_11AG2J5...`** ⬅️ 当前在用

**生产前必须全部轮换。** 详见下面的「轮换步骤」。

---

## 4. 轮换步骤

### 4.1 DashScope API key

1. 登录 https://dashscope.aliyuncs.com/
2. API Key 管理 → 创建新 key(权限只勾「OpenAI 兼容模式」+ `qwen3-max`、`qwen3.5-plus`)
3. SSH 到服务器,改:
   ```bash
   vi /home/jump/smartloop/apps/api/.env
   # 把 DASHSCOPE_API_KEY=sk-xxx 改成新值
   ```
4. 重启 API:
   ```bash
   systemctl restart smartloop-api  # systemd 化后
   # 或者人肉:
   pkill -TERM -f 'bun run src/server.ts'
   cd /home/jump/smartloop/apps/api
   setsid bun run src/server.ts > /tmp/smartloop-api.log 2>&1 < /dev/null &
   ```
5. 在 DashScope 控制台**作废旧 key**

### 4.2 Admin token

1. 生成新 token:
   ```bash
   openssl rand -base64 24 | tr -d '/+=' | head -c 32
   ```
2. 改 `apps/api/.env` 的 `ADMIN_TOKEN`
3. 改 `apps/web/.env.local` 的 `SMARTLOOP_ADMIN_TOKEN`(必须一致)
4. restart api + web
5. 通知所有用过老 token 的工具更新

### 4.3 Per-product API key(SDK key)

通过 API 轮换(无需停机):

```bash
ADMIN=<你的新 admin token>
curl -X POST http://47.82.1.197/admin/products/<product-id>/rotate-key \
  -H "x-admin-token: $ADMIN"
# 返回 {"ok":true,"apiKey":"sl_newxxxx","warning":"Old key is now invalid."}
```

旧 key 立即作废,通知产品方更新他们的 env。

### 4.4 GitHub PAT

1. GitHub Settings → Developer settings → Personal access tokens (Fine-grained)
2. **删掉**当前那把(repo 名字里有 SmartLoop 的)
3. **新建一把**:
   - Expiration: 90 天
   - Scopes: `Contents (read & write)` on `Binzaga/SmartLoop`
4. SSH 到服务器:
   ```bash
   echo 'https://x-access-token:<NEW_PAT>@github.com' > /root/.git-creds/smartloop
   chmod 600 /root/.git-creds/smartloop
   ```
5. 测试:
   ```bash
   cd /home/jump/smartloop
   git fetch origin
   ```

### 4.5 Postgres password

1. 改 `docker-compose.yml` 里 `POSTGRES_PASSWORD`
2. 改 `apps/api/.env` 里 `DATABASE_URL` 的 password 部分
3. `docker compose down && docker compose up -d`
   - **注意**:这会**保留**数据(volume)。但密码改动需要重新建用户:
     ```bash
     docker exec smartloop-postgres psql -U smartloop -d smartloop -c \
       "ALTER USER smartloop WITH PASSWORD 'new_password';"
     ```
4. 重启 API

---

## 5. 部署前 checklist

- [ ] 轮换 DashScope key
- [ ] 轮换 Admin token
- [ ] 轮换所有 product SDK key
- [ ] 轮换 GitHub PAT(可选,但建议)
- [ ] 把 Postgres 默认密码改掉
- [ ] 确认 `.env` 文件 chmod 600
- [ ] 确认 git 没有意外提交 `.env`(`git log --all -- '**/.env'` 应该为空)

---

## 6. 长期改进(架构层面)

| 现状 | 改进 |
|---|---|
| Secret 在 `.env` 明文 | 接入 **HashiCorp Vault** / 阿里云 KMS,运行时拉取 |
| `ADMIN_TOKEN` 全公司一个 | 接入 your org **SSO**,每人各自鉴权 |
| PAT 在文件 | 改成 **deploy key**(SSH 密钥对),更安全 |
| 无审计 | 加 `/admin/*` 访问日志(谁、什么时间、什么操作) |
| 手动轮换 | 90 天过期自动告警 + 自动轮换流程 |

详见 [ROADMAP.md](./ROADMAP.md) 的「安全」章节。

---

## 7. 如果 Secret 已经泄露怎么办

1. **立即**:走「轮换步骤」对应章节,作废旧值
2. **5 分钟内**:在团队 chat 周知,确认没有正在跑的脚本用旧值
3. **当天**:审计是否有异常调用(查 nginx access log + DashScope 用量 + GitHub audit log)
4. **复盘**:为什么泄露?(误提交?口头/聊天发了?误公开?)写到 incident 记录
