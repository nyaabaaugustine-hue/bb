import type { Metadata } from "next"; import { Projection } from "@/components/Tools"; import Card from "@/components/Card"; import PageHero from "@/components/PageHero"; import { listings, IMG } from "@/lib/data";
export const metadata: Metadata = { title: "Invest" };
export default function Invest() { return <><PageHero eyebrow="Invest" title="Land, portfolio, development" intro="Start with land, grow into rentals. Projections are illustrative only and are not advice or a promise of returns." img={IMG.village} />
  <div className="wrap"><Projection /><h2 className="mb-4 mt-12 text-2xl">Open to investors</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.filter((l) => l.when === 2).map((l) => <Card key={l.slug} l={l} />)}</div></div></>; }
