import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BUILDFlow ERP — Construction Enterprise Management",
  description: "Modular Enterprise Resource Planning for Medium Construction Enterprises",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased bg-background text-content-main font-sans">
        {children}
      </body>
    </html>
  );
}

