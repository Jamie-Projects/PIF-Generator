import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIF Generator — Property Information Forms",
  description: "Generate BASPI-compliant Property Information Forms with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
