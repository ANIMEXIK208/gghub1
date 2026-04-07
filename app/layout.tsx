import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ProductProvider } from '../contexts/ProductContext'
import { UserProvider } from '../contexts/UserContext'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { AnnouncementsProvider } from '../contexts/AnnouncementsContext'
import { ContactProvider } from '../contexts/ContactContext'
import { ChatProvider } from '../contexts/ChatContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GGHub - Premium Gaming Accessories & Service',
  description: 'Shop premium gaming accessories with clear service, fast delivery, and simple support at GGHub.',
}

function isAuthPage(pathname: string): boolean {
  return pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/admin/login') || pathname.includes('/auth');
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Note: In client component, we'll handle conditional rendering
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProductProvider>
          <UserProvider>
            <AuthProvider>
              <CartProvider>
                <AnnouncementsProvider>
                  <ContactProvider>
                    <ChatProvider>
                      <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">
                          {children}
                        </main>
                        <Footer />
                      </div>
                    </ChatProvider>
                  </ContactProvider>
                </AnnouncementsProvider>
              </CartProvider>
            </AuthProvider>
          </UserProvider>
        </ProductProvider>
      </body>
    </html>
  )
}