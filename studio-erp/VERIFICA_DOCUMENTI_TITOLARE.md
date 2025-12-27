# Verifica Visualizzazione Documenti - Ruolo TITOLARE

## ✅ Accessi Permessi

Il middleware permette al TITOLARE di accedere a:
- ✅ `/collaboratore/*` (incluso `/collaboratore/documenti`)
- ✅ `/admin/*` (route dedicate admin)
- File: `lib/auth.config.ts:53`

## 📄 Pagine Documenti Accessibili al TITOLARE

### 1. `/collaboratore/documenti` (Lista Completa)
**File**: `app/(protected)/collaboratore/documenti/page.tsx`

**Funzionalità Implementate**:
- ✅ `handleView` - Apertura inline con `disposition=inline`
- ✅ `handleDownload` - Download con fetch+blob pattern
- ✅ `handleApprove` - Approvazione documenti
- ✅ `handleReject` - Rifiuto documenti
- ✅ `handleDelete` - Eliminazione documenti

**Verificato**:
```typescript
const handleView = (doc: Documento) => {
  window.open(`/api/documenti/${doc.id}/download?disposition=inline`, '_blank')
}

const handleDownload = async (doc: Documento) => {
  const response = await fetch(`/api/documenti/${doc.id}/download?disposition=attachment`)
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = doc.nomeFile
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
```

### 2. `/collaboratore/incarichi/[id]` (Documenti per Incarico)
**File**: `app/(protected)/collaboratore/incarichi/[id]/page.tsx`

**Componente Usato**: `DocumentiSection`
**File**: `components/documenti-section.tsx`

**Funzionalità**:
- ✅ Stesso pattern handleView/handleDownload
- ✅ Upload documenti
- ✅ Approvazione/Rifiuto
- ✅ Eliminazione

## 🔒 API Permessi

### GET `/api/documenti/[id]/download`
**File**: `app/api/documenti/[id]/download/route.ts`

**Verifica Permessi**:
```typescript
const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO'] // ✅ TITOLARE incluso
const isCollaboratore = ruoliCollaboratori.includes(session.user.ruolo)
```

**Caratteristiche**:
- ✅ Supporto `disposition=inline` per visualizzazione
- ✅ Supporto `disposition=attachment` per download
- ✅ Path traversal protection
- ✅ Audit logging implementato

### GET `/api/collaboratore/documenti`
**File**: `app/api/collaboratore/documenti/route.ts`

**Permessi**: Solo collaboratori (TITOLARE, SENIOR, JUNIOR, ESTERNO)
**Query**: Filtra per `uploadedBy` dell'utente loggato

## 🧪 Test Manuali Richiesti

### Test 1: Visualizzazione Documento (Inline)
1. Login come TITOLARE
2. Vai a `/collaboratore/documenti`
3. Click su "Visualizza" (icona occhio) su un documento
4. **Risultato Atteso**: Si apre nuova tab con documento visualizzato inline
5. **URL**: `/api/documenti/[id]/download?disposition=inline`

### Test 2: Download Documento
1. Login come TITOLARE
2. Vai a `/collaboratore/documenti`
3. Click su "Download" (icona download) su un documento
4. **Risultato Atteso**: File scaricato automaticamente senza popup
5. **Network**: Verifica che usi fetch (non window.open)

### Test 3: Documenti per Incarico
1. Login come TITOLARE
2. Vai a `/collaboratore/incarichi/[id]`
3. Sezione "Documenti"
4. Testa Visualizza e Download
5. **Risultato Atteso**: Stesso comportamento di Test 1 e 2

### Test 4: Caricamento Documento
1. Login come TITOLARE
2. Vai a `/collaboratore/documenti` o `/collaboratore/incarichi/[id]`
3. Click "Carica documento"
4. Upload file
5. **Risultato Atteso**:
   - File caricato con successo
   - Rate limit: max 20 upload/ora
   - Audit log creato

## 🐛 Possibili Problemi da Verificare

### 1. Console Errors
```bash
# Aprire DevTools Console e verificare:
- Errori CORS
- Errori 403 Forbidden
- Errori 429 Too Many Requests (rate limiting)
- Errori di rete
```

### 2. Network Tab
```bash
# Verificare chiamate API:
GET /api/documenti/[id]/download?disposition=inline
GET /api/documenti/[id]/download?disposition=attachment

# Headers attesi nella response:
Content-Disposition: inline; filename="..."
Content-Disposition: attachment; filename="..."
Content-Type: application/pdf (o altro MIME type)
X-RateLimit-Limit: ...
X-RateLimit-Remaining: ...
```

### 3. Session/Auth
```bash
# Verificare che la sessione contenga:
session.user.ruolo === 'TITOLARE'
session.user.id (presente e valido)
```

### 4. Database
```sql
-- Verificare che i documenti esistano
SELECT * FROM documenti WHERE uploaded_by = [TITOLARE_USER_ID];

-- Verificare path_storage
SELECT id, nome_file, path_storage
FROM documenti
WHERE path_storage IS NOT NULL;
```

## 📝 Commit Rilevanti

- `4e26333` - fix: Download con fetch+blob
- `8771d07` - feat: Visualizzazione inline documenti
- `f0f0898` - feat: Rate limiting + audit logging
- `a263671` - refactor: Type safety (Documento interface)

## ⚠️ Note Importanti

1. **Rate Limiting**: Max 20 upload/ora per TITOLARE
2. **Audit Logging**: Ogni download/upload viene tracciato
3. **Popup Blocker**: Fix applicato con fetch+blob pattern
4. **File Types**: PDF, DOC, DOCX, DWG, DXF, ZIP supportati

## 🔍 Debug Steps

Se il problema persiste:

1. **Check Session**:
```typescript
console.log('User:', session.user)
console.log('Ruolo:', session.user.ruolo)
```

2. **Check API Response**:
```typescript
const res = await fetch('/api/documenti/1/download?disposition=inline')
console.log('Status:', res.status)
console.log('Headers:', [...res.headers.entries()])
```

3. **Check File Path**:
```sql
SELECT id, nome_file, path_storage, LENGTH(path_storage) as path_len
FROM documenti
WHERE id = 1;
```

4. **Check Permissions**:
```sql
SELECT d.id, d.nome_file, i.id as incarico_id, i.cliente_id
FROM documenti d
JOIN incarichi i ON d.incarico_id = i.id
WHERE d.id = 1;
```

## ✅ Conclusione Verifica

**Codice**: ✅ Implementazione corretta per TITOLARE
**API**: ✅ Permessi configurati correttamente
**Frontend**: ✅ handleView/handleDownload implementati
**Commits**: ✅ Tutte le fix pushate al branch

**Next Step**: Eseguire test manuali e fornire log specifici di eventuali errori
