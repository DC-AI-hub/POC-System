import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { I18nProvider } from '@/lib/i18n/context'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import { ReactPlugin } from '@stagewise-plugins/react'

export const metadata: Metadata = {
  title: '港交所POC系统',
  description: '费用管理与审批系统',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <I18nProvider>
          {children}
          <Toaster />
          <StagewiseToolbar 
            config={{
              plugins: [ReactPlugin],
            }}
          />
        </I18nProvider>
      </body>
    </html>
  )
}
