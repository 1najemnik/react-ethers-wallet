import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: process.env.NODE_ENV === 'production' ? '/react-ethers-wallet' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/react-ethers-wallet' : '',
    trailingSlash: true,
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;