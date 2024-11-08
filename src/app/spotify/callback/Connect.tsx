"use client";
import api from "@/lib/api";
import { spotifyUser } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa";

function Connect({ data }: { data: spotifyUser }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const handleLogin = async () => {
      const res = await api.post(`${process.env.SOCKET_URI}/api/auth`, data);
      if (res.success) {
        await api.post(`/api/login`, data);
        router.back();
      }
      if (res.error) {
        setError(res.error);
      }
    };
    handleLogin();
  }, [router, data]);
  if (error) {
    return (
      <div className=" flex text-7xl flex-col items-center justify-center h-screen">
        <FaSpotify />
        <p className=" text-lg text-center max-md:text-sm mt-2 text-white">
          {error}
        </p>
      </div>
    );
  }
  return (
    <div className=" flex text-7xl flex-col items-center justify-center h-screen">
      <FaSpotify />
    </div>
  );
}

export default Connect;
