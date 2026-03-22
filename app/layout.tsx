import type { Metadata } from "next";
import { Bebas_Neue, Oswald } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const oswald = Oswald({
  weight: ['300', '400', '500', '600'],
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Backyard Chipirons 2026",
  description: "Gestion de course backyard ultra entre amis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bebasNeue.variable} ${oswald.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
