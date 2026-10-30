"use client";

import { useState } from "react";
import Img from "./Img";
import { Key, Land, Crane, Wrench } from "./Icons";

const ICONS = [Key, Land, Crane, Wrench];
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function TeamPhoto({ photo, name, role, index }: { photo?: string; name?: string; role: string; index: number }) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[index % ICONS.length];

  if (photo && !failed) {
    return (
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-moss via-moss to-ink">
        <Img id={photo} alt={name ? `${name}, ${role}` : `B B Homes ${role}`} sizes="(min-width:1024px) 25vw, 50vw" className="transition duration-500 group-hover:scale-105" onError={() => setFailed(true)} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink/40 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-moss via-moss to-ink">
      <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-terra/30 blur-2xl" />
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cream/10 text-sand ring-1 ring-cream/20 backdrop-blur">
        {name ? <span className="font-serif text-2xl font-bold">{initials(name)}</span> : <Icon width={34} height={34} strokeWidth={1.5} />}
      </span>
    </div>
  );
}
