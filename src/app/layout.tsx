import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "OnDemandPsych — Psychiatric Clinical Co-Pilot",
    template: "%s | OnDemandPsych",
  },
  description:
    "Psychiatry-specific clinical decision support delivering real-time reasoning, safer care decisions, and chart-ready documentation. Built by Dr. Tanveer A. Padder, MD.",
  keywords: [
    "psychiatric clinical co-pilot",
    "AI psychiatry",
    "clinical decision support",
    "psychiatric documentation",
  ],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: "https://ondemandpsych.com",
    title: "OnDemandPsych — Psychiatric Clinical Co-Pilot",
    description:
      "Psychiatry-specific clinical decision support delivering real-time reasoning, safer care decisions, and chart-ready documentation.",
    images: [{ url: "/logo.webp" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${syne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
