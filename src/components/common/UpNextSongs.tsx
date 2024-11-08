import { useUserContext } from "@/store/userStore";
import parse from "html-react-parser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatArtistName } from "@/utils/utils";
import { motion } from "framer-motion";
import { useAudio } from "@/store/AudioContext";

function UpNextSongs() {
  const { upNextSongs } = useUserContext();
  const { currentSong } = useAudio();
  // Define animation variants
  const songVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="hide-scrollbar select-none w-full flex gap-2 min-h-5 items-center justify-center">
      <div className="flex overflow-x-scroll hide-scrollbar items-center gap-2.5">
        {upNextSongs.length > 0 &&
          upNextSongs
            .filter((s) => s.id !== currentSong?.id)
            .map((nextSong) => (
              <motion.div
                key={nextSong.id}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={songVariants}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="gap-1 backdrop-blur-lg p-1 rounded-lg border-white/20 border text-xs px-2 py-1.5 flex items-center"
              >
                <Avatar className="size-8 rounded-sm">
                  <AvatarImage
                    loading="lazy"
                    alt={nextSong?.name}
                    height={500}
                    width={500}
                    className="h-full w-full border"
                    src={
                      nextSong?.image[nextSong?.image?.length - 1]?.url ||
                      "/cache.jpg"
                    }
                  />
                  <AvatarFallback>SX</AvatarFallback>
                </Avatar>
                <div
                  title={`${parse(nextSong?.name)} (${
                    formatArtistName(nextSong?.artists?.primary) || "Unknown"
                  })`}
                  className="flex flex-col cursor-pointer leading-tight"
                >
                  <p className="w-24 font-semibold truncate">
                    {parse(nextSong?.name)}
                  </p>
                  <p className="w-20 text-[#D0BCFF] truncate text-[9px] font-medium">
                    {formatArtistName(nextSong?.artists?.primary) || "Unknown"}
                  </p>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
}

export default UpNextSongs;
