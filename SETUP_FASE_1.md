# 🚀 Setup Completo Workflow Fase 1 - Studio ERP

Guida completa per implementare workflow Git paritario per te e il collaboratore.

---

## 📋 Panoramica Setup

**Cosa implementiamo:**
- ✅ Branch structure: `production` + `develop`
- ✅ GitHub branch protection (ISO 27001 compliant)
- ✅ Collaboratore con accesso Admin (pari livello)
- ✅ Workflow PR con review reciproche
- ✅ Entrambi possono deployare su server
- ✅ Task tracking con TODO.md
- ✅ Documentazione completa

**Tempo stimato**: 45-60 minuti totali

---

## 🎯 Checklist Generale

### Fase A: Setup Repository Git (15 min)
- [ ] Creare branch `production` e `develop`
- [ ] Configurare branch protection su GitHub
- [ ] Verificare setup funzionante

### Fase B: Setup Collaboratore GitHub (10 min)
- [ ] Invitare collaboratore su GitHub (Admin role)
- [ ] Collaboratore accetta invito
- [ ] Collaboratore clona repository

### Fase C: Setup Accesso Server (20 min)
- [ ] Creare user `deploy` su server
- [ ] Configurare SSH key collaboratore
- [ ] Test accesso e deploy

### Fase D: Documentazione e Test (15 min)
- [ ] Condividere documentazione con collaboratore
- [ ] Prima PR di test insieme
- [ ] Primo deploy coordinato

---

## 📁 File Creati per Te

```
romanoing/
├── SETUP_FASE_1.md ⭐ (questo file - inizio qui)
├── SETUP_BRANCH_STRUCTURE.sh (script automatico branch)
├── GITHUB_SETUP.md (guida GitHub passo-passo)
├── WORKFLOW_COLLABORATORE.md (guida per collaboratore)
├── SERVER_ACCESS_SETUP.md (guida SSH collaboratore)
└── studio-erp/
    └── TODO.md (template tracking task)
```

**Come usarli**: Segui gli step sotto, ogni step indica quale file consultare.

---

## 🔧 FASE A: Setup Repository Git

### Step A1: Crea Branch Structure

**Sul tuo computer locale** (NON server):

```bash
# 1. Apri terminale/Git Bash

# 2. Vai nella directory repository
cd /path/to/romanoing
# Esempio Windows: cd C:\Users\Romano\romanoing
# Esempio Mac/Linux: cd ~/romanoing

# 3. Esegui script automatico
bash SETUP_BRANCH_STRUCTURE.sh

# Output atteso:
# ✅ Master aggiornato
# ✅ Branch production creato
# ✅ Branch production pushato su GitHub
# ✅ Branch develop creato da production
# ✅ Branch develop pushato su GitHub
# ✅ SETUP COMPLETATO!

# 4. Verifica su GitHub
# Vai su https://github.com/romanobenit/romanoing
# Clicca dropdown branch (sopra lista file)
# Dovresti vedere: master, production, develop ✅
```

**Problemi? Consulta troubleshooting in fondo al file.**

### Step A2: Configura Branch Protection

**Apri file `GITHUB_SETUP.md` e segui Section 1️⃣**

Riassunto veloce:
1. GitHub → Settings → Branches → Add rule
2. Branch: `production`
3. Spunta:
   - ☑ Require pull request + 1 approval
   - ☑ Include administrators
   - ☐ Restrict who can push (LASCIA VUOTO - entrambi pari)
4. Save

**Tempo**: 5 minuti

### Step A3: Verifica Protection

```bash
# Sul tuo computer
cd /path/to/romanoing
git checkout production
git commit --allow-empty -m "test protection"
git push origin production

# ATTESO: Errore push declined
# ✅ Se fallisce = protection funziona!

# Annulla commit
git reset --hard HEAD~1
```

---

## 👥 FASE B: Setup Collaboratore GitHub

### Step B1: Invita Collaboratore

**Apri file `GITHUB_SETUP.md` e segui Section 2️⃣**

Riassunto:
1. GitHub → Settings → Collaborators → Add people
2. Inserisci username/email collaboratore
3. **Role: Admin** ⭐ (pari livello)
4. Send invitation

### Step B2: Collaboratore Accetta e Clona

**Invia al collaboratore:**

```
Ciao,

Ti ho invitato come Admin su repository romanoing.

Setup:
1. Controlla email GitHub e accetta invito
2. Clona repo:
   git clone https://github.com/romanobenit/romanoing.git
   cd romanoing/studio-erp
   npm install

3. Leggi file WORKFLOW_COLLABORATORE.md (nella root romanoing/)

4. Setup SSH server: leggeremo SERVER_ACCESS_SETUP.md insieme

Fammi sapere quando hai clonato!
```

### Step B3: Collaboratore Installa e Testa

**Collaboratore esegue:**

