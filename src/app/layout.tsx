import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Base URL buat metadata (OG, dsb). Bisa di-override lewat env NEXT_PUBLIC_SITE_URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const siteDescription =
  "Kumpulan tools profesional untuk developer Roblox: Skybox Converter 3D, Robux Tax Calculator, Lua Formatter, Color3, dan lainnya.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CrestTools — Tools untuk Developer Roblox",
    template: "%s · CrestTools",
  },
  description: siteDescription,
  applicationName: "CrestTools",
  openGraph: {
    type: "website",
    siteName: "CrestTools",
    title: "CrestTools — Tools untuk Developer Roblox",
    description: siteDescription,
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#080b11",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080b11] text-slate-100">
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* FOOTER GLOBAL */}
        <footer className="border-t border-slate-800/80 bg-[#080b11] py-8 px-4 text-center text-xs text-slate-500 z-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <p>© 2026 CrestTools. Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-sky-400 transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:text-orange-400 transition-colors">
                Syarat Layanan
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
