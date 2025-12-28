import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                SR
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Studio Ing. Domenico Romano
                </h1>
                <p className="text-xs text-gray-600">Ingegneria e architettura</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Accedi
              </Link>
              <Button asChild>
                <Link href="/quiz">Richiedi Preventivo</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <Badge className="bg-green-100 text-green-900 hover:bg-green-200">
              ✓ Certificato ISO 9001:2015
            </Badge>
            <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-200">
              ✓ Certificato ISO 27001:2022
            </Badge>
            <Badge className="bg-purple-100 text-purple-900 hover:bg-purple-200">
              E-Commerce Demand-Driven
            </Badge>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Servizi di Ingegneria{" "}
            <span className="text-blue-600">Certificati</span> e su Misura
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Preventivo online in 24 ore. Pagamenti milestone-based sicuri.
            <br />
            <span className="font-semibold">Qualità certificata ISO 9001 | Sicurezza dati ISO 27001</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/quiz">
                🎯 Richiedi Preventivo Gratuito
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href="#servizi">
                Esplora Catalogo (8 Servizi)
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Anni di Esperienza</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-blue-100">Progetti Completati</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">ISO 9001</div>
              <div className="text-blue-100">Qualità Certificata</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">ISO 27001</div>
              <div className="text-blue-100">Sicurezza Dati</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Compliance */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <div className="text-center mb-6">
              <Badge className="bg-green-600 text-white mb-4">Piattaforma Certificata</Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Compliance Totale per i Tuoi Dati
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold mb-1">ISO 9001:2015</div>
                <div className="text-gray-600">Sistema Gestione Qualità certificato</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-bold mb-1">ISO 27001:2022</div>
                <div className="text-gray-600">Sicurezza Informazioni certificata</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-3xl mb-2">💳</div>
                <div className="font-bold mb-1">PCI-DSS Compliant</div>
                <div className="text-gray-600">Pagamenti sicuri via Stripe</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-3xl mb-2">🇪🇺</div>
                <div className="font-bold mb-1">GDPR Compliant</div>
                <div className="text-gray-600">Privacy dati garantita</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-3xl mb-2">🔐</div>
                <div className="font-bold mb-1">Encryption AES-256</div>
                <div className="text-gray-600">Dati criptati at rest & in transit</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-3xl mb-2">📦</div>
                <div className="font-bold mb-1">Backup Giornalieri</div>
                <div className="text-gray-600">Strategia 3-2-1 certificata</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - 8 Bundle */}
      <section id="servizi" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4">Catalogo Servizi Professionali</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            8 Soluzioni per Ogni Esigenza
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Servizi completi con preventivo personalizzato online. <br/>
            <span className="font-semibold">Modello Demand-Driven:</span> configuriamo il servizio sulle tue esigenze specifiche.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Bundle 1: Consulenza */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                💡
              </div>
              <CardTitle className="text-lg">Consulenza Tecnica</CardTitle>
              <CardDescription className="text-sm">
                Inquadramento preliminare (60-90 min)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende/P.A.</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €180 - €600
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Analisi criticità<br />
                  ✓ Fattibilità tecnica<br />
                  ✓ Stima costi intervento<br />
                  ✓ Roadmap operativa
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/bundle/BDL-CONSULENZA">
                    Preventivo →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 2: Ristrutturazione */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🏗️
              </div>
              <CardTitle className="text-lg">Ristrutturazione</CardTitle>
              <CardDescription className="text-sm">
                Progetto completo + Bonus Edilizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende/P.A.</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €8.000 - €18.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Rilievo geometrico<br />
                  ✓ Progetto arch. + strutt.<br />
                  ✓ Pratiche edilizie<br />
                  ✓ Asseverazioni bonus
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/bundle/BDL-RISTR-BONUS">
                    Preventivo →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 3: Due Diligence Tecnica */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🏢
              </div>
              <CardTitle className="text-lg">Due Diligence Tecnica</CardTitle>
              <CardDescription className="text-sm">
                Verifica immobiliare pre-acquisizione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">M&A/Fondi/Finanziamenti</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €2.000 - €20.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Desktop/Standard/Enhanced DD<br />
                  ✓ Verifica amministrativa/strutturale<br />
                  ✓ Red Flag Report<br />
                  ✓ Stima costi interventi
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/configuratore/due-diligence">
                    🔍 Configuratore →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 4: Vulnerabilità Sismica */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🏛️
              </div>
              <CardTitle className="text-lg">Vulnerabilità Sismica</CardTitle>
              <CardDescription className="text-sm">
                Valutazione e miglioramento sismico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende/P.A.</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €5.000 - €25.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Rilievo strutturale<br />
                  ✓ Indagini materiali<br />
                  ✓ Modellazione FEM<br />
                  ✓ Progetto miglioramento
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/configuratore/sismica">
                    🛡️ Configuratore →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 5: Ampliamento */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🏭
              </div>
              <CardTitle className="text-lg">Ampliamento Produttivo</CardTitle>
              <CardDescription className="text-sm">
                Espansione capannoni industriali
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende/P.A.</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €12.000 - €35.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Progetto strutturale<br />
                  ✓ Pratiche autorizzative<br />
                  ✓ Calcoli carichi<br />
                  ✓ Direzione lavori
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/bundle/BDL-AMPLIAMENTO">
                    Preventivo →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 6: Collaudo */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                ✅
              </div>
              <CardTitle className="text-lg">Collaudo Statico</CardTitle>
              <CardDescription className="text-sm">
                Certificazione opere strutturali
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende/P.A.</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €2.500 - €12.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Ispezione opere<br />
                  ✓ Verifica calcoli<br />
                  ✓ Prove carico<br />
                  ✓ Certificato collaudo
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/configuratore/collaudo">
                    Configuratore →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 7: Antincendio */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🔥
              </div>
              <CardTitle className="text-lg">Antincendio</CardTitle>
              <CardDescription className="text-sm">
                Progettazione prevenzione incendi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende/P.A.</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €2.000 - €8.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Valutazione rischio<br />
                  ✓ Progetto antincendio<br />
                  ✓ SCIA VVF<br />
                  ✓ Assistenza sopralluogo
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/configuratore/antincendio">
                    🔥 Configuratore →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 8: Efficientamento Energetico */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                ⚡
              </div>
              <CardTitle className="text-lg">Efficientamento Energetico</CardTitle>
              <CardDescription className="text-sm">
                Riqualificazione energetica edifici
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende/P.A.</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €2.500 - €8.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ APE ante/post<br />
                  ✓ Diagnosi energetica<br />
                  ✓ Progetto interventi<br />
                  ✓ Accesso incentivi
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href="/bundle/BDL-EFF-ENERGETICO">
                    Preventivo →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demand-Driven Explanation */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-600 text-white">E-Commerce Demand-Driven</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Non un E-Commerce Tradizionale
              </h2>
              <p className="text-lg text-gray-600">
                A differenza degli e-commerce standard, non vendiamo prodotti "a scaffale". <br/>
                <span className="font-semibold">Ogni servizio è personalizzato sulle tue esigenze specifiche.</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <div className="text-red-600 font-bold mb-2">❌ E-Commerce Tradizionale</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Prodotto fisso a catalogo</li>
                  <li>• Prezzo non negoziabile</li>
                  <li>• "Aggiungi al carrello" immediato</li>
                  <li>• Pagamento unico anticipato</li>
                  <li>• Nessuna personalizzazione</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 border-2 border-green-500">
                <div className="text-green-600 font-bold mb-2">✅ Studio Ing. Domenico Romano (Demand-Driven)</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Servizio personalizzato</strong> su tue esigenze</li>
                  <li>• <strong>Preventivo ad-hoc</strong> entro 24 ore</li>
                  <li>• <strong>Configurazione guidata</strong> via quiz</li>
                  <li>• <strong>Pagamenti milestone</strong> (acconto + SAL)</li>
                  <li>• <strong>Dashboard real-time</strong> avanzamento</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 italic">
                "Prima capiamo le tue esigenze, poi configuriamo il servizio perfetto per te."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Come Funziona</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Processo Demand-Driven in 5 Step
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-base mb-2">Richiesta Preventivo</h3>
              <p className="text-gray-600 text-sm">
                Compila quiz (2 min) o contattaci direttamente
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-base mb-2">Preventivo Personalizzato</h3>
              <p className="text-gray-600 text-sm">
                Ricevi preventivo ad-hoc entro 24 ore
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-base mb-2">Firma Digitale</h3>
              <p className="text-gray-600 text-sm">
                Accetti online in piattaforma sicura
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-base mb-2">Pagamenti Milestone</h3>
              <p className="text-gray-600 text-sm">
                Acconto + SAL (Stati Avanzamento Lavori)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                5
              </div>
              <h3 className="font-bold text-base mb-2">Dashboard Real-Time</h3>
              <p className="text-gray-600 text-sm">
                Monitora avanzamento e documenti 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Pronto per un Preventivo Personalizzato?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Servizi certificati ISO 9001 e ISO 27001. Preventivo gratuito in 24 ore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/quiz">
                Richiedi Preventivo Gratuito →
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/login">
                Accedi Area Riservata
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Studio Ing. Domenico Romano</h3>
              <p className="text-gray-600 text-sm mb-4">
                Ingegneria e architettura certificata ISO 9001 e ISO 27001
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">ISO 9001:2015</Badge>
                <Badge variant="outline" className="text-xs">ISO 27001:2022</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Servizi</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/bundle/BDL-CONSULENZA" className="hover:text-blue-600">Consulenza Tecnica</Link></li>
                <li><Link href="/bundle/BDL-RISTR-BONUS" className="hover:text-blue-600">Ristrutturazione</Link></li>
                <li><Link href="/configuratore/due-diligence" className="hover:text-blue-600">Due Diligence Tecnica</Link></li>
                <li><Link href="/bundle/BDL-EFF-ENERGETICO" className="hover:text-blue-600">Efficientamento Energetico</Link></li>
                <li><Link href="/bundle/BDL-AMPLIAMENTO" className="hover:text-blue-600">Ampliamento Produttivo</Link></li>
                <li><Link href="/bundle/BDL-COLLAUDO" className="hover:text-blue-600">Collaudo Statico</Link></li>
                <li><Link href="/bundle/BDL-ANTINCENDIO" className="hover:text-blue-600">Antincendio</Link></li>
                <li><Link href="/bundle/BDL-VULN-SISMICA" className="hover:text-blue-600">Vulnerabilità Sismica</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legale & Contatti</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/legal/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-blue-600">Termini e Condizioni</Link></li>
                <li className="pt-2 border-t">📧 info@studio-romano.it</li>
                <li>📞 +39 XXX XXXXXXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>© 2025 Studio Ing. Domenico Romano - P.IVA IT12345678901</p>
            <p className="mt-2">
              Certificato <strong>ISO 9001:2015</strong> (Qualità) | <strong>ISO 27001:2022</strong> (Sicurezza) |
              <strong> PCI-DSS Compliant</strong> (Pagamenti) | <strong>GDPR Compliant</strong> (Privacy)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
