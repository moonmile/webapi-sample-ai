import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: "お席タブレット | 日経寿司",
  description: "店内タブレットからの注文とレビュー投稿をサポートするアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-800 py-4 text-center text-xs text-white">
            © {currentYear} 日経寿司 | 店内タブレットシステム
          </footer>
        </div>
      </body>
    </html>
  );
}
