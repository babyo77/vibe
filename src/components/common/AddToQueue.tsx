"use client";
import { Button } from "@/components/ui/button";
import { Search, Trash2, X } from "lucide-react";
import QueueList from "./QueueList";
import { useUserContext } from "@/store/userStore";
import SearchSongPopup from "../SearchSongPopup";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { slideInVariants } from "@/utils/utils";
import useSelect from "@/Hooks/useSelect";
import { useSocket } from "@/Hooks/useSocket";
import useDebounce from "@/Hooks/useDebounce";
import api from "@/lib/api";
import { data, searchResults } from "@/lib/types";
import { emitMessage } from "@/lib/customEmits";
import SearchQueueList from "./SearchQueueList";
import InviteFriends from "./InviteFriends";

function AddToQueueComp() {
  const { queue, roomId, user, setQueue } = useUserContext();
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
  const search = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (queueControllerRef.current) {
      queueControllerRef.current.abort();
    }
    const controller = new AbortController();
    queueControllerRef.current = controller;
    const data = await api.get(
      `${process.env.SOCKET_URI}/api/queue?page=1&limit=4&room=${roomId}&name=${
        e?.target?.value || ""
      }`,
      {
        signal: controller.signal,
      }
    );
    if (data.success) {
      setSearchQu((data.data as data).results);
    }
  };

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
        selectedSongs.map((song) => ({
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
    }
  };
  const handleRemoveALL = () => {
    emitMessage("deleteAll", "remove");
    setQueue([]);
    setSelectedSongs([]);
  };

  return (
    <div className=" select-none max-md:rounded-none max-md:border-none  backdrop-blur-lg  max-h-full border flex flex-col gap-2 max-md:w-full border-white/15 w-[45%] rounded-xl p-3 pr-0">
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
            In Queue {total && total > 0 && `(${total})`}
          </motion.p>
        )}
        <div className=" flex items-center gap-1">
          <Button
            onClick={handleToggleSearch}
            variant={"secondary"}
            className=" bg-purple p-2.5 hover:bg-purple/80 "
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
                if (queue.length <= 1) return;
                setIsDeleting((prev) => !prev);
              }}
              variant={"secondary"}
              className=" bg-purple p-2.5 hover:bg-purple/80 "
            >
              {isDeleting ? (
                <X className=" size-4" />
              ) : (
                <Trash2 className=" size-4" />
              )}
            </Button>
          )}
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
          className=" flex hide-scrollbar overflow-x-scroll py-1 -mb-1 mt-2 items-center gap-1"
        >
          <Button
            onClick={handleBulkDelete}
            size={"sm"}
            className=" w-fit text-xs bg-purple text-white hover:bg-purple/80"
          >
            Remove Selected {selectedSongs.length}
          </Button>
          <Button
            onClick={handleRemoveALL}
            size={"sm"}
            className=" w-fit text-xs bg-red-600/85 text-white hover:bg-red-600/70"
          >
            Delete all
          </Button>
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
