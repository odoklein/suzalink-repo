import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import "./elan-theme.css";
import Providers from "@/components/providers/Providers";
import { Analytics } from "@vercel/analytics/next"

const displayFont = Bricolage_Grotesque({
  variable: "--font-elan-display",
  subsets: ["latin"],
});

const sansFont = DM_Sans({
  variable: "--font-elan-sans",
  subsets: ["latin"],
});

const monoFont = DM_Mono({
  variable: "--font-elan-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "élan | Plateforme d'exécution commerciale",
  description: "La plateforme d'exécution commerciale qui transforme l'activité en résultats.",
icons: {
    icon: [
        { url: "/elan-mark.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
    apple: "/elan-mark.svg",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} elan-app antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
