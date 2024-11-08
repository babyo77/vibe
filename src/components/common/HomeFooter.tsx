"use client";
import { cn } from "@/lib/utils";
import { InstagramLogo } from "@phosphor-icons/react/dist/icons/InstagramLogo";
import { XLogo } from "@phosphor-icons/react/dist/icons/XLogo";
import Link from "next/link";
import React from "react";

function HomeFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        `absolute bottom-7 flex-col text-white/80 gap-0.5  text-sm max-md:bottom-4 w-full flex justify-center items-center`,
        className
      )}
    >
      <div className=" w-8/12  max-md:w-full pt-4 max-md:px-5 border-t px-0.5 flex justify-between items-center border-white/20">
        <p>
          Made by{" "}
          <span className=" hover:text-white hover:underline hover:underline-offset-4 transition-all duration-500">
            <Link href="https://tanmayo7.vercel.app/" target="_blank">
              babyo7_
            </Link>
          </span>{" "}
          &{" "}
          <span className=" hover:text-white hover:underline hover:underline-offset-4 transition-all duration-500">
            <Link href="https://www.instagram.com/fixing_x/" target="_blank">
              Ajay Sharma
            </Link>
          </span>
        </p>
        <div className="flex text-xl items-center gap-2">
          <Link href="https://www.instagram.com/fixing_x/" target="_blank">
            <InstagramLogo
              // size={24}
              className=" hover:text-white transition-all duration-500"
            />
          </Link>

          <Link href="https://twitter.com/tanmay11117" target="_blank">
            <XLogo
              // size={24}
              className=" hover:text-white transition-all duration-500"
            />
          </Link>
        </div>
      </div>
      <div className=" px-0.5 flex gap-4 text-xs pt-1.5  text-white/70 justify-start w-8/12 max-md:w-full max-md:px-5">
        <Link href={"/terms"} className=" hover:text-white">
          Terms
        </Link>
        <Link href={"/privacy"} className=" hover:text-white">
          Privacy
        </Link>
        <Link href={"/"} className=" hover:text-white">
          Home
        </Link>
      </div>
    </footer>
  );
}

export default HomeFooter;
