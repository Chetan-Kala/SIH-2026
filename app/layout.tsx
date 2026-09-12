import type { Metadata } from 'next'
import { Noto_Sans_Devanagari, Newsreader, Work_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import './globals.css'

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-devanagari',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SamadhanSetu — समाधान-सेतु | SIH 2026',
  description:
    'A Digital Platform to Crowdsource Societal Challenges and Facilitate Collaborative Problem Solving Through Universities & Industry Partnerships. Connecting Citizens, Universities & Industry — One Problem at a Time.',
  keywords: 'SamadhanSetu, SIH 2026, Smart India Hackathon, Jharkhand, societal innovation, problem solving, universities, industry',
  openGraph: {
    title: 'SamadhanSetu — समाधान-सेतु',
    description: 'Connecting Citizens, Universities & Industry — One Problem at a Time.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className={`${notoSansDevanagari.variable} ${newsreader.variable} ${workSans.variable}`}>
        <Navbar />
        <main className="page-wrapper">
          {children}
        </main>
      </body>
    </html>
  )
}
