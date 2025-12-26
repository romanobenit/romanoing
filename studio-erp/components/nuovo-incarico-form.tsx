'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

interface NuovoIncaricoFormProps {
  onSuccess: (incarico: any) => void
  onCancel: () => void
}

export function NuovoIncaricoForm({ onSuccess, onCancel }: NuovoIncaricoFormProps) {
  const [loading, setLoading] = useState(false)
  const [clienti, setClienti] = useState<any[]>([])
  const [bundle, setBundle] = useState<any[]>([])
  const [collaboratori, setCollaboratori] = useState<any[]>([])

  const [formData, setFormData] = useState({
    cliente_id: '',
    bundle_id: '0',
    oggetto: '',
    descrizione: '',
    importo_totale: '',
    responsabile_id: '',
    data_inizio: '',
    data_scadenza: '',
    priorita: 'MEDIA',
    note: '',
  })

  useEffect(() => {
    // Fetch clienti, bundle, collaboratori
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch clienti
      const clientiRes = await fetch('/api/clienti')
      const clientiData = await clientiRes.json()
      if (clientiData.success) {
        setClienti(clientiData.data || [])
      }

      // Fetch bundle
      const bundleRes = await fetch('/api/bundle')
      const bundleData = await bundleRes.json()
      if (bundleData.success) {
        setBundle(bundleData.data || [])
      }

      // Fetch collaboratori
      const collabRes = await fetch('/api/collaboratori')
      const collabData = await collabRes.json()
      if (collabData.success) {
        setCollaboratori(collabData.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepara i dati convertendo "0" in null per bundle_id
      const payload = {
        ...formData,
        bundle_id: formData.bundle_id === "0" ? null : formData.bundle_id,
      }

      const res = await fetch('/api/collaboratore/incarichi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        onSuccess(data.data)
      } else {
        alert(data.error || 'Errore creazione incarico')
      }
    } catch (error) {
      console.error('Errore:', error)
      alert('Errore creazione incarico')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Cliente */}
        <div className="space-y-2">
          <Label htmlFor="cliente_id">
            Cliente <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.cliente_id}
            onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona cliente" />
            </SelectTrigger>
            <SelectContent>
              {clienti.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id.toString()}>
                  {cliente.ragione_sociale || `${cliente.nome} ${cliente.cognome}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bundle */}
        <div className="space-y-2">
          <Label htmlFor="bundle_id">Bundle (opzionale)</Label>
          <Select
            value={formData.bundle_id}
            onValueChange={(value) => setFormData({ ...formData, bundle_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona bundle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Nessuno</SelectItem>
              {bundle.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Oggetto */}
      <div className="space-y-2">
        <Label htmlFor="oggetto">
          Oggetto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="oggetto"
          value={formData.oggetto}
          onChange={(e) => setFormData({ ...formData, oggetto: e.target.value })}
          placeholder="Es: Ristrutturazione Villa Rossi"
          required
        />
      </div>

      {/* Descrizione */}
      <div className="space-y-2">
        <Label htmlFor="descrizione">Descrizione</Label>
        <Textarea
          id="descrizione"
          value={formData.descrizione}
          onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
          placeholder="Descrizione dettagliata dell'incarico..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Importo */}
        <div className="space-y-2">
          <Label htmlFor="importo_totale">
            Importo Totale (€) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="importo_totale"
            type="number"
            step="0.01"
            min="0"
            value={formData.importo_totale}
            onChange={(e) => setFormData({ ...formData, importo_totale: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        {/* Responsabile */}
        <div className="space-y-2">
          <Label htmlFor="responsabile_id">
            Responsabile <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.responsabile_id}
            onValueChange={(value) => setFormData({ ...formData, responsabile_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona responsabile" />
            </SelectTrigger>
            <SelectContent>
              {collaboratori.map((collab) => (
                <SelectItem key={collab.id} value={collab.id.toString()}>
                  {collab.nome} {collab.cognome} ({collab.ruolo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Data Inizio */}
        <div className="space-y-2">
          <Label htmlFor="data_inizio">Data Inizio</Label>
          <Input
            id="data_inizio"
            type="date"
            value={formData.data_inizio}
            onChange={(e) => setFormData({ ...formData, data_inizio: e.target.value })}
          />
        </div>

        {/* Data Scadenza */}
        <div className="space-y-2">
          <Label htmlFor="data_scadenza">Data Scadenza</Label>
          <Input
            id="data_scadenza"
            type="date"
            value={formData.data_scadenza}
            onChange={(e) => setFormData({ ...formData, data_scadenza: e.target.value })}
          />
        </div>

        {/* Priorità */}
        <div className="space-y-2">
          <Label htmlFor="priorita">Priorità</Label>
          <Select
            value={formData.priorita}
            onValueChange={(value) => setFormData({ ...formData, priorita: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BASSA">Bassa</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="URGENTE">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Note aggiuntive..."
          rows={2}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creazione...' : 'Crea Incarico'}
        </Button>
      </div>
    </form>
  )
}
