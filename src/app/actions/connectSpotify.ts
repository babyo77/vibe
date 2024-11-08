"use server";

import { spotifyToken } from "@/lib/types";

const client_id = process.env.SPOTIFY_CLIENT_ID || "";
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || "";
const redirect_uri = process.env.SPOTIFY_REDIRECT_URL || "";

export async function connectSpotify(code: string) {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        client_id: client_id,
        client_secret: client_secret,
      }),
    });

    if (response.ok) {
      const spotifyData = (await response.json()) as spotifyToken;

      const userResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${spotifyData.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userDetails = await userResponse.json();
        return userDetails;
      }
      return null;
    }

    return null;
  } catch (error: any) {
    console.error("SPOTIFY ERROR", error.message);
    return null;
  }
}
