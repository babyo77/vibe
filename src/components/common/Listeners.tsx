"use client";
import { useUserContext } from "@/app/store/userStore";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function Listeners({ className }: { className?: string }) {
  const { roomId, listener, user } = useUserContext();
  const handleShare = useCallback(() => {
    if (!user) return;
    try {
      navigator
        .share({
          url:
            window.location.origin +
            "/v/?room=" +
            roomId +
            "&ref=" +
            user.username,
        })
        .then(() => {
          toast.success("Shared the link successfully!");
        });
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [roomId, user]);
  return (
    <Dialog>
      <DialogTrigger
        disabled={listener?.totalUsers === 0}
        className={cn(
          " max-md:w-full flex items-center text-sm font-medium justify-between",
          className
        )}
      >
        <div className=" flex items-center gap-1">
          <p>Listening</p>

          <div className=" flex items-center">
            {user &&
              listener?.roomUsers
                ?.filter((r) => r.userId?._id !== user?._id)
                ?.slice(0, 5)
                ?.map((roomUser, i) => (
                  <TooltipProvider key={roomUser?._id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={` ${i !== 0 && "-ml-2"} size-6`}>
                          <Avatar className=" size-6 border border-white">
                            <AvatarImage
                              alt={roomUser?.userId?.name}
                              height={200}
                              width={200}
                              className=" rounded-full"
                              src={roomUser?.userId?.imageUrl}
                            />
                            <AvatarFallback>SX</AvatarFallback>
                          </Avatar>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className=" bg-[#9870d3] mb-1 text-white">
                        <p>
                          {roomUser?.userId?.username} ({roomUser?.userId?.name}
                          )
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            {listener && listener?.totalUsers > 5 && (
              <div className={` -ml-4 px-2 py-1 text-[9px]  rounded-full`}>
                <Avatar className=" size-6 border-white border">
                  <AvatarFallback>
                    {" "}
                    +
                    {listener?.totalUsers > 100 ? 99 : listener?.totalUsers - 5}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={handleShare}
          size={"sm"}
          variant={"secondary"}
          className=" bg-[#8D50F9] w-fit hover:bg-[#7140c5]"
        >
          {" "}
          <Share2 className="size-4 mr-2" /> Invite Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[40%] max-md:w-full  border flex justify-center items-center  bg-transparent border-none">
        <DialogHeader>
          <DialogTitle />
          <DialogDescription />
        </DialogHeader>
        <div className="w-full flex items-center justify-center">
          <div className="flex flex-col w-full overflow-hidden rounded-2xl">
            <div className="bg-black/80 w-full p-2.5 px-4">
              <p className=" font-semibold flex w-full justify-between">
                <span>Vibing with</span>{" "}
                {listener && `${listener?.totalUsers - 1}`}
              </p>
            </div>
            <div className="bg-black/80 flex-col flex items-center gap-2 justify-between p-2.5 pt-0 px-4 max-h-[50dvh] overflow-y-scroll">
              {listener?.roomUsers
                ?.filter((r) => r.userId?._id !== user?._id)
                ?.map((user, j) => (
                  <div key={j} className=" w-full py-2 flex items-center gap-2">
                    <Avatar className=" size-10">
                      <AvatarImage src={user?.userId?.imageUrl} />
                      <AvatarFallback>SX</AvatarFallback>
                    </Avatar>
                    <div className="text-sm leading-tight">
                      <p>{user?.userId?.name}</p>
                      <p className=" text-xs">{user?.userId?.username}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Listeners;
