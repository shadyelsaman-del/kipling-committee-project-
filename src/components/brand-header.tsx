import Link from "next/link";

export function BrandHeader() {
  return (
    <header className="bg-brand-black">
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-center">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display font-black uppercase tracking-wide text-brand-cream text-xl">
            Kipling
          </span>
          <span className="font-script text-brand-400 text-2xl leading-none">
            Graduates
          </span>
        </Link>
      </div>
    </header>
  );
}
