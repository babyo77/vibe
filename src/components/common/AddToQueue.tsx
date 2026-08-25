"use client";
import { Button } from "@/components/ui/button";
import { Search, Trash2, X } from "lucide-react";
import QueueList from "./QueueList";
import { useUserContext } from "@/store/userStore";
import SearchSongPopup from "../SearchSongPopup";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { slideInVariants } from "@/utils/utils";
import useSelect from "@/Hooks/useSelect";
import { useSocket } from "@/Hooks/useSocket";
import useDebounce from "@/Hooks/useDebounce";
import api from "@/lib/api";
import { data, searchResults } from "@/lib/types";
import SearchQueueList from "./SearchQueueList";
import InviteFriends from "./InviteFriends";
import VibeAlert from "./VibeAlert";
//import GameModal from "../vibe-games/GameModal";

function AddToQueueComp() {
  const { queue, roomId, user, setQueue, emitMessage } = useUserContext();
  const { total } = useSocket();
  const [isSearchedOpened, setOpenSearch] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (queue.length <= 1) {
      setIsDeleting(false);
    }
  }, [queue]);
  const queueControllerRef = useRef<AbortController | null>(null);
  const [searchQu, setSearchQu] = useState<searchResults[]>([]);
  const search = useCallback(
    async (e?: React.ChangeEvent<HTMLInputElement>) => {
      const query = e?.target.value || "";

      const localSearch = queue.filter((s) => {
        const songName = s?.name.toLowerCase();
        const primaryArtistName = s?.artists?.primary?.[0]?.name.toLowerCase();
        return (
          songName.includes(query.toLowerCase()) ||
          primaryArtistName.includes(query.toLowerCase())
        );
      });
      console.log("Local Search Results:", localSearch);
      if (localSearch.length > 0) {
        setSearchQu(localSearch);
        return;
      }

      if (queueControllerRef.current) {
        queueControllerRef.current.abort();
      }
      const controller = new AbortController();
      queueControllerRef.current = controller;
      const data = await api.get(
        `${process.env.SOCKET_URI}/api/queue?page=1&limit=4&room=${roomId}&name=${query}`,
        {
          signal: controller.signal,
        }
      );
      if (data.success) {
        setSearchQu((data.data as data).results);
      }
    },
    [queue, roomId]
  );

  const handleSearch = useDebounce(search);
  const handleToggleSearch = () => {
    if (isSearchedOpened) {
      // Close the search, but wait for the animation to finish before setting the state
      setOpenSearch(false);
      setSearchQu([]);
    } else {
      // Open the search immediately
      setOpenSearch(true);
    }
  };

  const { handleSelect, selectedSongs, setSelectedSongs } = useSelect();
  const handleBulkDelete = () => {
    if (selectedSongs.length > 0) {
      emitMessage(
        "bulkDelete",
        selectedSongs?.map((song) => ({
          id: song.id,
          queueId: song.queueId,
        }))
      );
      setQueue((prevQueue) =>
        prevQueue.filter((song) => !selectedSongs.includes(song))
      );
      setSearchQu((prevQueue) =>
        prevQueue.filter((song) => !selectedSongs.includes(song))
      );
      setSelectedSongs([]);
      setIsDeleting(false);
    }
  };
  const handleRemoveALL = () => {
    emitMessage("deleteAll", "remove");
    setQueue([]);
    setSelectedSongs([]);
    setIsDeleting(false);
  };
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`select-none max-md:rounded-none max-md:border-none  backdrop-blur-lg max-h-full border flex flex-col gap-2 max-md:w-full w-[45%] ${
        isDragging ? "border-white/70" : "border-white/15"
      } rounded-2xl p-3 pr-0`}
    >
      <div className=" flex items-center pr-4 gap-2.5 justify-between">
        {isSearchedOpened ? (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            className=" w-full"
            variants={slideInVariants}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <Input
              autoFocus
              onChange={handleSearch}
              placeholder="Search in queue"
              className="py-2 border border-zinc-700"
            />
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:text-lg max-md:pl-1.5 text-base font-semibold"
          >
            Queue{" "}
            {total.current && total.current > 0 ? `(${total.current})` : ``}
          </motion.p>
        )}
        <div className=" flex items-center gap-1">
          <Button
            onClick={handleToggleSearch}
            variant={"secondary"}
            className=" bg-lightPurple text-[#4F378A] p-2.5 hover:bg-lightPurple/80 "
          >
            {isSearchedOpened ? (
              <X className=" size-4" />
            ) : (
              <Search className=" size-4" />
            )}
          </Button>
          {user && user.role === "admin" && queue.length > 1 && (
            <Button
              onClick={() => {
                setSelectedSongs([]);
                if (queue.length <= 1) return;
                setIsDeleting((prev) => !prev);
              }}
              variant={"secondary"}
              className=" bg-lightPurple text-[#4F378A] p-2.5 hover:bg-lightPurple/80 "
            >
              {isDeleting ? (
                <X className=" size-4" />
              ) : (
                <Trash2 className=" size-4" />
              )}
            </Button>
          )}
          {/* <GameModal /> */}
        </div>
      </div>
      {isDeleting && queue.length > 1 && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideInVariants}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          className=" flex hide-scrollbar overflow-x-scroll py-1 pr-4 justify-between -mb-1 mt-2 items-center gap-1"
        >
          <VibeAlert
            title="Delete all"
            headingClassName=" md:w-8/12 w-[80vw] "
            confirmText="Yes, delete all"
            heading="Are you sure you want to delete all songs?"
            action={handleRemoveALL}
          />
          <VibeAlert
            disabled={selectedSongs.length == 0}
            className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-8 rounded-lg px-3 w-fit text-xs bg-lightPurple text-[#4F378A] hover:bg-lightPurple/80"
            title={`Remove Selected ${selectedSongs.length}`}
            headingClassName="md:w-8/12 w-[80vw] "
            confirmText="Yes, delete selected"
            heading={`Are you sure you want to delete ${selectedSongs.length} songs?`}
            action={handleBulkDelete}
          />
        </motion.div>
      )}

      <div className="h-full hide-scrollbar transition-all z-50 overflow-y-scroll">
        {queue.length > 0 ? (
          <>
            {isSearchedOpened && (
              <SearchQueueList
                searchQu={searchQu}
                handleSelect={handleSelect}
                selectedSongs={selectedSongs}
                isDeleting={isDeleting}
              />
            )}
            <QueueList
              setIsDragging={setIsDragging}
              handleSelect={handleSelect}
              selectedSongs={selectedSongs}
              isDeleting={isDeleting}
            />
          </>
        ) : (
          <SearchSongPopup isAddToQueue />
        )}
      </div>

      <InviteFriends className=" max-md:hidden" />
    </div>
  );
}
const AddToQueue = React.memo(AddToQueueComp);
export default AddToQueue;
