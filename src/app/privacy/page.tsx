import Privacy from "./Privacy";

export async function generateMetadata() {
  return {
    title: `Vibe Privacy Policy`,
    description: `Join Vibe, the music platform where your votes decide the playlist. Discover, vote, and enjoy trending tracks with a vibrant community. Tune in and let your voice be heard!`,

    icons: { icon: "/favicon.png" },
    openGraph: {
      title: "Vibe - Votes decide the beats",
      description:
        "Explore, vote, and enjoy a community-driven music experience where your votes decide the beats.",
      url: "https://getvibe.in",
      type: "website",
      images: [
        {
          url: "https://getvibe.in/logo.svg",
          width: 1200,
          height: 630,
          alt: "Vibe - Votes decide the beats",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@tanmay11117",
      title: "Vibe - Votes decide the beats",
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
  };
}

function page() {
  return <Privacy />;
}

export default page;
