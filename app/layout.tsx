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
  title: {
    default: "FATEKIT — متجر المكياج الفاخر والعناية بالبشرة",
    template: "%s | FATEKIT",
  },
  description: "علامة تجارية فلسطينية فاخرة للمكياج والعناية بالبشرة، صممت خصيصاً لإبراز تميزكِ وإطلالتكِ الاستثنائية. الدفع نقداً عند الاستلام (COD) مع توصيل سريع لكافة المدن.",
  keywords: ["مكياج", "تجميل", "مكياج فاخر", "FATEKIT", "عناية بالبشرة", "أحمر شفاه", "فاونديشن", "فلسطين", "الدفع عند الاستلام"],
  authors: [{ name: "FATEKIT" }],
  creator: "FATEKIT",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: "https://fatekit.com",
    title: "FATEKIT — متجر المكياج الفاخر والعناية بالبشرة",
    description: "مكياج فاخر مصمم ليمنحكِ إطلالة لا تُنسى بأعلى معايير الجودة والفخامة.",
    siteName: "FATEKIT",
  },
  twitter: {
    card: "summary_large_image",
    title: "FATEKIT — متجر المكياج الفاخر والعناية بالبشرة",
    description: "مكياج فاخر مصمم ليمنحكِ إطلالة لا تُنسى بأعلى معايير الجودة والفخامة.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${playfair.variable} ${ibmPlexArabic.variable}`} suppressHydrationWarning>
      <body className="bg-background text-on-background antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
