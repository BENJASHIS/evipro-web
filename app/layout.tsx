import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import "./globals.css";

// GA4 (Google Ads / Analytics). El measurement ID es público: viaja en el HTML del cliente.
// ponytail: snippet oficial de Google vía next/script; GA4 "medición mejorada" cubre la
// navegación SPA sin código extra. Sube a @next/third-parties solo si necesitas eventos custom.
const GA_ID = 'G-2HXXPSN49M';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "EVIPro — Medicina Integral y Cannabis Medicinal",
  description: "Plataforma de membresías médicas en Medicina Integral y Cannabis Medicinal. Cusco, Perú.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.png',    sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-white font-sans">
        {children}
        <Analytics />
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
        <footer className="border-t border-subtle bg-ink py-10 px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Contacto */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-mono text-muted">
              <a href="tel:+51942185939" className="hover:text-white transition-colors">
                942 185 939
              </a>
              <a href="tel:+51924074152" className="hover:text-white transition-colors">
                924 074 152
              </a>
              <a href="mailto:consulta@evipro.pe" className="hover:text-white transition-colors">
                consulta@evipro.pe
              </a>
              <span className="text-faint">
                Av. Infancia 410 Consultorio 2, Wanchaq — Cusco, Perú
              </span>
            </div>
            {/* Redes sociales */}
            <div className="flex justify-center gap-6">
              <a href="https://www.instagram.com/eviproia" target="_blank" rel="noopener noreferrer"
                className="text-faint hover:text-white transition-colors text-xs font-mono flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @eviproia
              </a>
              <a href="https://www.facebook.com/profile.php?id=61591227427770" target="_blank" rel="noopener noreferrer"
                className="text-faint hover:text-white transition-colors text-xs font-mono flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                EVIPro
              </a>
            </div>
            {/* Links legales */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-mono text-faint">
              <span>© {new Date().getFullYear()} EVIPro · RUC 10439904572</span>
              <a href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</a>
              <a href="/politica-devoluciones" className="hover:text-white transition-colors">Política de Cancelaciones</a>
              <a href="/libro-reclamaciones" className="hover:text-white transition-colors">Libro de Reclamaciones</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
