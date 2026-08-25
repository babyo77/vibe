"use server";

import { cookies } from "next/headers";

export async function getLoggedInUser() {
  try {
    const vibeId = cookies().get("vibeId")?.value;
    const room = cookies().get("room")?.value;
    if (!vibeId) return null;
    const res = await fetch(`${process.env.SOCKET_URI}/api/vibe`, {
      headers: {
        Authorization: `${vibeId}`,
        cookie: `room=${room} `,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
    const data = await res.json();

    return data;
  } catch (error: any) {
    console.error("Error in getLoggedInUser:", error.message);
    return null;
  }
}
