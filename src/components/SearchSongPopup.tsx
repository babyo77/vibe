"use client";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2Icon, Search, Star, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { searchResults, searchSongResult } from "@/lib/types";
import api from "@/lib/api";
import useDebounce from "@/Hooks/useDebounce";
import { formatArtistName } from "@/utils/utils";
import { useInView } from "react-intersection-observer";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { socket } from "@/app/socket";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useUserContext } from "@/app/store/userStore";
import { toast } from "sonner";

function SearchSongPopup() {
  const { user } = useUserContext();
  const [songs, setSongs] = useState<searchSongResult | null>(null);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { ref, inView } = useInView();
  const [query, setQuery] = useState<string>("");

  const search = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setQuery(value);
    if (value.length <= 0) {
      setSongs(null);
      setLoading(false);
      return;
    }

    const url = `${process.env.BACKEND_URI}/api/search/songs?query=${value}&page=0`;

    setPage(0); // Reset page on a new search
    setLoading(true);
    const res = await api.get(url);
    if (res.success) {
      setSongs(res.data as searchSongResult);
    }
    setLoading(false);
  }, []);

  const handleSearch = useDebounce(search, 400);

  const searchMoreSongs = useCallback(async () => {
    if (!query || !songs || songs.data.results.length >= songs.data.total)
      return;

    setLoading(true);
    const url = `${
      process.env.BACKEND_URI
    }/api/search/songs?query=${query}&page=${page + 1}`;

    const res = await api.get(url);
    if (res.success) {
      setSongs((prevSongs) => ({
        ...prevSongs!,
        data: {
          ...prevSongs!.data,
          results: [
            ...prevSongs!.data.results,
            ...(res.data as searchSongResult).data.results,
          ],
        },
      }));
      setPage((prevPage) => prevPage + 1);
    }
    setLoading(false);
  }, [query, page, songs]);

  useEffect(() => {
    if (inView && !loading) {
      searchMoreSongs();
    }
  }, [inView, loading, searchMoreSongs]);

  const handlePlay = useCallback(
    async (song: searchResults) => {
      if (!user) {
        toast.warning("Login to play");
      }
      socket.emit("addToQueue", song);
    },
    [user]
  );

  return (
    <Dialog key={"songs"}>
      <DialogTrigger className="w-7/12 bg-black/70 border flex items-center px-4 gap-2 text-[#6750A4] rounded-full justify-between">
        <Search />
        <input
          type="text"
          readOnly
          className=" bg-transparent font-medium text-white p-2 w-full outline-none"
          placeholder="What do you want to play next?"
        />
        <Star />
      </DialogTrigger>
      <DialogContent className="w-[40%] max-md:w-full  border flex justify-center items-center  bg-transparent border-none">
        <DialogTitle />
        <div className="w-full flex items-center justify-center">
          <div className="flex flex-col w-full overflow-hidden rounded-2xl">
            <div className="bg-black flex items-center gap-2 justify-between p-2.5 px-4">
              <DialogClose>
                <ArrowLeft className="text-zinc-500 cursor-pointer" />
              </DialogClose>
              <Input
                autoFocus
                onChange={handleSearch}
                placeholder="Search Song"
                className="border-none focus-visible:ring-0"
              />
              <DialogClose>
                {loading ? (
                  <Loader2Icon className="text-zinc-500 animate-spin" />
                ) : (
                  <X className="text-zinc-500 cursor-pointer" />
                )}
              </DialogClose>
            </div>
            {songs && (
              <div className="flex border-zinc-500 border-t flex-col overflow-hidden bg-[#49454F]/60 max-h-[50dvh] overflow-y-scroll">
                {songs?.data.results.map((song, i) => (
                  <DialogClose
                    key={i}
                    onClick={() => handlePlay(song)}
                    className={`flex gap-2 text-start cursor-pointer hover:bg-zinc-800/20 ${
                      i != songs.data.results.length - 1 && "border-b"
                    }  border-[#1D192B] p-2.5 items-center`}
                  >
                    <Avatar className=" h-14 w-14 rounded-none">
                      <AvatarImage
                        alt={song?.name}
                        height={500}
                        width={500}
                        className=" h-fll w-full"
                        src={
                          song?.image[song?.image?.length - 1]?.url ||
                          "/cache.jpg"
                        }
                      />
                    </Avatar>
                    <div className="text-sm font-medium w-full">
                      <p className="font-semibold truncate w-10/12">
                        {song.name}
                      </p>
                      <p className="font-medium truncate w-10/12 text-zinc-400 text-xs">
                        {formatArtistName(song.artists.primary)}
                      </p>
                    </div>
                  </DialogClose>
                ))}

                {/* Infinite Scroll Trigger */}
                <div ref={ref} className="h-1"></div>
                {loading && (
                  <p className="text-center text-zinc-500 py-4">Loading..</p>
                )}
                {songs?.data.results.length === 0 && !loading && (
                  <p className="text-center text-zinc-500 py-4">
                    No songs found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchSongPopup;
