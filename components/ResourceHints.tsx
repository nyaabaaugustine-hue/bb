"use client";

import { preconnect, prefetchDNS } from "react-dom";

/** Warms the Cloudinary CDN connection before the hero image is requested. */
export default function ResourceHints() {
  preconnect("https://res.cloudinary.com");
  prefetchDNS("https://res.cloudinary.com");
  return null;
}
