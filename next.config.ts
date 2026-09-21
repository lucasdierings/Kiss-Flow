import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

// Permite que `next dev` enxergue os bindings do Cloudflare (D1, R2)
initOpenNextCloudflareForDev();

export default nextConfig;