```bash
# Clone repository
git clone https://github.com/romanobenit/romanoing.git
cd romanoing/studio-erp

# Install dependencies
npm install

# Copy environment (chiedi credenziali a Romano)
cp .env.example .env.local
nano .env.local
# Inserisci credenziali development

# Test locale
npm run dev

# Apri browser: http://localhost:3000
# ✅ App deve partire
```

---

## 🔐 FASE C: Setup Accesso Server (Opzionale ma Consigliato)

### Quando Fare:
- ✅ Subito se vuoi che collaboratore possa deployare autonomamente
- ⏸️ Più tardi se preferisci deployare solo tu inizialmente

### Step C1: Setup Server User Deploy

**Apri file `SERVER_ACCESS_SETUP.md` e segui Section "Setup (Esegui Come Root)"**

**Sul server produzione (tu come root):**

```bash
# SSH come root
ssh -i ~/.ssh/key.txt root@116.203.109.249

# Crea user deploy
adduser deploy
# Password: genera sicura (openssl rand -base64 24)

# Aggiungi sudo
usermod -aG sudo deploy

# Configura sudoers
sudo visudo
# Aggiungi le righe indicate in SERVER_ACCESS_SETUP.md

# Test
su - deploy
sudo pm2 status
# Deve funzionare senza password ✅
exit
```

### Step C2: SSH Key Collaboratore

**Collaboratore (sul suo PC):**

```bash
# Genera SSH key
ssh-keygen -t ed25519 -C "collaboratore@email.com" -f ~/.ssh/romanoing_deploy

# Visualizza chiave pubblica
cat ~/.ssh/romanoing_deploy.pub

# Copia TUTTO l'output e invia a Romano
```

**Tu (sul server):**

```bash
# SSH come root
ssh -i ~/.ssh/key.txt root@116.203.109.249

# Passa a user deploy
su - deploy

# Crea directory SSH
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Aggiungi chiave pubblica
nano ~/.ssh/authorized_keys
# Incolla chiave ricevuta dal collaboratore
# Salva: CTRL+O, ENTER, CTRL+X

# Permessi
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step C3: Test Accesso Collaboratore

**Collaboratore (sul suo PC):**

```bash
# Test SSH
ssh -i ~/.ssh/romanoing_deploy deploy@116.203.109.249

# Se connesso ✅
# Prompt: deploy@RomanoServer:~$

# Test deploy
sudo /root/deploy-production.sh
# Deve partire senza chiedere password

# CTRL+C per interrompere
# exit per uscire

# ✅ Setup server completato!
```

---

## 📚 FASE D: Documentazione e Primo Test

### Step D1: Condividi Documentazione

**Invia al collaboratore:**

```
Setup completato! 🎉

File da leggere (nella root romanoing/):

1. WORKFLOW_COLLABORATORE.md ⭐ LEGGI QUESTO PER PRIMO
   - Workflow quotidiano completo
   - Comandi Git essenziali
   - Processo PR e deploy

2. SERVER_ACCESS_SETUP.md
   - Comandi utili server
   - Troubleshooting SSH

3. studio-erp/TODO.md
   - Task condivisi
   - Aggiorna quando inizi/finisci task

Gruppo WhatsApp: "Studio ERP Dev"
- Coordinamento deploy
- Domande veloci
- Blocchi tecnici

Pronti per prima PR di test?
```

### Step D2: Prima PR di Test (Insieme)

**Collaboratore esegue (tu segui):**

```bash
cd romanoing/studio-erp
git checkout develop
git pull origin develop

# Crea branch test
git checkout -b test/primo-task-collaboratore

# Modifica piccola (es. commento nel codice)
nano app/page.tsx
# Aggiungi commento: // Test collaboratore

git add .
git commit -m "test: Prima modifica collaboratore"
git push -u origin test/primo-task-collaboratore

# Apri PR su GitHub
# Base: develop
# Compare: test/primo-task-collaboratore
# Title: "Test workflow - Prima PR collaboratore"
```

**Tu approvi:**

1. GitHub → Pull Requests → #N
2. Review Files Changed
3. Approve
4. Merge pull request
5. Delete branch

**Collaboratore aggiorna locale:**

```bash
git checkout develop
git pull origin develop
# Deve vedere modifica mergata ✅

# ✅ Workflow funziona!
```

### Step D3: Primo Deploy Coordinato

**Pianificate insieme (WhatsApp/Slack):**

```
Romano: "Facciamo test deploy venerdì 16:00?"
Collaboratore: "✅ Ok"

# Venerdì 16:00

Romano: "Apro PR production, reviewi?"
# Apre PR develop → production
# Title: "Test Release - Verifica workflow"

Collaboratore: "Approved ✅"

Romano: "Mergio e deployo"
# Merge PR
# SSH server
# /root/deploy-production.sh

Romano: "✅ Deploy OK - verifica anche tu romanoing.com"

Collaboratore: "Verificato ✅ Tutto funziona"

