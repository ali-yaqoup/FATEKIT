import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FATEKIT — مكياج فاخر",
  description: "مكياج فاخر مصمم ليمنحكِ إطلالة لا تُنسى.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${playfair.variable} ${ibmPlexArabic.variable}`}>
      <body className="bg-background text-on-background antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
