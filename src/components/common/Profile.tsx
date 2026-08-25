"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserContext } from "@/store/userStore";
import { TUser } from "@/lib/types";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import api from "@/lib/api";
import Login from "./Login";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import OnBoarding from "./OnBoarding";
import { Input } from "../ui/input";
import { AtSign, LoaderCircle, Mail, Sun } from "lucide-react";
import { encryptObjectValues } from "@/utils/utils";
import VibeAlert from "./VibeAlert";
import { useAudio } from "@/store/AudioContext";
import { useRouter } from "next/navigation";
function ProfileComp({ user, roomId }: { user: TUser; roomId?: string }) {
  const { setUser, user: LoggedInUser, socketRef } = useUserContext();
  const { state, dispatch, pause } = useAudio();
  useEffect(() => {
    console.log(
      "%cVibe developed by tanmay7_",
      "color: #D0BCFF; font-size: 20px; padding: 10px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
    );
    setUser(user);
    const socket = socketRef.current;
    if (!roomId) {
      window.location.href = "/browse";
      return;
    }

    const isValidRoomId = /^[a-zA-Z0-9]+$/.test(roomId);
    if (roomId.length <= 3 || !isValidRoomId || roomId.length > 11) {
      window.location.href = "/browse";
      return;
    }

    socket.io.opts.query = {
      authorization: user?.token || "",
      room: roomId || "",
    };
    api.setAuthToken(user?.token || null);

    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socketRef, setUser, user, roomId]);
  const [inputValue, setInputValue] = useState(user?.username);
  const [loader, setLoader] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const handleUpdate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const payload: { name: string; username: string } | any = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });
      setLoader(true);
      const res = await api.patch(
        `${process.env.SOCKET_URI}/api/update`,
        encryptObjectValues(payload),
        {
          credentials: "include",
        }
      );
      if (res.error) {
        setError(res.error);
      }
      if (res.success) {
        setError(null);
        socketRef.current.emit("profile");
        toast.success("Profile updated!");
        if (LoggedInUser) {
          setUser(() => ({
            ...LoggedInUser,
            username: payload.username,
            name: payload.name,
          }));
        }
      }
      setLoader(false);
    },
    [LoggedInUser, setUser, socketRef]
  );
  const [image, setImage] = useState(
    user?.imageUrl || "https://imagedump.vercel.app/notFound.jpg"
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return toast.error("Invalid Image");
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
          await uploadImage(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const uploadImage = useCallback(
    async (file: File) => {
      try {
        if (uploadControllerRef.current) {
          uploadControllerRef.current.abort();
        }
        const controller = new AbortController();
        uploadControllerRef.current = controller;

        const formData = new FormData();
        formData.append(
          "payload_json",
          JSON.stringify({
            upload_source: process.env.UPLOAD_SOURCE,
            domain: process.env.UPLOAD_DOMAIN,
            type: 1,
            name: LoggedInUser?.username,
          })
        );
        setUploading(true);
        if (LoggedInUser?.imageDelUrl) {
          await api.get(LoggedInUser.imageDelUrl, { showErrorToast: false });
        }
        formData.append("file", file);
        const res = await api.post(
          `${process.env.PROXY_SERVER_URL}/upload-image`,
          formData,
          {
            signal: controller.signal,
          }
        );
        if (res.success) {
          const imageUrl = (res.data as any)?.data?.direct_url;
          const imageDelUrl = (res.data as any)?.data?.deletion_url;
          const update = await api.patch(
            `${process.env.SOCKET_URI}/api/dp`,
            encryptObjectValues({
              imageUrl,
              imageDelUrl,
            })
          );
          if (update.success) {
            toast.success("Profile picture updated!");
            if (LoggedInUser) {
              setUser({ ...LoggedInUser, imageUrl, imageDelUrl });
            }
          }
          socketRef.current.emit("profile");
        }
      } catch (error) {
      } finally {
        setUploading(false);
      }
    },
    [setUser, LoggedInUser, socketRef]
  );

  const router = useRouter();

  if (!user) {
    return <Login />;
  }
  return (
    <>
      <div className=" flex items-center gap-2">
        <OnBoarding />

        <VibeAlert
          className="items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 md:block hidden text-[#D0BCFF] hover:bg-[#D0BCFF]/15 bg-[#D0BCFF]/20 rounded-lg"
          confirmText="Yes, leave room"
          title="Rooms"
          headingClassName=" w-8/12"
          heading="Are you sure you want to leave this Room ?"
          action={() => {
            router.push("/browse"), socketRef.current.disconnect(), pause();
          }}
        />

        <svg
          onClick={() => {
            const confirmNavigation = window.confirm(
              "Are you sure you want to navigate to the browse page?"
            );
            if (confirmNavigation) {
              window.location.href = "/browse";
            }
          }}
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          className=" md:hidden block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.05469 7.4655C3.05469 4.84711 3.08272 3.97459 6.5456 3.97459C10.0085 3.97459 10.0365 4.84711 10.0365 7.4655C10.0365 10.0839 10.0475 10.9564 6.5456 10.9564C3.04364 10.9564 3.05469 10.0839 3.05469 7.4655Z"
            stroke="#EADDFF"
            strokeWidth="1.30909"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.05469 18.3746C3.05469 15.7562 3.08272 14.8837 6.5456 14.8837C10.0085 14.8837 10.0365 15.7562 10.0365 18.3746C10.0365 20.993 10.0475 21.8655 6.5456 21.8655C3.04364 21.8655 3.05469 20.993 3.05469 18.3746Z"
            stroke="#EADDFF"
            strokeWidth="1.30909"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.9639 18.3746C13.9639 15.7562 13.9919 14.8837 17.4548 14.8837C20.9176 14.8837 20.9457 15.7562 20.9457 18.3746C20.9457 20.993 20.9567 21.8655 17.4548 21.8655C13.9528 21.8655 13.9639 20.993 13.9639 18.3746Z"
            stroke="#EADDFF"
            strokeWidth="1.30909"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.9639 7.4655C13.9639 4.84711 13.9919 3.97459 17.4548 3.97459C20.9176 3.97459 20.9457 4.84711 20.9457 7.4655C20.9457 10.0839 20.9567 10.9564 17.4548 10.9564C13.9528 10.9564 13.9639 10.0839 13.9639 7.4655Z"
            stroke="#EADDFF"
            strokeWidth="1.30909"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <Dialog key={"user profile"}>
          <DialogTrigger>
            <Avatar className="size-10 max-md:size-8 ">
              <AvatarImage
                width={500}
                height={500}
                alt="Profile"
                className=" rounded-full object-cover"
                src={image}
              />
              <AvatarFallback>SX</AvatarFallback>
            </Avatar>
          </DialogTrigger>
          <DialogContent className="w-fit flex flex-col border-none bg-transparent p-0">
            <DialogHeader className=" h-0">
              <DialogTitle className=" w-fit" />
              <DialogDescription />
            </DialogHeader>
            <div className=" h-[414px]  flex items-center justify-center">
              <div className="flex backdrop-blur-lg flex-col overflow-hidden p-7 items-center justify-center w-[20rem] border-2 border-white/15 bg-gradient-to-br from-black/45  to-black/25 rounded-[24px]">
                <Avatar
                  className="size-28 relative"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage
                    width={500}
                    height={500}
                    alt="Profile"
                    style={{ opacity: uploading ? 0.5 : 1 }}
                    className=" rounded-full h-full w-full object-cover"
                    src={image}
                  />

                  <input
                    disabled={uploading}
                    hidden
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <AvatarFallback>SX</AvatarFallback>
                  {uploading && (
                    <div className=" absolute  inset-0 justify-center  items-center flex">
                      <LoaderCircle className=" animate-spin" />
                    </div>
                  )}
                </Avatar>
                <p className=" my-2.5 font-medium">
                  {LoggedInUser?.name || user?.name} (
                  {LoggedInUser?.username || user?.username})
                </p>

                <form
                  onChange={() => error && setError(null)}
                  onSubmit={handleUpdate}
                  className=" flex gap-2.5  w-full flex-col"
                >
                  <div className=" relative flex items-center">
                    <Sun className=" size-4 ml-2 text-zinc-400 absolute" />
                    <Input
                      maxLength={25}
                      max={25}
                      min={4}
                      className=" pl-7"
                      placeholder="name"
                      name="name"
                      defaultValue={LoggedInUser?.name}
                    />
                  </div>
                  <div className=" relative flex items-center">
                    <AtSign className=" size-4 ml-2 text-zinc-400 absolute" />
                    <Input
                      maxLength={25}
                      max={25}
                      min={4}
                      placeholder="username"
                      name="username"
                      className=" pl-7"
                      value={inputValue}
                      onChange={(e) =>
                        setInputValue(e.target.value.toLowerCase())
                      }
                      defaultValue={LoggedInUser?.username}
                    />
                  </div>
                  <div className=" relative flex items-center">
                    <Mail className=" size-4 ml-2 text-zinc-400 absolute" />

                    <Input
                      disabled
                      className=" disabled:opacity-70 pl-7"
                      placeholder="email"
                      readOnly
                      value={LoggedInUser?.email}
                    />
                  </div>
                  {error && (
                    <p className=" text-xs p-0.5 text-red-400">{error}</p>
                  )}

                  <Button
                    disabled={loader}
                    variant={"purple"}
                    className=" w-full mt-2.5"
                    type="submit"
                  >
                    {loader ? (
                      <LoaderCircle className=" animate-spin " />
                    ) : (
                      "Update"
                    )}
                  </Button>
                </form>

                <Button
                  onClick={() => {
                    dispatch({
                      type: "SET_BACKGROUND",
                      payload: !state.background,
                    });
                    localStorage.setItem(
                      "background",
                      JSON.stringify(!state.background)
                    );
                  }}
                  className=" w-full mt-2.5"
                  variant={!state.background ? "purple" : "outline"}
                >
                  {state.background ? "Disable" : "Enable"} Background
                </Button>
                <Button
                  variant={"outline"}
                  className=" w-full mt-2.5"
                  onClick={async () => {
                    const res = await api.get("/api/logout");
                    if (res.success) {
                      window.location.reload();
                    }
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
const Profile = React.memo(ProfileComp);
export default Profile;
