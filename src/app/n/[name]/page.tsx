import { redirect } from "next/navigation";

function page({ params }: { params: { name: string } }) {
  const name = params.name;
  redirect(`https://ngl-drx.vercel.app/${name}`);
}

export default page;
