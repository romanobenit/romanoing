# 📌 Cheat Sheet Workflow - Studio ERP

Quick reference per workflow quotidiano. Stampa o tieni aperto! ⭐

---

## 🌳 Branch Structure

```
production  → Live su romanoing.com (PR required)
develop     → Lavoro quotidiano (PR required)
feature/*   → Tue modifiche (push libero)
```

---

## 🔄 Workflow Completo

### 1️⃣ Nuovo Task

```bash
git checkout develop && git pull
git checkout -b feature/nome-task
```

### 2️⃣ Lavoro e Commit

```bash
# ... modifica codice ...
git add .
git commit -m "feat: Descrizione"
git push -u origin feature/nome-task
```

### 3️⃣ Pull Request

```
GitHub → Compare & Pull Request
Base: develop ← feature/nome-task
Assign reviewer
Create PR
```

### 4️⃣ Review e Merge

```
Reviewer approva → Merge → Delete branch
```

### 5️⃣ Aggiorna Locale

```bash
git checkout develop && git pull
git branch -d feature/nome-task
```

---

## 🚢 Deploy Produzione

### Quando
Venerdì 16:00 (o quando pronto)

### Chi
Chiunque di voi 2 (comunicare prima!)

### Processo

```bash
# 1. PR develop → production su GitHub
# 2. L'altro approva
# 3. Merge
# 4. SSH server
ssh -i ~/.ssh/key deploy@116.203.109.249
# 5. Deploy
sudo /root/deploy-production.sh
# 6. Verifica https://romanoing.com
# 7. Notifica team ✅
```

---

## 📝 Commit Messages

```bash
feat: Nuova funzionalità
fix: Correzione bug
update: Aggiornamento contenuti
refactor: Refactoring codice
docs: Documentazione
test: Test
chore: Manutenzione
```

---

## 🔥 Hotfix Urgente

```bash
git checkout production && git pull
git checkout -b hotfix/descrizione
# ... fix ...
git push origin hotfix/descrizione
# PR → production (URGENT)
# Fast review → Merge → Deploy subito
# Backport: merge in develop
```

---

## 🛠️ Comandi Git Utili

```bash
# Stato
git status

# Storia
git log --oneline -10

# Differenze
git diff
git diff develop

# Annulla ultimo commit (mantieni modifiche)
git reset --soft HEAD~1

# Aggiorna branch con develop
git checkout feature/mio
git merge develop

# Vedi branch
git branch -a

# Cancella branch locale
git branch -d nome-branch

# Stash (salva temporaneamente)
git stash
git stash pop
```

---

## 🖥️ Comandi Server

```bash
# Connetti
ssh deploy@116.203.109.249

# Deploy
sudo /root/deploy-production.sh

# Rollback
sudo /root/rollback-production.sh

# Monitor PM2
sudo pm2 status
sudo pm2 logs studio-erp
sudo pm2 logs studio-erp --lines 100
sudo pm2 monit

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx

# Disco e RAM
df -h
free -h

# Git (read-only)
cd /root/romanoing/studio-erp
git log --oneline -10
git status
```

---

## ✅ Checklist PR

Prima di aprire PR:

- [ ] Testato in locale (npm run dev)
- [ ] Build passa (npm run build)
- [ ] No secrets committati (.env, password)
- [ ] Commit messages chiari
- [ ] TODO.md aggiornato se necessario

---

## 🚨 Regole d'Oro

### ✅ FARE

✅ Sempre partire da develop aggiornato
✅ Branch descrittivi
✅ Commit frequenti
✅ PR con descrizione
✅ Revieware attentamente
✅ Comunicare prima deploy
✅ Aggiornare TODO.md

### ❌ NON FARE

❌ Push diretto su production/develop
❌ Force push (git push -f)
❌ Committare .env con secrets
❌ Mergare senza approval
❌ Deployare senza comunicare
❌ Cancellare branch production/develop

---

## 📞 Comunicazione

### Prima Deploy

```
WhatsApp/Slack:
"Deploy v1.2 tra 10 min, ok?"
"✅ Procedi"
```

### Dopo Deploy

```
"✅ Deploy v1.2 completato - PDF export live"
```

### Blocco Tecnico

```
"Bloccato su integrazione Stripe, hai 10 min?"
```

---

## 🆘 Troubleshooting Rapido

### "Cannot push to production"
✅ NORMALE! Usa PR

### "Merge conflict"
```bash
git merge develop
# Risolvi conflitti in file
git add file-risolto.ts
git commit -m "merge: Resolve conflicts"
```

### "Permission denied SSH"
```bash
# Verifica chiave usata
ssh -i ~/.ssh/romanoing_deploy deploy@116.203.109.249
```

### "Build failed"
```bash
npm install  # Aggiorna dipendenze
npm run build  # Testa build
# Leggi errori e fixa
```

---

## 📋 TODO.md Quick Update

```bash
# Inizio task
git checkout develop && git pull
nano TODO.md
# Sposta task "Prossimi" → "In Corso" + tuo nome
git add TODO.md
git commit -m "docs: Start task nome-task"
git push

# Fine task
# Sposta "In Corso" → "Completati"
git add TODO.md
git commit -m "docs: Complete task nome-task"
git push
```

---

## 🎯 Workflow Settimanale Tipico

### Lunedì
- Sync su task settimana
- Assegnazione in TODO.md

### Mar-Gio
- Sviluppo feature
- PR reciproche
- Review e merge

### Venerdì
- Sync 30 min (opzionale)
- Deploy coordonato 16:00
- Verifica produzione

---

## 🔗 File Riferimento Completi

- `SETUP_FASE_1.md` - Setup iniziale
- `WORKFLOW_COLLABORATORE.md` - Guida completa
- `GITHUB_SETUP.md` - Config GitHub
- `SERVER_ACCESS_SETUP.md` - SSH e deploy
- `DEPLOYMENT_GUIDE.md` - Deploy dettagliato
- `TODO.md` - Task tracking

---

## 💡 Tips & Tricks

### Alias Git Utili

```bash
# Aggiungi a ~/.gitconfig o ~/.bashrc

git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph -10"

# Uso:
git co develop  # invece di git checkout develop
git st          # invece di git status
git lg          # log grafico
```

### SSH Config

```bash
# ~/.ssh/config

Host romanoing
    HostName 116.203.109.249
    User deploy
    IdentityFile ~/.ssh/romanoing_deploy

# Uso:
ssh romanoing  # invece di ssh -i ~/.ssh/romanoing_deploy deploy@...
```

### VS Code Extensions

- GitLens (Git enhanced)
- GitHub Pull Requests
- Prettier (code formatter)
- ESLint
- Tailwind CSS IntelliSense

---

**Stampa questo file o tienilo aperto in tab separato! 📌**

---

Ultimo aggiornamento: 4 Gennaio 2025
