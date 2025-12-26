'use client'

import { useState } from 'react'
import { CreditCard, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Milestone {
  id: number
  codice: string
  nome: string
  descrizione: string
  importo: number
  stato: string
  dataScadenza?: string
}

interface MilestonePaymentProps {
  milestone: Milestone
  incaricoCodice: string
}

export function MilestonePayment({ milestone, incaricoCodice }: MilestonePaymentProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePayment = async () => {
    setProcessing(true)

    try {
      // Crea Stripe Checkout Session
      const response = await fetch('/api/cliente/pagamenti/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: milestone.id,
        }),
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        alert('Errore nella creazione della sessione di pagamento')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Errore durante il pagamento. Riprova.')
    } finally {
      setProcessing(false)
    }
  }

  const isPaid = milestone.stato === 'PAGATO'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {milestone.codice}: {milestone.nome}
              {isPaid && <CheckCircle className="w-5 h-5 text-green-600" />}
            </CardTitle>
            <CardDescription>{milestone.descrizione}</CardDescription>
          </div>
          <Badge variant={isPaid ? 'success' : 'destructive'}>
            {isPaid ? 'Pagato' : 'Da pagare'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Importo</span>
          <span className="text-2xl font-bold">
            €{parseFloat(milestone.importo.toString()).toLocaleString('it-IT', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Due Date */}
        {milestone.dataScadenza && !isPaid && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Scadenza</span>
            <span className="font-medium">
              {new Date(milestone.dataScadenza).toLocaleDateString('it-IT')}
            </span>
          </div>
        )}

        {/* Payment Button */}
        {!isPaid && (
          <div className="pt-4 border-t">
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Elaborazione...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Paga con Carta
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Pagamento sicuro tramite Stripe</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Pagamento completato</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Grazie per il pagamento. Riceverai una ricevuta via email.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
