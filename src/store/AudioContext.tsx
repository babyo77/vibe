"use client";

import { searchResults } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  SetStateAction,
} from "react";
import { useUserContext } from "./userStore";
import { socket } from "@/app/socket";
import { emitMessage } from "@/lib/customEmits";

interface AudioContextType {
  play: (song: searchResults) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  mute: () => void;
  unmute: () => void;
  playPrev: () => void;
  playNext: () => void;
  setVolume: (value: number) => void;
  isPlaying: boolean;
  isMuted: boolean;
  seek: (value: number) => void;
  volume: number;
  duration: number;
  progress: number;
  currentSong: searchResults | null;
  setProgress: React.Dispatch<SetStateAction<number>>;
  isLooped: boolean;
  setLoop: React.Dispatch<SetStateAction<boolean>>;
  shuffled: boolean;
  setShuffled: React.Dispatch<SetStateAction<boolean>>;
  videoRef: React.RefObject<HTMLAudioElement> | undefined;
  backgroundVideoRef: React.RefObject<HTMLAudioElement> | undefined;
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

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(
    typeof window !== "undefined" ? new Audio() : null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<searchResults | null>(null);
  const [currentProgress, setProgress] = useState<number>(0);
  const [currentDuration, setDuration] = useState<number>(0);
  const [currentVolume, setVolume] = useState<number>(1);
  const [isLooped, setLoop] = useState<boolean>(false);
  const [shuffled, setShuffled] = useState<boolean>(false);
  const { queue } = useUserContext();
  const progress = useMemo(() => currentProgress, [currentProgress]);
  const duration = useMemo(() => currentDuration, [currentDuration]);
  const volume = useMemo(() => currentVolume, [currentVolume]);
  const { user } = useUserContext();
  // play
  const play = useCallback((song: searchResults) => {
    setCurrentSong(song);
    const audioUrl = song?.downloadUrl[song?.downloadUrl?.length - 1]?.url;
    if (audioRef.current) {
      audioRef.current.src = audioUrl?.startsWith("http")
        ? audioUrl
        : `${process.env.STREAM_URL}/${audioUrl}`;
      audioRef.current
        .play()
        .then(async () => {
          if (videoRef.current && backgroundVideoRef.current) {
            videoRef.current.play();
            backgroundVideoRef.current.play();
          }
          setIsPlaying(true);
        })
        .catch(() => {
          console.error("Error playing audio");
        });
    }
  }, []);

  // pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (videoRef.current && backgroundVideoRef.current) {
        backgroundVideoRef.current.pause();
        videoRef.current.pause();
      }
    }
    setIsPlaying(false);
  }, []);

  // resume
  const resume = useCallback(() => {
    if (audioRef.current && currentSong) {
      audioRef.current
        .play()
        .then(() => {
          if (videoRef.current && backgroundVideoRef.current) {
            backgroundVideoRef.current.play();
            videoRef.current.play();
          }
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error resuming audio:", error);
        });
    }
  }, [currentSong]);

  // toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (currentSong) {
        resume();
      }
    }
  }, [isPlaying, currentSong, pause, resume]);

  // mute
  const mute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  }, []);

  // unmute
  const unmute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  // Set volume
  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      localStorage.setItem("volume", String(value));
    }
    setVolume(value);
  };

  // seek
  const seek = useCallback((value: number) => {
    if (audioRef.current) {
      if (videoRef.current && backgroundVideoRef.current) {
        videoRef.current.currentTime = value;
        backgroundVideoRef.current.currentTime = value;
      }
      audioRef.current.currentTime = value;
    }
  }, []);

  // Play the next song in the queue
  const playNext = useCallback(() => {
    if (socket.connected) {
      emitMessage("playNext", "playNext");
    }
  }, []);

  // Play the previous song in the queue
  const playPrev = useCallback(() => {
    if (socket.connected) {
      emitMessage("playPrev", "playPrev");
    }
  }, []);

  // Set media session metadata and event handlers
  const setMediaSession = useCallback(() => {
    const handleBlock = () => {
      return;
    };
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong?.name,
        artist: currentSong?.artists.primary[0].name,
        artwork: currentSong?.image.map((image) => ({
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
        }
      });
      navigator.mediaSession.setActionHandler("seekbackward", handleBlock);
      navigator.mediaSession.setActionHandler("seekforward", handleBlock);
    }
  }, [currentSong, playNext, playPrev, pause, resume, seek, user]);

  // Debounced function to emit progress

  const lastEmittedTime = useRef(0);
  const lastEmitted = useRef(0);

  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => {
      setMediaSession();
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleEnd = () => {
      emitMessage("songEnded", "songEnded");
    };
    const updateProgress = () => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;

        if (Math.abs(currentTime - lastEmittedTime.current) >= 1.04) {
          setProgress(currentTime);
          if (videoRef.current && backgroundVideoRef.current) {
            videoRef.current.currentTime = currentTime;
            backgroundVideoRef.current.currentTime = currentTime;
          }
          lastEmittedTime.current = currentTime;
        }

        if (Math.abs(currentTime - lastEmitted.current) >= 7) {
          socket.emit("progress", currentTime);
          lastEmitted.current = currentTime;
        }
      }
    };
    const audioElement = audioRef.current;

    if (audioElement) {
      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("pause", handlePause);
      audioElement.addEventListener("ended", handleEnd);
      audioElement.addEventListener("canplay", handleCanPlay);
      audioElement.addEventListener("timeupdate", updateProgress);
      return () => {
        audioElement.removeEventListener("play", handlePlay);
        audioElement.removeEventListener("pause", handlePause);
        audioElement.removeEventListener("ended", handleEnd);
        audioElement.removeEventListener("canplay", handleCanPlay);
        audioElement.removeEventListener("timeupdate", updateProgress);
      };
    }
  }, [setMediaSession, lastEmitted, lastEmittedTime]);

  useEffect(() => {
    if (!currentSong && queue.length > 0 && audioRef.current) {
      setCurrentSong(queue[0]);

      const audioUrl =
        queue[0]?.downloadUrl[queue[0]?.downloadUrl?.length - 1]?.url;
      audioRef.current.src = audioUrl?.startsWith("http")
        ? audioUrl
        : `${process.env.STREAM_URL}/${audioUrl}`;
    }
  }, [queue, currentSong]);

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
    };

    document.addEventListener("keydown", handleKeyDown);
    const volume = localStorage.getItem("volume");
    if (volume) {
      handleVolumeChange(Number(volume));
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlayPause]);

  const value = useMemo(
    () => ({
      play,
      pause,
      resume,
      togglePlayPause,
      mute,
      unmute,
      setVolume: handleVolumeChange, // Add the volume setter to the context
      isPlaying,
      isMuted,
      volume,
      currentSong,
      progress,
      setProgress,
      playPrev,
      playNext,
      seek,
      duration,
      isLooped,
      setLoop,
      shuffled,
      setShuffled,
      videoRef,
      backgroundVideoRef,
    }),
    [
      play,
      pause,
      resume,
      togglePlayPause,
      mute,
      unmute,
      isPlaying,
      isMuted,
      volume,
      currentSong,
      progress,
      playPrev,
      playNext,
      seek,
      duration,
      isLooped,
      shuffled,
    ]
  );
  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
