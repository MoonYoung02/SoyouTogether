"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatWon } from "@/lib/format";
import { ToastMessage } from "@/components/ToastMessage";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, toast, clearToast } = useStore();
  const pathname = usePathname();
  const isBrowse = pathname === "/browse";

  return (
    <div className="min-h-screen text-slate-900">
      {isBrowse ? null : (
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#3e5bf2] px-2.5 py-1 text-xs font-semibold text-white">SOU</span>
              <nav className="flex items-center gap-2 text-sm">
                <Link className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-100" href="/">
                  홈
                </Link>
                <Link className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-100" href="/browse">
                  지도
                </Link>
              </nav>
            </div>
            <nav className="hidden items-center gap-3 text-sm sm:flex">
              <Link className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-100" href="/">
                같이 소유하기
              </Link>
              <Link className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-100" href="/browse">
                부동산 둘러보기
              </Link>
              <Link className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-100" href="/admin">
                수요 대시보드
              </Link>
            </nav>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-slate-600">예약 한도 {formatWon(user.reservationLimit)}</p>
            </div>
          </div>
        </header>
      )}
      <main className={isBrowse ? "h-screen overflow-hidden" : "mx-auto max-w-6xl px-4 py-6 sm:py-8"}>
        {children}
      </main>
      <ToastMessage message={toast} onClose={clearToast} />
    </div>
  );
}
