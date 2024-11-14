"use client";
import VolumeControl from "./VolumeControl";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import PlayButton from "./PlayButton";
import { useAudio } from "@/store/AudioContext";
import { useUserContext } from "@/store/userStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
function Controller({ className }: { className?: string }) {
  const { user } = useUserContext();
  const { playNext, playPrev, volume, setVolume } = useAudio();
  return (
    <div
      className={cn(
        "flex -mt-1 items-center w-full justify-center gap-4",
        className
      )}
    >
      <div className=" flex items-center w-fit gap-2">
        <svg
          onClick={() => {
            if (user?.role == "admin") {
              playPrev();
              return;
            }
            toast.error("Only admin can play prev");
          }}
          aria-label="play prev"
          className="cursor-pointer size-5 rotate-180"
          width="21"
          height="16"
          viewBox="0 0 21 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.5392 10.1308C14.7748 9.95045 14.9656 9.71919 15.0968 9.4547C15.228 9.19022 15.2962 8.89953 15.2962 8.60494C15.2962 8.31034 15.228 8.01966 15.0968 7.75517C14.9656 7.49068 14.7748 7.25942 14.5392 7.07912C11.4881 4.74472 8.08115 2.90473 4.4458 1.62803L3.78112 1.39453C2.51079 0.948656 1.16819 1.79812 0.996162 3.09547C0.515602 6.75308 0.515602 10.4568 0.996162 14.1144C1.1692 15.4117 2.51079 16.2612 3.78112 15.8153L4.4458 15.5818C8.08115 14.3051 11.4881 12.4652 14.5392 10.1308Z"
            fill={user?.role !== "admin" ? "#434343" : "#EADDFF"}
          />
          <path
            d="M18.6625 1.26718C18.7124 0.821304 19.0911 0.503082 19.5397 0.503082C19.9884 0.503082 20.3676 0.820549 20.4187 1.26629C20.5328 2.26253 20.6971 4.30858 20.6971 7.83333C20.6971 11.5742 20.5121 14.0197 20.3983 15.1696C20.3547 15.6102 19.9825 15.9352 19.5397 15.9352C19.0911 15.9352 18.7124 15.617 18.6625 15.1711C18.5483 14.1504 18.3823 12.0145 18.3823 8.21913C18.3823 4.42377 18.5483 2.28784 18.6625 1.26718Z"
            fill={user?.role !== "admin" ? "#434343" : "#EADDFF"}
            fillOpacity="0.5"
          />
        </svg>

        <PlayButton />

        <svg
          onClick={() => {
            if (user?.role == "admin") {
              playNext();
              return;
            }
            toast.error("Only admin can play next");
          }}
          aria-label="play next"
          className="cursor-pointer size-5"
          width="21"
          height="16"
          viewBox="0 0 21 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.5392 10.1308C14.7748 9.95045 14.9656 9.71919 15.0968 9.4547C15.228 9.19022 15.2962 8.89953 15.2962 8.60494C15.2962 8.31034 15.228 8.01966 15.0968 7.75517C14.9656 7.49068 14.7748 7.25942 14.5392 7.07912C11.4881 4.74472 8.08115 2.90473 4.4458 1.62803L3.78112 1.39453C2.51079 0.948656 1.16819 1.79812 0.996162 3.09547C0.515602 6.75308 0.515602 10.4568 0.996162 14.1144C1.1692 15.4117 2.51079 16.2612 3.78112 15.8153L4.4458 15.5818C8.08115 14.3051 11.4881 12.4652 14.5392 10.1308Z"
            fill={user?.role !== "admin" ? "#434343" : "#EADDFF"}
          />
          <path
            d="M18.6625 1.26718C18.7124 0.821304 19.0911 0.503082 19.5397 0.503082C19.9884 0.503082 20.3676 0.820549 20.4187 1.26629C20.5328 2.26253 20.6971 4.30858 20.6971 7.83333C20.6971 11.5742 20.5121 14.0197 20.3983 15.1696C20.3547 15.6102 19.9825 15.9352 19.5397 15.9352C19.0911 15.9352 18.7124 15.617 18.6625 15.1711C18.5483 14.1504 18.3823 12.0145 18.3823 8.21913C18.3823 4.42377 18.5483 2.28784 18.6625 1.26718Z"
            fill={user?.role !== "admin" ? "#434343" : "#EADDFF"}
            fillOpacity="0.5"
          />
        </svg>
      </div>
      <div className="text-sm cursor-pointer gap-1.5 w-[30%] items-center flex">
        {volume == 0 ? (
          <VolumeX
            onClick={() => {
              const volume = localStorage.getItem("volume");
              if (volume && Number(volume) !== 0) {
                setVolume(Number(volume));
                return;
              }
              setVolume(0.5);
            }}
            className=" size-6"
          />
        ) : volume < 0.5 ? (
          <Volume1 onClick={() => setVolume(0)} className="size-6" />
        ) : (
          <Volume2 onClick={() => setVolume(0)} className="size-6" />
        )}

        <VolumeControl />
      </div>
    </div>
  );
}

export default Controller;
