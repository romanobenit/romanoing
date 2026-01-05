"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatEuro } from "@/lib/utils";

interface BundleData {
  codice: string;
  nome: string;
  descrizione: string;
  prezzoMin: number;
  prezzoMax: number;
  milestone: Array<{
    codice: string;
    nome: string;
    percentuale: number;
  }>;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bundleCode = searchParams.get("bundle");

  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    codiceFiscale: "",
    indirizzo: "",
    citta: "",
    cap: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bundleCode) {
      router.push("/#servizi");
      return;
    }

    fetch(`/api/bundle/${bundleCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBundle(data.data);
        } else {
          router.push("/");
        }
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [bundleCode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Crea Stripe Checkout Session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bundleCode: bundle?.codice,
          cliente: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Errore durante il checkout');
      }

      // Redirect a Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL checkout non ricevuto');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || "Errore durante il checkout. Riprova.");
      setSubmitting(false);
    }
    // Note: Non settiamo setSubmitting(false) se redirect avviene con successo
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return null;
  }

  const acconto = bundle.milestone[0];
  const importoAcconto = Math.round((bundle.prezzoMin + bundle.prezzoMax) / 2 * (acconto.percentuale / 100));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/bundle/${bundle.codice}`} className="text-blue-600 hover:underline mb-4 inline-block">
            ← Torna al servizio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Completa l'acquisto per iniziare il tuo progetto
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dati Cliente</CardTitle>
                <CardDescription>
                  Inserisci i tuoi dati per procedere con il pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome *
                      </label>
                      <Input
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Mario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cognome *
                      </label>
                      <Input
                        required
                        value={formData.cognome}
                        onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                        placeholder="Rossi"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="mario.rossi@example.com"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Riceverai le credenziali di accesso qui
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefono *
                      </label>
                      <Input
                        required
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="+39 333 1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Codice Fiscale
                    </label>
                    <Input
                      value={formData.codiceFiscale}
                      onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value.toUpperCase() })}
                      placeholder="RSSMRA80A01H501Z"
                      maxLength={16}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indirizzo
                    </label>
                    <Input
                      value={formData.indirizzo}
                      onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                      placeholder="Via Roma 123"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Città
                      </label>
                      <Input
                        value={formData.citta}
                        onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                        placeholder="Milano"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CAP
                      </label>
                      <Input
                        value={formData.cap}
                        onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                        placeholder="20100"
                        maxLength={5}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (opzionale)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Eventuali note o richieste particolari..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Elaborazione..." : `Procedi al Pagamento (${formatEuro(importoAcconto)})`}
                  </Button>

                  <p className="text-xs text-gray-600 text-center">
                    Cliccando procedi verrai reindirizzato a Stripe per il pagamento sicuro
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Riepilogo */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Riepilogo Ordine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Servizio</div>
                  <div className="font-semibold text-lg">{bundle.nome}</div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Prezzo totale stimato</span>
                    <span className="font-medium">
                      {formatEuro(bundle.prezzoMin)} - {formatEuro(bundle.prezzoMax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm text-gray-600">Acconto {acconto.percentuale}%</div>
                      <div className="text-xs text-gray-500">({acconto.nome})</div>
                    </div>
                    <Badge className="text-base px-3 py-1">
                      {formatEuro(importoAcconto)}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Da pagare ora</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatEuro(importoAcconto)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Pagamento sicuro con Stripe. Carte accettate: Visa, Mastercard, American Express.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-sm">
                  <div className="font-semibold mb-2">📋 Cosa succede dopo?</div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span>1.</span>
                      <span>Ricevi email con credenziali area riservata</span>
                    </li>
                    <li className="flex gap-2">
                      <span>2.</span>
                      <span>Monitora l'avanzamento del progetto</span>
                    </li>
                    <li className="flex gap-2">
                      <span>3.</span>
                      <span>Paghi le milestone successive online</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-4 space-y-2 text-xs text-gray-600">
                  <p>✓ Pagamento sicuro SSL</p>
                  <p>✓ Garanzia soddisfatti o rimborsati</p>
                  <p>✓ Supporto clienti dedicato</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
