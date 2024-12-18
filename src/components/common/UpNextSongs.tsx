import { useUserContext } from "@/store/userStore";
import parse from "html-react-parser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatArtistName } from "@/utils/utils";
import { motion } from "framer-motion";
import { useAudio } from "@/store/AudioContext";
import { searchResults } from "@/lib/types";

function UpNextSongs() {
  const { upNextSongs, setShowAddDragOptions } = useUserContext();
  const { currentSong } = useAudio();

  const songVariants = {
    hidden: { opacity: 0, y: 17 },
    visible: { opacity: 1, y: 0 },
  };
  const handleDragStart = (e: any, song: searchResults) => {
    e.dataTransfer.setData("application/json", JSON.stringify(song));
    setShowAddDragOptions(true);
  };
  const handleDragEnd = (e: MouseEvent) => {
    e.preventDefault();
    setShowAddDragOptions(false);
  };

  return (
    <div className="hide-scrollbar select-none w-full flex gap-2 min-h-5 items-center justify-center">
      <div className="flex overflow-x-scroll hide-scrollbar items-center gap-2.5">
        {upNextSongs.length > 0 &&
          upNextSongs
            .filter((s) => s.id !== currentSong?.id)
            .map((nextSong) => (
              <motion.div
                onDragEnd={handleDragEnd}
                onDragStart={(e) => handleDragStart(e, nextSong)}
                draggable
                key={nextSong.id}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={songVariants}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="gap-1.5 backdrop-blur-lg p-1 rounded-lg border-white/20 border text-xs px-2 py-1.5 flex items-center"
              >
                <Avatar className="size-9 rounded-sm">
                  <AvatarImage
                    draggable="false"
                    loading="lazy"
                    alt={nextSong?.name}
                    height={500}
                    width={500}
                    className="h-full object-cover w-full border"
                    src={
                      nextSong?.image[nextSong?.image?.length - 1]?.url ||
                      "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/d61488c1ddafe4606fe57013728a7e84.jpg"
                    }
                  />
                  <AvatarFallback>SX</AvatarFallback>
                </Avatar>
                <div
                  title={`${parse(nextSong?.name)} (${
                    formatArtistName(nextSong?.artists?.primary) || "Unknown"
                  })`}
                  className="flex flex-col  leading-tight"
                >
                  <p className="w-24 mb-0.5 font-semibold truncate">
                    {parse(nextSong?.name)}
                  </p>
                  <p className="w-20 text-[#D0BCFF] truncate text-[0.6rem] font-medium">
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
