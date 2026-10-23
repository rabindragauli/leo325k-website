# START HERE — Rabindra's checklist

## ✅ Before Sprint 0
- [x] Node.js 22 + npm 10.9 installed (`node -v`, `npm -v`)
- [x] Git installed (`git --version`)
- [x] PowerShell policy set (`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`)
- [x] XAMPP installed at `D:\Code\Database\xampp` (start **MySQL only** when needed — from Sprint 3)
- [ ] This kit extracted directly into `D:\Code\LEO 325K` (you should see `MASTER_PROMPT.md` in the root)
- [ ] VS Code folder trusted (no "Restricted Mode" bar)

## ▶️ Kick-off message (paste into Claude Code or Copilot Chat → Agent mode)
Keep approvals ON. Read each command before allowing it.

```
Read MASTER_PROMPT.md in this workspace and follow it exactly.
Also read README.md, START_HERE.md and every file in docs/ before starting.
Start with section 6 of the master prompt: give me your 5-bullet understanding of the scope,
any blocking questions, and the exact commands you will run for Sprint 0.
Wait for my OK before running them.
```

## 🗄️ When the agent reaches Sprint 3 (database)
XAMPP Control Panel → **Start MySQL** → **Shell** → `mysql -u root`, then:
```sql
CREATE DATABASE leo325k CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'leo325k_dev'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON leo325k.* TO 'leo325k_dev'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Put the connection in `.env` (never commit it):
`DATABASE_URL="mysql://leo325k_dev:YOUR_PASSWORD@localhost:3306/leo325k"`

## 🔁 After every sprint
1. Run the site: `npm run dev` → open http://localhost:3000 and compare with `design/screens/`.
2. If happy: `git add .` → `git commit -m "Sprint N"` → `git push`.
3. Tell the agent **continue**.

## 🚀 Deploy (Sprint 8)
GitHub → Actions → **Build deploy package** → Run workflow → download `leo325k-deploy.zip` → follow `docs/06_DEPLOY_KAILASH_CPANEL.md`.
