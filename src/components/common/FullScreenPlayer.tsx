"use client";
import { useEffect, useState } from "react";
import { useAudio } from "@/store/AudioContext";
import { useUserContext } from "@/store/userStore";
import Image from "next/image";
import Background from "../Background";
import Blur from "../Blur";
import { formatArtistName } from "@/utils/utils";
import ProgressBar from "./ProgressBar";
import { X } from "lucide-react";
import Logo from "./Logo";
import { motion } from "framer-motion";
function FullScreenPlayer() {
  const { user } = useUserContext();
  const { currentSong } = useAudio();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  function closeFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }

  if (!isFullscreen) return;

  return (
    <motion.div
      className="inset-0 overflow-hidden bg-pink-500 h-screen absolute z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Background />
      <Blur className=" bg-black/60" />

      {/* Top Element (Logo) sliding from the top */}
      <motion.div
        className="absolute top-4 left-5 opacity-80"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Logo className=" size-14" />
      </motion.div>

      {/* Close button with fade out on exit */}
      <motion.div
        onClick={closeFullscreen}
        className="absolute opacity-70 hover:opacity-100 cursor-pointer top-4 right-4 text-white"
        whileHover={{ scale: 1.1 }}
        exit={{ opacity: 0 }}
      >
        <X className="size-9" />
      </motion.div>

      {/* Bottom Element (Song info) sliding up from the bottom */}
      <motion.div
        className="flex w-auto items-end gap-4 absolute bottom-4 m-2 left-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className=" w-auto"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image
            priority
            title={
              currentSong?.name
                ? `${currentSong.name} - Added by ${
                    currentSong?.addedByUser?.username !== user?.username
                      ? `${currentSong?.addedByUser?.name} (${currentSong?.addedByUser?.username})`
                      : "You"
                  }`
                : "No song available"
            }
            alt={currentSong?.name || ""}
            height={300}
            width={300}
            className="cover object-cover"
            src={
              currentSong?.image[currentSong.image.length - 1].url ||
              "/cache.jpg"
            }
          />
        </motion.div>
        <div className="text-3xl pb-1 font-semibold w-full">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {currentSong?.name}
          </motion.p>
          <motion.p
            className="text-lg font-normal opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            {(currentSong && formatArtistName(currentSong?.artists?.primary)) ||
              "Unknown"}
          </motion.p>
          <ProgressBar className="md:px-0 w-[70dvw]  mr-14 my-1" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FullScreenPlayer;
