"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/config/firebase";
import api from "@/lib/api";
import { useUserContext } from "@/store/userStore";
import { spotifyUser, TUser } from "@/lib/types";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { FaSpotify } from "react-icons/fa";

function Login() {
  const { setUser, user } = useUserContext();
  const [loader, setLoader] = useState<boolean>(false);
  const handleLogin = async () => {
    try {
      setLoader(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.displayName && user.email && user.photoURL) {
        const payload: spotifyUser = {
          display_name: user.displayName,
          email: user.email,
          images: [{ url: user.photoURL }],
        };
        const res = await api.post(
          `${process.env.SOCKET_URI}/api/auth`,
          payload
        );
        if (res.success) {
          await api.post(`/api/login`, payload);
          setUser((res.data as any).data as TUser);
          window.location.reload();
        }
      } else {
        toast.error("Missing Name, Email and Photo URL");
      }
      setLoader(false);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  return (
    <Dialog key={"user Login"} open={user ? false : true}>
      <DialogTrigger className=" border max-md:px-0 max-md:border-none border-[#79747E] h-full flex justify-center items-center px-5 rounded-xl text-base">
        <p className=" max-md:hidden">Login / SignUp</p>
        <LogIn className=" size-6 text-zinc-200 hidden max-md:block" />
      </DialogTrigger>
      <DialogContent className="w-fit flex items-center justify-center bg-transparent border-none">
        <DialogHeader>
          <DialogTitle />
          <DialogDescription />
        </DialogHeader>
        <div className=" w-fit flex flex-col h-72 p-6 justify-between bg-zinc-500/70 rounded-2xl shadow-md">
          <div>
            <h1 className=" font-semibold text-2xl mb-2">Login Or SignUp</h1>
            <p className=" text-zinc-400 text-xl">
              lets get to know <br /> each other.
            </p>
          </div>
          <div className=" flex flex-col items-center gap-2 justify-center">
            <Button
              disabled={loader}
              onClick={handleLogin}
              className=" gap-1.5 items-center shadow-none px-7 py-5"
            >
              <FcGoogle className=" size-5" />
              {loader ? "Signing in..." : "Continue with Google"}
            </Button>
            {typeof window !== "undefined" &&
              window.navigator.userAgent.includes("Electron") && (
                <Link
                  href={`https://accounts.spotify.com/en/authorize?client_id=${
                    process.env.SPOTIFY_CLIENT_ID
                  }&scope=user-read-private%20user-read-email&response_type=token&redirect_uri=${encodeURIComponent(
                    process.env.SPOTIFY_REDIRECT_URL || ""
                  )}&show_dialog=true`}
                >
                  <Button className=" gap-1.5 items-center shadow-none px-7 py-5">
                    <FaSpotify className=" size-5" />
                    Continue with Spotify
                  </Button>
                </Link>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Login;
