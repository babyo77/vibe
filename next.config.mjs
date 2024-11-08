/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedump.vercel.app",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "wsrv.nl",
      },
      {
        protocol: "https",
        hostname: "c.saavncdn.com",
      },
    ],
  },
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    BACKEND_URI: process.env.BACKEND_URI,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URL: process.env.SPOTIFY_REDIRECT_URL,
    SOCKET_URI: process.env.SOCKET_URI,
    COOKIES: process.env.COOKIES,
    LOCK_SECRET: process.env.LOCK_SECRET,
    STREAM_URL: process.env.STREAM_URL,
    GLOBAL_BACKEND_URI: process.env.GLOBAL_BACKEND_URI,
  },
};

export default nextConfig;
