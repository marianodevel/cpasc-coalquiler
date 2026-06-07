import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Bolsa de Co-Alquiler | CPASC",
    template: "%s | CPASC",
  },
  description:
    "Encontrá o publicá espacios de co-alquiler entre abogados matriculados en el Colegio Público de la Abogacía de la Provincia de Santa Cruz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
