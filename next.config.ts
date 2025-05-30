import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'foamcutoptimizer'; // Define repository name

const nextConfig: NextConfig = {
  ...(isProd && {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'docs',
    basePath: `/${repoName}`,          // Add basePath
    assetPrefix: `/${repoName}/`,     // Add assetPrefix (note the trailing slash)
  }),
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
