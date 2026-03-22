# 🔍 Server Diagnosis - SSH Connection Issues

## ✅ Stato Attuale Connessione

```bash
✅ Server PING: OK (116.203.109.249 risponde)  
✅ Porta SSH 22: APERTA e accetta connessioni
✅ SSH Host Keys: DISPONIBILI (server SSH attivo)
❌ Connessione SSH: TIMEOUT durante handshake
```

## 🔎 Possibili Cause

### 1. **Problema Autenticazione SSH** (più probabile)
- La chiave SSH nei GitHub Secrets non corrisponde alle authorized_keys del server
- La chiave SSH ha una passphrase ma il workflow non la gestisce correttamente  
- L'utente root ha restrizioni SSH (PermitRootLogin)

### 2. **Problema Configurazione SSH Server**
- SSH configurato per accettare solo chiavi specifiche
- MaxAuthTries raggiunto (troppe connessioni fallite)
- SSH jail/ban temporaneo per troppi tentativi

### 3. **Problema di Rete/Firewall**
- Firewall applicativo blocca connessioni prolungate
- ISP/Provider blocca connessioni SSH prolungate
- Rate limiting a livello di rete

## 🛠️ Soluzioni Immediate

### Soluzione 1: Reset Completo SSH
```bash
# OPZIONE A: Se hai accesso fisico o console Hetzner
# Accedi via console Hetzner Cloud e esegui:

# 1. Rimuovi chiavi esistenti
rm -f ~/.ssh/authorized_keys

# 2. Genera nuova chiave senza passphrase per il test
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# 3. Aggiungi alla authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 4. Mostra chiave privata per GitHub Secrets
cat ~/.ssh/github_deploy

# 5. Riavvia SSH
systemctl restart ssh
```

### Soluzione 2: Debug SSH Connection
```bash
# Test connessione SSH con debug verbose
ssh -vvv -o ConnectTimeout=10 root@116.203.109.249

# Output atteso:
# - "debug1: Authentication succeeded" = OK
# - "debug1: Connection timeout" = problema rete
# - "Permission denied" = problema chiave/auth
```

### Soluzione 3: Usa Console Hetzner
```bash
# Se SSH non funziona, usa Hetzner Cloud Console:
# 1. Vai su https://console.hetzner.cloud/
# 2. Seleziona il server "studio-erp-prod"
# 3. Click "Console" per accesso web terminal
# 4. Esegui i comandi di debug direttamente
```

## 🔧 Fix Workflow GitHub Actions

### Modifica Temporanea - SSH Senza Passphrase
```yaml
- name: Configure SSH key (SIMPLIFIED)
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
    chmod 600 ~/.ssh/id_ed25519
    
    # NO passphrase per ora - test semplificato
    ssh-agent -s
    ssh-add ~/.ssh/id_ed25519
    
    # Host keys
    ssh-keyscan -H 116.203.109.249 >> ~/.ssh/known_hosts
    
    # Test connessione VERBOSE
    ssh -vvv -o ConnectTimeout=30 root@116.203.109.249 "echo 'SSH OK'"
```

### Debug Step Aggiuntivo  
```yaml
- name: Debug SSH Connection Issues
  run: |
    echo "=== Network Connectivity ==="
    ping -c 3 116.203.109.249
    
    echo "=== Port Scan ==="
    nc -zv 116.203.109.249 22
    
    echo "=== SSH Host Keys ==="
    ssh-keyscan 116.203.109.249
    
    echo "=== SSH Auth Test ==="
    timeout 30 ssh -vvv -o ConnectTimeout=30 \
      -o StrictHostKeyChecking=no \
      root@116.203.109.249 \
      "echo 'Connection successful'" || echo "SSH failed with exit code $?"
```

## 📋 Action Plan

### Immediato (fai ORA):
1. **Accedi via Hetzner Console** (web terminal)
2. **Genera nuova chiave SSH** senza passphrase  
3. **Aggiorna GitHub Secret** SSH_PRIVATE_KEY
4. **Rimuovi** SSH_PASSPHRASE dai secrets (temporaneamente)
5. **Re-run deployment** con workflow semplificato

### Medio termine:
1. Una volta funzionante, ri-aggiungi passphrase per security
2. Test completo del processo di deployment
3. Setup monitoring per evitare problemi futuri

## 🚨 Link Utili

- **Hetzner Console**: https://console.hetzner.cloud/
- **Server Logs**: `journalctl -u ssh -f`  
- **SSH Config**: `/etc/ssh/sshd_config`
- **Auth Log**: `/var/log/auth.log`

---

**Prossimo Step**: Accedi via console Hetzner e genera una nuova chiave SSH pulita! 🔑