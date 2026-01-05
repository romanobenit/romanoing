import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, FileText, AlertCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna alla home
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xl text-blue-50">
            Informativa sul trattamento dei dati personali ai sensi del GDPR
          </p>
          <p className="text-sm text-blue-100 mt-2">
            Ultimo aggiornamento: 29 Dicembre 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          {/* Introduzione */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Introduzione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                Lo Studio Ing. Domenico Romano, in qualità di <strong>Titolare del trattamento</strong>,
                La informa che i Suoi dati personali saranno trattati nel rispetto del Regolamento UE 2016/679
                (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
              </p>
              <p className="text-gray-700">
                La presente informativa descrive le modalità di trattamento dei dati personali
                raccolti attraverso il sito web e durante l'erogazione dei servizi professionali.
              </p>
            </CardContent>
          </Card>

          {/* Titolare del Trattamento */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>1. Titolare del Trattamento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-gray-700 space-y-2">
                <p><strong>Titolare:</strong> Ing. Domenico Romano</p>
                <p><strong>Sede:</strong> [Indirizzo Studio - Napoli, Italia]</p>
                <p><strong>P.IVA:</strong> IT12345678901</p>
                <p><strong>Email:</strong> privacy@studio-romano.it</p>
                <p><strong>PEC:</strong> domenico.romano@ingpec.eu</p>
              </div>
            </CardContent>
          </Card>

          {/* Dati Raccolti */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                2. Dati Personali Raccolti
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2.1 Dati forniti volontariamente</h4>
                  <p className="text-gray-700 mb-2">Durante l'utilizzo dei configuratori e la richiesta di preventivi:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Nome e cognome</li>
                    <li>Email</li>
                    <li>Numero di telefono</li>
                    <li>Indirizzo (comune e regione)</li>
                    <li>Informazioni tecniche sul progetto/immobile</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2.2 Dati di navigazione</h4>
                  <p className="text-gray-700 mb-2">Raccolti automaticamente dai sistemi informatici:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Indirizzo IP</li>
                    <li>Tipo di browser</li>
                    <li>Sistema operativo</li>
                    <li>Pagine visitate e durata della sessione</li>
                    <li>Dati di utilizzo (localStorage per salvataggio progressi)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2.3 Dati professionali</h4>
                  <p className="text-gray-700 mb-2">Durante l'erogazione dei servizi:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Documentazione tecnica fornita (progetti, planimetrie, APE)</li>
                    <li>Corrispondenza via email</li>
                    <li>Registrazioni di consulenze (previo consenso esplicito)</li>
                    <li>Dati di fatturazione</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finalità del Trattamento */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>3. Finalità del Trattamento e Base Giuridica</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">A) Erogazione dei servizi professionali</h4>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Base giuridica:</strong> Esecuzione di un contratto o misure precontrattuali (Art. 6.1.b GDPR)
                  </p>
                  <p className="text-sm text-gray-600">
                    Risposta a richieste di preventivo, erogazione consulenze, progettazione, pratiche amministrative
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">B) Obblighi di legge</h4>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Base giuridica:</strong> Adempimento di un obbligo legale (Art. 6.1.c GDPR)
                  </p>
                  <p className="text-sm text-gray-600">
                    Fatturazione, tenuta registri contabili, conservazione documentazione professionale secondo normative di settore
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">C) Marketing e comunicazioni commerciali</h4>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Base giuridica:</strong> Consenso esplicito (Art. 6.1.a GDPR)
                  </p>
                  <p className="text-sm text-gray-600">
                    Invio newsletter, promozioni servizi, eventi - solo previo consenso
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">D) Legittimo interesse</h4>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Base giuridica:</strong> Legittimo interesse del Titolare (Art. 6.1.f GDPR)
                  </p>
                  <p className="text-sm text-gray-600">
                    Sicurezza informatica, prevenzione frodi, miglioramento servizi, analisi statistiche anonime
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conservazione */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                4. Periodo di Conservazione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>I dati personali saranno conservati per il tempo necessario alle finalità indicate:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Dati di preventivo non convertito:</strong> 12 mesi dall'ultimo contatto</li>
                  <li><strong>Dati di clienti attivi:</strong> Durata del rapporto professionale + 10 anni (obblighi civilistici e fiscali)</li>
                  <li><strong>Documentazione tecnica:</strong> Secondo normative professionali (minimo 10 anni per progetti strutturali)</li>
                  <li><strong>Dati di fatturazione:</strong> 10 anni (obblighi fiscali)</li>
                  <li><strong>Consensi marketing:</strong> Fino a revoca del consenso</li>
                  <li><strong>Dati di navigazione:</strong> 12 mesi (analytics)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Modalità di Trattamento */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>5. Modalità di Trattamento e Sicurezza</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <p>
                  I dati personali sono trattati con strumenti informatici e cartacei,
                  adottando misure di sicurezza adeguate per prevenire accessi non autorizzati,
                  divulgazione, modifica o distruzione:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cifratura dei dati in transito (HTTPS/TLS)</li>
                  <li>Certificazione <strong>ISO 27001:2022</strong> per la sicurezza delle informazioni</li>
                  <li>Backup giornalieri crittografati</li>
                  <li>Autenticazione multi-fattore per accessi amministrativi</li>
                  <li>Firewall e sistemi di protezione perimetrale</li>
                  <li>Formazione periodica del personale autorizzato</li>
                  <li>Conformità <strong>PCI-DSS</strong> per pagamenti elettronici</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Destinatari */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>6. Destinatari dei Dati</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>I dati personali potranno essere comunicati a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Collaboratori professionali:</strong> Ingegneri, architetti, geometri autorizzati dal Titolare</li>
                  <li><strong>Fornitori di servizi IT:</strong> Hosting, backup, manutenzione (nominati Responsabili del Trattamento)</li>
                  <li><strong>Enti pubblici:</strong> Comuni, Regioni, VVF, Genio Civile (per pratiche amministrative)</li>
                  <li><strong>Istituti bancari:</strong> Per pagamenti e incassi</li>
                  <li><strong>Commercialista:</strong> Per adempimenti fiscali</li>
                  <li><strong>Assicurazione professionale:</strong> In caso di gestione sinistri</li>
                </ul>
                <p className="mt-4">
                  <strong>Trasferimenti extra-UE:</strong> I dati non sono trasferiti verso paesi terzi.
                  Eventuali fornitori cloud sono EU-based o garantiscono adeguatezza GDPR.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Diritti dell'Interessato */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                7. Diritti dell'Interessato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <p>
                  In qualità di interessato, Lei ha diritto di esercitare i seguenti diritti
                  ai sensi degli artt. 15-22 del GDPR:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">✓ Accesso (Art. 15)</h4>
                    <p className="text-sm">Ottenere conferma dell'esistenza dei dati e copia degli stessi</p>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">✓ Rettifica (Art. 16)</h4>
                    <p className="text-sm">Correggere dati inesatti o incompleti</p>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">✓ Cancellazione (Art. 17)</h4>
                    <p className="text-sm">Richiedere la cancellazione dei dati (diritto all'oblio)</p>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">✓ Limitazione (Art. 18)</h4>
                    <p className="text-sm">Limitare il trattamento dei dati</p>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">✓ Portabilità (Art. 20)</h4>
                    <p className="text-sm">Ricevere i dati in formato strutturato e trasferirli</p>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">✓ Opposizione (Art. 21)</h4>
                    <p className="text-sm">Opporsi al trattamento per motivi legittimi</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-amber-900 mb-2">Come esercitare i diritti</p>
                  <p className="text-sm text-gray-700 mb-2">
                    Le richieste possono essere inviate a:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>📧 Email: <strong>privacy@studio-romano.it</strong></li>
                    <li>📮 PEC: <strong>domenico.romano@ingpec.eu</strong></li>
                    <li>✉️ Raccomandata A/R presso la sede dello Studio</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    Il Titolare risponderà entro 30 giorni dalla ricezione della richiesta.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-1">Reclamo al Garante</p>
                  <p className="text-sm text-gray-700">
                    Hai il diritto di proporre reclamo al <strong>Garante per la Protezione dei Dati Personali</strong>
                    (www.garanteprivacy.it) qualora ritenga che il trattamento violi il GDPR.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>8. Cookie e Tecnologie di Tracciamento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>
                  Il sito utilizza esclusivamente <strong>cookie tecnici</strong> necessari
                  al funzionamento (salvataggio progressi configuratori in localStorage).
                </p>
                <p>
                  <strong>Non utilizziamo cookie di profilazione o marketing.</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Il localStorage del browser conserva temporaneamente i dati inseriti nei configuratori
                  per permettere di riprendere la compilazione. Questi dati risiedono esclusivamente
                  sul Suo dispositivo e possono essere cancellati in qualsiasi momento pulendo la cache del browser.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modifiche */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                9. Modifiche alla Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700">
                La presente Privacy Policy può essere aggiornata periodicamente.
                Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
                Ti invitiamo a consultare regolarmente questa pagina.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Hai domande sulla privacy?</h2>
            <p className="text-blue-50 mb-6">
              Contatta il nostro team per qualsiasi chiarimento sul trattamento dei tuoi dati
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="mailto:privacy@studio-romano.it">
                  Contatta Privacy Team
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                <Link href="/">
                  Torna alla Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