# 🎉 Primo deploy coordinato riuscito!
```

---

## ✅ Checklist Finale Setup Completato

### Repository Git:
- [ ] Branch production creato e pushato
- [ ] Branch develop creato e pushato
- [ ] Branch protection configurata su production
- [ ] Verifica protection funzionante (test push diretto fallisce)

### Collaboratore GitHub:
- [ ] Invito inviato e accettato
- [ ] Role Admin confermato
- [ ] Repository clonato in locale
- [ ] npm install completato
- [ ] App funziona in locale (npm run dev)

### Accesso Server (opzionale):
- [ ] User deploy creato su server
- [ ] Sudoers configurato
- [ ] SSH key collaboratore aggiunta
- [ ] Test accesso SSH riuscito
- [ ] Test deploy script funzionante

### Documentazione:
- [ ] WORKFLOW_COLLABORATORE.md condiviso
- [ ] SERVER_ACCESS_SETUP.md disponibile
- [ ] TODO.md creato e spiegato
- [ ] Gruppo WhatsApp/Slack creato

### Test Workflow:
- [ ] Prima PR test completata
- [ ] Review reciproca funzionante
- [ ] Merge riuscito
- [ ] Deploy coordinato testato

---

## 🎯 Prossimi Step (Post-Setup)

### Immediate (Questa Settimana):
- [ ] Assegnare primo task reale al collaboratore (TODO.md)
- [ ] Stabilire orario sync settimanale (es. venerdì 16:00)
- [ ] Decidere naming convention branch (già in WORKFLOW_COLLABORATORE.md)

### Breve Termine (Prossime 2 Settimane):
- [ ] 3-4 PR reali completate
- [ ] 1-2 deploy coordinati riusciti
- [ ] Workflow consolidato e naturale

### Medio Termine (1-2 Mesi):
- [ ] Valutare se serve Fase 2 (staging branch, GitHub Projects)
- [ ] Review sicurezza accessi
- [ ] Ottimizzare processo deploy (automazioni?)

---

## ❓ Troubleshooting Comuni

### "Script SETUP_BRANCH_STRUCTURE.sh non si esegue"

```bash
# Windows Git Bash:
bash SETUP_BRANCH_STRUCTURE.sh

# Mac/Linux terminal:
chmod +x SETUP_BRANCH_STRUCTURE.sh
./SETUP_BRANCH_STRUCTURE.sh

# Se ancora errori:
# Esegui comandi manualmente (aperti nel file .sh)
```

### "Push declined due to branch protection rule"

✅ **NORMALE!** Protection funziona.
Soluzione: Usa PR (workflow corretto).

```bash
# Invece di push diretto:
git checkout -b feature/nome
git push origin feature/nome
# Apri PR su GitHub
```

### "Collaboratore non riceve invito GitHub"

1. Controlla spam email
2. Verifica username corretto
3. Reinvia invito: Settings → Collaborators → Reinvite

### "SSH connection refused collaboratore"

```bash
# Verifica:
1. Chiave pubblica corretta su server
2. User deploy esiste (su server: id deploy)
3. Permessi authorized_keys corretti (600)
4. Firewall porta 22 aperta (dovrebbe già esserlo)

# Test da server:
su - deploy
cat ~/.ssh/authorized_keys
# Deve mostrare chiave collaboratore
```

### "sudo chiede password a user deploy"

```bash
# Su server come root:
sudo visudo
# Verifica righe NOPASSWD per deploy user
# Salva e riprova
```

---

## 📞 Supporto

### Se blocchi:
1. Controlla section troubleshooting file specifico
2. Cerca errore su Google/StackOverflow
3. Chiedi nel gruppo dev (se già configurato)
4. Documenta soluzione in file per futuri riferimenti

### File di riferimento per problema:
- **Git/Branch**: `GITHUB_SETUP.md`
- **Workflow quotidiano**: `WORKFLOW_COLLABORATORE.md`
- **Server SSH**: `SERVER_ACCESS_SETUP.md`
- **Deploy**: `DEPLOYMENT_GUIDE.md`

---

## 🎓 Risorse Aggiuntive

### Convenzioni Git:
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

### ISO 27001 Compliance:
- Branch protection = 4-eyes principle ✅
- User separati server = separation of duties ✅
- Audit trail GitHub + server logs ✅
- Backup automatici deploy ✅

### Next Steps (Fase 2 - Futuro):
- Staging branch
- GitHub Projects Kanban
- GitHub Actions CI/CD
- Test automatici

---

## 🎉 Congratulazioni!

Setup Fase 1 completato! Ora tu e il collaboratore potete:

✅ Lavorare in parallelo su feature diverse
✅ Revieware codice reciprocamente (qualità ↑)
✅ Deployare entrambi autonomamente (flessibilità ↑)
✅ Tracciabilità completa (ISO 27001 ✅)
✅ Rollback rapido se problemi

**Workflow minimo vitale operativo!**

Lavorate così per 4-8 settimane, poi rivalutate se serve Fase 2 (staging, sprint, metriche).

---

**Domande? Aggiungi a questa guida e committa miglioramenti!**

**Buon lavoro! 🚀**
