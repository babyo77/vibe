import { useAudio } from "@/store/AudioContext";
import { useUserContext } from "@/store/userStore";
import { formatArtistName, getSpotifyTrackID } from "@/utils/utils";
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { searchResults } from "@/lib/types";
import useDebounce from "@/Hooks/useDebounce";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import parse from "html-react-parser";
import { MdDone } from "react-icons/md";
import VoteIcon from "./VoteIcon";
import { useSocket } from "@/Hooks/useSocket";
import Image from "next/image";
// import autoAnimate from "@formkit/auto-animate";
import useAddSong from "@/Hooks/useAddSong";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { useMediaQuery } from "@react-hook/media-query";
interface QueueListProps {
  isDeleting?: boolean;
  handleSelect: (song: searchResults, limit: boolean) => void;
  selectedSongs: searchResults[];
  setIsDragging: React.Dispatch<SetStateAction<boolean>>;
}

function QueueListComp({
  isDeleting = false,
  handleSelect,
  selectedSongs,
  setIsDragging,
}: QueueListProps) {
  const {
    queue,
    setQueue,
    roomId,
    user,
    showDragOptions,
    setShowDragOptions,
    setShowAddDragOptions,
    emitMessage,
  } = useUserContext();
  const { currentSong, isPlaying, play } = useAudio();
  const { loading, handleUpdateQueue } = useSocket();
  const { addSong } = useAddSong();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const handleUpVote = useCallback(
    (song: searchResults) => {
      emitMessage("upvote", {
        queueId: song.isVoted ? "del" + song?.queueId : song?.queueId,
      });
    },
    [emitMessage]
  );

  const triggerUpVote = useCallback(
    (e: React.MouseEvent, song: searchResults) => {
      if (!user) return toast.error("Login required");
      e.stopPropagation();
      if (currentSong?.id == song.id) {
        toast.info("Can't vote currently playing song");
        return;
      }
      try {
        handleUpVote(song);
        if (song.isVoted) return;
        setQueue((prevQueue) => {
          const songIndex = prevQueue.findIndex((item) => item.id === song.id);
          const songExists = songIndex !== -1;

          if (songExists) {
            // Toggle isVoted status and update topVoters list
            return prevQueue?.map((item, index) =>
              index === songIndex
                ? {
                  ...item,
                  isVoted: !item.isVoted,
                  topVoters: item.isVoted
                    ? item?.topVoters?.filter(
                      (voter) => voter._id !== user._id
                    )
                    : [...(item.topVoters || []), user],
                  addedByUser: user,
                }
                : item
            );
          } else {
            // Add new song to the queue with the user as the initial voter
            return [
              ...prevQueue,
              {
                ...song,
                isVoted: true,
                topVoters: [user],
                addedByUser: user,
              },
            ];
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    [handleUpVote, setQueue, user, currentSong]
  );

  const handlePlay = useCallback(
    (e: React.MouseEvent, song: searchResults) => {
      if (!e.isTrusted) return;
      if (isDeleting) return;
      e.stopPropagation();
      if (!user) {
        return toast.error("Login required");
      }
      if (user?.role !== "admin") return toast.error("Only admin can play");
      emitMessage("play", { ...song, currentQueueId: currentSong?.queueId });
      play(song);
    },
    [isDeleting, user, currentSong, emitMessage, play]
  );

  const scroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight } = containerRef.current;

    // Calculate the current scroll position and the halfway point
    const isAtHalfway = scrollTop >= scrollHeight / 2;

    // Trigger data fetching when both conditions are met
    if (isAtHalfway && !loading) {
      handleUpdateQueue();
    }
  };

  const handleScroll = useDebounce(scroll);
  useEffect(() => {
    const container = containerRef.current;

    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    song: searchResults
  ) => {
    setShowDragOptions(true);
    setShowAddDragOptions(true);
    e.dataTransfer.setData("application/json", JSON.stringify(song));
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowDragOptions(false);
    setShowAddDragOptions(false);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (showDragOptions) return;
      const droppedUrl = e.dataTransfer.getData("text/plain");

      if (droppedUrl.includes("youtube.com")) {
        const res = await api.get(
          `${process.env.SOCKET_URI}/api/search/?name=${droppedUrl}&page=0`,
          { showErrorToast: false }
        );
        if (res.success) {
          const data = res.data as any;
          const song = data?.data;
          if (song?.results && song?.results.length > 0) {
            await addSong(song.results, roomId);
          } else {
            toast.error("No track found 😭");
          }
        }
        return;
      }

      if (droppedUrl.includes("spotify.com")) {
        const id = getSpotifyTrackID(droppedUrl);
        if (!id) {
          toast.error("No track found 😭");
          return;
        }
        const res = await api.get(
          `${process.env.SOCKET_URI}/api/spotify/${id}`,
          { showErrorToast: false }
        );
        if (res.success) {
          const data = res.data as any;
          const song = data?.data;
          if (song?.results && song?.results.length > 0) {
            await addSong(song.results, roomId);
          } else {
            toast.error("No track found 😭");
          }
        }
        return;
      }

      const jsonData = e.dataTransfer.getData("application/json");
      if (!jsonData) return;
      const song = JSON.parse(jsonData);
      if (!song) return;
      await addSong([song], roomId);
    },
    [roomId, showDragOptions, addSong, setIsDragging]
  );
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  useEffect(() => {
    setSelectedIds(new Set(selectedSongs?.map((song) => song.id)));
  }, [selectedSongs]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <div
      style={{
        WebkitMaskImage:
          "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 2%, rgba(0,0,0,1) 98%, rgba(0,0,0,0) 100%)",
        maskImage:
          "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 2%, rgba(0,0,0,1) 98%, rgba(0,0,0,0) 100%)",
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={containerRef}
      className="py-2 pr-2  h-full  group-hover:opacity-100 flex flex-col  overflow-y-scroll gap-1"
    >
      {/* <AnimatePresence key={"queue list"} mode="wait"> */}
      {queue?.map((song, i) => (
        <motion.div
          key={song?.id + i}
          initial={{
            y: isDesktop ? "5dvh" : 0,
            opacity: 0,
            filter: "blur(10px)",
          }}
          // viewport={{ amount: "some", once: true }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,

            // type: "spring",
            // stiffness: 45,
          }}
          exit={{ y: isDesktop ? "5dvh" : 0, opacity: 0 }}
        >
          <div
            onDragEnd={handleDragEnd}
            onDragStart={(e) => handleDragStart(e, song)}
            draggable
            title={
              song.addedByUser && song.addedByUser.username !== user?.username
                ? `Added by ${song.addedByUser.name} (${song.addedByUser.username})`
                : "Added by You"
            }
            key={song?.id + i}
          >
            {/* {i !== 0 && <div className="h-0.5 bg-zinc-400/5"></div>} */}
            <label
              onClick={(e) => handlePlay(e, song)}
              htmlFor={song?.id + i}
              className={`flex gap-2 ${i !== queue.length && " border-white/5"
                } py-2 pl-2 ${currentSong?.id == song?.id && "bg-white/15"
                } hover:bg-white/10 hover:duration-100 hover:transition-all rounded-xl items-center justify-between`}
            >
              <div title={String(song?.order)} className="relative">
                <Avatar className="size-[3.2rem] rounded-md relative group">
                  <AvatarImage
                    draggable="false"
                    loading="lazy"
                    alt={song.name}
                    height={500}
                    width={500}
                    className={`rounded-md object-cover group-hover:opacity-40 ${currentSong?.id == song.id && "opacity-70"
                      }`}
                    src={song.image[song.image.length - 1].url}
                  />
                  <AvatarFallback>SX</AvatarFallback>
                  {currentSong?.id !== song?.id && (
                    <svg
                      className="absolute cursor-pointer group-hover:z-20  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.8324 9.66406C15.0735 9.47748 15.2686 9.23818 15.4029 8.9645C15.5371 8.69082 15.6069 8.39004 15.6069 8.0852C15.6069 7.78036 15.5371 7.47957 15.4029 7.20589C15.2686 6.93221 15.0735 6.69291 14.8324 6.50634C11.7106 4.09079 8.22476 2.18684 4.50523 0.86576L3.82515 0.624141C2.5254 0.162771 1.15171 1.04177 0.9757 2.38422C0.484012 6.16897 0.484012 10.0014 0.9757 13.7862C1.15275 15.1286 2.5254 16.0076 3.82515 15.5463L4.50523 15.3046C8.22476 13.9836 11.7106 12.0796 14.8324 9.66406Z"
                        fill="white"
                      />
                    </svg>
                  )}
                  {currentSong?.id == song.id && (
                    <div className="absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300">
                      {isPlaying ? (
                        <Image
                          height={100}
                          width={100}
                          src="/bars.gif"
                          alt={song?.name}
                          className=" h-full w-full"
                        />
                      ) : (
                        <svg
                          className=" h-full w-full"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.99902 14H5.99902V0H3.99902V14ZM-0.000976562 14H1.99902V4H-0.000976562V14ZM12 7V14H14V7H12ZM8.00002 14H10V10H8.00002V14Z"
                            fill="#F08FFB"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </Avatar>
              </div>
              <div className="flex flex-col gap-1 flex-grow text-sm w-6/12">
                <div className=" text-start w-11/12">
                  <p className=" font-semibold truncate">{parse(song?.name)}</p>
                </div>
                <p className="text-[#D0BCFF] flex gap-2 items-center opacity-95 truncate text-xs">
                  {formatArtistName(song.artists.primary)}{" "}
                  {/* <span>
                  {song.addedByUser &&
                    song.addedByUser.username !== user?.username && (
                      <Avatar
                        onClick={(e) => e.stopPropagation()}
                        className=" size-4 relative group"
                      >
                        <AvatarImage
                          draggable="false"
                          loading="lazy"
                          alt={song.name}
                          height={500}
                          width={500}
                          className="object-cover"
                          src={song.addedByUser?.imageUrl}
                        />
                        <AvatarFallback>SX</AvatarFallback>
                      </Avatar>
                    )}
                </span> */}
                </p>
              </div>

              {isDeleting ? (
                <div className="relative mr-0.5 pr-1.5">
                  <input
                    onChange={() => handleSelect(song, false)}
                    checked={selectedIds.has(song.id)}
                    name={song?.id + i}
                    id={song?.id + i}
                    type="checkbox"
                    className="peer  appearance-none w-5 h-5 border border-gray-400 rounded-none checked:bg-purple-700 checked:border-purple checked:bg-purple"
                  />
                  <MdDone className="hidden w-4 h-4 text-white absolute left-0.5 top-0.5 peer-checked:block" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <VoteIcon song={song} triggerUpVote={triggerUpVote} />
                </div>
              )}
            </label>
          </div>
        </motion.div>
      ))}
      {/* </AnimatePresence> */}
      <div />
      {/* {loading && <p className="text-center text-zinc-500 py-1">Loading..</p>} */}
    </div>
  );
}
const QueueList = React.memo(QueueListComp);
export default QueueList;
