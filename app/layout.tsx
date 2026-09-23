import type { Metadata } from 'next'
import { Noto_Sans_Devanagari, Poppins, Inter } from 'next/font/google'
import GovHeader from '@/components/GovHeader'
import GovFooter from '@/components/GovFooter'
import './globals.css'

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-devanagari',
  display: 'swap',
})
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SamadhanSetu — समाधान-सेतु | सार्वजनिक शिकायत एवं नवाचार पोर्टल | SIH 2026',
  description:
    'Government of Jharkhand — SamadhanSetu is a Digital Platform to Crowdsource Societal Challenges and Facilitate Collaborative Problem Solving Through Universities & Industry Partnerships.',
  keywords:
    'SamadhanSetu, SIH 2026, Smart India Hackathon, Jharkhand, societal innovation, problem solving, universities, industry, grievance portal',
  openGraph: {
    title: 'SamadhanSetu — समाधान-सेतु | Government of Jharkhand',
    description: 'Connecting Citizens, Universities & Industry — One Problem at a Time.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className={`${notoDevanagari.variable} ${poppins.variable} ${inter.variable}`}>
        <GovHeader />
        <main id="main-content">
          {children}
        </main>
        <GovFooter />
      </body>
    </html>
  )
}
