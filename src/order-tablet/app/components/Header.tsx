'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinks = [
  { href: "/", label: "ホーム" },
  { href: "/categories", label: "カテゴリー" },
  { href: "/cart", label: "カート" },
  { href: "/order-history", label: "注文状況" },
  { href: "/reviews", label: "レビュー投稿" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return null;
  }

  return (
    <header className="bg-white text-slate-900 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-wide text-red-600">
          🍣 日経寿司 タブレット
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-gray-600 transition-colors hover:text-red-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
