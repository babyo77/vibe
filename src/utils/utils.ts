import { artists } from "@/lib/types";

export const formatArtistName = (artists: artists[]) => {
  return artists
    .map((data, index) => {
      if (index === artists.length - 1) {
        return `${data.name}`;
      }
      return `${data.name}, ${data.name}`;
    })
    .join("")
    .split(",")[0];
};
export function formatElapsedTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
  const totalSeconds = Math.floor(seconds);

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
  }`;
}

export function generateRoomId(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let roomId = "";
  for (let i = 0; i < length; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomId;
}

export const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value};path=/`;
};

export const isImageUrl = (url: string): boolean => {
  // Only match URLs that end with known image file extensions
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|ico|heic|heif|jfif|pjpeg|pjp)$/i.test(
    url
  );
};
export const linkifyOptions = {
  target: "_blank",
  nl2br: true,
  className: "custom-link",
};

export function extractPlaylistID(url: string) {
  try {
    // Create a new URL object to parse the input URL
    const urlObj = new URL(url);

    // Get the value of the 'list' parameter, which is the playlist ID
    return urlObj.searchParams.get("list");
  } catch (error) {
    return null;
  }
}

export const springConfig = {
  type: "spring",
  stiffness: 900, // Controls the speed of the spring
  damping: 30, // Controls the bounciness
};

export const playVariants = {
  hidden: { y: -25 }, // Comes from top
  visible: { y: 0, transition: springConfig }, // Spring-based movement
  exit: { y: -20, transition: springConfig }, // Exits upwards with spring effect
};

export const pauseVariants = {
  hidden: { y: 25 }, // Comes from bottom
  visible: { y: 0, transition: springConfig }, // Spring-based movement
  exit: { y: 20, transition: springConfig }, // Exits downwards with spring effect
};

export const slideInVariants = {
  hidden: { y: "-100%", opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: "-100%", opacity: 0 },
};

export function containsOnlyEmojis(text: string): boolean {
  const emojiRegex =
    //@ts-expect-error:expected
    /^(?:[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{24C2}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{3297}\u{3299}\u{203C}-\u{2049}\u{FE0F}])+$/u;
  return emojiRegex.test(text);
}
