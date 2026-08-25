/* eslint-disable @next/next/no-img-element */
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useUserContext } from "@/store/userStore";
import { Loader2Icon, X } from "lucide-react";
import { RiFileGifLine } from "react-icons/ri";
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAudio } from "@/store/AudioContext";
import {
  containsOnlyEmojis,
  formatArtistName,
  isImageUrl,
  isVideoUrl,
  linkifyOptions,
} from "@/utils/utils";
import Linkify from "linkify-react";
import Link from "next/link";
import PlayButton from "./PlayButton";
import { toast } from "sonner";
import { linkPreview, messages } from "@/lib/types";
import { decrypt } from "tanmayo7lock";
import { uploadImage } from "@/lib/utils";
import api from "@/lib/api";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";

function Chat({
  setIsChatOpen,
  isChatOpen,
}: {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentSong, playPrev, playNext } = useAudio();
  const [message, setMessage] = useState<string>("");
  const { user, listener, emitMessage, setSeen, socketRef } = useUserContext();
  const [messages, setMessages] = useState<messages[]>([]);
  const isAdmin = user?.role === "admin";
  const sendMessage = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (message.length > 500) return toast.error("Message size exceeded");
      if (String(message).trim().length == 0) return;
      emitMessage("message", message);
      setMessage("");
    },
    [message, emitMessage]
  );

  const handleMessage = useCallback(
    (data: any): void => {
      const message = decrypt(data) as messages;
      setMessages((prev) => [...prev, message]);
      const audio = new Audio("");
      if (!isChatOpen) {
        setSeen(false);
      }
      if (document.hidden) {
        audio.play();
      } else {
        audio.pause();
        audio.currentTime = 0; // Reset the audio if needed
      }
    },
    [setSeen, isChatOpen]
  );

  useEffect(() => {
    const currentSocket = socketRef.current;
    currentSocket.on("message", handleMessage);
    return () => {
      currentSocket.off("message", handleMessage);
    };
  }, [socketRef, handleMessage]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isChatOpen) {
      setSeen(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isChatOpen, setSeen]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [gif, showGif] = useState<boolean>(false);
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (uploading) return;
      const formData = new FormData();
      formData.append(
        "payload_json",
        JSON.stringify({
          upload_source: process.env.UPLOAD_SOURCE,
          domain: process.env.UPLOAD_DOMAIN,
          type: 1,
          name: file.name,
        })
      );
      formData.append("file", file);
      setUploading(true);
      const res = await uploadImage(formData);

      if (res.success && res.data && res.data.data.direct_url) {
        emitMessage("message", res.data.data.direct_url);
      }
      setUploading(false);
    },
    [emitMessage, uploading]
  );
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      const clipboardData = e.clipboardData;
      const items = clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            await handleFileUpload(file);
          }
          e.preventDefault();
          break;
        }
      }
    },
    [handleFileUpload]
  );
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        await handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const [gifs, setGifs] = useState([]);
  const [gifQuery, setQuery] = useState<string>("");
  const controllerRef = useRef<AbortController | null>(null);
  const fetchGifs = async (searchTerm: string) => {
    if (searchTerm.trim().length == 0) return;

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const response = await api.get<any>(
      `https://api.klipy.com/v2/search?q=${searchTerm}&key=0Jtxr3jTQEJE70UZdPkUu2HeLSiirssW2nl0FxrXJ3QZjF5fLfVs9B9GiDioIS4H&limit=50`,
      {
        signal: controllerRef.current?.signal,
        showErrorToast: false,
      }
    );
    if (response.success) {
      setGifs(
        response.data.results?.map((gif: any) => gif.media_formats.gif.url)
      );
    }
  };

  useEffect(() => {
    setGifs([]);
    fetchGifs(gifQuery);
  }, [gifQuery]);

  // for gif input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setQuery(searchTerm);
  };
  // const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // for message input
  // const handleTyping = () => {
  //   emitMessage("typing", { u: user?._id, status: true });
  //   if (typingTimeoutRef.current) {
  //     clearTimeout(typingTimeoutRef.current);
  //   }

  //   typingTimeoutRef.current = setTimeout(() => {
  //     emitMessage("typing", { u: user?._id, status: false });
  //   }, 1000);
  // };

  return (
    <>
      <div className="  flex hide-scrollbar p-5 justify-between items-center">
        <div className=" flex w-9/12 truncate items-center gap-1.5">
          <Avatar className=" rounded-md size-14">
            <AvatarImage
              loading="lazy"
              alt={currentSong?.name || ""}
              height={300}
              width={300}
              className=" h-full object-cover  w-full"
              src={
                currentSong?.image[currentSong.image.length - 1].url ||
                "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/d61488c1ddafe4606fe57013728a7e84.jpg"
              }
            />
          </Avatar>
          <div className=" truncate w-9/12">
            <p className=" truncate text-base">{currentSong?.name}</p>
            <p className="truncate text-xs">
              {(currentSong &&
                formatArtistName(currentSong?.artists.primary)) ||
                "Unknown"}
            </p>
          </div>
        </div>
        <div>
          <div className=" flex items-center w-fit gap-2">
            <svg
              onClick={playPrev}
              aria-label="play prev"
              className=" size-5 rotate-180"
              width="21"
              height="16"
              viewBox="0 0 21 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.5392 10.1308C14.7748 9.95045 14.9656 9.71919 15.0968 9.4547C15.228 9.19022 15.2962 8.89953 15.2962 8.60494C15.2962 8.31034 15.228 8.01966 15.0968 7.75517C14.9656 7.49068 14.7748 7.25942 14.5392 7.07912C11.4881 4.74472 8.08115 2.90473 4.4458 1.62803L3.78112 1.39453C2.51079 0.948656 1.16819 1.79812 0.996162 3.09547C0.515602 6.75308 0.515602 10.4568 0.996162 14.1144C1.1692 15.4117 2.51079 16.2612 3.78112 15.8153L4.4458 15.5818C8.08115 14.3051 11.4881 12.4652 14.5392 10.1308Z"
                fill={isAdmin ? "#EADDFF" : "#434343"}
              />
              <path
                d="M18.6625 1.26718C18.7124 0.821304 19.0911 0.503082 19.5397 0.503082C19.9884 0.503082 20.3676 0.820549 20.4187 1.26629C20.5328 2.26253 20.6971 4.30858 20.6971 7.83333C20.6971 11.5742 20.5121 14.0197 20.3983 15.1696C20.3547 15.6102 19.9825 15.9352 19.5397 15.9352C19.0911 15.9352 18.7124 15.617 18.6625 15.1711C18.5483 14.1504 18.3823 12.0145 18.3823 8.21913C18.3823 4.42377 18.5483 2.28784 18.6625 1.26718Z"
                fill={isAdmin ? "#EADDFF" : "#434343"}
                fillOpacity="0.5"
              />
            </svg>
            <PlayButton className=" size-4" />
            <svg
              onClick={playNext}
              aria-label="play next"
              className="  size-5"
              width="21"
              height="16"
              viewBox="0 0 21 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.5392 10.1308C14.7748 9.95045 14.9656 9.71919 15.0968 9.4547C15.228 9.19022 15.2962 8.89953 15.2962 8.60494C15.2962 8.31034 15.228 8.01966 15.0968 7.75517C14.9656 7.49068 14.7748 7.25942 14.5392 7.07912C11.4881 4.74472 8.08115 2.90473 4.4458 1.62803L3.78112 1.39453C2.51079 0.948656 1.16819 1.79812 0.996162 3.09547C0.515602 6.75308 0.515602 10.4568 0.996162 14.1144C1.1692 15.4117 2.51079 16.2612 3.78112 15.8153L4.4458 15.5818C8.08115 14.3051 11.4881 12.4652 14.5392 10.1308Z"
                fill={isAdmin ? "#EADDFF" : "#434343"}
              />
              <path
                d="M18.6625 1.26718C18.7124 0.821304 19.0911 0.503082 19.5397 0.503082C19.9884 0.503082 20.3676 0.820549 20.4187 1.26629C20.5328 2.26253 20.6971 4.30858 20.6971 7.83333C20.6971 11.5742 20.5121 14.0197 20.3983 15.1696C20.3547 15.6102 19.9825 15.9352 19.5397 15.9352C19.0911 15.9352 18.7124 15.617 18.6625 15.1711C18.5483 14.1504 18.3823 12.0145 18.3823 8.21913C18.3823 4.42377 18.5483 2.28784 18.6625 1.26718Z"
                fill={isAdmin ? "#EADDFF" : "#434343"}
                fillOpacity="0.5"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className=" flex py-2 px-5 text-2xl font-semibold bg-white/5 border w-full justify-between items-center">
        <p>Chat</p>
        <div className=" flex items-center">
          {listener?.roomUsers?.slice(0, 5)?.map((roomUser, i) => (
            <div
              title={`${roomUser?.userId?.username} (${roomUser?.userId?.name})`}
              key={roomUser.userId?.id}
            >
              <div className={` ${i !== 0 && "-ml-2"} size-7`}>
                <Avatar className=" size-7 border border-white">
                  <AvatarImage
                    loading="lazy"
                    alt={roomUser?.userId?.name}
                    height={200}
                    width={200}
                    className=" rounded-full object-cover"
                    src={roomUser?.userId?.imageUrl}
                  />
                </Avatar>
              </div>
            </div>
          ))}
          {listener && listener?.totalUsers >= 5 && (
            <div className={` -ml-4 px-2 py-1 text-[9px]  rounded-full`}>
              <Avatar className=" size-7 border-white border">
                <div className="h-full w-full items-center justify-center rounded-full bg-muted">
                  {" "}
                  +{listener?.totalUsers > 100 ? 99 : listener?.totalUsers - 5}
                </div>
              </Avatar>
            </div>
          )}
        </div>
        <X className=" cursor-pointer" onClick={() => setIsChatOpen(false)} />
      </div>
      <div className="  h-full hide-scrollbar overflow-y-scroll px-5 pb-4 flex flex-col justify-between  break-words overflow-x-hidden">
        <div
          onClick={(e) => {
            e.stopPropagation(), showGif(false);
          }}
          className=" flex-grow gap-4 flex hide-scrollbar flex-col py-6 overflow-y-scroll"
        >
          {messages?.map((message) => (
            <div title={message?.time} key={message?.message}>
              {message.user._id !== user?._id ? (
                <div className=" flex gap-2">
                  <Avatar className="size-9">
                    <AvatarImage
                      loading="lazy"
                      alt={message?.user?.name || ""}
                      height={50}
                      width={50}
                      className=" h-full object-cover  w-full"
                      src={message?.user?.imageUrl || "/bg.webp"}
                    />
                    <AvatarFallback>SX</AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <p className="truncate -mt-0.5 border-white w-5/12 font-semibold mb-1.5">
                      {message?.user?.name}
                    </p>
                    {isVideoUrl(message?.message) ? (
                      <video
                        src={message?.message}
                        controls
                        autoPlay
                        muted
                        className="w-fit max-h-72 self-start rounded-lg rounded-tl-none"
                      />
                    ) : (
                      <>
                        {isImageUrl(message?.message) ? (
                          <Link href={message?.message} target="_blank">
                            <img
                              src={message?.message}
                              alt="User sent image"
                              className="w-fit max-h-72 self-start rounded-lg rounded-tl-none"
                            />
                          </Link>
                        ) : (
                          <MessageComponent
                            me={false}
                            message={message?.message}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className=" flex w-full self-end gap-2">
                  <div className=" w-full flex flex-col justify-end items-end">
                    <p className=" truncate -mt-0.5 text-end font-semibold mb-1.5 w-5/12">
                      {message.user?.name}
                    </p>
                    {isVideoUrl(message.message) ? (
                      <video
                        src={message?.message}
                        controls
                        autoPlay
                        muted
                        className="w-fit max-h-72 self-end rounded-lg rounded-tr-none"
                      />
                    ) : (
                      <>
                        {isImageUrl(message?.message) ? (
                          <Link href={message?.message} target="_blank">
                            <img
                              src={message?.message}
                              alt="User sent image"
                              className="w-fit max-h-72 self-end rounded-lg rounded-tr-none"
                            />
                          </Link>
                        ) : (
                          <MessageComponent message={message?.message} />
                        )}
                      </>
                    )}
                  </div>
                  <Avatar className="size-9">
                    <AvatarImage
                      loading="lazy"
                      alt={message?.user?.name || ""}
                      height={50}
                      width={50}
                      className=" h-full object-cover w-full"
                      src={message?.user?.imageUrl || "/bg.webp"}
                    />
                    <AvatarFallback>SX</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>
          ))}
        </div>
        {gif && (
          <div className="text-muted-foreground hover:text-white absolute size-6 left-0 bg-black/20 bottom-[3.2rem] z-10 cursor-pointer h-72  w-[calc(100%-5rem)] ml-5 mb-6 border-2 border-white/10 shadow-lg flex flex-col items-start p-2 text-xs gap-2 px-2 backdrop-blur-xl rounded-xl">
            <Input
              autoFocus
              value={gifQuery}
              onChange={handleInputChange}
              placeholder="Search gif"
              className=" rounded-lg py-4 backdrop-blur-lg placeholder:text-muted-foreground/70 mb-0.5"
            />
            <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-2 space-y-3 overflow-y-scroll rounded-md">
              {gifs.length > 0 ? (
                gifs?.map((gifUrl, index) => (
                  <GifComponent
                    key={index}
                    index={index}
                    gifUrl={gifUrl}
                    showGif={showGif}
                    emitMessage={emitMessage}
                  />
                ))
              ) : (
                <p className="text-center px-1 text-muted-foreground">
                  No GIFs found!
                </p>
              )}
            </div>
          </div>
        )}
        <form onSubmit={sendMessage} className=" relative">
          {uploading && (
            <div className="text-muted-foreground border-2 border-white/15 absolute size-6 left-0 bottom-[3.2rem] z-10 cursor-pointer h-10 w-40 bg-muted-foreground/10 flex items-center text-xs gap-1 px-2 backdrop-blur-sm rounded-xl">
              <Loader2Icon className=" animate-spin" /> <p>sending file...</p>
            </div>
          )}

          <Input
            ref={inputRef}
            onChange={(e) => (
              setMessage(e.target.value), setQuery(e.target.value)
            )}
            value={message}
            // onInput={handleTyping}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            name="message"
            id="message"
            type="text"
            className=" bg-white/5 pr-20 pl-9 rounded-xl py-5 border border-white/20"
            placeholder="Send Message"
          />

          <RiFileGifLine
            onClick={() => showGif((prev) => !prev)}
            className={`${
              gif ? "text-white" : "text-muted-foreground"
            } hover:text-white absolute size-6 left-2 top-[0.55rem] z-10 cursor-pointer`}
          />

          <Button
            size={"sm"}
            className=" absolute right-1.5 top-[0.349rem] bg-purple  hover:bg-purple text-white rounded-lg px-4"
          >
            Send
          </Button>
        </form>
      </div>
    </>
  );
}

const MessageComponent = ({
  message,
  me = true,
}: {
  message: string;
  me?: boolean;
}) => {
  const [linkPreviews, setLinkPreviews] = useState<linkPreview[] | null>();

  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:\/[^\s]*)?)/g; // Refined regex

    // Replace any URL followed by another URL with a space in between
    text = text.replace(
      /(https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:\/[^\s]*)?)(https?:\/\/)/g,
      "$1 $2"
    );

    return text.match(urlRegex) || [];
  };

  useEffect(() => {
    const links = extractLinks(message);
    const fetchLinkPreviews = async () => {
      const previews = await Promise.all(
        links?.map(async (link) => {
          const response = await api.get<linkPreview>(
            `${process.env.SOCKET_URI}/api/linkpreview?url=${encodeURIComponent(
              link
            )}`,
            {
              showErrorToast: false,
            }
          );
          if (response.data && response.success) {
            return { ...response.data, requestUrl: link };
          }
          return null;
        })
      );
      setLinkPreviews(
        Object.values(
          previews
            .filter((preview): preview is linkPreview => Boolean(preview))
            .reduce((uniquePreviews, preview) => {
              if (!uniquePreviews[preview.requestUrl]) {
                uniquePreviews[preview.requestUrl] = preview;
              }
              return uniquePreviews;
            }, {} as { [key: string]: linkPreview })
        )
      );
    };
    if (links.length > 0) {
      fetchLinkPreviews();
    }
  }, [message]);

  const removeLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:\/[^\s]*)?)/g; // Refined regex for URLs

    return text.replace(urlRegex, "").trim(); // Remove links and trim extra spaces
  };

  return (
    <div className=" space-y-1">
      {linkPreviews?.map((linkPreview, index) => (
        <div
          title={linkPreview?.requestUrl}
          key={linkPreview?.title + index}
          className={` border bg-white/5  overflow-hidden rounded-lg ${
            me ? "rounded-tr-none" : "rounded-tl-none"
          }`}
        >
          <Link href={linkPreview?.requestUrl} target="_blank">
            <Avatar className=" rounded-none aspect-video h-auto  w-full">
              <AvatarImage
                loading="lazy"
                alt={linkPreview?.title}
                height={50}
                width={50}
                className=" h-full object-cover rounded-none w-full"
                src={linkPreview?.image || ""}
              />
              <AvatarFallback>SX</AvatarFallback>
            </Avatar>

            <div className="p-2">
              <p className=" text-sm">{linkPreview?.title}</p>
              <p className=" text-xs text-accent-foreground/70">
                {linkPreview?.description}
              </p>
            </div>
          </Link>
        </div>
      ))}
      {removeLinks(message) !== "" && (
        <Linkify as="p" options={linkifyOptions}>
          <p
            className={` w-fit  break-words bg-white/5 border  ${
              containsOnlyEmojis(message) ? "text-5xl" : "text-sm"
            } px-2 py-1 rounded-lg ${
              me ? "rounded-tr-none" : "rounded-tl-none"
            }`}
          >
            {removeLinks(message)}
          </p>
        </Linkify>
      )}
    </div>
  );
};

const GifComponent = ({ gifUrl, index, emitMessage, showGif }: any) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && <Skeleton className="w-full absolute h-full rounded-lg" />}
      <Image
        height={500}
        width={500}
        key={index}
        src={gifUrl}
        onError={(e) => {
          e.currentTarget.src =
            "https://lightwidget.com/wp-content/uploads/localhost-file-not-found.jpg";
        }}
        onClick={() => {
          emitMessage("message", gifUrl);
          showGif(false);
        }}
        loading="eager"
        alt={`Gif ${index + 1}`}
        className={`break-inside-avoid rounded-lg shadow-sm ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default Chat;
