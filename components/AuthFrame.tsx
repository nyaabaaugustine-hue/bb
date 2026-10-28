import Link from "next/link";
import Img from "@/components/Img";
import { IMG } from "@/lib/data";

export default function AuthFrame({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <section className="wrap !pb-16 !pt-28 sm:!pt-32">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-line bg-card shadow-sm lg:min-h-[620px] lg:grid-cols-[1fr_0.92fr]">
        <aside className="relative isolate flex min-h-56 flex-col justify-end overflow-hidden bg-ink px-6 py-7 text-white sm:min-h-72 sm:px-9 sm:py-9 lg:min-h-full lg:px-11 lg:py-12">
          <Img
            id={IMG.home2}
            alt="A welcoming home surrounded by greenery"
            sizes="(min-width: 1024px) 480px, 100vw"
            priority
            className="-z-10 opacity-55"
          />
          <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
          <Link href="/" className="absolute left-6 top-6 text-sm font-semibold text-white/90 underline-offset-4 hover:underline sm:left-9 sm:top-9">
            B B Homes
          </Link>
          <div className="max-w-md">
            <p className="text-sm font-semibold text-sand">Your property journey, in one place</p>
            <h1 className="mt-3 text-3xl leading-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/85 sm:text-base">{description}</p>
          </div>
        </aside>
        <div className="flex items-center px-5 py-8 sm:px-9 sm:py-10 lg:px-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
    </section>
  );
}
