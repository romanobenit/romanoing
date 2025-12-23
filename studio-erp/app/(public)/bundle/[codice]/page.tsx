import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEuro } from "@/lib/utils";

interface BundleData {
  id: number;
  codice: string;
  nome: string;
  descrizione: string;
  target: string;
  prezzoMin: number;
  prezzoMax: number;
  durataMesi: number;
  servizi: string[];
  procedure: string[];
  milestone: Array<{
    codice: string;
    nome: string;
    percentuale: number;
    descrizione?: string;
  }>;
}

async function getBundle(codice: string): Promise<BundleData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/bundle/${codice}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Errore nel recupero del bundle:", error);
    return null;
  }
}

const bundleIcons: Record<string, string> = {
  "BDL-RISTR-BONUS": "🏗️",
  "BDL-VULN-SISMICA": "🏛️",
  "BDL-ANTINCENDIO": "🔥",
};

const bundleColors: Record<string, string> = {
  "BDL-RISTR-BONUS": "blue",
  "BDL-VULN-SISMICA": "orange",
  "BDL-ANTINCENDIO": "red",
};

export default async function BundlePage({
  params,
}: {
  params: { codice: string };
}) {
  const bundle = await getBundle(params.codice);

  if (!bundle) {
    notFound();
  }

  const icon = bundleIcons[bundle.codice] || "📦";
  const color = bundleColors[bundle.codice] || "blue";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                SR
              </div>
              <span className="font-bold text-lg">Studio Ing. Romano</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Torna alla Home
              </Link>
              <Button asChild>
                <Link href={`/checkout?bundle=${bundle.codice}`}>
                  Acquista Ora
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 bg-${color}-100 rounded-full flex items-center justify-center text-6xl mx-auto mb-6`}>
              {icon}
            </div>
            <Badge className="mb-4">{bundle.target}</Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {bundle.nome}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {bundle.descrizione}
            </p>
          </div>

          {/* Key Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600 font-normal">
                  Prezzo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatEuro(bundle.prezzoMin)} - {formatEuro(bundle.prezzoMax)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600 font-normal">
                  Durata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {bundle.durataMesi} {bundle.durataMesi === 1 ? "mese" : "mesi"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600 font-normal">
                  Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 capitalize">
                  {bundle.target}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Servizi Inclusi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✓ Servizi Inclusi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {bundle.servizi.map((servizio, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{servizio}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Milestone Pagamenti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💳 Piano Pagamenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {bundle.milestone.map((m, index) => (
                  <li key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-900">
                        {m.nome}
                      </span>
                      <Badge variant="secondary">{m.percentuale}%</Badge>
                    </div>
                    {m.descrizione && (
                      <p className="text-sm text-gray-600">{m.descrizione}</p>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 mt-4 pt-4 border-t">
                Il primo pagamento (acconto del {bundle.milestone[0]?.percentuale}%) viene effettuato online. I successivi verranno richiesti al raggiungimento di ogni milestone.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Pronto a Iniziare?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Acconto del {bundle.milestone[0]?.percentuale}% online, il resto a milestone
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                  <Link href={`/checkout?bundle=${bundle.codice}`}>
                    Acquista Ora →
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/quiz">
                    ← Rifai il Quiz
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Altri Servizi */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Esplora anche gli altri servizi
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {["BDL-RISTR-BONUS", "BDL-VULN-SISMICA", "BDL-ANTINCENDIO"]
              .filter((code) => code !== bundle.codice)
              .map((code) => (
                <Link
                  key={code}
                  href={`/bundle/${code}`}
                  className="text-blue-600 hover:underline"
                >
                  {bundleIcons[code]}{" "}
                  {code === "BDL-RISTR-BONUS"
                    ? "Ristrutturazione"
                    : code === "BDL-VULN-SISMICA"
                    ? "Vulnerabilità Sismica"
                    : "Antincendio"}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Generate static params for the 3 MVP bundles
export async function generateStaticParams() {
  return [
    { codice: "BDL-RISTR-BONUS" },
    { codice: "BDL-VULN-SISMICA" },
    { codice: "BDL-ANTINCENDIO" },
  ];
}
