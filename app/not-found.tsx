import Link from "next/link";
import Nav from "@/components/Nav";
import PublicFooter from "@/components/PublicFooter";
import { Arrow } from "@/components/Icons";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="wrap flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-3xl md:text-4xl">That page is not here.</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-mute">The link may be old or mistyped. Browse homes and land, or talk to the team and we will point you to the right place.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-primary">Back to the home page <Arrow width={16} height={16} /></Link>
          <Link href="/homes" className="btn">Browse homes</Link>
          <Link href="/contact" className="btn">Contact the team</Link>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
