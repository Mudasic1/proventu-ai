import type { Metadata } from "next";
import { Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Proventu AI | Put Your Revenue Work in Motion",
  description:
    "Turn your offer and lead list into campaigns, clear priorities, and follow-ups your team can approve before the day gets busy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full antialiased ${bebasNeue.variable} ${outfit.variable}`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#10211c",
              border: "1px solid rgba(216, 255, 98, 0.22)",
              color: "#f4f2ea",
            },
          }}
        />
      </body>
    </html>
  );
}
