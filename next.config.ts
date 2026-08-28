import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
     remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Local embedding model (onnxruntime-node's native binary) must not be bundled by Turbopack.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
};

export default nextConfig;
