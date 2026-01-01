'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

const SERVIZI = [
  { nome: "Consulenza Tecnica", icon: "💡", href: "/configuratore/consulenza" },
  { nome: "Ristrutturazione", icon: "🏗️", href: "/configuratore/ristrutturazione" },
  { nome: "Due Diligence Tecnica", icon: "🏢", href: "/configuratore/due-diligence" },
  { nome: "Vulnerabilità Sismica", icon: "🏛️", href: "/configuratore/sismica" },
  { nome: "Ampliamento", icon: "🏗️", href: "/configuratore/ampliamento" },
  { nome: "Collaudo Statico", icon: "✅", href: "/configuratore/collaudo" },
  { nome: "Antincendio", icon: "🔥", href: "/configuratore/antincendio" },
  { nome: "Efficientamento Energetico", icon: "⚡", href: "/configuratore/efficientamento" },
  { nome: "PropTech/Blockchain R&D", icon: "✨", href: "/configuratore/proptech-blockchain" }
];

// Numero WhatsApp (sostituire con il numero reale)
const WHATSAPP_NUMBER = "393123456789"; // Formato: 39 + numero senza spazi
const WHATSAPP_MESSAGE = "Ciao, vorrei fissare una chiamata preliminare per discutere di un servizio.";

export default function HomePage() {
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                SR
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Technical Advisory Ing. Domenico Romano
                </h1>
                <p className="text-xs text-gray-600">Consulenza tecnica avanzata</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                  className="flex items-center gap-2"
                >
                  Esplora Servizi
                  <ChevronDown className={`w-4 h-4 transition-transform ${showServicesDropdown ? 'rotate-180' : ''}`} />
                </Button>

                {showServicesDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowServicesDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                      {SERVIZI.map((servizio, idx) => (
                        <Link
                          key={idx}
                          href={servizio.href}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                          onClick={() => setShowServicesDropdown(false)}
                        >
                          <span className="text-2xl">{servizio.icon}</span>
                          <span className="text-sm font-medium text-gray-900">{servizio.nome}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Accedi
              </Link>
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
            Technical Advisory{" "}
            <span className="text-blue-600">Certificato</span> e su Misura
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Preventivi online immediati con configuratori intelligenti. Pagamenti milestone-based sicuri.
            <br />
            <span className="font-semibold">Qualità certificata ISO 9001 | Sicurezza dati ISO 27001</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="#servizi">
                🎯 Configura il Tuo Servizio in 3 Minuti
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href="#servizi">
                Esplora Catalogo (9 Servizi)
              </Link>
            </Button>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Fissa una chiamata preliminare su WhatsApp
          </a>
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

      {/* Services Section - 9 Bundle */}
      <section id="servizi" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4">Catalogo Servizi Professionali</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            9 Soluzioni per Ogni Esigenza
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
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/consulenza">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-CONSULENZA">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
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
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/ristrutturazione">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-RISTR-BONUS">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
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
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/due-diligence">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-DUE-DILIGENCE">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
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
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/sismica">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-VULN-SISMICA">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 5: Ampliamento */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🏗️
              </div>
              <CardTitle className="text-lg">Ampliamento</CardTitle>
              <CardDescription className="text-sm">
                Progetto ampliamento residenziale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Privati/Aziende</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €3.000 - €12.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Progetto architettonico<br />
                  ✓ Permesso di costruire<br />
                  ✓ Progetto strutturale<br />
                  ✓ Verifica fattibilità
                </div>
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/ampliamento">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-AMPLIAMENTO">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
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
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/collaudo">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-COLLAUDO">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
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
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/antincendio">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-ANTINCENDIO">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
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
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/efficientamento">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-EFF-ENERGETICO">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 9: PropTech/Blockchain R&D */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                ✨
              </div>
              <CardTitle className="text-lg">PropTech/Blockchain R&D</CardTitle>
              <CardDescription className="text-sm">
                Ricerca tokenizzazione immobiliare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">Aziende/Fondi/Start-up</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  €3.000 - €48.000
                </div>
                <div className="text-xs text-gray-600">
                  ✓ Studio fattibilità tokenizzazione<br />
                  ✓ PoC Smart Contract + Dashboard<br />
                  ✓ Linee guida architettura<br />
                  ✓ Servizi R&D (ATECO 72.19)
                </div>
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/configuratore/proptech-blockchain">
                      ⚙️ Configura Servizio →
                    </Link>
                  </Button>
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <Link href="/bundle/BDL-PROPTECH-BLOCKCHAIN">
                      ℹ️ Info Dettagliate
                    </Link>
                  </Button>
                </div>
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
                <div className="text-green-600 font-bold mb-2">✅ Technical Advisory Ing. Domenico Romano (Demand-Driven)</div>
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
              <h3 className="font-bold text-base mb-2">Configura Servizio</h3>
              <p className="text-gray-600 text-sm">
                Usa il configuratore online (2-3 min)
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
            Pronto per Configurare il Tuo Servizio?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Servizi certificati ISO 9001 e ISO 27001. Preventivo personalizzato in 24 ore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="#servizi">
                Esplora i 9 Servizi →
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contattaci su WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Technical Advisory Ing. Domenico Romano</h3>
              <p className="text-gray-600 text-sm mb-4">
                Consulenza tecnica avanzata certificata ISO 9001 e ISO 27001
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">ISO 9001:2015</Badge>
                <Badge variant="outline" className="text-xs">ISO 27001:2022</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Servizi</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/configuratore/consulenza" className="hover:text-blue-600">Consulenza Tecnica</Link></li>
                <li><Link href="/configuratore/ristrutturazione" className="hover:text-blue-600">Ristrutturazione</Link></li>
                <li><Link href="/configuratore/due-diligence" className="hover:text-blue-600">Due Diligence Tecnica</Link></li>
                <li><Link href="/configuratore/efficientamento" className="hover:text-blue-600">Efficientamento Energetico</Link></li>
                <li><Link href="/configuratore/ampliamento" className="hover:text-blue-600">Ampliamento</Link></li>
                <li><Link href="/configuratore/proptech-blockchain" className="hover:text-blue-600">PropTech/Blockchain R&D</Link></li>
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
                <li><Link href="/legal/garanzia-consulenza" className="hover:text-blue-600">🔒 Garanzia Soddisfatti o Rimborsati</Link></li>
                <li className="pt-2 border-t">📧 info@studio-romano.it</li>
                <li>📞 +39 XXX XXXXXXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>© 2025 Technical Advisory Ing. Domenico Romano - P.IVA IT12345678901</p>
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
