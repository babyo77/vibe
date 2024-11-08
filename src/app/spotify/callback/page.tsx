"use client";
import { FaSpotify } from "react-icons/fa";
import Connect from "./Connect";
import { useEffect, useState } from "react";

function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const login = async () => {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));

        const userResponse = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${params.get("access_token")}`,
          },
        });

        if (!userResponse.ok) {
          console.error("User data request failed", userResponse.status);
          setError("Something went wrong. Please try again.");
          return;
        }

        const userDetails = await userResponse.json();
        setData(userDetails);
      } catch (err: any) {
        console.error("Error during login process", err);
        setError(err.message);
      }
    };
    login();
  }, []);

  if (data) {
    return <Connect data={data} />;
  }

  return (
    <div className="flex text-7xl flex-col items-center justify-center h-screen">
      <FaSpotify />
      <p className="text-lg text-center max-md:text-sm mt-2 text-white">
        {error}
      </p>
    </div>
  );
}

export default Page;
