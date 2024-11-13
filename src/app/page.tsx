"use client";
import Image from "next/image";
import Blur from "@/components/Blur";
import HomeFooter from "@/components/common/HomeFooter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";
import useDebounce from "@/Hooks/useDebounce";
import Login from "@/components/common/Login";
function Page() {
  const [loader, setLoader] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const checkRoom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const roomName = e.target.value;
    setError(null);
    const isValidRoomId = /^[a-zA-Z0-9]+$/.test(roomName);

    if (roomName.trim().length == 0) return;
    if (roomName.length <= 3) {
      setError("Name is too short, minimum 4 characters");
      return;
    }

    if (roomName.length > 11) {
      setError("Name is too large, maximum 11 characters");
      return;
    }
    if (!isValidRoomId) {
      setError("Special characters not allowed");
      return;
    }
    setLoader(true);
    const res = await api.get(
      `${process.env.SOCKET_URI}/api/checkroom?r=${roomName}`,
      {
        showErrorToast: false,
      }
    );
    setLoader(false);
    if (res.error) {
      setError(res?.error);
    }
  };
  const makeRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const isValidRoomId = /^[a-zA-Z0-9]+$/.test(roomName);

    if (roomName.trim().length == 0) return;
    if (roomName.length <= 3) {
      setError("Name is too short, minimum 4 characters");
      return;
    }

    if (roomName.length > 11) {
      setError("Name is too large, maximum 11 characters");
      return;
    }
    if (!isValidRoomId) {
      setError("Special characters not allowed");
      return;
    }
    setLoader(true);
    const res = await api.get(
      `${process.env.SOCKET_URI}/api/checkroom?r=${roomName}`,
      { showErrorToast: false }
    );
    if (res.success) {
      window.location.href = `/${roomName}`;
      setLoader(false);
      return;
    }
    setLoader(false);
    if (res.error) {
      setError(res?.error);
    }
  };
  const handleCheckRoom = useDebounce(checkRoom, 200);
  return (
    <div className="  bg-[url('/mask.svg')] bg-no-repeat bg-cover ">
      <Blur className=" blur-2xl bg-transparent" />
      <motion.div
        initial={{
          opacity: 0,
          filter: "blur(10px)",
        }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{
          duration: 0.75,
        }}
        exit={{ opacity: 0 }}
        className=" min-h-dvh md:pb-[10dvh] min-w-dvw flex items-center justify-center flex-col bg-[url('/mask.svg')] bg-cover"
      >
        <div className="   w-8/12 max-xl:w-11/12 max-sm:w-full  max-lg:w-11/12 max-md:w-full flex max-md:gap-2 max-md:pt-8 justify-center flex-wrap items-center max-md:px-5">
          <div className=" w-1/2 max-md:text-center max-md:w-full flex font-semibold gap-4 flex-col max-md:justify-center max-md:items-center">
            <Image
              src={"/logo.svg"}
              className=" ml-1 size-16 max-md:size-20"
              alt="logo"
              height={80}
              width={80}
            />
            <p className=" text-6xl max-md:text-5xl -mt-3">
              Delightful <br />
              Music Parties
            </p>
            <p className=" -mt-4 text-6xl max-md:text-5xl text-with-image">
              Start Here.
            </p>
            <span className="ml-1 max-md:hidden font-normal text-lg leading-tight my-2.5 -mt-1 mb-1">
              Invite friends, enjoy high quality music
              <br /> & let votes will decide the beat🥂.
            </span>
            <span className="ml-1 max-md:flex hidden font-normal text-lg leading-tight my-2.5 -mt-1 mb-1">
              Invite friends, enjoy high quality music & let votes will decide
              the beat🥂.
            </span>

            <form
              onSubmit={makeRoom}
              className="w-[335px] h-[52px] pl-3 pr-1.5 py-1.5 bg-[#c8aeff]/0 rounded-xl border border-[#eaddff]/50 justify-between items-center inline-flex"
            >
              <div className="w-[164px] h-5 relative">
                <div
                  className={`left-0 top-0 absolute ${
                    roomName.length == 0 ? "text-white" : "text-white/60"
                  } transition-all duration-150  text-sm font-semibold leading-tight tracking-tight`}
                >
                  getvibe.in/
                </div>
                <input
                  min={4}
                  autoFocus
                  maxLength={11}
                  max={11}
                  onInput={(e) => setRoomName(e.currentTarget.value)}
                  onChange={handleCheckRoom}
                  placeholder="claim your vibe"
                  className="left-[68px] placeholder:animate-pulse placeholder:opacity-55 bg-transparent outline-none top-0 absolute text-white text-sm font-medium leading-tight tracking-tight"
                />
              </div>
              <Button
                disabled={
                  loader || typeof error === "string" || roomName.length === 0
                }
                type="submit"
                className="h-10 w-20 bg-white rounded-lg flex-col justify-center items-center gap-2 inline-flex"
              >
                {loader ? <LoaderCircle className=" animate-spin" /> : "Claim"}
              </Button>
            </form>

            <p className="h-4 text-red-500 font-normal text-xs -mt-2 px-1">
              {error}
            </p>
            {typeof window !== "undefined" &&
              !window.location.pathname.includes("/make") && <Login footer />}
          </div>
          <div className=" w-1/2  max-md:w-full">
            <video
              preload="true"
              playsInline
              src="/vibe.mp4"
              className=" rounded-xl"
              muted
              loop
              autoPlay
            />
          </div>
        </div>
        <HomeFooter />
      </motion.div>
    </div>
  );
}

export default Page;
