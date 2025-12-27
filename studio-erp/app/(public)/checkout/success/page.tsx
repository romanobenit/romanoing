"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, FileText, CreditCard } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula caricamento (in produzione, potremmo verificare session con Stripe)
    setTimeout(() => setLoading(loading), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pagamento Completato!
          </h1>
          <p className="text-xl text-gray-600">
            Grazie per aver scelto Studio Ing. Romano
          </p>
        </div>

        {/* Success Card */}
        <Card className="border-2 border-green-200 shadow-xl mb-8">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-2xl text-center text-green-900">
              Il Tuo Ordine è Stato Confermato
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Cosa succede ora?
              </h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <div className="font-medium">Riceverai un'email di conferma</div>
                    <div className="text-sm text-gray-600">
                      Controlla la tua casella di posta per i dettagli dell'ordine
                    </div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <div className="font-medium">Credenziali area riservata</div>
                    <div className="text-sm text-gray-600">
                      Ti invieremo le credenziali per accedere alla tua area clienti
                    </div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <div className="font-medium">Verrai contattato dal tecnico</div>
                    <div className="text-sm text-gray-600">
                      Entro 24 ore per organizzare il primo appuntamento
                    </div>
                  </div>
                </li>
              </ol>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-sm">Documenti</div>
                <div className="text-xs text-gray-600">
                  Scarica i tuoi documenti dall'area riservata
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-sm">Pagamenti</div>
                <div className="text-xs text-gray-600">
                  Paga le milestone successive online
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-sm">Messaggi</div>
                <div className="text-xs text-gray-600">
                  Comunica direttamente con il tecnico
                </div>
              </div>
            </div>

            {/* Session ID (debug) */}
            {sessionId && (
              <div className="text-center text-xs text-gray-500 pt-4 border-t">
                ID Transazione: {sessionId}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Controlla la tua email per le credenziali di accesso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/login">
                Accedi all'Area Riservata →
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">
                Torna alla Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Hai bisogno di aiuto?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Il nostro team è a tua disposizione
          </p>
          <div className="text-sm text-gray-700">
            <p>📧 info@studio-romano.it</p>
            <p>📞 +39 XXX XXXXXXX</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
