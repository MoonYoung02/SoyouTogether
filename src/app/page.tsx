import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="surface-card overflow-hidden">
      <div className="grid gap-8 p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-10">
        <div>
          <p className="kicker">공동 소유 투자 데모</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            나의 첫 건물을 소유하고,
            <br />
            소유의 경험을 누려보세요.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
            사전예약금 등록부터 목표 달성, 공모 오픈, 예약 이행(투자 전환)까지 사용자 흐름을 실제 서비스처럼 체험할 수 있습니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="primary-btn" href="/같이소유">
              같이 소유 시작하기
            </Link>
            <Link className="ghost-btn" href="/browse">
              매물 지도 보기
            </Link>
            <Link className="ghost-btn" href="/admin">
              수요 데이터 보기
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-[#4b63f5] to-[#3655ef] p-6 text-white shadow-sm">
          <p className="text-sm text-blue-100">오늘의 하이라이트</p>
          <p className="mt-3 text-3xl font-semibold">공모 준비 12건 진행 중</p>
          <p className="mt-1 text-sm text-blue-100">사용자 투표 기반 매입 검토 현황</p>
          <div className="mt-6 rounded-2xl bg-white/15 p-4">
            <p className="text-xs text-blue-100">현재 데모에서 가능한 액션</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>한도 검증 후 사전예약금 등록</li>
              <li>목표 달성 시 공모 오픈 대기 전환</li>
              <li>예약 이행 시 보유 전환 및 신뢰 점수 반영</li>
            </ul>
          </div>
          <Link className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2c46d7]" href="/같이소유">
            대시보드 열기
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-7 py-4 text-xs text-slate-500 lg:px-10">
        목업 데이터 기반 데모이므로 실제 로그인/결제/매입 연동은 포함되지 않습니다.
      </div>
    </section>
  );
}
