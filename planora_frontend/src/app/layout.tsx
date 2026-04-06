import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
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
          <NextTopLoader
            color="#0a564a"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl
            easing="ease"
            speed={200}
            shadow="0 0 10px rgba(10, 86, 74, 0.35), 0 0 6px rgba(248, 213, 126, 0.22)"
            showSpinner={false}
          />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
