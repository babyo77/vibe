"use client";
// import api from "@/lib/api";
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
import { decrypt } from "@/utils/lock";
// import { toast } from "sonner";
// import { encryptObjectValues } from "@/utils/utils";

interface AudioContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
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
  playerRef: any;
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
  background: boolean;
  currentSeek: number;
}

const initialState: State = {
  isPlaying: false,
  isMuted: false,
  currentSong: null,
  currentProgress: 0,
  currentDuration: 0,
  currentVolume: 1,
  currentSeek: 0,
  background:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("background") || "true")
      : true,
};

type Action =
  | { type: "SET_IS_PLAYING"; payload: boolean }
  | { type: "SET_IS_MUTED"; payload: boolean }
  | { type: "SET_CURRENT_SONG"; payload: searchResults | null }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_BACKGROUND"; payload: boolean }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_SEEK"; payload: number };

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
    case "SET_BACKGROUND":
      return { ...state, background: action.payload };
    case "SET_DURATION":
      return { ...state, currentDuration: action.payload };
    case "SET_SEEK":
      return { ...state, currentSeek: action.payload };
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
  const playerRef = useRef(null);
  const progress = useMemo(
    () => state.currentProgress,
    [state.currentProgress]
  );
  const duration = useMemo(
    () => state.currentDuration,
    [state.currentDuration]
  );
  const volume = useMemo(() => state.currentVolume, [state.currentVolume]);

  const { user, isAdminOnline, socketRef, emitMessage } = useUserContext();
  const lastEmittedTime = useRef(0);

  const getVideoId = (song: searchResults) => {
    try {
      const data = decrypt(song?.downloadUrl?.at(-1)?.url || "");
      return data;
    } catch (error) {
      return "";
    }
  };

  // play
  const play = useCallback(async (song: searchResults) => {
    dispatch({ type: "SET_CURRENT_SONG", payload: song });
    if (song.source == "youtube" && playerRef.current) {
      console.log("playing youtube");
      console.log(playerRef.current);

      try {
        const videoId = getVideoId(song);
        if (videoId) {
          //@ts-expect-error:expect error
          playerRef.current?.loadVideoById(videoId);
          //@ts-expect-error:expect error
          playerRef.current?.playVideo();

          const storedVolume = Number(localStorage.getItem("volume")) || 1;
          //@ts-expect-error:expect error
          playerRef.current?.setVolume(storedVolume * 200);

          console.log("loading and playing youtube");
        } else {
          console.error("Invalid or missing video ID");
        }
      } catch (error) {
        console.error("Error playing YouTube video:", error);
      }
    }

    // Continue with audio handling
    if (audioRef.current) {
      console.log("setting audio src");
      audioRef.current.src = "";
      const currentVideoUrl = getURL(song);

      audioRef.current.src = currentVideoUrl;
      if (song.source !== "youtube") {
        try {
          //@ts-expect-error:expect error
          if (playerRef.current) playerRef.current?.pauseVideo();
        } catch (error) {
          console.error("Error pausing YouTube player:", error);
        }
      } else {
        return;
      }

      audioRef.current
        .play()
        .then(async () => {
          dispatch({ type: "SET_IS_PLAYING", payload: true });
        })
        .catch(async (e) => {
          console.error("Error playing audio", e.message);
        });
    }
  }, []);

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
      if (playerRef.current && state.currentSong?.source == "youtube") {
        try {
          //@ts-expect-error:demo
          playerRef.current.pauseVideo();
          if (state.currentProgress) {
            console.log("seeking to", state.currentProgress);
            //@ts-expect-error:demo
            playerRef.current.seekTo(state.currentProgress);
          }
          dispatch({ type: "SET_IS_PLAYING", payload: false });
        } catch (error) {
          console.error("Error pausing YouTube player:", error);
        }
      }
      pause();
    } else {
      if (state.currentSong) {
        resume();
        if (playerRef.current && state.currentSong?.source == "youtube") {
          try {
            dispatch({ type: "SET_IS_PLAYING", payload: true });
            //@ts-expect-error:demo
            playerRef.current.playVideo();
            if (state.currentProgress) {
              console.log("seeking to", state.currentProgress);
              //@ts-expect-error:demo
              playerRef.current.seekTo(state.currentProgress);
            }
          } catch (error) {
            console.error("Error playing YouTube video:", error);
          }
        }
      }
    }
  }, [
    state.isPlaying,
    state.currentSong,
    pause,
    resume,
    state.currentProgress,
  ]);

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
    if (playerRef.current) {
      //@ts-expect-error:demo
      playerRef.current.setVolume(value);
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

      if (playerRef.current) {
        try {
          //@ts-expect-error:demo
          playerRef.current.seekTo(value, true);
        } catch (error) {
          console.error("Error seeking YouTube player:", error);
        }
      }
      console.log("seeking to", value);

      dispatch({ type: "SET_PROGRESS", payload: value });

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
        artwork: state.currentSong?.image?.map((image) => ({
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

  useEffect(() => {
    const t = setInterval(() => {
      if (!audioRef.current) return;
      if (audioRef.current.paused) return;
      if (isAdminOnline.current) {
        socketRef.current.emit("progress", audioRef.current?.currentTime);
      }

      if (lastEmittedTime.current === Math.pow(2, 53)) return;
      if (
        lastEmittedTime.current >= Math.floor(audioRef.current.duration * 0.3)
      ) {
        socketRef.current.emit("analytics", {
          type: "listening",
        });
        lastEmittedTime.current = Math.pow(2, 53);
        return;
      }
      if (state.currentVolume === 0) return;
      lastEmittedTime.current += 3;
    }, 3000);
    return () => clearInterval(t);
  }, [isAdminOnline, socketRef, state.currentVolume]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const handlePlay = () => {
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
      };
      const handleEnd = () => {
        // if (isAdminOnline.current) {
        emitMessage("songEnded", "songEnded");
        // }
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
        state,
        dispatch,
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
        playerRef,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
