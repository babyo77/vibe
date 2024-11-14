"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
  SetStateAction,
} from "react";
import { socket } from "@/app/socket";
import { toast } from "sonner";
import { data, listener, messages, searchResults, TUser } from "@/lib/types";
import { decrypt } from "@/utils/lock";
import api from "@/lib/api";
import { useUserContext } from "@/store/userStore";
import { useAudio } from "@/store/AudioContext";
import useDebounce from "./useDebounce";
import { useRouter } from "next/navigation";
// Define the shape of a message
export interface Message {
  id: string;
  content: string;
  sender: string;
}

// Define the shape of the context state
interface SocketContextType {
  isConnected: boolean;
  loading: boolean;
  total: number | null;
  transport: string;
  messages: messages[];
  handleUpdateQueue: () => void;
  setMessages: React.Dispatch<React.SetStateAction<messages[]>>;
  likEffectUser: { imageUrl: string }[];
  setLikEffectUser: React.Dispatch<
    React.SetStateAction<{ imageUrl: string }[]>
  >;
  setPage: React.Dispatch<SetStateAction<number | null>>;
}

// Default context value
const SocketContext = createContext<SocketContextType | null>(null);

// Custom hook to use UserContext
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a socketProvider");
  }
  return context;
};

// Define props for the UserProvider
interface SocketProviderProps {
  children: ReactNode;
}
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const {
    setQueue,
    queue,
    setListener,
    user: loggedInUser,
    setUpNextSongs,
    setUser,
    roomId,
    isAdminOnline,
  } = useUserContext();
  const { seek, play } = useAudio();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transport, setTransport] = useState<string>("N/A");
  const [messages, setMessages] = useState<messages[]>([]);
  const [likEffectUser, setLikEffectUser] = useState<{ imageUrl: string }[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number | null>(1);
  const [total, setTotal] = useState<number | null>(null);
  const socketRef = useRef(socket);
  const listenerControllerRef = useRef<AbortController | null>(null);
  const queueControllerRef = useRef<AbortController | null>(null);
  const upNextSongControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  // Memoized connect and disconnect functions
  const onConnect = useCallback((): void => {
    setIsConnected(true);
    toast.dismiss("connecting");
    setTransport(socketRef.current.io.engine.transport.name);
    socketRef.current.io.engine.on("upgrade", (transport) => {
      setTransport(transport.name);
    });
  }, []);

  const onDisconnect = useCallback((): void => {
    setIsConnected(false);
    setTransport("N/A");
  }, []);

  const handleMessage = useCallback((data: any): void => {
    const message = decrypt(data) as messages;
    setMessages((prev) => [...prev, message]);
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"
    );
    if (document.hidden) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0; // Reset the audio if needed
    }
  }, []);

  const updateListeners = useCallback(async () => {
    if (listenerControllerRef.current) {
      listenerControllerRef.current.abort();
    }
    const controller = new AbortController();
    listenerControllerRef.current = controller;
    const data = await api.get(
      `${process.env.SOCKET_URI}/api/listeners?room=${roomId}`,
      { signal: controller.signal }
    );

    if (data.success) {
      setListener(data.data as listener);
    }
  }, [setListener, roomId]);

  const handleHeart = useCallback((data: any) => {
    const value = decrypt(data) as { imageUrl: string };
    if (value?.imageUrl) {
      setLikEffectUser([value]);
    }
  }, []);

  const handleError = useCallback((message: string): void => {
    toast.dismiss("connecting");
    toast.error(decrypt(message), { style: { background: "#e94625" } });
  }, []);

  const handleConnectError = useCallback((error: Error): void => {
    toast.dismiss("connecting");
    toast.error(error?.message || "Unable to connect to server", {
      style: { background: "#e94625" },
    });
  }, []);

  const handleUserLeftRoom = useCallback(
    async (data: any) => {
      const user = decrypt(data) as TUser;
      if (user.username == loggedInUser?.username) return;
      updateListeners();
      toast.info(`${user?.username} has left`, {
        style: { background: "#e94625" },
      });
    },
    [updateListeners, loggedInUser]
  );

  const handleUserJoinedRoom = useCallback(
    async (data: any) => {
      const user = decrypt(data) as TUser;
      if (user.username == loggedInUser?.username) return;
      updateListeners();
      toast.info(`${user?.username} has Joined`);
    },
    [updateListeners, loggedInUser]
  );

  const updateQueue = useCallback(async () => {
    if (total && queue.length >= total) return;
    setLoading(true);
    if (queueControllerRef.current) {
      queueControllerRef.current.abort();
    }
    const controller = new AbortController();
    queueControllerRef.current = controller;
    const data = await api.get(
      `${process.env.SOCKET_URI}/api/queue?page=${page}&room=${roomId}&name`,
      {
        signal: controller.signal,
      }
    );
    if (data.success) {
      const value = data.data as data;
      if (value?.results?.length > 0) {
        setQueue((prev) => {
          // Create a Set with IDs from the previous queue to track unique songs
          const songIds = new Set(prev.map((song) => song.id));

          // Filter new results to include only songs not already in the queue
          const uniqueNewSongs = (value.results || []).filter((song) => {
            if (!songIds.has(song.id)) {
              songIds.add(song.id); // Add new song ID to Set
              return true;
            }
            return false;
          });

          // Update the queue with only unique songs
          return [...prev, ...uniqueNewSongs];
        });
      }

      setTotal(value?.total);
      setPage(value?.start + 1);
    }
    setLoading(false);
  }, [setQueue, page, queue, total, roomId]);
  const handleUpdateQueue = useDebounce(updateQueue, 0);

  const upNextSong = useCallback(async () => {
    if (upNextSongControllerRef.current) {
      upNextSongControllerRef.current.abort();
    }
    const controller = new AbortController();
    upNextSongControllerRef.current = controller;

    const data = await api.get(
      `${process.env.SOCKET_URI}/api/upNextSong?room=${roomId}`,
      {
        signal: controller.signal,
      }
    );
    if (data.success) {
      setUpNextSongs(data.data as searchResults[]);
    }
  }, [roomId, setUpNextSongs]);

  const getUpNextSong = useDebounce(upNextSong);

  const UpdateQueue = useCallback(async () => {
    setLoading(true);
    if (queueControllerRef.current) {
      queueControllerRef.current.abort();
    }
    const controller = new AbortController();
    queueControllerRef.current = controller;
    const data = await api.get(
      `${process.env.SOCKET_URI}/api/queue?page=1&room=${roomId}&limit=${
        queue.length > 70 ? queue.length : 70
      }&name`,
      {
        headers: {
          nocache: "no-cache",
        },
        signal: controller.signal,
      }
    );
    if (data.success) {
      const value = data.data as data;
      setQueue(value.results); // Replace the queue with the full result

      setTotal(value?.total);
      setPage(1);
      getUpNextSong();
    }
    setLoading(false);
  }, [setQueue, queue, roomId, getUpNextSong]);

  const forceUpdateQueue = useDebounce(UpdateQueue, 0);
  const handleJoined = useCallback(
    async (data: any) => {
      const value = decrypt(data) as {
        roomId: string;
        _id: string;
        progress: number;
        role: string;
      };
      if (value?.role && loggedInUser) {
        setUser(() => {
          const user = { ...loggedInUser };
          user.role = value.role;
          return user;
        });
      }
      router.push(`/v?room=${roomId}`);
      seek(value?.progress || 0);
      toast.dismiss("connecting");
      toast.info("Joined successfully");
      updateListeners();
      handleUpdateQueue();
      upNextSong();
    },
    [
      handleUpdateQueue,
      seek,
      updateListeners,
      upNextSong,
      loggedInUser,
      setUser,
      roomId,
      router,
    ]
  );

  // Centralized event listeners setup and cleanup
  useEffect(() => {
    const currentSocket = socketRef.current;
    currentSocket.on("connect", onConnect);
    currentSocket.on("disconnect", onDisconnect);
    currentSocket.on("heart", handleHeart);
    currentSocket.on("error", handleError);
    currentSocket.on("connect_error", handleConnectError);
    currentSocket.on("message", handleMessage);
    currentSocket.on("userLeftRoom", handleUserLeftRoom);
    currentSocket.on("userJoinedRoom", handleUserJoinedRoom);
    currentSocket.on("joined", handleJoined);
    currentSocket.on("update", forceUpdateQueue);
    currentSocket.on("seekable", (r) => (isAdminOnline.current = r));
    currentSocket.on("isplaying", (d) => d && play(decrypt(d)));
    currentSocket.on("play", (d) => d && play(decrypt(d)));
    currentSocket.on("seek", seek);
    return () => {
      currentSocket.off("connect", onConnect);
      currentSocket.off("disconnect", onDisconnect);
      currentSocket.off("message", handleMessage);
      currentSocket.off("heart", handleHeart);
      currentSocket.off("error", handleError);
      currentSocket.off("connect_error", handleConnectError);
      currentSocket.off("userLeftRoom", handleUserLeftRoom);
      currentSocket.off("userJoinedRoom", handleUserJoinedRoom);
      currentSocket.off("update", forceUpdateQueue);
      currentSocket.off("joined", handleJoined);
      currentSocket.off("seekable");
      currentSocket.off("isplaying");
      currentSocket.off("play");
      currentSocket.off("seek", seek);
    };
  }, [
    handleUserLeftRoom,
    onConnect,
    handleJoined,
    onDisconnect,
    handleMessage,
    handleHeart,
    handleError,
    handleConnectError,
    handleUserJoinedRoom,
    forceUpdateQueue,
    play,
    seek,
    isAdminOnline,
  ]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        transport,
        messages,
        likEffectUser,
        setMessages,
        setLikEffectUser,
        total,
        loading,
        handleUpdateQueue,
        setPage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
