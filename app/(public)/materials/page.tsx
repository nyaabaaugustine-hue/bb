import type { Metadata } from "next"; import { Shop } from "@/components/Tools"; import PageHero from "@/components/PageHero"; import { IMG } from "@/lib/data";
export const metadata: Metadata = { title: "Materials shop" };
export default function Materials() { return <><PageHero eyebrow="Materials shop" title="Catalogue, quotes, project supply" intro="Build your list, see an estimate, and request a quote. An agent applies wholesale pricing for projects." img={IMG.build1} /><div className="wrap"><Shop /></div></>; }
