import type { Metadata } from "next"; import Finder from "@/components/Finder"; import PageHero from "@/components/PageHero"; import { listings, IMG } from "@/lib/data";
export const metadata: Metadata = { title: "Find a home" };
export default function Homes() { return <><PageHero eyebrow="Find a home" title="Rentals, homes for sale, off-plan" intro="Filter by city, budget and timing. Every listing shows its price and next steps upfront." img={IMG.home2} /><div className="wrap"><Finder listings={listings} compact /></div></>; }
