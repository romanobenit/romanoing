"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PreferenzeNotifiche {
  email_attivo: boolean;
  notifica_nuovo_documento: boolean;
  notifica_messaggio: boolean;
  notifica_richiesta_pagamento: boolean;
  notifica_stato_incarico: boolean;
  notifica_richiesta_documento: boolean;
}

const preferenzeDefault: PreferenzeNotifiche = {
  email_attivo: true,
  notifica_nuovo_documento: true,
  notifica_messaggio: true,
  notifica_richiesta_pagamento: true,
  notifica_stato_incarico: true,
  notifica_richiesta_documento: true,
};

export default function PreferenzePage() {
  const { data: session, status } = useSession();
  const [preferenze, setPreferenze] = useState<PreferenzeNotifiche>(preferenzeDefault);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Carica preferenze attuali
  useEffect(() => {
    if (status === "authenticated") {
      fetchPreferenze();
    }
  }, [status]);

  const fetchPreferenze = async () => {
    try {
      const response = await fetch('/api/cliente/preferenze');
      const data = await response.json();
      
      if (data.success) {
        setPreferenze(data.preferenze || preferenzeDefault);
      } else {
        console.error('Error loading preferences:', data.error);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvaPreferenze = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/cliente/preferenze', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenze),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Preferenze salvate con successo!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error || 'Errore durante il salvataggio');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Errore durante il salvataggio' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof PreferenzeNotifiche) => {
    setPreferenze(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.ruolo !== "COMMITTENTE") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
          <p className="text-gray-600">Non sei autorizzato a visualizzare questa pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferenze Notifiche</h1>
          <p className="text-gray-600 mt-2">
            Gestisci come e quando ricevi le notifiche email
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Controllo Principale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notifiche Email
                <Badge variant={preferenze.email_attivo ? "default" : "secondary"}>
                  {preferenze.email_attivo ? "Attive" : "Disattivate"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Controlla se vuoi ricevere email da Studio Ing. Romano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggle('email_attivo')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferenze.email_attivo ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferenze.email_attivo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="font-medium">
                  {preferenze.email_attivo ? 'Ricevi email' : 'Non ricevere email'}
                </span>
              </div>
              
              {!preferenze.email_attivo && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Attenzione:</strong> Disattivando le email non riceverai notifiche importanti 
                    su pagamenti, documenti e messaggi dal tecnico.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifiche Specifiche */}
          <Card className={!preferenze.email_attivo ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle>Tipi di Notifica</CardTitle>
              <CardDescription>
                Scegli quali email vuoi ricevere (solo se le email sono attive)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Nuovo Documento */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">📄 Nuovi Documenti</h3>
                  <p className="text-sm text-gray-600">
                    Quando il tecnico carica un nuovo documento per te
                  </p>
                </div>
                <button
                  disabled={!preferenze.email_attivo}
                  onClick={() => handleToggle('notifica_nuovo_documento')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                    preferenze.notifica_nuovo_documento ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferenze.notifica_nuovo_documento ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Messaggi */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">💬 Nuovi Messaggi</h3>
                  <p className="text-sm text-gray-600">
                    Quando ricevi un messaggio dal tecnico
                  </p>
                </div>
                <button
                  disabled={!preferenze.email_attivo}
                  onClick={() => handleToggle('notifica_messaggio')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                    preferenze.notifica_messaggio ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferenze.notifica_messaggio ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Richieste Pagamento */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">💳 Richieste di Pagamento</h3>
                  <p className="text-sm text-gray-600">
                    Quando è disponibile una nuova milestone da pagare
                  </p>
                </div>
                <button
                  disabled={!preferenze.email_attivo}
                  onClick={() => handleToggle('notifica_richiesta_pagamento')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                    preferenze.notifica_richiesta_pagamento ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferenze.notifica_richiesta_pagamento ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Stato Incarico */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">📋 Aggiornamenti Incarico</h3>
                  <p className="text-sm text-gray-600">
                    Quando cambia lo stato del tuo incarico
                  </p>
                </div>
                <button
                  disabled={!preferenze.email_attivo}
                  onClick={() => handleToggle('notifica_stato_incarico')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                    preferenze.notifica_stato_incarico ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferenze.notifica_stato_incarico ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Richiesta Documenti */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">📎 Richieste Documenti</h3>
                  <p className="text-sm text-gray-600">
                    Quando il tecnico ti richiede di caricare un documento
                  </p>
                </div>
                <button
                  disabled={!preferenze.email_attivo}
                  onClick={() => handleToggle('notifica_richiesta_documento')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                    preferenze.notifica_richiesta_documento ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferenze.notifica_richiesta_documento ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Informazioni GDPR */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy e Dati</CardTitle>
              <CardDescription>
                Informazioni sui tuoi dati e diritti
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">🔒 I tuoi diritti GDPR</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Puoi modificare le preferenze email in qualsiasi momento</li>
                  <li>• I tuoi dati sono trattati secondo la Privacy Policy</li>
                  <li>• Puoi richiedere l'export o la cancellazione dei dati</li>
                  <li>• Le email sono inviate solo se hai dato il consenso</li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>
                  Per richiedere l'export dei tuoi dati o la cancellazione dell'account,
                  contatta <strong>privacy@studio-romano.it</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pulsante Salva */}
          <div className="flex justify-end">
            <Button 
              onClick={salvaPreferenze}
              disabled={saving}
              size="lg"
              className="px-8"
            >
              {saving ? 'Salvataggio...' : 'Salva Preferenze'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}