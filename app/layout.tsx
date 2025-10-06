import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "./states/provider";
import { Toaster } from "sonner";

// Font setup
const geistSans = Geist( {
  variable: "--font-geist-sans",
  subsets: ["latin"],
} );

const geistMono = Geist_Mono( {
  variable: "--font-geist-mono",
  subsets: ["latin"],
} );

// ✅ Metadata lengkap dengan konfigurasi PWA
export const metadata: Metadata = {
  title: "Chat App",
  description: "Chat real-time dengan Socket.IO dan Next.js",
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout( {
  children,
}: Readonly<{
  children: React.ReactNode;
}> )
{
  return (
    <html lang="en">
      <body
        className={ `${ geistSans.variable } ${ geistMono.variable } antialiased bg-white text-gray-900` }
      >
        <ReduxProvider>
          { children }
          <Toaster richColors position="top-center" />
          {/* ✅ Toaster hanya sekali di root */ }
        </ReduxProvider>
      </body>
    </html>
  );
}
