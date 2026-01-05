import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Studio Ing. Romano - Gestione Incarichi",
  description: "Piattaforma integrata ERP + eCommerce per Studio di Ingegneria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="font-sans antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
