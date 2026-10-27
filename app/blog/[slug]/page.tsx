import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { articles } from "@/lib/blog";
import { cld } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => articles.map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) return { title: "Guide not found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: cld(article.image, 1200) }],
    },
  };
}

export default async function BlogArticle({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) notFound();

  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <>
      <PageHero
        eyebrow={article.category}
        title={article.title}
        intro={article.excerpt}
        img={article.image}
      />
      <div className="wrap !pt-8 md:!pt-10">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href="/blog" className="font-semibold text-terra underline underline-offset-4 hover:text-ink">
            News &amp; stories
          </Link>
          <span className="mx-2 text-mute" aria-hidden="true">/</span>
          <span className="text-mute">{article.category}</span>
        </nav>

        <article className="mx-auto mt-8 max-w-3xl">
          <p className="mb-7 text-sm font-medium text-mute">{article.readTime}</p>
          {article.sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="text-xl leading-snug md:text-2xl">{section.heading}</h2>
              <div className="mt-3 space-y-4 text-base leading-7 text-ink/85">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.points && (
                <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-ink/85 marker:text-terra">
                  {section.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              )}
            </section>
          ))}
          <aside className="mt-10 rounded-xl bg-ink p-6 text-cream md:p-8">
            <p className="font-serif text-xl font-bold">Want to talk through your next step?</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-cream/80">
              Tell our team what you are looking for. We can help you explore homes, land, and build options.
            </p>
            <Link href="/contact" className="btn-primary mt-5 border-sand bg-sand text-ink hover:border-sand hover:bg-sand/90">
              Talk to the team
            </Link>
          </aside>
          <p className="mt-6 text-xs leading-5 text-mute">
            This guide is for general information only and is not legal or financial advice. Details and requirements can vary; verify information for your situation with qualified professionals before making a decision.
          </p>
        </article>

        {related.length > 0 && (
          <section className="mx-auto mt-14 max-w-3xl border-t border-line pt-8" aria-labelledby="related-guides-heading">
            <h2 id="related-guides-heading" className="text-2xl">Keep exploring</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <article key={item.slug} className="border-b border-line pb-5">
                  <p className="text-sm font-semibold text-terra">{item.category}</p>
                  <h3 className="mt-2 text-lg leading-snug">
                    <Link href={`/blog/${item.slug}`} className="hover:text-terra">{item.title}</Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-mute">{item.excerpt}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
