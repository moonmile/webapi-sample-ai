import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navigationLinks = [
  { href: "/", label: "ホーム" },
  { href: "/categories", label: "カテゴリー" },
  { href: "/cart", label: "カート" },
  { href: "/order-complete", label: "注文状況" },
  { href: "/reviews", label: "レビュー投稿" },
];

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
          <header className="bg-rose-600 text-white shadow-lg shadow-rose-900/20">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="text-2xl font-semibold tracking-wide">
                日経寿司 タブレット
              </Link>
              <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-4 py-2 transition-colors hover:bg-white/20"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-white py-4 text-center text-xs text-slate-500">
            © {currentYear} 日経寿司 / 店内タブレットシステム
          </footer>
        </div>
      </body>
    </html>
  );
}
