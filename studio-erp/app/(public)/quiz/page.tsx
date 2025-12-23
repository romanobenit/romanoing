"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type QuizStep = 1 | 2 | 3 | 4;

interface QuizAnswers {
  tipo: string;
  esigenza: string;
  budget: string;
  urgenza: string;
}

export default function QuizPage() {
  const [step, setStep] = useState<QuizStep>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    tipo: "",
    esigenza: "",
    budget: "",
    urgenza: "",
  });
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const handleAnswer = (key: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));

    // Auto-advance after selection
    setTimeout(() => {
      if (step < 4) {
        setStep((prev) => (prev + 1) as QuizStep);
      } else {
        calculateRecommendation({ ...answers, [key]: value });
      }
    }, 300);
  };

  const calculateRecommendation = (finalAnswers: QuizAnswers) => {
    // Logica di raccomandazione basata sulle risposte
    const { tipo, esigenza } = finalAnswers;

    if (
      tipo === "privato" &&
      (esigenza === "ristrutturazione" || esigenza === "bonus")
    ) {
      setRecommendation("BDL-RISTR-BONUS");
    } else if (
      tipo === "condominio" &&
      (esigenza === "sismica" || esigenza === "sicurezza")
    ) {
      setRecommendation("BDL-VULN-SISMICA");
    } else if (
      (tipo === "azienda" || tipo === "commerciale") &&
      (esigenza === "antincendio" || esigenza === "sicurezza")
    ) {
      setRecommendation("BDL-ANTINCENDIO");
    } else {
      // Default: scegli in base al tipo
      if (tipo === "privato") setRecommendation("BDL-RISTR-BONUS");
      else if (tipo === "condominio") setRecommendation("BDL-VULN-SISMICA");
      else setRecommendation("BDL-ANTINCENDIO");
    }
  };

  const getBundleInfo = (code: string) => {
    const bundles: Record<string, any> = {
      "BDL-RISTR-BONUS": {
        nome: "Ristrutturazione con Bonus",
        icon: "🏗️",
        descrizione: "Perfetto per ristrutturazioni private con bonus edilizi",
        prezzo: "€8.000 - €18.000",
        durata: "6-12 mesi",
      },
      "BDL-VULN-SISMICA": {
        nome: "Vulnerabilità Sismica",
        icon: "🏛️",
        descrizione: "Ideale per condomini e valutazione sismica",
        prezzo: "€5.000 - €25.000",
        durata: "2-4 mesi",
      },
      "BDL-ANTINCENDIO": {
        nome: "Antincendio",
        icon: "🔥",
        descrizione: "Perfetto per attività commerciali e aziende",
        prezzo: "€2.000 - €8.000",
        durata: "2-4 mesi",
      },
    };
    return bundles[code];
  };

  if (recommendation) {
    const bundle = getBundleInfo(recommendation);
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-green-100 text-green-800">
              ✓ Quiz Completato
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Abbiamo il Servizio Perfetto per Te!
            </h1>
          </div>

          <Card className="border-2 border-blue-300 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                {bundle.icon}
              </div>
              <CardTitle className="text-3xl">{bundle.nome}</CardTitle>
              <p className="text-gray-600 mt-2">{bundle.descrizione}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Prezzo</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {bundle.prezzo}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Durata</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {bundle.durata}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button asChild className="w-full" size="lg">
                  <Link href={`/bundle/${recommendation}`}>
                    Scopri Tutti i Dettagli →
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Link href={`/checkout?bundle=${recommendation}`}>
                    Acquista Ora
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep(1);
                    setAnswers({ tipo: "", esigenza: "", budget: "", urgenza: "" });
                    setRecommendation(null);
                  }}
                >
                  ← Rifai il Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Non sei sicuro? Esplora tutti i nostri servizi:</p>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="/bundle/BDL-RISTR-BONUS" className="text-blue-600 hover:underline">
                Ristrutturazione
              </Link>
              <Link href="/bundle/BDL-VULN-SISMICA" className="text-blue-600 hover:underline">
                Vulnerabilità Sismica
              </Link>
              <Link href="/bundle/BDL-ANTINCENDIO" className="text-blue-600 hover:underline">
                Antincendio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4">Quiz Gratuito</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trova il Servizio Perfetto per Te
          </h1>
          <p className="text-gray-600">
            Rispondi a 4 semplici domande • Richiede meno di 2 minuti
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Domanda {step} di 4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Chi sei?"}
              {step === 2 && "Qual è la tua esigenza principale?"}
              {step === 3 && "Qual è il tuo budget orientativo?"}
              {step === 4 && "Quando vorresti iniziare?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {step === 1 && (
              <>
                <Button
                  variant={answers.tipo === "privato" ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleAnswer("tipo", "privato")}
                >
                  <div>
                    <div className="font-semibold">Privato</div>
                    <div className="text-sm text-gray-600">
                      Ho bisogno di un intervento per la mia abitazione
                    </div>
                  </div>
                </Button>
                <Button
                  variant={answers.tipo === "condominio" ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleAnswer("tipo", "condominio")}
                >
                  <div>
                    <div className="font-semibold">Condominio</div>
                    <div className="text-sm text-gray-600">
                      Sono un amministratore o proprietario in condominio
                    </div>
                  </div>
                </Button>
                <Button
                  variant={answers.tipo === "azienda" ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleAnswer("tipo", "azienda")}
                >
                  <div>
                    <div className="font-semibold">Azienda</div>
                    <div className="text-sm text-gray-600">
                      Ho un'attività commerciale o industriale
                    </div>
                  </div>
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Button
                  variant={answers.esigenza === "ristrutturazione" ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleAnswer("esigenza", "ristrutturazione")}
                >
                  <div>
                    <div className="font-semibold">Ristrutturazione</div>
                    <div className="text-sm text-gray-600">
                      Voglio ristrutturare e accedere ai bonus edilizi
                    </div>
                  </div>
                </Button>
                <Button
                  variant={answers.esigenza === "sismica" ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleAnswer("esigenza", "sismica")}
                >
                  <div>
                    <div className="font-semibold">Sicurezza Sismica</div>
                    <div className="text-sm text-gray-600">
                      Devo valutare la vulnerabilità sismica dell'edificio
                    </div>
                  </div>
                </Button>
                <Button
                  variant={answers.esigenza === "antincendio" ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleAnswer("esigenza", "antincendio")}
                >
                  <div>
                    <div className="font-semibold">Prevenzione Incendi</div>
                    <div className="text-sm text-gray-600">
                      Ho bisogno di pratiche antincendio (SCIA VVF)
                    </div>
                  </div>
                </Button>
                <Button
                  variant={answers.esigenza === "altro" ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleAnswer("esigenza", "altro")}
                >
                  <div>
                    <div className="font-semibold">Altro</div>
                    <div className="text-sm text-gray-600">
                      Ho un'esigenza diversa
                    </div>
                  </div>
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <Button
                  variant={answers.budget === "basso" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("budget", "basso")}
                >
                  Fino a €5.000
                </Button>
                <Button
                  variant={answers.budget === "medio" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("budget", "medio")}
                >
                  €5.000 - €15.000
                </Button>
                <Button
                  variant={answers.budget === "alto" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("budget", "alto")}
                >
                  Oltre €15.000
                </Button>
                <Button
                  variant={answers.budget === "nonlo" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("budget", "nonsociao")}
                >
                  Non lo so ancora
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <Button
                  variant={answers.urgenza === "subito" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("urgenza", "subito")}
                >
                  Il prima possibile
                </Button>
                <Button
                  variant={answers.urgenza === "1-3mesi" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("urgenza", "1-3mesi")}
                >
                  Tra 1-3 mesi
                </Button>
                <Button
                  variant={answers.urgenza === "3-6mesi" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("urgenza", "3-6mesi")}
                >
                  Tra 3-6 mesi
                </Button>
                <Button
                  variant={answers.urgenza === "oltre6" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleAnswer("urgenza", "oltre6")}
                >
                  Oltre 6 mesi
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back button */}
        {step > 1 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setStep((prev) => (prev - 1) as QuizStep)}
            >
              ← Torna Indietro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
