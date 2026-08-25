"use client";

import api from "@/lib/api";
import { useAudio } from "@/store/AudioContext";
import { useUserContext } from "@/store/userStore";
// import useDebounce from "@/Hooks/useDebounce";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { decrypt } from "tanmayo7lock";

interface LikeButtonProps {
  hearts?: string[]; // Array of heart emojis or icons
  maxSize?: number; // Maximum size for the images/hearts
}

const LikeButton: React.FC<LikeButtonProps> = ({
  hearts = ["❤️", "💛", "😍", "🥰", "🥳"],
  maxSize = 40,
}) => {
  const { user, emitMessage, socketRef } = useUserContext();
  const { currentSong } = useAudio();
  const [users, setLikEffectUser] = useState<{ imageUrl: string }[]>([]);
  const handleHeart = useCallback((data: any) => {
    const value = decrypt(data) as { imageUrl: string };
    if (value?.imageUrl) {
      setLikEffectUser([value]);
    }
  }, []);
  useEffect(() => {
    const currentSocket = socketRef.current;
    currentSocket.on("heart", handleHeart);
    return () => {
      currentSocket.off("heart", handleHeart);
    };
  }, [socketRef, handleHeart]);
  const heartRef = useRef<SVGSVGElement>(null);
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      const xPos = event.clientX;
      const yPos = event.clientY;

      // Function to create and style an element
      const createElement = (
        url: string | null,
        size: number,
        left: number,
        top: number,
        isHeart: boolean
      ) => {
        const el = document.createElement("div");
        el.style.zIndex = "100";
        el.style.position = "absolute";
        el.style.left = left + "px";
        el.style.top = top + "px";
        el.style.width = size + "px";
        el.style.height = size + "px";
        el.style.background = isHeart ? "none" : `url('${url}')`; // Use image URL or no background for heart
        el.style.backgroundSize = "cover"; // Ensure the image covers the div
        el.style.borderRadius = "50%"; // Make it rounded
        el.style.pointerEvents = "none"; // Disable pointer events
        el.style.animation = "heartAnimation 6s linear"; // Set the animation
        el.style.opacity = "0.5"; // Set opacity

        if (isHeart) {
          el.textContent = hearts![Math.floor(Math.random() * hearts!.length)]; // Set a random heart emoji from the array
          el.style.fontSize = size + "px"; // Set font size for heart
          el.style.color = "red"; // Set heart color
          el.style.lineHeight = `${size}px`; // Center heart vertically
          el.style.textAlign = "center"; // Center heart horizontally
        }

        return el;
      };

      // Generate a size based on the number of users or the maximum size
      const size = Math.min(maxSize, 40 / users!.length); // Adjust size based on number of users

      // Loop through users and create elements for each user's image
      users?.forEach((user) => {
        if (user.imageUrl) {
          // Generate random offsets for better spacing
          const randomXOffset = Math.random() * 80 - 40; // Random offset between -40 and 40
          const randomYOffset = Math.random() * 80 - 40; // Random offset between -40 and 40

          // Adjust yPos to create the effect of spawning above the heart
          const imageEl = createElement(
            user.imageUrl,
            size,
            xPos + randomXOffset,
            yPos - size + randomYOffset, // Change this to spawn above
            false
          );

          const heartEl = createElement(
            null,
            size / 2,
            xPos + randomXOffset + 20,
            yPos - size + randomYOffset, // Change this to spawn above
            true
          );

          // Append elements to the body
          document.body.appendChild(imageEl);
          document.body.appendChild(heartEl);

          // Remove elements after the animation completes (6 seconds)
          setTimeout(() => {
            imageEl.remove();
            heartEl.remove();
            setLikEffectUser([]);
          }, 2500);
        }
      });
    },
    [users, hearts, maxSize]
  );
  useEffect(() => {
    if (heartRef.current && users?.length > 0) {
      // Get the bounding box of the Heart component
      const heartRect = heartRef.current.getBoundingClientRect();

      // Simulate a click at the center of the Heart component
      handleClick({
        clientX: heartRect.left + heartRect.width / 2, // Center horizontally
        clientY: heartRect.top + heartRect.height / 2, // Center vertically
      } as React.MouseEvent<HTMLDivElement>); // Manually cast as a MouseEvent
    }
  }, [handleClick, users]);
  const likedRef = useRef<boolean>(false);
  useEffect(() => {
    likedRef.current = false;
  }, [currentSong]);
  const handleEmit = useCallback(async () => {
    if (user?.imageUrl) {
      setLikEffectUser([{ imageUrl: user.imageUrl }]);
      api.get<any>(`${process.env.SOCKET_URI}/api/ping`).then((rateLimit) => {
        if (rateLimit.error) {
          return;
        }
      });
      if (!user || !currentSong) return;
      emitMessage("heart", { imageUrl: user.imageUrl });

      if (likedRef.current) return;
      const id = user._id.trim().slice(-11);
      if (!id) return;
      console.log(id);

      const add = await api.post(
        `${process.env.SOCKET_URI}/api/add?room=${id}`,
        [currentSong],
        {
          showErrorToast: false,
        }
      );

      if (add.status === 404) {
        toast.message("Liked songs room created");
        window.open(`/${id}`);
      } else {
        likedRef.current = true;
      }
      if (add.success) {
        toast.message("Added to liked songs room");
        socketRef.current.emit("event", id);
      }
    }
  }, [user, emitMessage, currentSong, socketRef]);

  return (
    <div className=" mb-0.5 flex gap-1.5 items-center">
      <Heart
        ref={heartRef}
        onClick={handleEmit}
        className="size-[1.27rem] text-zinc-100 hover:fill-red-500 hover:text-red-500 hover:opacity-100 opacity-70 transition-all hover:scale-125 active:scale-75 duration-100 "
      />
    </div>
  );
};
export default LikeButton;
