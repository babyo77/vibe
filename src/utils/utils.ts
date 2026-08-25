import { artists, CachedVideo, searchResults } from "@/lib/types";

import { decrypt, encrypt } from "tanmayo7lock";

export const formatArtistName = (artists: artists[]) => {
  return artists
    ?.map((data, index) => {
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
export const isVideoUrl = (url: string): boolean => {
  // Only match URLs that end with known image file extensions
  return /^https?:\/\/.*\.(mp4|mov|mp3|ogg|mpeg)$/i.test(url);
};
export const linkifyOptions = {
  target: "_blank",
  nl2br: true,
  className: "custom-link",
};

export function extractPlaylistID(url: string) {
  if (url.includes("youtube.com")) {
    const urlObj = new URL(url);

    return urlObj.searchParams.get("list");
  }
  const match = url.match(/playlist\/([^/?]+)/);
  return match?.[1] || null;
}

export const springConfig = {
  type: "spring",
  stiffness: 900, // Controls the speed of the spring
  damping: 30, // Controls the bounciness
};

export const playVariants = {
  hidden: { y: -25 }, // Comes from top
  visible: { y: 0, transition: springConfig }, // Spring-based movement
  exit: { y: -25, transition: springConfig }, // Exits upwards with spring effect
};

export const pauseVariants = {
  hidden: { y: 25 }, // Comes from bottom
  visible: { y: 0, transition: { duration: 0.1, ease: "easeInOut" } }, // Spring-based movement
  exit: { y: 25, transition: { duration: 0.1, ease: "easeInOut" } }, // Exits downwards with spring effect
};

export const slideInVariants = {
  hidden: { y: "-20%", opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: "-20%", opacity: 0 },
};

export function containsOnlyEmojis(text: string): boolean {
  const emojiRegex =
    //@ts-expect-error:expected
    /^(?:[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{24C2}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{3297}\u{3299}\u{203C}-\u{2049}\u{FE0F}])+$/u;
  return emojiRegex.test(text);
}

const EXPIRE_TIME = 10 * 60 * 60 * 1000; // 1 hour in milliseconds

export const cacheVideo = async (url: string, id: string): Promise<string> => {
  try {
    if (!url || !id) return "";
    console.log(
      "%cVibe",
      "color: #D0BCFF; font-size: 20px; padding: 10px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
    );

    const db = await openDatabase();
    const transaction = db.transaction("videos", "readonly");
    const store = transaction.objectStore("videos");

    // Check if the video is in the cache by ID
    const getRequest = store.get(id);
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = async () => {
        const result: CachedVideo | undefined = getRequest.result;

        if (result) {
          const currentTime = Date.now();

          if (currentTime - result.timestamp < EXPIRE_TIME) {
            // Video is cached and not expired

            resolve(URL.createObjectURL(result.blob));
          } else {
            // Video expired; delete it from cache and fetch again
            await deleteVideoFromCache(id, db);

            const blob = await fetchAndCacheVideo(url, id, db);
            resolve(URL.createObjectURL(blob));
          }
        } else {
          // Video not in cache

          const blob = await fetchAndCacheVideo(url, id, db);
          resolve(URL.createObjectURL(blob));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error("Error caching video:", error);
    return "";
  }
};

// Helper function to fetch and cache the video
async function fetchAndCacheVideo(
  url: string,
  id: string,
  db: IDBDatabase
): Promise<Blob> {
  const response = await fetch(url);
  const blob = await response.blob();
  const timestamp = Date.now();

  // Store the video in the cache
  const cacheTransaction = db.transaction("videos", "readwrite");
  const cacheStore = cacheTransaction.objectStore("videos");
  cacheStore.put({ id, url, blob, timestamp });

  return new Promise((resolve) => {
    cacheTransaction.oncomplete = () => resolve(blob);
  });
}

// Helper function to delete expired videos from cache
async function deleteVideoFromCache(
  id: string,
  db: IDBDatabase
): Promise<void> {
  const deleteTransaction = db.transaction("videos", "readwrite");
  const deleteStore = deleteTransaction.objectStore("videos");
  deleteStore.delete(id);
}

// Helper function to open the IndexedDB database
async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("videoCacheDB", 1);

    // Type-cast event.target to IDBRequest inside the onupgradeneeded handler
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest).result;
      if (db) {
        const store = db.createObjectStore("videos", { keyPath: "id" });
        store.createIndex("by_id", "id", { unique: true });
      }
    };

    // Resolve with the result of the IDBRequest in onsuccess
    request.onsuccess = (event) => {
      const db = (event.target as IDBRequest).result;
      resolve(db);
    };

    // Reject with the error of the IDBRequest in onerror
    request.onerror = (event) => {
      const error = (event.target as IDBRequest).error;
      reject(error);
    };
  });
}

export default function getURL(currentSong: searchResults) {
  const currentSongUrl =
    currentSong?.downloadUrl[currentSong.downloadUrl.length - 1]?.url;
  const currentVideoUrl = currentSongUrl?.startsWith("http")
    ? currentSongUrl
    : `${process.env.STREAM_URL}/${currentSongUrl}` ||
      "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/d61488c1ddafe4606fe57013728a7e84.jpg";

  return currentVideoUrl;
}

// window.navigator.userAgent.includes("Electron")
//   ? "http://localhost:7777/stream"
//   :

export function getBackgroundURL(currentSong: searchResults) {
  const currentSongUrl =
    currentSong?.downloadUrl[currentSong.downloadUrl.length - 1]?.url;
  const currentVideoUrl = currentSongUrl?.startsWith("http")
    ? currentSongUrl
    : `${
        window.navigator.userAgent.includes("Electron")
          ? "http://localhost:7777/stream"
          : process.env.BACKGROUND_STREAM_URI
      }/${currentSongUrl}` ||
      "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/d61488c1ddafe4606fe57013728a7e84.jpg";

  return currentVideoUrl;
}

export async function checkIsCached(id: string): Promise<string> {
  const db = await openDatabase();
  const transaction = db.transaction("videos", "readonly");
  const store = transaction.objectStore("videos");

  // Check if the video is in the cache by ID
  const getRequest = store.get(id);
  return new Promise((resolve, reject) => {
    getRequest.onsuccess = async () => {
      const result: CachedVideo | undefined = getRequest.result;

      if (result) {
        const currentTime = Date.now();

        if (currentTime - result.timestamp < EXPIRE_TIME) {
          resolve(URL.createObjectURL(result.blob));
        }
      }
      return null;
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

export function encryptObjectValues(obj: any) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = encrypt(obj[key as any]); // Apply decrypt to each value
    return acc;
  }, {} as Record<string, string>);
}

export function decryptObjectValues(obj: any) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = decrypt(obj[key as any]); // Apply decrypt to each value
    return acc;
  }, {} as Record<string, string>);
}

export const BACKGROUND_APP_TIMEOUT = 150000;

export const getInviteLink = (roomId?: string, username?: string) => {
  if (typeof window == "undefined") return "";
  if (username) {
    return `${window.location.origin}/v?room=${roomId}&ref=${username}&new=true`;
  }
  return `${window.location.origin}/v?room=${roomId}&new=true`;
};

export function getRandom(emojis: { msg: string; gif: string }[]): {
  msg: string;
  gif: string;
} {
  const randomIndex = Math.floor(Math.random() * emojis.length);
  return emojis[randomIndex];
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getSpotifyTrackID(url: string) {
  const match = url.match(/\/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}
