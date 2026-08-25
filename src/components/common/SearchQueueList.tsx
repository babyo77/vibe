import { useAudio } from "@/store/AudioContext";
import { useUserContext } from "@/store/userStore";
import { formatArtistName } from "@/utils/utils";
import { Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { searchResults } from "@/lib/types";
import useDebounce from "@/Hooks/useDebounce";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import parse from "html-react-parser";
import { MdDone } from "react-icons/md";
import VoteIcon from "./VoteIcon";
import Image from "next/image";
function SearchQueueList({
  searchQu,
  isDeleting = false,
  handleSelect,
  selectedSongs,
}: {
  searchQu?: searchResults[];
  isDeleting?: boolean;
  handleSelect: (song: searchResults, limit: boolean) => void;
  selectedSongs: searchResults[];
}) {
  const [queue, setQueue] = useState<searchResults[]>(searchQu || []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { user, setShowDragOptions, setShowAddDragOptions, emitMessage } =
    useUserContext();
  const { currentSong, isPlaying } = useAudio();

  const upVote = useCallback(
    (song: searchResults) => {
      emitMessage("upvote", { queueId: song?.queueId });
    },
    [emitMessage]
  );
  const handleDelete = useCallback(
    (song: searchResults) => {
      if (isDeleting) return;
      emitMessage("deleteSong", {
        queueId: song?.queueId,
        addedBy: song?.addedBy,
      });
      if (user?.role == "admin" || song.addedBy == user?._id) {
        setQueue((prev) => prev.filter((s) => s.id !== song.id));
      }
    },
    [user, isDeleting, emitMessage]
  );
  const handleUpVote = useDebounce(upVote);

  const triggerUpVote = useCallback(
    (e: React.MouseEvent, song: searchResults) => {
      {
        if (!user) return toast.error("Login required");
        e.stopPropagation();
        if (currentSong?.id == song.id) {
          toast.info("Cant't vote currently playing song");
          return;
        }

        try {
          handleUpVote(song);
          setQueue((prev) => {
            const songExists = prev.find((item) => item.id === song.id);

            if (songExists) {
              // If the song is already in the queue, toggle the isVoted state
              return prev?.map((item) =>
                item.id === song.id
                  ? {
                      ...item,
                      isVoted: !item.isVoted, // Toggle isVoted
                      topVoters:
                        item.isVoted &&
                        item.topVoters &&
                        item.topVoters.length > 0
                          ? item.topVoters.filter(
                              (voter) => voter?._id !== user?._id
                            ) // Remove user if unvoted
                          : [...(item.topVoters || []), user], // Add user if voted
                      addedByUser: user, // Update addedByUser only when voting
                    }
                  : item
              );
            } else {
              // If the song is not in the queue, add it with isVoted set to true and add user to topVoters
              return [
                ...prev,
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
      }
    },
    [handleUpVote, user, currentSong]
  );

  const Play = useCallback(
    (e: React.MouseEvent, song: searchResults) => {
      if (isDeleting) return;
      e.stopPropagation();
      if (!user) {
        return toast.error("Login required");
      }
      if (user?.role !== "admin") return toast.error("Only admin can play");
      emitMessage("play", { ...song, currentQueueId: currentSong?.queueId });
    },
    [isDeleting, user, currentSong, emitMessage]
  );
  const handlePlay = useDebounce(Play);

  useEffect(() => {
    if (searchQu) {
      setQueue(searchQu);
    }
  }, [searchQu]);
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
  useEffect(() => {
    setSelectedIds(new Set(selectedSongs?.map((song) => song.id)));
  }, [selectedSongs]);
  return (
    <>
      {queue?.length > 0 ? (
        <div className=" py-2 pr-2 group-hover:opacity-100 flex flex-col overflow-y-scroll gap-1">
          <p className=" font-medium">Search Results</p>
          {queue?.map((song, i) => (
            <div
              onDragEnd={handleDragEnd}
              draggable
              onDragStart={(e) => handleDragStart(e, song)}
              title={
                song.addedByUser && song.addedByUser.username !== user?.username
                  ? `Added by ${song.addedByUser.name} (${song.addedByUser.username})`
                  : "Added by You"
              }
              key={song?.id + i}
            >
              {/* {i !== 0 && <div className=" h-0.5 bg-zinc-400/5"></div>} */}
              <label
                htmlFor={song?.id + i}
                key={i}
                className={`flex gap-2 ${
                  i !== queue.length && " border-white/5"
                } py-2 pl-2 hover:bg-white/15   items-center justify-between ${
                  currentSong?.id == song?.id && "bg-white/10"
                } hover:bg-white/10 duration-100 rounded-xl`}
              >
                <div className="relative">
                  <Avatar className="size-[3.2rem] rounded-md relative group">
                    <AvatarImage
                      draggable="false"
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
                    <Trash
                      onClick={() => handleDelete(song)}
                      className="absolute group-hover:z-20  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    {currentSong?.id == song.id && (
                      <div className="absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity duration-300">
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
                  className="flex flex-col flex-grow text-sm w-6/12"
                >
                  <div className=" w-auto text-start">
                    <p className=" font-semibold truncate">
                      {parse(song?.name)}
                    </p>
                  </div>

                  <p className="text-[#D0BCFF] opacity-75 truncate text-[12px]">
                    {formatArtistName(song.artists.primary)}
                  </p>
                </div>
                {isDeleting ? (
                  <div className=" relative mr-0.5 pr-1.5">
                    <input
                      onChange={() => handleSelect(song, false)}
                      checked={selectedIds.has(song.id)}
                      name={song?.id + i}
                      id={song?.id + i}
                      type="checkbox"
                      className="peer  appearance-none w-5 h-5 border border-gray-400 rounded-[2px]checked:bg-purple-700 checked:border-purple checked:bg-purple"
                    />
                    <MdDone className="hidden w-4 h-4 text-white absolute left-0.5 top-0.5 peer-checked:block" />
                  </div>
                ) : (
                  <div className=" flex flex-col  items-center gap-2">
                    <VoteIcon song={song} triggerUpVote={triggerUpVote} />
                  </div>
                )}
              </label>
            </div>
          ))}
          {/* {loading && <p className="text-center text-zinc-500 py-1">Loading..</p>} */}
        </div>
      ) : (
        <p className="text-center  w-full text-zinc-500 py-4">
          Search in queue
        </p>
      )}
      <p className=" font-medium">In Queue</p>
    </>
  );
}

export default SearchQueueList;
