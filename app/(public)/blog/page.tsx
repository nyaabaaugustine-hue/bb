import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Img from "@/components/Img";
import { articles } from "@/lib/blog";
import { IMG } from "@/lib/data";

export const metadata: Metadata = {
  title: "News & stories",
  description: "Practical guides to finding, buying, renting, and building a home in Ghana.",
};

export default function BlogIndex() {
  const [featured, ...moreArticles] = articles;

  return (
    <>
      <PageHero
        eyebrow="News & stories"
        title="Clearer steps toward a place of your own"
        intro="Practical ideas for finding a home, planning a build, and making confident property decisions in Ghana."
        img={IMG.village}
      />
      <div className="wrap !py-10 md:!py-14">
        {featured && (
          <article className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr] md:gap-10">
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-line focus-visible:ring-offset-cream"
              aria-label={`Read: ${featured.title}`}
            >
              <Img
                id={featured.image}
                alt=""
                sizes="(min-width: 768px) 55vw, 100vw"
                className="transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </Link>
            <div className="py-2">
              <p className="eyebrow">{featured.category}</p>
              <h2 className="mt-2 text-2xl leading-snug md:text-3xl">
                <Link href={`/blog/${featured.slug}`} className="hover:text-terra">
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-xl text-mute">{featured.excerpt}</p>
              <p className="mt-4 text-sm text-mute">{featured.readTime}</p>
              <Link
                href={`/blog/${featured.slug}`}
                className="mt-5 inline-flex items-center gap-2 font-semibold text-terra underline decoration-transparent underline-offset-4 transition hover:decoration-current"
              >
                Read the guide <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        )}

        {moreArticles.length > 0 && (
          <section className="mt-12 border-t border-line pt-8 md:mt-16 md:pt-10" aria-labelledby="guides-heading">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">From the team</p>
                <h2 id="guides-heading" className="mt-1 text-2xl md:text-3xl">
                  Guides for the decisions ahead
                </h2>
              </div>
              <Link href="/contact" className="text-sm font-semibold text-terra underline underline-offset-4">
                Ask our team a question
              </Link>
            </div>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {moreArticles.map((article) => (
                <article key={article.slug} className="group">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-line"
                    aria-label={`Read: ${article.title}`}
                  >
                    <Img
                      id={article.image}
                      alt=""
                      sizes="(min-width: 640px) 45vw, 100vw"
                      className="transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mute">
                    <span className="font-semibold text-terra">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="mt-2 text-xl leading-snug">
                    <Link href={`/blog/${article.slug}`} className="hover:text-terra">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-mute">{article.excerpt}</p>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-line underline-offset-4 transition hover:text-terra hover:decoration-terra"
                  >
                    Read the guide <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
