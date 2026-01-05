import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
  AlertTriangle,
  FileText,
  Euro,
  Phone
} from "lucide-react";

export default function GaranziaConsulenzaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/configuratore/consulenza" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna al configuratore
          </Link>
          <h1 className="text-4xl font-bold mb-3">Garanzia Soddisfatti o Rimborsati</h1>
          <p className="text-xl text-green-50">
            Consulenza Tecnica Preliminare
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Intro */}
          <Card>
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                Lo <strong>Studio Ing. Domenico Romano</strong> garantisce la soddisfazione
                del cliente per le consulenze tecniche preliminari.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                Se non sei soddisfatto della consulenza ricevuta, puoi richiedere un rimborso
                entro <strong>7 giorni dalla data della consulenza</strong>, specificando per
                iscritto i motivi dell'insoddisfazione.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                L'entità del rimborso verrà valutata caso per caso in base alla natura della
                consulenza e ai servizi effettivamente erogati.
              </p>
            </CardContent>
          </Card>

          {/* Cosa copre */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Cosa Copre la Garanzia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">La garanzia si applica alle seguenti tipologie di consulenza:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Consulenza Online</div>
                    <div className="text-sm text-gray-600">Videocall 60 minuti - €180</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Consulenza in Presenza</div>
                    <div className="text-sm text-gray-600">Presso studio 90 minuti - €300</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Consulenza con Sopralluogo</div>
                    <div className="text-sm text-gray-600">Presso immobile 90 minuti - €450 + trasferta</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quando richiedere */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Quando Puoi Richiedere il Rimborso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">Puoi richiedere un rimborso se:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Hai fornito informazioni complete e veritiere durante la consulenza</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Hai partecipato attivamente alla sessione</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">La consulenza non ha soddisfatto aspettative ragionevoli</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Invii la richiesta <strong>entro 7 giorni</strong> dalla data della consulenza</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Come richiedere */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Come Richiedere il Rimborso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Invia una email</div>
                    <div className="text-sm text-gray-600">
                      A: <a href="mailto:garanzia@studio-romano.it" className="text-blue-600 underline">garanzia@studio-romano.it</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Oggetto email</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
                      Richiesta rimborso consulenza [DATA]
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-2">Includi le seguenti informazioni</div>
                    <div className="bg-gray-50 p-4 rounded text-sm font-mono space-y-1">
                      <div>Nome e Cognome: <span className="text-gray-500">[Il tuo nome]</span></div>
                      <div>Data consulenza: <span className="text-gray-500">[GG/MM/AAAA]</span></div>
                      <div>Modalità: <span className="text-gray-500">[Online/Presenza/Sopralluogo]</span></div>
                      <div>Importo pagato: <span className="text-gray-500">€[XXX]</span></div>
                      <div className="pt-2">Motivo insoddisfazione:</div>
                      <div className="text-gray-500">[Descrizione dettagliata]</div>
                      <div className="pt-2">IBAN per rimborso:</div>
                      <div className="text-gray-500">[IT00 0000 0000 0000 0000 0000 000]</div>
                      <div>Intestatario: <span className="text-gray-500">[Nome intestatario]</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valutazione */}
          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Valutazione della Richiesta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                Riceverai una risposta entro <strong>5 giorni lavorativi</strong> dalla ricezione della richiesta.
              </p>
              <p className="text-gray-700 mb-4">
                In base alla situazione specifica, lo Studio può offrire:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded">
                  <Euro className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Rimborso parziale o totale</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Credito per servizi futuri</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded">
                  <FileText className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Seconda consulenza gratuita</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Integrazione senza costi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Esclusioni */}
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Esclusioni
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">La garanzia <strong>NON si applica</strong> nei seguenti casi:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Non ti presenti all'appuntamento (no-show)</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Cancelli la consulenza con meno di 48 ore di preavviso</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Richiedi servizi fuori dall'ambito della consulenza prenotata</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Hai già ricevuto e utilizzato servizi aggiuntivi (report scritti, preventivi dettagliati)</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Hai fornito informazioni false o incomplete durante la consulenza</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <strong>Nota sulle trasferte:</strong> Le spese di trasferta per sopralluoghi già effettuati
                    non sono rimborsabili, in quanto rappresentano costi diretti già sostenuti.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tempi */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Tempi di Rimborso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700">
                Se la richiesta viene approvata, il rimborso verrà erogato entro{" "}
                <strong>14 giorni lavorativi</strong> dalla data di approvazione, tramite bonifico bancario
                sull'IBAN fornito nella richiesta.
              </p>
            </CardContent>
          </Card>

          {/* Assistenza */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Assistenza
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">Per domande o chiarimenti sulla garanzia:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <a href="mailto:garanzia@studio-romano.it" className="text-blue-600 hover:underline">
                    garanzia@studio-romano.it
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">+39 XXX XXXXXXX</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Prenota la Tua Consulenza</h2>
            <p className="text-green-50 mb-6">
              Protetto dalla nostra Garanzia Soddisfatti o Rimborsati
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/configuratore/consulenza">
                Configura Consulenza →
              </Link>
            </Button>
          </div>

          {/* Last update */}
          <div className="text-center text-sm text-gray-500">
            Ultimo aggiornamento: Dicembre 2024
          </div>
        </div>
      </div>
    </div>
  );
}
