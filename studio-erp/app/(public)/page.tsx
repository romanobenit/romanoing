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
                  Studio Ing. Romano
                </h1>
                <p className="text-xs text-gray-600">Ingegneria Strutturale</p>
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
                <Link href="/quiz">Inizia il Quiz</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-900 hover:bg-blue-200">
            Servizi di Ingegneria su Misura
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Dal Progetto alla Realizzazione,{" "}
            <span className="text-blue-600">Ti Guidiamo</span> in Ogni Fase
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Ristrutturazioni con bonus edilizi, sicurezza sismica, prevenzione incendi.
            <br />
            Scopri il servizio perfetto per le tue esigenze in 2 minuti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/quiz">
                🎯 Inizia il Quiz Gratuito
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href="#servizi">
                Esplora i Servizi
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Anni di Esperienza</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-blue-100">Progetti Completati</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Clienti Soddisfatti</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servizi" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4">I Nostri Servizi</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tre Soluzioni per Ogni Esigenza
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pacchetti completi progettati per privati, condomini e aziende
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Bundle 1: Ristrutturazione */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🏗️
              </div>
              <CardTitle>Ristrutturazione con Bonus</CardTitle>
              <CardDescription>
                Progettazione completa con pratiche bonus edilizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target</div>
                  <Badge variant="secondary">Privati</Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Prezzo</div>
                  <div className="text-2xl font-bold text-gray-900">
                    €8.000 - €18.000
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  ✓ Rilievo geometrico<br />
                  ✓ Progetto architettonico e strutturale<br />
                  ✓ Pratiche edilizie<br />
                  ✓ Direzione lavori<br />
                  ✓ Asseverazioni bonus
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/bundle/BDL-RISTR-BONUS">
                    Scopri di Più →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 2: Vulnerabilità Sismica */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🏛️
              </div>
              <CardTitle>Vulnerabilità Sismica</CardTitle>
              <CardDescription>
                Valutazione e miglioramento sismico edifici
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target</div>
                  <Badge variant="secondary">Condomini</Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Prezzo</div>
                  <div className="text-2xl font-bold text-gray-900">
                    €5.000 - €25.000
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  ✓ Rilievo strutturale<br />
                  ✓ Indagini materiali<br />
                  ✓ Modellazione FEM<br />
                  ✓ Relazione vulnerabilità<br />
                  ✓ Progetto miglioramento
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/bundle/BDL-VULN-SISMICA">
                    Scopri di Più →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle 3: Antincendio */}
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-3xl mb-4">
                🔥
              </div>
              <CardTitle>Antincendio</CardTitle>
              <CardDescription>
                Progettazione e pratiche prevenzione incendi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target</div>
                  <Badge variant="secondary">Aziende</Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Prezzo</div>
                  <div className="text-2xl font-bold text-gray-900">
                    €2.000 - €8.000
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  ✓ Valutazione rischio incendio<br />
                  ✓ Progetto antincendio<br />
                  ✓ Elaborati grafici<br />
                  ✓ SCIA VVF<br />
                  ✓ Assistenza sopralluogo
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/bundle/BDL-ANTINCENDIO">
                    Scopri di Più →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Come Funziona</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Semplice, Veloce, Trasparente
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Quiz Gratuito</h3>
              <p className="text-gray-600 text-sm">
                Rispondi a poche domande sulle tue esigenze
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Pacchetto Su Misura</h3>
              <p className="text-gray-600 text-sm">
                Ti suggeriamo il servizio perfetto per te
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Pagamento Online</h3>
              <p className="text-gray-600 text-sm">
                Pagamento sicuro con acconto del 30%
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Area Riservata</h3>
              <p className="text-gray-600 text-sm">
                Monitora l'avanzamento in tempo reale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Pronto a Iniziare il Tuo Progetto?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Scopri in 2 minuti quale servizio fa per te
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link href="/quiz">
              Inizia il Quiz Gratuito →
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Studio Ing. Romano</h3>
              <p className="text-gray-600 text-sm">
                Ingegneria strutturale e progettazione
                <br />
                al servizio dei tuoi progetti
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Servizi</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/bundle/BDL-RISTR-BONUS" className="hover:text-blue-600">Ristrutturazione</Link></li>
                <li><Link href="/bundle/BDL-VULN-SISMICA" className="hover:text-blue-600">Vulnerabilità Sismica</Link></li>
                <li><Link href="/bundle/BDL-ANTINCENDIO" className="hover:text-blue-600">Antincendio</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contatti</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📧 info@studio-romano.it</li>
                <li>📞 +39 XXX XXXXXXX</li>
                <li>📍 Via Example, Milano</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            © 2025 Studio Ing. Romano - Tutti i diritti riservati
          </div>
        </div>
      </footer>
    </div>
  );
}
