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
function Profile({ user, roomId }: { user: TUser; roomId?: string }) {
  const { setUser } = useUserContext();

  useEffect(() => {
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
    <Dialog key={"user profile"}>
      <DialogTrigger>
        <Avatar className="size-10 cursor-pointer">
          <AvatarImage
            width={500}
            height={500}
            alt="Profile"
            className=" rounded-full object-cover"
            src={user?.imageUrl || "https://imagedump.vercel.app/notFound.jpg"}
          />
          <AvatarFallback>SX</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="w-fit border-none bg-transparent p-0">
        <DialogHeader>
          <DialogTitle className=" w-fit" />
          <DialogDescription />
        </DialogHeader>
        <div className="w-fit  flex items-center justify-center">
          <div className="flex flex-col bg-black/80 p-5 items-center justify-center w-[20rem] overflow-hidden rounded-2xl">
            <Avatar className="size-24 cursor-pointer">
              <AvatarImage
                width={500}
                height={500}
                alt="Profile"
                className=" rounded-full h-full w-full object-cover"
                src={
                  user?.imageUrl || "https://imagedump.vercel.app/notFound.jpg"
                }
              />
              <AvatarFallback>SX</AvatarFallback>
            </Avatar>
            <p className=" my-4">
              {user?.name} ({user?.username})
            </p>
            <Button
              onClick={async () => {
                const res = await api.get("/api/logout");
                if (res.success) {
                  window.location.reload();
                }
              }}
            >
              Logout
            </Button>
            {/* <form className=" flex gap-2.5 mt-4 mb-1.5 w-full flex-col">
   {/* <Input placeholder="ID" readOnly value={user?._id} /> */}

            {/* <Input
     placeholder="username"
     name="username"
     defaultValue={user?.username}
   />
   <DialogClose>
     <Button variant={"secondary"} className="w-full">
       Update
     </Button>
   </DialogClose> */}
            {/* </form> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Profile;
