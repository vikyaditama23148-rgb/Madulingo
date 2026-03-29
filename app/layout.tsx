import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MaduLingo - Belajar Bahasa Madura',
  description: 'Platform gamifikasi untuk belajar bahasa dan budaya Madura',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MaduLingo',
  },
  openGraph: {
    title: 'MaduLingo',
    description: 'Belajar bahasa Madura dengan cara yang menyenangkan',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#E11D48',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      
      <link rel="icon" href="/icons/icon-192.png" />
      <link rel="apple-touch-icon" href="/icons/icon-512.png" />
    </head>
      <body>
        <div className="batik-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
