import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ProductProvider } from '../contexts/ProductContext'
import { CartProvider } from '../contexts/CartContext'
import { AnnouncementsProvider } from '../contexts/AnnouncementsContext'
import { ContactProvider } from '../contexts/ContactContext'
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GGHub - Premium Gaming Accessories & Service',
  description: 'Shop premium gaming accessories with clear service, fast delivery, and simple support at GGHub.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <AnnouncementsProvider>
                <ContactProvider>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">
                      {children}
                    </main>
                    <Footer />
                  </div>
                </ContactProvider>
              </AnnouncementsProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  )
}