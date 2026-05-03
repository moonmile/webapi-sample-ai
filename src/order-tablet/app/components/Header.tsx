'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navigationLinks = [
  { href: "/", label: "ホーム" },
  { href: "/categories", label: "カテゴリー" },
  { href: "/order-history", label: "注文状況" },
  { href: "/reviews", label: "レビュー投稿" },
];

const actionLinks = [
  { href: "/cart", label: "🛒 カート" },
  { href: "/payment", label: "💳 お会計" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const items = JSON.parse(cart);
        const count = Array.isArray(items) ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  if (isHome) {
    return null;
  }

  return (
    <header className="bg-white text-slate-900 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-wide text-red-600">
          🍣 日経寿司 タブレット
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-gray-600 transition-colors hover:text-red-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-2 h-6 border-l border-gray-300"></div>
          {actionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-full px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
            >
              {link.label}
              {link.href === '/cart' && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
