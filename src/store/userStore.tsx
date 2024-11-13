"use client";
import { listener, searchResults, TUser } from "@/lib/types";
import { generateRoomId } from "@/utils/utils";
import { useSearchParams } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
} from "react";

interface UserContextType {
  queue: searchResults[];
  setQueue: React.Dispatch<SetStateAction<searchResults[]>>;
  roomId: string | null;
  setRoomId: React.Dispatch<SetStateAction<string>>;
  user: TUser | null;
  setUser: React.Dispatch<SetStateAction<TUser | null>>;
  setListener: React.Dispatch<SetStateAction<listener | null>>;
  listener: listener | null;
  setUpNextSongs: React.Dispatch<SetStateAction<searchResults[]>>;
  upNextSongs: searchResults[];
  showVideo: boolean | null;
  setShowVideo: React.Dispatch<SetStateAction<boolean | null>>;
  isAdminOnline: React.MutableRefObject<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const search = useSearchParams();
  const [queue, setQueue] = React.useState<searchResults[]>([]);
  const [upNextSongs, setUpNextSongs] = React.useState<searchResults[]>([]);
  const [user, setUser] = React.useState<TUser | null>(null);
  const isAdminOnline = React.useRef<boolean>(true);
  const [listener, setListener] = React.useState<listener | null>(null);
  const [showVideo, setShowVideo] = React.useState<boolean | null>(() => {
    const data =
      typeof window !== "undefined" ? localStorage.getItem("v") : null;
    return data ? JSON.parse(data) : null;
  });
  const [roomId, setRoomId] = React.useState<string>(
    () => search.get("room") || generateRoomId()
  );

  const value = useMemo(
    () => ({
      queue,
      setQueue,
      roomId,
      setRoomId,
      showVideo,
      setShowVideo,
      user,
      setUser,
      listener,
      setListener,
      setUpNextSongs,
      upNextSongs,
      isAdminOnline,
    }),
    [listener, queue, roomId, user, upNextSongs, showVideo, isAdminOnline]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export { UserProvider, useUserContext };
