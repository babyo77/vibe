import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "./store/userStore";
import { AudioProvider } from "./store/AudioContext";
import { GoogleTagManager } from "@next/third-parties/google";
import { Suspense } from "react";
import Script from "next/script";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: "Vibe - Shape the Playlist with Your Votes",
  description:
    "Join Vibe, the music platform where your votes decide the playlist. Discover, vote, and enjoy trending tracks with a vibrant community. Tune in and let your voice be heard!",
  keywords: [
    "music",
    "collaborative playlists",
    "music voting platform",
    "trending music",
    "interactive music",
    "community-driven playlists",
    "discover music",
    "vibe music",
  ],
  icons: { icon: "/favicon.png" },

  // OpenGraph Meta Tags
  openGraph: {
    title: "Vibe - Shape the Playlist with Your Votes",
    description:
      "Explore, vote, and enjoy a community-driven music experience where your votes decide the beats.",
    url: "https://getvibe.in",
    type: "website",
    images: [
      {
        url: "https://getvibe.in/logo.svg",
        width: 1200,
        height: 630,
        alt: "Vibe - Shape the Playlist with Your Votes",
      },
    ],
  },

  // Twitter Meta Tags
  twitter: {
    card: "summary_large_image",
    site: "@tanmay11117",
    title: "Vibe - Shape the Playlist with Your Votes",
    description:
      "Discover, vote, and influence the playlist in real-time on Vibe, the collaborative music platform.",
    images: [
      {
        url: "https://getvibe.in/logo.svg",
        width: 1200,
        height: 630,
        alt: "Vibe - Collaborative Music Platform",
      },
      {
        url: "https://getvibe.in/logo.svg",
        width: 800,
        height: 600,
        alt: "Vibe Music Collaboration",
      },
    ],
  },

  alternates: {
    canonical: "https://getvibe.in",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <GoogleTagManager gtmId="GTM-KS6FPVS3" />
      <GoogleAnalytics />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="microsoft-clarity-analytics">
          {`
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "GTM-KS6FPVS3");
  `}
        </Script>
        {/* <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-KS6FPVS3"
                height="0"
                width="0"
                style="display:none;visibility:hidden"
              ></iframe>
            `,
          }}
        /> */}
        <Suspense>
          <UserProvider>
            <AudioProvider>
              <Toaster
                position="bottom-left"
                visibleToasts={2}
                toastOptions={{
                  style: { background: "#6750A4" },
                  className: "rounded-xl w-fit text-white border-none",
                }}
              />
              {children}
            </AudioProvider>
          </UserProvider>
        </Suspense>
      </body>
      <Script id="seo" async type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Vibe",
          url: "https://getvibe.in",
          description:
            "A collaborative music platform where votes shape playlists.",
        })}
      </Script>
    </html>
  );
}
