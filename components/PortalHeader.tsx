import Link from "next/link";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";

export default function PortalHeader({ admin = false }: { admin?: boolean }) {
  return (
    <header className="sticky top-0 z-[55] border-b border-line bg-card/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="B B Homes public website" className="shrink-0">
          <span className="sr-only">B B Homes</span>
          <Logo height={30} />
        </Link>
        <div className="min-w-0 flex-1 border-l border-line pl-3">
          <p className="truncate text-sm font-bold text-ink">{admin ? "Property operations" : "Customer portal"}</p>
          <p className="hidden text-xs text-mute sm:block">{admin ? "Private team workspace" : "Your property journey"}</p>
        </div>
        <nav aria-label="Portal actions" className="flex shrink-0 items-center gap-1 sm:gap-2">
          {admin ? (
            <>
              <Link href="/account" className="btn hidden min-h-10 px-3 text-xs sm:inline-flex">My account</Link>
              <Link href="/" className="btn hidden min-h-10 px-3 text-xs md:inline-flex">View website</Link>
            </>
          ) : (
            <Link href="/homes" className="btn hidden min-h-10 px-3 text-xs sm:inline-flex">Browse homes</Link>
          )}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
