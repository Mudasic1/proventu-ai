import type { Metadata } from "next";
import "./globals.css";
import { Manrope, Syne } from "next/font/google";
import { Toaster } from "react-hot-toast";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "SalesEasyAI | Put Your Revenue Work in Motion",
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
      className={`h-full antialiased ${manrope.variable} ${syne.variable}`}
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
