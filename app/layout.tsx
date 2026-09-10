import type { Metadata } from 'next'
import { Noto_Sans_Devanagari, Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import './globals.css'

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-devanagari',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SIH 2026 — झारखंड नवाचार पोर्टल',
  description:
    'नागरिकों की समस्याओं को विश्वविद्यालयों और उद्योगों से जोड़ने का डिजिटल मंच',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body
        className={`${notoSansDevanagari.variable} ${inter.variable} antialiased`}
        style={{ margin: 0, backgroundColor: '#f8fafc', minHeight: '100vh' }}
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
