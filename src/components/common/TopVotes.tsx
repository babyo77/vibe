import { searchResults } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";

function TopVotes({ song }: { song: searchResults }) {
  // Define animation variants for smooth scaling from 0.5 to 1
  const avatarVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.5, // Stagger the appearance of each avatar
        type: "spring",
        stiffness: 70, // Adjust stiffness for smooth motion
        damping: 12, // Add damping to make it less bouncy
      },
    }),
  };

  return (
    <div className="flex items-center">
      {song.topVoters?.slice(0, 2).map((voter, i) => (
        <TooltipProvider key={voter?._id}>
          <Tooltip>
            <TooltipTrigger>
              <motion.div
                custom={i}
                initial="hidden"
                animate="visible"
                variants={avatarVariants}
                className={` ${i !== 0 && "-ml-2.5"} size-5`}
              >
                <Avatar className="size-5 border border-white">
                  <AvatarImage
                    loading="lazy"
                    alt={voter?.name}
                    height={200}
                    width={200}
                    className="rounded-full"
                    src={voter?.imageUrl}
                  />
                  <AvatarFallback>SX</AvatarFallback>
                </Avatar>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="mr-44 bg-[#9870d3] mb-1 text-white">
              <p>
                {voter?.username} ({voter?.name})
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {song?.voteCount > 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.4, // Slight delay before showing the vote count
            type: "spring",
            stiffness: 70,
            damping: 12,
          }}
          className="-ml-4 pl-1.5 py-1 text-[9px] rounded-full"
        >
          <Avatar className="size-6 border-white border">
            <AvatarFallback>+{song?.voteCount - 2}</AvatarFallback>
          </Avatar>
        </motion.div>
      )}
    </div>
  );
}

export default TopVotes;
