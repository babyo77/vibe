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
import { useEffect } from "react";
import { Button } from "../ui/button";
import api from "@/lib/api";
import Login from "./Login";
import { socket } from "@/app/socket";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import OnBoarding from "./OnBoarding";
import { Input } from "../ui/input";
function Profile({ user, roomId }: { user: TUser; roomId?: string }) {
  const { setUser } = useUserContext();

  useEffect(() => {
    console.log(
      "%cVibe developed by Tanmay and designed by Ajay",
      "color: #D0BCFF; font-size: 20px; padding: 10px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
    );
    setUser(user);
    if (!roomId) toast.error("Room ID is required");
    socket.io.opts.extraHeaders = {
      Authorization: user?.token || "",
      Room: roomId || "",
    };
    api.setAuthToken(user?.token || null);
    socket.connect();
  }, [user, setUser, roomId]);

  if (!user) {
    return <Login />;
  }
  return (
    <>
      <div className=" flex items-center gap-2">
        <OnBoarding />
        <a href={"/browse"}>
          <Button className=" md:block hidden text-[#D0BCFF] hover:bg-[#D0BCFF]/15 bg-[#D0BCFF]/20 rounded-lg">
            Rooms
          </Button>
          <svg
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
        </a>
        <Dialog key={"user profile"}>
          <DialogTrigger>
            <Avatar className="size-10 max-md:size-8 cursor-pointer">
              <AvatarImage
                width={500}
                height={500}
                alt="Profile"
                className=" rounded-full object-cover"
                src={
                  user?.imageUrl || "https://imagedump.vercel.app/notFound.jpg"
                }
              />
              <AvatarFallback>SX</AvatarFallback>
            </Avatar>
          </DialogTrigger>
          <DialogContent className="w-fit flex flex-col border-none bg-transparent p-0">
            <DialogHeader className=" h-0">
              <DialogTitle className=" w-fit" />
              <DialogDescription />
            </DialogHeader>
            <div className="  w-[316px] h-[414px]  flex items-center justify-center">
              <div className="flex flex-col bg-gradient-to-t to-[#FFFFFF]/20 overflow-hidden from-black/50  p-5 items-center justify-center w-[20rem] rounded-2xl">
                <Avatar className="size-24">
                  <AvatarImage
                    width={500}
                    height={500}
                    alt="Profile"
                    className=" rounded-full h-full w-full object-cover"
                    src={
                      user?.imageUrl ||
                      "https://imagedump.vercel.app/notFound.jpg"
                    }
                  />
                  <AvatarFallback>SX</AvatarFallback>
                </Avatar>
                <p className=" my-2.5 font-medium">
                  {user?.name} ({user?.username})
                </p>

                <div className=" flex gap-2.5  w-full flex-col">
                  <Input
                    disabled
                    placeholder="email"
                    readOnly
                    value={user?.email}
                  />

                  <Input
                    readOnly
                    placeholder="name"
                    name="name"
                    disabled
                    defaultValue={user?.name}
                  />

                  <Input
                    disabled
                    readOnly
                    placeholder="username"
                    name="username"
                    defaultValue={user?.username}
                  />
                  <p className=" text-xs p-0.5 text-zinc-400">
                    Hint :- Try changing ur google account details.
                  </p>
                </div>
                <Button
                  variant={"default"}
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

export default Profile;
