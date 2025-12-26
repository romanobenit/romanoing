'use client'

import { MessaggiMonitor } from './messaggi-monitor'
import { LogAIMonitor } from './log-ai-monitor'

interface DashboardMonitorsProps {
  isTitolare: boolean
}

export function DashboardMonitors({ isTitolare }: DashboardMonitorsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Messaggi Monitor - Solo per TITOLARE */}
      {isTitolare && <MessaggiMonitor limit={5} showOnlyUnread={true} />}

      {/* Log AI Monitor - Per tutti, ma TITOLARE vede tutti i log */}
      <LogAIMonitor
        limit={5}
        showOnlyUnverified={isTitolare}
        isTitolare={isTitolare}
      />
    </div>
  )
}
