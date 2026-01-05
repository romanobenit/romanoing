# 🔧 Configurazione GitHub - Workflow Fase 1

## Prerequisiti
- ✅ Branch `production` e `develop` creati (esegui `SETUP_BRANCH_STRUCTURE.sh` se non fatto)
- ✅ Account GitHub collaboratore

---

## 1️⃣ Configurazione Branch Protection

### Step 1: Vai su GitHub

1. Apri browser → https://github.com/romanobenit/romanoing
2. Clicca tab **Settings**
3. Nel menu laterale: **Branches**

### Step 2: Proteggi Branch `production`

1. Clicca **Add branch protection rule**
2. Compila i campi:

```
Branch name pattern: production

☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☐ Require review from Code Owners (lascia vuoto)

☐ Require status checks to pass before merging (per ora disabilitato)

☑ Require conversation resolution before merging

☐ Require signed commits (opzionale - avanzato)

☑ Require linear history (mantiene storia pulita)

☑ Include administrators
  ⚠️ IMPORTANTE: Anche tu devi seguire le regole (ISO requirement!)

☐ Restrict who can dismiss pull request reviews (lascia vuoto)

☐ Restrict who can push to matching branches (lascia vuoto - entrambi pari)

☐ Allow force pushes: NEVER
☐ Allow deletions: NEVER
```

3. Clicca **Create** in fondo alla pagina

✅ **Risultato**: Nessuno (nemmeno voi 2) può pushare direttamente su `production`. Sempre via PR con 1 approval.

### Step 3: Branch `develop` (Opzionale - Consigliato)

Ripeti processo sopra per branch `develop` con regole più permissive:

```
Branch name pattern: develop

☑ Require a pull request before merging
  ☑ Require approvals: 1

☐ Include administrators (puoi lasciare disabilitato - più flessibilità)

Resto: lascia default
```

✅ **Risultato**: Feature branch richiedono PR per merge su develop, ma più flessibile.

---

## 2️⃣ Invita Collaboratore

### Step 1: Aggiungi Collaboratore

1. GitHub → **Settings** → **Collaborators**
2. Clicca **Add people**
3. Inserisci username/email GitHub collaboratore
4. Seleziona role: **Admin** ⭐
   - Admin = pieno accesso (configurazione paritaria)
5. Clicca **Add [username] to this repository**

### Step 2: Collaboratore Accetta Invito

1. Collaboratore riceve email da GitHub
2. Clicca link conferma
3. Accetta invito

✅ **Risultato**: Collaboratore ha accesso Admin (pari a te)

---

## 3️⃣ Verifica Configurazione

### Checklist Finale:

```bash
# Sul tuo computer
git fetch --all
git branch -a

# Dovresti vedere:
  master
  production
  develop
  remotes/origin/master
  remotes/origin/production
  remotes/origin/develop
```

### Test Branch Protection:

```bash
# Prova a pushare direttamente su production (deve fallire)
git checkout production
git commit --allow-empty -m "test"
git push origin production

# ATTESO: Errore tipo "push declined due to branch protection"
# ✅ Se fallisce = protezione funziona!
```

---

## 4️⃣ Comunicazione con Collaboratore

### Invia al collaboratore:

```
Ciao,

Ti ho aggiunto al repository romanoing su GitHub con accesso Admin.

Setup iniziale:
1. Accetta invito GitHub (controlla email)
2. Clona repo: git clone https://github.com/romanobenit/romanoing.git
3. Entra: cd romanoing/studio-erp
4. Leggi file: WORKFLOW_COLLABORATORE.md

Branch structure:
- production = codice live su romanoing.com (protetto)
- develop = lavoro quotidiano nostro
- feature/* = branch temporanei per task

Workflow:
1. Sempre partire da develop
2. Creare feature branch
3. PR per merge
4. Deploy da production

Domande? Scriviamoci su WhatsApp/Slack.
```

---

## 5️⃣ Prossimi Step

- [ ] Setup SSH collaboratore su server (vedi `SERVER_ACCESS_SETUP.md`)
- [ ] Creare TODO.md per tracking task
- [ ] Prima PR di prova insieme
- [ ] Primo deploy coordinato

---

## 📚 File Correlati

- `WORKFLOW_COLLABORATORE.md` - Guida workflow per collaboratore
- `SERVER_ACCESS_SETUP.md` - Setup accesso SSH server
- `TODO.md` - Template tracking task
- `DEPLOYMENT_GUIDE.md` - Procedura deploy produzione

---

## ❓ Troubleshooting

### "Non vedo branch protection rules"
- Verifica di essere Owner del repository
- Settings → Branches deve essere accessibile

### "Collaboratore non riceve invito"
- Controlla email spam
- Verifica username GitHub corretto
- Reinvia invito da Settings → Collaborators

### "Push declined on production"
- ✅ NORMALE! Protezione funziona
- Usa sempre PR: develop → production

### "Collaboratore non può mergare production"
- Verifica sia Admin (Settings → Collaborators)
- Verifica abbia approvato PR (1 approval required)

---

## 🎯 Configurazione Finale Attesa

```
Repository: romanoing
├─ Branches:
│  ├─ master (legacy, può rimanere)
│  ├─ production (protetto - PR + 1 approval) ⭐
│  └─ develop (opzionalmente protetto) ⭐
│
├─ Collaboratori:
│  ├─ romanobenit (Owner - Admin)
│  └─ [collaboratore] (Admin) ⭐
│
└─ Branch Protection:
   └─ production: PR required + 1 approval + no force push ⭐
```

✅ Setup completo per workflow Fase 1 paritario!
