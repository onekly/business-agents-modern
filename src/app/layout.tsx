import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Agents Platform",
  description: "AI-powered business intelligence and data collection platform with intelligent agents",
  keywords: ["AI", "Business Intelligence", "Data Collection", "Automation", "Agents"],
  authors: [{ name: "Business Agents Team" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}