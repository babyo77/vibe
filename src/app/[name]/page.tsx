import { redirect } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const room = params.name;
  const username = searchParams["ref"];
  let user = null;

  const res = await fetch(`${process.env.SOCKET_URI}/api/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payload: username ? "user" : "roomAdmin",
      text: username ? username : room,
    }),
    cache: "no-cache",
  });
  if (res.ok) {
    user = await res.json();
  }

  if (!user) return {};
  return {
    title: `Vibe x ${user?.name?.split(" ")[0] || "404"} `,
    description: `${user?.name || "404"}'s Inviting you to listen together`,
    icons: [
      {
        rel: "icon",
        url: user?.imageUrl || "/",
      },
    ],
    openGraph: {
      images: [
        {
          width: 736,
          height: 464,
          url:
            "https://getvibe.in/api/og?image=" +
              user?.imageUrl +
              "&name=" +
              user?.name || "/",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@tanmay11117",
      title: `${user?.name?.split(" ")[0]} Vibe`,
      description: `${user?.name?.split(" ")[0]} is listening on Vibe`,
      images:
        "https://getvibe.in/api/og?image=" +
          user?.imageUrl +
          "&name=" +
          user?.name || "/",
    },
  };
}
function page({ params }: { params: { name: string } }) {
  const name = params.name;
  redirect(`/v?room=${name}`);
}

export default page;
