'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, User, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Message {
  id: number
  testo: string
  mittente: {
    nome: string
    cognome: string
    ruolo: string
  }
  createdAt: string
  letto: boolean
}

interface MessageThreadProps {
  incaricoId: number
  incaricoCodice: string
  messages: Message[]
  currentUserEmail: string
}

export function MessageThread({
  incaricoId,
  incaricoCodice,
  messages: initialMessages,
  currentUserEmail,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/cliente/messaggi?incaricoId=${incaricoId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setMessages(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Setup polling for new messages (every 5 seconds)
  useEffect(() => {
    // Initial fetch
    fetchMessages()

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages()
    }, 5000) // Poll every 5 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [incaricoId])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch('/api/cliente/messaggi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incaricoId,
          testo: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        // Refresh messages immediately after sending
        await fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchMessages()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Messaggi - {incaricoCodice}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs hidden sm:inline">
            {isRefreshing ? 'Aggiornamento...' : 'Aggiorna'}
          </span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="space-y-4 max-h-96 overflow-y-auto scroll-smooth">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun messaggio ancora</p>
              <p className="text-sm mt-1">Inizia una conversazione con lo studio</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.mittente.ruolo === 'COMMITTENTE'

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isOwnMessage ? 'bg-primary/10' : 'bg-gray-200'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>

                  {/* Message */}
                  <div className={`flex-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-sm font-medium ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {isOwnMessage
                          ? 'Tu'
                          : `${message.mittente.nome} ${message.mittente.cognome}`}
                      </span>
                      <span className={`text-xs text-gray-500 ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                        {new Date(message.createdAt).toLocaleString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.testo}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          {/* Invisible div for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Real-time indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Messaggi aggiornati automaticamente ogni 5 secondi</span>
        </div>

        {/* New Message Input */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Scrivi un messaggio..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              rows={3}
              className="flex-1"
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Premi Invio per inviare, Shift+Invio per andare a capo
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
