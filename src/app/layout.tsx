import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sünger Kesim Optimizasyonu - 3D Foam Cut Optimizer",
  description: "3D sünger kesimi için minimum israf ile optimum yerleştirme hesaplama aracı. En az malzeme kaybı ile sünger parçalarınızı optimize edin.",
  keywords: "sünger kesim, 3D optimizasyon, malzeme optimizasyonu, bin packing, foam cutting",
  authors: [{ name: "Foam Cut Optimizer" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
