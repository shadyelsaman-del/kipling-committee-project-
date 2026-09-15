import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        <h1 className="text-3xl font-bold">Kipling Food Orders</h1>
        <p className="mt-2 text-gray-600">Class F &middot; 2027</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/order"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
        >
          Order Food
        </Link>
        <Link
          href="/status"
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-100 transition"
        >
          Check My Order Status
        </Link>
      </div>
    </main>
  );
}
