import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesEasyAI | Sales CRM and Outreach Assistant",
  description:
    "Organize leads, manage customer relationships, and prepare helpful sales follow-ups from one focused workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
