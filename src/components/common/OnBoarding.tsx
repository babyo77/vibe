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
import { useUserContext } from "@/store/userStore";
import { useState } from "react";
import { onBoarding } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function OnBoarding() {
  const { user } = useUserContext();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(() => {
    const data =
      typeof window !== "undefined" ? localStorage.getItem("o") : false;
    return data ? JSON.parse(data) : true;
  });

  const handleOnboarding = () => {
    if (currentStep !== onBoarding.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    localStorage.setItem("o", "false");
    setShowOnboarding(false);
  };
  return (
    <Dialog key={"user Login"} open={showOnboarding || false}>
      <DialogTrigger className=" absolute h-0 w-0 p-0 "></DialogTrigger>
      <DialogContent className="w-fit flex flex-col items-center justify-center bg-transparent border-none">
        <DialogHeader className=" h-0">
          <DialogTitle />
          <DialogDescription />
        </DialogHeader>
        <div className=" w-[316px] h-[414px] flex flex-col gap-4 bg-gradient-to-t to-[#FFFFFF]/25 overflow-hidden from-black/50 gradient  rounded-[28px] shadow-md ">
          {user && showOnboarding && (
            <>
              <div className={`${currentStep == 3 ? "" : "bg-black "} h-1/2 `}>
                {currentStep == 3 ? (
                  <div className=" p-7 pb-0">
                    <Avatar className="size-32 cursor-pointer">
                      <AvatarImage
                        width={500}
                        height={500}
                        alt="Profile"
                        className=" rounded-full object-cover"
                        src={
                          user?.imageUrl ||
                          "https://imagedump.vercel.app/notFound.jpg"
                        }
                      />
                      <AvatarFallback>SX</AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <video
                    preload="true"
                    playsInline
                    src={onBoarding[currentStep].src}
                    className=" h-full w-full object-cover"
                    muted
                    loop
                    autoPlay
                  />
                )}
              </div>
              <div className=" flex flex-col justify-between flex-grow">
                <div className=" px-7">
                  <p className="  font-semibold text-2xl pb-0.5">
                    {currentStep == 3
                      ? `${user.name.split(" ")[0]}, Set your vibe `
                      : onBoarding[currentStep].heading}
                  </p>
                  <p className=" text-sm text-zinc-400">
                    {onBoarding[currentStep].description}
                  </p>
                </div>
                <div className=" flex w-full items-center justify-between p-7">
                  {currentStep !== 3 && (
                    <p
                      onClick={() => {
                        localStorage.setItem("o", "false");
                        setShowOnboarding(false);
                      }}
                      className=" text-zinc-400 text-base cursor-pointer"
                    >
                      Skip
                    </p>
                  )}

                  <Button
                    className={`${
                      currentStep == 3
                        ? "w-full bg-[#9747FF] hover:bg-[#9747FF]/80 text-white focus:outline-none outline-[#9747FF]"
                        : ""
                    } `}
                    onClick={handleOnboarding}
                    size={"default"}
                  >
                    {onBoarding[currentStep].ctaText}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OnBoarding;
