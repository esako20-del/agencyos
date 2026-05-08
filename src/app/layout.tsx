import type { Metadata } from 'next'
import { Syne, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400','500','600','700','800'] })
const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['300','400','500'] })

export const metadata: Metadata = {
  title: 'AgencyOS — Life Insurance Agency Operating System',
  description: 'AO Globe Life · American Income Life — Owner Command Center',
  manifest: '/manifest.json',
  themeColor: '#07090D',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-bg text-text font-body antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111820', border: '1px solid #1C2A3A', color: '#ECF0F5', fontSize: '13px' },
            success: { iconTheme: { primary: '#00E5A0', secondary: '#000' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
