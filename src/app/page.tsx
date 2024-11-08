"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Blur from "@/components/Blur";
import HomeFooter from "@/components/common/HomeFooter";
import { motion } from "framer-motion";
function Page() {
  return (
    <>
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
        className=" h-dvh w-dvw bg-[url('/mask.svg')] bg-no-repeat bg-cover"
      >
        <div className=" z-50 absolute w-full h-[87dvh] flex justify-center items-center">
          <div className=" w-8/12 max-md:w-full flex max-md:gap-6 max-md:pt-8 justify-center flex-wrap items-center max-md:px-5">
            <div className=" w-1/2 max-md:text-center  max-md:w-full flex font-semibold gap-4 flex-col max-md:justify-center max-md:items-center">
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
              <p className=" -mt-4 text-6xl max-md:text-5xl   text-with-image">
                Start Here.
              </p>
              <span className="ml-1 max-md:hidden font-normal text-lg leading-tight my-2.5 -mt-1 mb-1">
                Set up an room, invite friends and enjoy music. <br /> Host a
                memorable event today.
              </span>
              <span className="ml-1 max-md:flex hidden font-normal text-lg leading-tight my-2.5 -mt-1 mb-1">
                Set up an room, invite friends and enjoy music. Host a memorable
                event today.
              </span>
              <Link href={"/v"}>
                <Button
                  size={"lg"}
                  className="text-base font-semibold px-4 w-fit ml-1 "
                >
                  Create Your First Room
                </Button>
              </Link>
            </div>
            <div className=" w-1/2  max-md:w-full">
              <video
                src="/vibe.mp4"
                className=" rounded-xl"
                muted
                loop
                autoPlay
                controls
              />
            </div>
          </div>
        </div>
        <HomeFooter />
      </motion.div>
    </>
  );
}

export default Page;
