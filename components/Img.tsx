"use client";
import Image, { type ImageLoaderProps } from "next/image";
import { cld } from "@/lib/data";

// Cloudinary does the resizing, so Next serves its URL directly instead of re-processing it.
// Absolute URLs (assets hosted on another Cloudinary account) are already sized at the source.
const loader = ({ src, width }: ImageLoaderProps) => (src.startsWith("https://") ? src : cld(src, width));

/** Fills its (relatively positioned) parent. Give the parent an aspect ratio or height. */
export default function Img({ id, alt, sizes = "100vw", priority, fetchPriority, className = "", onError }: { id: string; alt: string; sizes?: string; priority?: boolean; fetchPriority?: "high" | "low" | "auto"; className?: string; onError?: () => void }) {
  return (
    <Image
      loader={loader}
      src={id}
      alt={alt}
      sizes={sizes}
      priority={priority}
      fetchPriority={fetchPriority}
      fill
      decoding="async"
      placeholder="empty"
      className={`bg-sand/40 object-cover ${className}`}
      onError={onError}
    />
  );
}
