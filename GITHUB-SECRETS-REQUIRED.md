# 🔐 GitHub Secrets Required - Studio Romano ERP

## 📋 Checklist Secrets Obbligatori

### 🔑 SSH Deployment
```bash
SSH_PRIVATE_KEY     # Contenuto completo di ~/.ssh/id_ed25519 dal server
SSH_PASSPHRASE      # Passphrase della chiave SSH (es: Studio2025Deploy!)
PRODUCTION_SERVER_IP # 116.203.109.249
```

### 📧 Email Notifications (SendGrid)
```bash
SENDGRID_API_KEY    # Formato: SG.xxxxxxxxxx (Full Access)
```

### 🛠️ Optional Secrets (per funzionalità avanzate)
```bash
SNYK_TOKEN          # Security scanning (opzionale)
SENTRY_DSN          # Error monitoring (opzionale)
SENTRY_AUTH_TOKEN   # Deployment notifications (opzionale)
ANSIBLE_VAULT_PASSWORD # Per secrets cifrati (usato in futuro)
```

## 🚀 Come Configurare

### 1. Generare Chiave SSH (SUL SERVER)
```bash
# Connettiti al server
ssh root@116.203.109.249

# Genera chiave con passphrase
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -C "github-actions-deploy"
# Inserisci passphrase sicura: Studio2025Deploy!

# Aggiungi alle authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys ~/.ssh/id_ed25519

# Mostra chiave privata (COPIA TUTTO)
cat ~/.ssh/id_ed25519
```

### 2. Ottenere SendGrid API Key
```bash
# Vai su: https://app.sendgrid.com/settings/api_keys
# 1. Click "Create API Key"
# 2. Scegli "Full Access"  
# 3. Nome: "GitHub Actions Deploy"
# 4. COPIA la chiave generata (SG.xxxx)
```

### 3. Aggiungere Secrets su GitHub
```bash
# URL: https://github.com/TUO_USERNAME/TUO_REPO/settings/secrets/actions

# Click "New repository secret" per ognuno:

Nome: SSH_PRIVATE_KEY
Valore: [Incolla il contenuto COMPLETO di ~/.ssh/id_ed25519]
        Deve iniziare con: -----BEGIN OPENSSH PRIVATE KEY-----
        E finire con:      -----END OPENSSH PRIVATE KEY-----

Nome: SSH_PASSPHRASE  
Valore: Studio2025Deploy!

Nome: PRODUCTION_SERVER_IP
Valore: 116.203.109.249

Nome: SENDGRID_API_KEY
Valore: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ✅ Verifica Configurazione

### Test SSH Key Locale (opzionale)
```bash
# Dal tuo computer, se hai la chiave:
ssh -i ~/.ssh/id_ed25519 root@116.203.109.249 "echo 'SSH OK'"
```

### Test SendGrid API Key
```bash
curl -X "GET" "https://api.sendgrid.com/v3/user/account" \
     -H "Authorization: Bearer SG.your-api-key"

# Deve ritornare i tuoi dati account, non errore 401
```

## 🐛 Troubleshooting

### Errore "Invalid login: 535 Authentication failed"
- ✅ Verifica che SENDGRID_API_KEY sia nel formato corretto: `SG.xxx`
- ✅ Assicurati che l'API Key abbia "Full Access" permissions
- ✅ L'API Key non deve essere scaduta

### Errore "No such file or directory" (SSH key)
- ✅ Verifica che SSH_PRIVATE_KEY contenga la chiave COMPLETA
- ✅ Include anche le righe -----BEGIN/END-----
- ✅ Non ci devono essere spazi extra all'inizio/fine

### Errore "Connection timeout"
- ✅ Verifica che PRODUCTION_SERVER_IP sia corretto
- ✅ Il server deve essere acceso e raggiungibile
- ✅ La porta 22 deve essere aperta nel firewall

## 🔄 Re-Run Deployment

Dopo aver configurato tutti i secrets:

1. Vai su GitHub Actions: `https://github.com/TUO_USERNAME/TUO_REPO/actions`
2. Seleziona il workflow "Deploy to Production" fallito
3. Click "Re-run all jobs"

Il deployment dovrebbe ora completarsi con successo! 🎉

---

**Nota**: Mantieni questi secrets sicuri e non condividerli mai pubblicamente.