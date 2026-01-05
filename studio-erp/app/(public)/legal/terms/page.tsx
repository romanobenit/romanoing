import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, Ban, Euro } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna alla home
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <Scale className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Termini e Condizioni</h1>
          </div>
          <p className="text-xl text-slate-200">
            Condizioni generali di fornitura dei servizi professionali
          </p>
          <p className="text-sm text-slate-300 mt-2">
            Ultimo aggiornamento: 29 Dicembre 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          {/* Introduzione */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                Premessa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                I presenti Termini e Condizioni regolano il rapporto contrattuale tra
                <strong> Studio Ing. Domenico Romano</strong> (di seguito "Studio" o "Professionista")
                e il Cliente per l'erogazione di servizi professionali di ingegneria e architettura.
              </p>
              <p className="text-gray-700">
                L'invio di una richiesta di preventivo o l'accettazione di un'offerta
                comporta l'accettazione integrale dei presenti termini e condizioni,
                unitamente alle normative deontologiche degli Ordini Professionali di riferimento.
              </p>
            </CardContent>
          </Card>

          {/* Definizioni */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>1. Definizioni</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="space-y-3 text-gray-700">
                <div>
                  <dt className="font-semibold">Studio/Professionista:</dt>
                  <dd className="ml-4">Ing. Domenico Romano, con sede in [Indirizzo - Napoli], P.IVA IT12345678901, iscritto all'Ordine degli Ingegneri della Provincia di Napoli</dd>
                </div>
                <div>
                  <dt className="font-semibold">Cliente/Committente:</dt>
                  <dd className="ml-4">La persona fisica o giuridica che richiede servizi professionali allo Studio</dd>
                </div>
                <div>
                  <dt className="font-semibold">Servizi:</dt>
                  <dd className="ml-4">Le prestazioni professionali di ingegneria, architettura, consulenza tecnica, progettazione, direzione lavori, collaudo, pratiche amministrative descritte nel preventivo o contratto</dd>
                </div>
                <div>
                  <dt className="font-semibold">Preventivo:</dt>
                  <dd className="ml-4">Offerta economica vincolante dello Studio per l'erogazione di specifici servizi</dd>
                </div>
                <div>
                  <dt className="font-semibold">Configuratore:</dt>
                  <dd className="ml-4">Strumento online per la generazione automatica di preventivi indicativi</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Oggetto dei Servizi */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>2. Oggetto dei Servizi</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <p>
                  Lo Studio eroga servizi professionali nelle seguenti aree:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Progettazione strutturale e architettonica</li>
                  <li>Prevenzione incendi (pratiche SCIA, CPI, rinnovi)</li>
                  <li>Efficientamento energetico (APE, diagnosi energetica, incentivi)</li>
                  <li>Vulnerabilità sismica e miglioramento sismico</li>
                  <li>Due diligence tecnica immobiliare</li>
                  <li>Direzione lavori e coordinamento sicurezza (CSP/CSE)</li>
                  <li>Collaudi statici e funzionali</li>
                  <li>Consulenze tecniche preliminari</li>
                  <li>Pratiche amministrative (CILA, SCIA, Permessi di Costruire)</li>
                </ul>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-amber-900 mb-2">Servizi esclusi</p>
                  <p className="text-sm">
                    Sono esclusi dall'oggetto dei servizi: esecuzione lavori edili,
                    fornitura materiali, consulenze legali, perizie giurate per cause civili/penali
                    (salvo accordi specifici).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preventivi */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-slate-700" />
                3. Preventivi e Modalità di Accettazione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3.1 Preventivi da Configuratore</h4>
                  <p className="mb-2">
                    I preventivi generati tramite configuratore online sono <strong>indicativi</strong>
                    e soggetti a conferma scritta da parte dello Studio entro 48 ore dalla ricezione della richiesta.
                  </p>
                  <p className="text-sm text-gray-600">
                    Lo Studio si riserva il diritto di modificare il preventivo a seguito di
                    approfondimenti tecnici o integrazioni documentali.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3.2 Preventivi Personalizzati</h4>
                  <p>
                    I preventivi personalizzati hanno validità di <strong>30 giorni</strong> dalla data di emissione,
                    salvo diversa indicazione esplicita.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3.3 Accettazione</h4>
                  <p>
                    L'accettazione del preventivo può avvenire tramite:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Firma digitale del documento di preventivo</li>
                    <li>Email di conferma esplicita all'indirizzo info@studio-romano.it</li>
                    <li>Versamento dell'acconto (ove previsto)</li>
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Varianti in corso d'opera:</strong> Eventuali variazioni rispetto al preventivo
                    accettato dovranno essere concordate per iscritto e potranno comportare adeguamenti economici.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tariffe e Pagamenti */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>4. Tariffe e Modalità di Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">4.1 Determinazione delle Tariffe</h4>
                  <p>
                    Le tariffe sono determinate in conformità al <strong>D.M. 17/06/2016</strong>
                    (parametri per servizi di ingegneria e architettura) e tengono conto di:
                    complessità tecnica, urgenza, valore dell'opera, responsabilità professionale.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">4.2 Modalità di Pagamento</h4>
                  <p className="mb-2">I pagamenti possono essere effettuati tramite:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Bonifico bancario (preferenziale)</li>
                    <li>Carta di credito/debito (circuiti Visa, Mastercard, American Express)</li>
                    <li>Assegno bancario (solo per importi &gt; €1.000)</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    Tutti i pagamenti elettronici sono gestiti in conformità allo standard <strong>PCI-DSS</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">4.3 Acconti e Scadenze</h4>
                  <div className="space-y-2">
                    <p>
                      <strong>Consulenze preliminari:</strong> Pagamento anticipato 100%
                    </p>
                    <p>
                      <strong>Progetti fino a €5.000:</strong> Acconto 50% + Saldo a consegna
                    </p>
                    <p>
                      <strong>Progetti oltre €5.000:</strong> Piano SAL (Stati Avanzamento Lavori) concordato
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      Termini di pagamento: <strong>30 giorni data fattura</strong> (salvo diversi accordi).
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">4.4 Ritardi nei Pagamenti</h4>
                  <p className="mb-2">
                    In caso di ritardo nei pagamenti si applicano:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Interessi di mora al tasso legale + 8 punti percentuali (D.Lgs. 231/2002)</li>
                    <li>Sospensione delle prestazioni in corso</li>
                    <li>Diritto di trattenere la documentazione fino a saldo</li>
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-1">Spese Vive</p>
                  <p className="text-sm text-gray-700">
                    Salvo diverso accordo, le spese vive (trasferte, diritti istruttoria presso enti,
                    marche da bollo, copie eliografiche, ecc.) sono a carico del Cliente e fatturate a rimborso.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Obblighi del Cliente */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>5. Obblighi del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>Il Cliente si impegna a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fornire tempestivamente tutta la documentazione necessaria (titoli di proprietà, progetti esistenti, visure, ecc.)</li>
                  <li>Garantire l'accesso agli immobili per sopralluoghi e verifiche tecniche</li>
                  <li>Comunicare prontamente variazioni o informazioni rilevanti per il progetto</li>
                  <li>Rispettare le scadenze di pagamento concordate</li>
                  <li>Nominare lo Studio con atto formale presso gli Enti competenti (ove richiesto)</li>
                  <li>Fornire informazioni veritiere e complete</li>
                </ul>

                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Ritardi imputabili al Cliente:</strong> Ritardi nella fornitura di documentazione
                    o nelle decisioni progettuali comportano automatica proroga dei termini di consegna,
                    senza responsabilità per lo Studio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Obblighi dello Studio */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>6. Obblighi dello Studio</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>Lo Studio si impegna a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Erogare i servizi con diligenza professionale secondo le regole dell'arte e le normative vigenti</li>
                  <li>Rispettare i termini di consegna concordati (salvo cause di forza maggiore o ritardi imputabili al Cliente)</li>
                  <li>Mantenere la riservatezza su tutte le informazioni ricevute dal Cliente</li>
                  <li>Garantire la conformità dei progetti alle normative tecniche vigenti al momento della redazione</li>
                  <li>Fornire assistenza nelle fasi di deposito pratiche presso enti</li>
                  <li>Mantenere copertura assicurativa professionale adeguata</li>
                </ul>

                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-900 mb-1">Certificazioni di Qualità</p>
                  <p className="text-sm text-gray-700">
                    Lo Studio è certificato <strong>ISO 9001:2015</strong> (Qualità) e
                    <strong> ISO 27001:2022</strong> (Sicurezza Informazioni).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recesso */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-slate-700" />
                7. Recesso e Risoluzione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.1 Recesso del Cliente</h4>
                  <p className="mb-2">
                    Il Cliente può recedere dal contratto in qualsiasi momento con comunicazione scritta.
                    In tal caso:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Saranno dovuti i corrispettivi per le prestazioni già eseguite</li>
                    <li>Sarà dovuto un indennizzo pari al 30% del valore delle prestazioni non ancora eseguite</li>
                    <li>Acconti versati non sono rimborsabili</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.2 Recesso dello Studio</h4>
                  <p className="mb-2">
                    Lo Studio può recedere dal contratto nei seguenti casi:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Mancato pagamento oltre 30 giorni dalla scadenza</li>
                    <li>Impossibilità sopravvenuta di eseguire la prestazione per cause imputabili al Cliente</li>
                    <li>Modifica sostanziale e non concordata delle condizioni contrattuali</li>
                    <li>Violazione degli obblighi deontologici da parte del Cliente</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    In caso di recesso dello Studio per inadempimento del Cliente, acconti e SAL già pagati
                    non saranno rimborsati.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.3 Garanzia "Soddisfatti o Rimborsati"</h4>
                  <p>
                    Per le <strong>consulenze tecniche preliminari</strong> si applica la
                    garanzia "Soddisfatti o Rimborsati" secondo le condizioni specificate
                    in <Link href="/legal/garanzia-consulenza" className="text-blue-600 underline">questa pagina</Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsabilità */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-700" />
                8. Limitazioni di Responsabilità
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">8.1 Ambito di Responsabilità</h4>
                  <p>
                    Lo Studio è responsabile esclusivamente per le prestazioni professionali
                    oggetto del contratto, con obbligo di mezzi e non di risultato.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">8.2 Esclusioni di Responsabilità</h4>
                  <p className="mb-2">Lo Studio non è responsabile per:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Difetti costruttivi o vizi dell'opera eseguiti da terzi (imprese)</li>
                    <li>Modifiche non autorizzate al progetto da parte del Cliente o dell'impresa</li>
                    <li>Ritardi nelle autorizzazioni amministrative imputabili agli Enti</li>
                    <li>Informazioni false o incomplete fornite dal Cliente</li>
                    <li>Eventi di forza maggiore (calamità naturali, pandemie, guerre, ecc.)</li>
                    <li>Variazioni normative sopravvenute dopo la consegna del progetto</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">8.3 Copertura Assicurativa</h4>
                  <p>
                    Lo Studio mantiene polizza di responsabilità civile professionale con
                    massimale adeguato ai servizi prestati, come previsto dalla normativa di settore.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Massimale di responsabilità:</strong> In ogni caso, la responsabilità
                    dello Studio è limitata all'importo effettivamente percepito per la specifica
                    prestazione oggetto di contestazione, salvo dolo o colpa grave.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proprietà Intellettuale */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>9. Proprietà Intellettuale</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>
                  I progetti, relazioni tecniche, elaborati grafici e ogni altra opera dell'ingegno
                  prodotta dallo Studio restano di <strong>proprietà intellettuale dello Studio</strong>,
                  tutelati dalla Legge sul Diritto d'Autore (L. 633/1941).
                </p>
                <p>
                  Il Cliente acquisisce il diritto di utilizzare la documentazione esclusivamente per
                  le finalità oggetto del contratto (realizzazione dell'opera, deposito presso enti).
                </p>
                <p className="font-semibold mt-4">È espressamente vietato:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Riprodurre, copiare o modificare gli elaborati senza autorizzazione scritta</li>
                  <li>Utilizzare i progetti per opere diverse da quella concordata</li>
                  <li>Cedere a terzi la documentazione senza consenso dello Studio</li>
                  <li>Rimuovere intestazioni, timbri professionali o riferimenti allo Studio</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Riservatezza */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>10. Riservatezza</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>
                  Lo Studio si impegna a trattare con massima riservatezza tutte le informazioni
                  ricevute dal Cliente nell'ambito dello svolgimento dell'incarico professionale,
                  nel rispetto del segreto professionale ex art. 622 c.p. e del GDPR.
                </p>
                <p>
                  Il Cliente autorizza lo Studio a comunicare dati e documenti tecnici esclusivamente
                  agli Enti competenti (Comuni, Regioni, VVF, ecc.) e ai collaboratori/consulenti
                  vincolati da analoghi obblighi di riservatezza.
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  Per maggiori dettagli sul trattamento dei dati personali, consultare la
                  <Link href="/legal/privacy" className="text-blue-600 underline ml-1">Privacy Policy</Link>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comunicazioni */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>11. Comunicazioni</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>
                  Tutte le comunicazioni ufficiali tra le parti dovranno essere effettuate per iscritto tramite:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email ordinaria: info@studio-romano.it</li>
                  <li>PEC (raccomandata): domenico.romano@ingpec.eu</li>
                  <li>Raccomandata A/R presso la sede dello Studio</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  Le comunicazioni si intendono ricevute: email ordinaria (24h dall'invio),
                  PEC (immediatamente), raccomandata (data ricevuta).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Foro Competente */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-700" />
                12. Legge Applicabile e Foro Competente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>
                  I presenti Termini e Condizioni sono regolati dalla <strong>legge italiana</strong>.
                </p>
                <p>
                  Per ogni controversia derivante dall'interpretazione, esecuzione o risoluzione
                  del contratto, sarà competente in via esclusiva il <strong>Foro di Napoli</strong>.
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Rimane salva la facoltà del Cliente-consumatore di adire il Foro del proprio
                  domicilio ai sensi del D.Lgs. 206/2005 (Codice del Consumo).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Controversie ADR */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>13. Risoluzione Alternativa delle Controversie (ADR)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <p>
                  Prima di adire l'autorità giudiziaria, le parti si impegnano a tentare
                  una <strong>conciliazione stragiudiziale</strong> attraverso:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Commissione di Conciliazione dell'Ordine degli Ingegneri di Napoli</li>
                  <li>Camera di Commercio - Servizio di Conciliazione</li>
                  <li>Organismo di mediazione accreditato</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  Il tentativo di conciliazione è condizione di procedibilità della domanda giudiziale
                  (D.Lgs. 28/2010).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disposizioni Finali */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-slate-700" />
                14. Disposizioni Finali
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">14.1 Modifiche ai Termini</h4>
                  <p>
                    Lo Studio si riserva il diritto di modificare i presenti Termini e Condizioni.
                    Le modifiche saranno pubblicate su questa pagina e si applicheranno ai contratti
                    stipulati successivamente alla pubblicazione.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">14.2 Nullità Parziale</h4>
                  <p>
                    L'eventuale nullità o invalidità di una clausola non pregiudica la validità
                    delle restanti disposizioni, che rimarranno pienamente efficaci.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">14.3 Prevalenza del Contratto Specifico</h4>
                  <p>
                    In caso di contratto scritto specifico per il singolo incarico, le clausole
                    ivi contenute prevalgono sui presenti Termini generali per quanto in contrasto.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Hai domande sui termini di servizio?</h2>
            <p className="text-slate-200 mb-6">
              Contattaci per qualsiasi chiarimento prima di procedere con la richiesta di servizi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="mailto:info@studio-romano.it">
                  Contatta lo Studio
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-slate-700">
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
