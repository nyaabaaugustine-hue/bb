"use client";
import Image, { type ImageLoaderProps } from "next/image";
import { cld } from "@/lib/data";

// Cloudinary does the resizing, so Next serves its URL directly instead of re-processing it.
const loader = ({ src, width }: ImageLoaderProps) => cld(src, width);

/** Fills its (relatively positioned) parent. Give the parent an aspect ratio or height. */
export default function Img({ id, alt, sizes = "100vw", priority, className = "" }: { id: string; alt: string; sizes?: string; priority?: boolean; className?: string }) {
  return <Image loader={loader} src={id} alt={alt} sizes={sizes} priority={priority} fill className={`object-cover ${className}`} />;
}
