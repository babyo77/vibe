"use client";

import { searchResults } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useReducer,
} from "react";
import { useUserContext } from "./userStore";
import getURL from "@/utils/utils";
import { toast } from "sonner";

interface AudioContextType {
  play: (song: searchResults) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  mute: () => void;
  unmute: () => void;
  playPrev: () => void;
  playNext: () => void;
  setVolume: (value: number, save?: boolean) => void;
  isPlaying: boolean;
  isMuted: boolean;
  seek: (value: number) => void;
  volume: number;
  duration: number;
  progress: number;
  currentSong: searchResults | null;
  setCurrentSong: (song: searchResults | null) => void;
  setProgress: (value: number) => void;
  videoRef: React.RefObject<HTMLVideoElement> | undefined;
  backgroundVideoRef: React.RefObject<HTMLVideoElement> | undefined;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

interface State {
  isPlaying: boolean;
  isMuted: boolean;
  currentSong: searchResults | null;
  currentProgress: number;
  currentDuration: number;
  currentVolume: number;
}

const initialState: State = {
  isPlaying: false,
  isMuted: false,
  currentSong: null,
  currentProgress: 0,
  currentDuration: 0,
  currentVolume: 1,
};

type Action =
  | { type: "SET_IS_PLAYING"; payload: boolean }
  | { type: "SET_IS_MUTED"; payload: boolean }
  | { type: "SET_CURRENT_SONG"; payload: searchResults | null }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "SET_VOLUME"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_IS_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_IS_MUTED":
      return { ...state, isMuted: action.payload };
    case "SET_CURRENT_SONG":
      return { ...state, currentSong: action.payload };
    case "SET_PROGRESS":
      return { ...state, currentProgress: action.payload };
    case "SET_VOLUME":
      return { ...state, currentVolume: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
}
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(
    typeof window !== "undefined" ? new Audio() : null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // const [isMuted, setIsMuted] = useState<boolean>(false);
  // const [currentSong, setCurrentSong] = useState<searchResults | null>(null);
  // const [currentProgress, setProgress] = useState<number>(0);
  // const [currentDuration] = useState<number>(0);
  // const [currentVolume, setVolume] = useState<number>(1);
  // const [isLooped, setLoop] = useState<boolean>(false);
  // const [shuffled, setShuffled] = useState<boolean>(false);
  const progress = useMemo(
    () => state.currentProgress,
    [state.currentProgress]
  );
  const duration = useMemo(
    () => state.currentDuration,
    [state.currentDuration]
  );
  const volume = useMemo(() => state.currentVolume, [state.currentVolume]);
  const skipCountRef = useRef(0); // Ref to track skipped songs
  const { user, isAdminOnline, socketRef, emitMessage } = useUserContext();
  // play
  const play = useCallback(
    async (song: searchResults) => {
      dispatch({ type: "SET_CURRENT_SONG", payload: song });
      if (audioRef.current) {
        if (backgroundVideoRef.current) {
          backgroundVideoRef.current.src = "";
        }
        if (videoRef.current) {
          videoRef.current.src = "";
        }
        audioRef.current.src = "";
        const currentVideoUrl = getURL(song).replace(
          process.env.VIDEO_STREAM_URI || "",
          // window.navigator.userAgent.includes("Electron")
          // ? // ? "http://localhost:7777/stream"
          // : process.env.STREAM_URL || ""
          // process.env.STREAM_URL || ""
          process.env.STREAM_URL || ""
        );

        audioRef.current.src = currentVideoUrl;

        audioRef.current
          .play()
          .then(async () => {
            // Reset skip count on successful play
            skipCountRef.current = 0;
            if (videoRef.current) {
              videoRef.current?.play();
            }
            if (backgroundVideoRef.current) {
              backgroundVideoRef.current?.play();
            }
            dispatch({ type: "SET_IS_PLAYING", payload: true });
          })
          .catch((e) => {
            if (e.message.startsWith("Failed to load because no supported")) {
              skipCountRef.current += 1;
              if (skipCountRef.current >= 3) {
                toast.error(
                  window.navigator.userAgent.includes("Electron")
                    ? "Open youtube on browser and try again"
                    : "Maximum skip limit reached. Download vibe desktop app.",
                  {
                    style: { background: "#e94625" },
                  }
                );
              } else {
                emitMessage("songEnded", "songEnded");
                toast.error("Song not available on web Skipping", {
                  style: { background: "#e94625" },
                });
              }
            }
            console.error("Error playing audio", e.message);
          });
      }
    },
    [emitMessage]
  );

  // pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    socketRef.current.emit("status", false);
    dispatch({ type: "SET_IS_PLAYING", payload: false });
  }, [socketRef]);

  // resume
  const resume = useCallback(() => {
    if (audioRef.current && state.currentSong) {
      audioRef.current
        .play()
        .then(() => {
          socketRef.current.emit("status", true);
          dispatch({ type: "SET_IS_PLAYING", payload: true });
        })
        .catch((error) => {
          console.error("Error resuming audio:", error);
        });
    }
  }, [state.currentSong, socketRef]);

  // toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      if (state.currentSong) {
        resume();
      }
    }
  }, [state.isPlaying, state.currentSong, pause, resume]);

  // mute
  const mute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = true;
      dispatch({ type: "SET_IS_MUTED", payload: true });
    }
  }, []);

  // unmute
  const unmute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      dispatch({ type: "SET_IS_MUTED", payload: false });
    }
  }, []);

  // Set volume
  const handleVolumeChange = (value: number, save?: boolean) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      if (save) {
        localStorage.setItem("volume", String(value));
      }
    }
    dispatch({ type: "SET_PROGRESS", payload: value });
  };

  // seek
  const seek = useCallback((value: number) => {
    if (audioRef.current) {
      if (videoRef.current) {
        videoRef.current.currentTime = value;
      }
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.currentTime = value;
      }
      audioRef.current.currentTime = value;
    }
  }, []);

  // Play the next song in the queue
  const playNext = useCallback(() => {
    audioRef.current?.pause();
    emitMessage("playNext", "playNext");
  }, [emitMessage]);

  // Play the previous song in the queue
  const playPrev = useCallback(() => {
    audioRef.current?.pause();
    emitMessage("playPrev", "playPrev");
  }, [emitMessage]);
  // Set media session metadata and event handlers
  const setMediaSession = useCallback(() => {
    const handleBlock = () => {
      return;
    };
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.currentSong?.name,
        artist: state.currentSong?.artists.primary[0].name,
        artwork: state.currentSong?.image.map((image) => ({
          sizes: image.quality,
          src: image.url,
        })),
      });
      navigator.mediaSession.setActionHandler("play", resume);
      navigator.mediaSession.setActionHandler("pause", pause);
      navigator.mediaSession.setActionHandler("previoustrack", playPrev);
      navigator.mediaSession.setActionHandler("nexttrack", playNext);
      navigator.mediaSession.setActionHandler("seekto", (e) => {
        if (e.seekTime && user?.role == "admin") {
          seek(e.seekTime);
          if (videoRef.current) {
            videoRef.current.currentTime = e.seekTime;
          }
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.currentTime = e.seekTime;
          }
        }
      });
      navigator.mediaSession.setActionHandler("seekbackward", handleBlock);
      navigator.mediaSession.setActionHandler("seekforward", handleBlock);
    }
  }, [state.currentSong, playNext, playPrev, pause, resume, seek, user]);

  // Debounced function to emit progress

  // const lastEmittedTime = useRef(0);
  // const lastEmitted = useRef(0);

  // const updateProgress = useCallback(() => {
  //   if (audioRef.current) {
  //     const currentTime = audioRef.current.currentTime;

  //     // // Update the visual progress every second
  //     // if (Math.abs(currentTime - lastEmittedTime.current) >= 1.0) {
  //     //   // setProgress(currentTime);

  //     //   // Update the last emitted time for progress
  //     //   lastEmittedTime.current = currentTime;
  //     // }

  //     // Emit progress to the server every 5 seconds
  //     if (Math.abs(currentTime - lastEmitted.current) >= 2.5) {
  //       lastEmitted.current = currentTime;
  //       // Sync video progress with audio progress
  //       if (videoRef.current) {
  //         videoRef.current.currentTime = currentTime;
  //       }

  //       if (backgroundVideoRef.current) {
  //         backgroundVideoRef.current.currentTime = currentTime;
  //       }
  //     }

  //     // If audio is not paused, keep updating progress
  //     if (!audioRef.current.paused) {
  //       requestAnimationFrame(updateProgress);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (
        isAdminOnline.current &&
        audioRef.current &&
        !audioRef.current.paused
      ) {
        socketRef.current.emit("progress", audioRef.current?.currentTime);
      }
    }, 2000);
    return () => clearInterval(t);
  }, [isAdminOnline, socketRef]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const handlePlay = () => {
        // requestAnimationFrame(updateProgress),

        dispatch({ type: "SET_IS_PLAYING", payload: true });
        if (videoRef.current) {
          videoRef.current?.play();
        }
        if (backgroundVideoRef.current) {
          backgroundVideoRef.current?.play();
        }
      };
      const handlePause = () => {
        if (videoRef.current) {
          videoRef.current?.pause();
        }
        if (backgroundVideoRef.current) {
          backgroundVideoRef.current?.pause();
        }
      };
      const handleCanPlay = () => {
        setMediaSession();

        // if (audioRef.current) {
        //   setDuration(audioRef.current.duration);
        // }
      };
      const handleEnd = () => {
        if (isAdminOnline.current) {
          emitMessage("songEnded", "songEnded");
        }
      };
      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("pause", handlePause);
      audioElement.addEventListener("ended", handleEnd);
      audioElement.addEventListener("canplay", handleCanPlay);
      return () => {
        audioElement.removeEventListener("play", handlePlay);
        audioElement.removeEventListener("pause", handlePause);
        audioElement.removeEventListener("ended", handleEnd);
        audioElement.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [setMediaSession, isAdminOnline, emitMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === " " &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        togglePlayPause();
      }
      if ((e.ctrlKey || e.altKey) && e.key === "ArrowRight") {
        e.preventDefault();
        playNext();
      } else if ((e.ctrlKey || e.altKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        playPrev();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlayPause, playNext, playPrev]);

  const setProgress = useCallback((progress: number) => {
    dispatch({ type: "SET_PROGRESS", payload: progress });
  }, []);

  const setCurrentSong = useCallback((song: searchResults | null) => {
    dispatch({ type: "SET_CURRENT_SONG", payload: song });
  }, []);
  return (
    <AudioContext.Provider
      value={{
        play,
        pause,
        resume,
        togglePlayPause,
        mute,
        unmute,
        setVolume: handleVolumeChange, // Add the volume setter to the context
        isPlaying: state.isPlaying,
        isMuted: state.isMuted,
        volume,
        currentSong: state.currentSong,
        progress,
        setProgress,
        playPrev,
        playNext,
        seek,
        duration,
        videoRef,
        backgroundVideoRef,
        audioRef,
        setCurrentSong,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
