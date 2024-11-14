import { useAudio } from "@/store/AudioContext";
import { useUserContext } from "@/store/userStore";
import { formatArtistName } from "@/utils/utils";
import { Trash } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { searchResults } from "@/lib/types";
import useDebounce from "@/Hooks/useDebounce";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import parse from "html-react-parser";
import { MdDone } from "react-icons/md";
import VoteIcon from "./VoteIcon";
import { emitMessage } from "@/lib/customEmits";
import { useSocket } from "@/Hooks/useSocket";
import Image from "next/image";

interface QueueListProps {
  isDeleting?: boolean;
  handleSelect: (song: searchResults, limit: boolean) => void;
  selectedSongs: searchResults[];
}

function QueueList({
  isDeleting = false,
  handleSelect,
  selectedSongs,
}: QueueListProps) {
  const { queue, setQueue, user } = useUserContext();
  const { currentSong, isPlaying } = useAudio();
  const { loading, handleUpdateQueue } = useSocket();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const upVote = useCallback((song: searchResults) => {
    emitMessage("upvote", { queueId: song?.queueId });
  }, []);

  const handleDelete = useCallback(
    (song: searchResults) => {
      if (isDeleting) return;
      emitMessage("deleteSong", {
        queueId: song?.queueId,
        addedBy: song?.addedBy,
      });
      if (user?.role === "admin" || song.addedBy === user?._id) {
        setQueue((prev) => prev.filter((s) => s.id !== song.id));
      }
    },
    [setQueue, user, isDeleting]
  );

  const handleUpVote = useDebounce(upVote);

  const triggerUpVote = useCallback(
    (e: React.MouseEvent, song: searchResults) => {
      if (!user) return toast.error("Login required");
      e.stopPropagation();
      if (currentSong?.id == song.id) {
        toast.info("Cant't vote currently playing song");
        return;
      }
      try {
        handleUpVote(song);
        setQueue((prevQueue) => {
          const songIndex = prevQueue.findIndex((item) => item.id === song.id);
          const songExists = songIndex !== -1;

          if (songExists) {
            // Toggle isVoted status and update topVoters list
            return prevQueue.map((item, index) =>
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

  const Play = useCallback(
    (e: React.MouseEvent, song: searchResults) => {
      if (isDeleting) return;
      e.stopPropagation();
      if (user?.role !== "admin") return toast.error("Only admin can play");
      emitMessage("play", { ...song, currentQueueId: currentSong?.queueId });
    },
    [isDeleting, user, currentSong]
  );

  const handlePlay = useDebounce(Play);

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

    // Attach scroll event listener
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className="py-2 pr-2 max-h-full  group-hover:opacity-100 flex flex-col  overflow-y-scroll gap-1"
    >
      {queue?.map((song, i) => (
        <div
          title={
            song.addedByUser && song.addedByUser.username !== user?.username
              ? `Added by ${song.addedByUser.name} (${song.addedByUser.username})`
              : "Added by You"
          }
          key={song?.id + i}
        >
          {i !== 0 && <div className="h-0.5 bg-zinc-400/5"></div>}
          <label
            htmlFor={song?.id + i}
            className={`flex gap-2 ${
              i !== queue.length && " border-white/5"
            } py-2 pl-2 ${
              currentSong?.id == song?.id && "bg-white/15"
            } hover:bg-white/10 cursor-pointer rounded-xl items-center justify-between`}
          >
            <div title={String(song?.order)} className="relative">
              <Avatar className="size-[3.2rem] rounded-md relative group">
                <AvatarImage
                  loading="lazy"
                  alt={song.name}
                  height={500}
                  width={500}
                  className={`rounded-md object-cover group-hover:opacity-40 ${
                    currentSong?.id == song.id && "opacity-70"
                  }`}
                  src={song.image[song.image.length - 1].url}
                />
                <AvatarFallback>SX</AvatarFallback>
                {!isDeleting && (
                  <Trash
                    onClick={() => handleDelete(song)}
                    className="absolute group-hover:z-20 cursor-pointer top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}
                {currentSong?.id == song.id && (
                  <div className="absolute cursor-pointer top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity duration-300">
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
            <div
              onClick={(e) => handlePlay(e, song)}
              className="flex flex-col gap-1 flex-grow text-sm w-6/12"
            >
              <div className=" text-start w-11/12">
                <p className="cursor-pointer font-semibold truncate">
                  {parse(song.name)}
                </p>
              </div>
              <p className="text-[#D0BCFF] opacity-75 truncate text-xs">
                {formatArtistName(song.artists.primary)}{" "}
              </p>
            </div>

            {isDeleting ? (
              <div className="relative mr-0.5 pr-1.5">
                <input
                  onChange={() => handleSelect(song, false)}
                  checked={selectedSongs.includes(song)}
                  name={song?.id + i}
                  id={song?.id + i}
                  type="checkbox"
                  className="peer cursor-pointer appearance-none w-5 h-5 border border-gray-400 rounded-none checked:bg-purple-700 checked:border-purple checked:bg-purple"
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
      ))}
      <div />
      {loading && <p className="text-center text-zinc-500 py-1">Loading..</p>}
    </div>
  );
}

export default QueueList;
