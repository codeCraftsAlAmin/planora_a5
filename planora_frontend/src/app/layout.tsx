import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { AppProvider } from "@/providers/app-provider";

export const metadata: Metadata = {
  title: "Planora | Event Management Platform",
  description:
    "Planora is a polished event platform for discovering, hosting, and managing public and private experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
