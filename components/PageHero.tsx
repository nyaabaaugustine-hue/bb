import Img from "./Img";

/** Photo banner used at the top of inner pages. */
export default function PageHero({ eyebrow, title, intro, img }: { eyebrow: string; title: string; intro?: string; img: string }) {
  return (<section className="relative isolate overflow-hidden bg-ink text-cream">
    <Img id={img} alt="" priority sizes="100vw" className="-z-10 opacity-45" />
    <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
    <div className="wrap !pb-14 !pt-36 md:!pb-20 md:!pt-44"><p className="eyebrow fade-in !text-sand">{eyebrow}</p>
      <h1 className="fade-in mt-2 max-w-2xl text-3xl leading-tight md:text-5xl">{title}</h1>
      {intro && <p className="fade-in mt-3 max-w-xl text-cream/80">{intro}</p>}</div></section>);
}
