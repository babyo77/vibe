import { useAudio } from "@/store/AudioContext";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function UpvotedBy() {
  const { currentSong } = useAudio();
  return (
    <>
      {currentSong?.topVoters && currentSong.topVoters.length > 0 && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 shadow-md text-[11px] font-bold border border-white/20 py-1.5 px-4 rounded-tl-xl whitespace-nowrap rounded-tr-xl mt-1 flex items-center gap-1 bg-[#a176eb]">
          Upvoted by{" "}
          <div className=" flex items-center pr-2  justify-center">
            {currentSong?.topVoters?.map((voter, i) => (
              <TooltipProvider key={voter._id}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={` ${i !== 0 && "-ml-0"} size-3 mb-2.5`}>
                      <Avatar className=" size-6 border border-white">
                        <AvatarImage
                          loading="lazy"
                          alt={voter?.name}
                          height={200}
                          width={200}
                          className=" rounded-full"
                          src={voter?.imageUrl}
                        />
                        <AvatarFallback>SX</AvatarFallback>
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="mr-20 font-normal bg-[#9870d3] max-w-52 truncate mb-1 text-white">
                    <p className=" truncate">
                      {voter?.username} ({voter?.name})
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

            {currentSong && currentSong.voteCount > 4 && (
              <div className={` -ml-4 px-2 py-1 text-[9px] rounded-full`}>
                <Avatar className=" size-6 border-white border">
                  <AvatarFallback>+{currentSong?.voteCount - 4}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default UpvotedBy;
