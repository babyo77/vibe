"use client";
import { useAudio } from "@/store/AudioContext";
import { useUserContext } from "@/store/userStore";
import React from "react";
import Image from "next/image";
import UpvotedBy from "./UpvotedBy";
import YouTube from "react-youtube";
import { decrypt } from "tanmayo7lock";
function PLayerCoverComp() {
  const { user, setShowAddDragOptions, emitMessage } = useUserContext();
  const { currentSong, dispatch, playerRef, state } = useAudio();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (currentSong) {
      setShowAddDragOptions(true);
      e.dataTransfer.setData("application/json", JSON.stringify(currentSong));
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowAddDragOptions(false);
  };

  const getVideoId = () => {
    try {
      if (!currentSong?.downloadUrl?.at(-1)?.url) return "";
      const data = decrypt(currentSong.downloadUrl.at(-1)?.url || "");
      console.log("[YouTube] Decrypted video ID:", data);
      return data || "";
    } catch (error) {
      console.error("Error decrypting video ID:", error);
      return "";
    }
  };

  const onPlayerReady = (event: any) => {
    console.log("[YouTube] Player ready event triggered");
    playerRef.current = event.target;
    if (currentSong?.source === "youtube") {
      console.log("[YouTube] Current song is from YouTube source");
      const videoId = getVideoId();
      if (videoId) {
        try {
          console.log("state.currentSeek", state.currentSeek);
          if (state.isPlaying) {
            console.log("[YouTube] Loading video with ID:", videoId);
            event.target.loadVideoById(videoId, state.currentSeek);
          } else {
            console.log("[YouTube] Cueing video with ID:", videoId);
            event.target.cueVideoById(videoId, state.currentSeek);
          }

          console.log("[YouTube] Attempting to play video");
          event.target.playVideo();

          const storedVolume = Number(localStorage.getItem("volume")) || 1;
          console.log("[YouTube] Setting volume to:", storedVolume * 200);
          event.target.setVolume(storedVolume * 200);
        } catch (error) {
          console.error("YouTube player error:", error);
        }
      } else {
        console.warn("[YouTube] No video ID available to load");
      }
    } else {
      console.log(
        "[YouTube] Current song is not from YouTube source:",
        currentSong?.source
      );
    }
  };

  return (
    <>
      <div className="-z-10 opacity-0 aspect-square absolute">
        <YouTube
          // videoId={getVideoId()}
          onEnd={() => {
            console.log(
              "[YouTube] Video playback ended, emitting songEnded event"
            );
            emitMessage("songEnded", "songEnded");
          }}
          opts={{
            height: '10',
            width: '10',
            playerVars: {
              origin:
                typeof window !== "undefined" ? window.location.origin : "",
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
            },
          }}
          onPause={() => {
            console.log("[YouTube] Video paused");
            dispatch({ type: "SET_IS_PLAYING", payload: false });
          }}
          onPlay={() => {
            console.log("[YouTube] Video started playing");
            if (playerRef.current) {
              try {
                const duration = playerRef.current.getDuration();
                console.log("[YouTube] Video duration:", duration);
                dispatch({ type: "SET_DURATION", payload: duration });
              } catch (error) {
                console.error("Error getting duration:", error);
              }
              console.log("[YouTube] Playing YouTube video, updating state");
              dispatch({ type: "SET_IS_PLAYING", payload: true });
            }
          }}
          onReady={onPlayerReady}
        />
      </div>

      <div
        draggable
        onDragStart={(e) => handleDragStart(e)}
        onDragEnd={handleDragEnd}
        className=" border-2 border-white/10 relative h-auto min-h-40  overflow-hidden rounded-xl "
      >
        {!currentSong?.video ? (
          <Image
            draggable="false"
            priority
            title={
              currentSong?.name
                ? `${currentSong.name} - Added by ${
                    currentSong?.addedByUser?.username !== user?.username
                      ? `${currentSong?.addedByUser?.name} (${currentSong?.addedByUser?.username})`
                      : "You"
                  }`
                : "No song available"
            }
            alt={currentSong?.name || ""}
            height={300}
            width={300}
            className="cover aspect-square h-full object-cover  w-full"
            src={
              currentSong?.image?.[currentSong.image.length - 1]?.url ||
              "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/d61488c1ddafe4606fe57013728a7e84.jpg"
            }
          />
        ) : (
          <div className=" relative">
            <Image
              draggable="false"
              priority
              title={
                currentSong?.name
                  ? `${currentSong.name} - Added by ${
                      currentSong?.addedByUser?.username !== user?.username
                        ? `${currentSong?.addedByUser?.name} (${currentSong?.addedByUser?.username})`
                        : "You"
                    }`
                  : "No song available"
              }
              alt={currentSong?.name || ""}
              height={300}
              width={300}
              className="cover z-10  aspect-square h-full object-cover  w-full"
              src={
                currentSong?.image?.[currentSong.image.length - 1]?.url ||
                "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/d61488c1ddafe4606fe57013728a7e84.jpg"
              }
            />
          </div>
        )}

        {/* {currentSong?.source !== "youtube" && (
        <p className=" absolute bottom-2 right-2 text-xl mt-1 text-[#a176eb]">
          ☆
        </p>
      )} */}
        <UpvotedBy />
      </div>
    </>
  );
}
const PLayerCover = React.memo(PLayerCoverComp);
export default PLayerCover;
