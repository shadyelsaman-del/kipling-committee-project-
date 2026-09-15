import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        <h1 className="font-display font-black text-3xl uppercase tracking-wide">
          Food Orders
        </h1>
        <p className="mt-2 text-gray-600">Class F &middot; 2027</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/order"
          className="rounded-full bg-brand-600 px-6 py-3 text-white font-medium hover:bg-brand-700 transition"
        >
          Order Food
        </Link>
        <Link
          href="/status"
          className="rounded-full border border-brand-200 px-6 py-3 font-medium hover:bg-brand-50 transition"
        >
          Check My Order Status
        </Link>
      </div>
    </main>
  );
}
