import { Browse } from "@/components/common/Browse";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: `Vibe Rooms`,
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
async function page() {
  const vibeId = cookies().get("vibeId")?.value;
  if (!vibeId) redirect("/");
  const res = await fetch(`${process.env.SOCKET_URI}/api/rooms`, {
    headers: {
      cookie: `vibeIdR=${vibeId}`,
    },
  });
  if (!res.ok) redirect("/");

  return <Browse data={await res.json()} />;
}

export default page;
