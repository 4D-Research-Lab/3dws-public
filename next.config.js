/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  rewrites: async () => [
    {
      source: "/public/explorer.html",
      destination: "/pages/api/explorer.js",
    },
    {
      source: "/public/story.html",
      destination: "/pages/api/story.js",
    },
  ],

}


module.exports = nextConfig
