# 🔐 GitHub Secrets Richiesti per Deployment

## 📋 Lista Secrets Obbligatori

Questi secrets devono essere configurati in **Settings → Secrets and variables → Actions**:

### 🖥️ **Server & SSH**
| Nome | Descrizione | Esempio |
|------|-------------|---------|
| `PRODUCTION_SERVER_IP` | IP del server Hetzner | `116.203.109.249` |
| `SSH_PRIVATE_KEY` | Chiave privata SSH per accesso server | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### 🗄️ **Database**
| Nome | Descrizione | Esempio |
|------|-------------|---------|
| `POSTGRESQL_PASSWORD` | Password utente PostgreSQL | `GenerateRandomPassword123!` |

### 🔐 **Autenticazione**
| Nome | Descrizione | Esempio |
|------|-------------|---------|
| `NEXTAUTH_SECRET` | Secret per NextAuth.js (min 32 char) | `openssl rand -base64 32` |

### 💳 **Pagamenti Stripe**
| Nome | Descrizione | Esempio |
|------|-------------|---------|
| `STRIPE_SECRET_KEY` | Chiave segreta Stripe LIVE | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Chiave pubblica Stripe LIVE | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | `whsec_...` |

### 📧 **Email SendGrid**
| Nome | Descrizione | Esempio |
|------|-------------|---------|
| `SENDGRID_API_KEY` | Chiave API SendGrid | `SG.xxxxx...` |

### 🔧 **Ansible**
| Nome | Descrizione | Come Generare |
|------|-------------|---------------|
| `ANSIBLE_VAULT_PASSWORD` | Password per Ansible Vault | `openssl rand -base64 32` |

## 🔧 **Secrets Opzionali**

### 📊 **Monitoring (Opzionale)**
| Nome | Descrizione |
|------|-------------|
| `SENTRY_DSN` | Sentry per error tracking |
| `SENTRY_AUTH_TOKEN` | Token auth Sentry per deploy tracking |

### 🚀 **Redis (Opzionale - Rate Limiting)**
| Nome | Descrizione |
|------|-------------|
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash |

### 🎯 **AI Services (Opzionale)**
| Nome | Descrizione |
|------|-------------|
| `OPENAI_API_KEY` | Chiave OpenAI se utilizzata |

### 📦 **Backup (Opzionale)**
| Nome | Descrizione |
|------|-------------|
| `HETZNER_API_TOKEN` | Token API Hetzner per backup |
| `BACKUP_ENCRYPTION_PASSPHRASE` | Passphrase per crittografia backup |
| `GRAFANA_ADMIN_PASSWORD` | Password admin Grafana |

### 🔍 **Security Scanning (Opzionale)**
| Nome | Descrizione |
|------|-------------|
| `SNYK_TOKEN` | Token Snyk per security scan |

---

## 🚨 **Come Configurare i Secrets**

### 1. Vai su GitHub Repository
```
Settings → Secrets and variables → Actions → New repository secret
```

### 2. Aggiungi i Secrets Obbligatori
Inizia con questi essenziali per far funzionare il deployment:
- `PRODUCTION_SERVER_IP` = `116.203.109.249`
- `SSH_PRIVATE_KEY` = (chiave SSH privata per accesso al server)
- `POSTGRESQL_PASSWORD` = (password database)
- `NEXTAUTH_SECRET` = (genera con `openssl rand -base64 32`)
- `ANSIBLE_VAULT_PASSWORD` = (genera con `openssl rand -base64 32`)

### 3. Aggiungi Stripe (per pagamenti)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY` 
- `STRIPE_WEBHOOK_SECRET`

### 4. Aggiungi SendGrid (per email)
- `SENDGRID_API_KEY`

---

## 🔄 **Verifica Secrets**

Prima del deployment, verifica di aver configurato almeno questi secrets critici:

```bash
# Usa questo comando per verificare (sostituisci con i tuoi valori):
echo "Secrets da verificare:"
echo "- PRODUCTION_SERVER_IP: configurato"
echo "- SSH_PRIVATE_KEY: configurato" 
echo "- POSTGRESQL_PASSWORD: configurato"
echo "- NEXTAUTH_SECRET: configurato"
echo "- ANSIBLE_VAULT_PASSWORD: configurato"
```

## ⚠️ **Note Importanti**

1. **Mai committare secrets** nel codice
2. **Usa password robuste** per database e vault
3. **Chiavi Stripe LIVE** solo in produzione
4. **Backup secrets** in luogo sicuro offline
5. **Ruota secrets** periodicamente per sicurezza

Una volta configurati tutti i secrets obbligatori, il deployment dovrebbe funzionare correttamente!