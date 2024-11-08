import { useAudio } from "@/store/AudioContext";
import { cn } from "@/lib/utils";
import { pauseVariants, playVariants } from "@/utils/utils";
import { AnimatePresence, motion } from "framer-motion";

function PlayButton({ className }: { className?: string }) {
  const { isPlaying, togglePlayPause } = useAudio();
  return (
    <div
      onClick={togglePlayPause}
      className="bg-purple cursor-pointer p-4 rounded-full"
    >
      <div className=" w-fit overflow-hidden">
        <AnimatePresence mode="wait" key={"play pause"}>
          {isPlaying ? (
            <motion.div
              key="pause" // Unique key for Pause icon
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={pauseVariants} // Pause icon animation
            >
              <svg
                className={cn("size-4", className)}
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 14.4V1.6C1 1.44087 1.06321 1.28826 1.17574 1.17574C1.28826 1.06321 1.44087 1 1.6 1H4.4C4.55913 1 4.71174 1.06321 4.82426 1.17574C4.93679 1.28826 5 1.44087 5 1.6V14.4C5 14.5591 4.93679 14.7117 4.82426 14.8243C4.71174 14.9368 4.55913 15 4.4 15H1.6C1.44087 15 1.28826 14.9368 1.17574 14.8243C1.06321 14.7117 1 14.5591 1 14.4ZM9 14.4V1.6C9 1.44087 9.06321 1.28826 9.17574 1.17574C9.28826 1.06321 9.44087 1 9.6 1H12.4C12.5591 1 12.7117 1.06321 12.8243 1.17574C12.9368 1.28826 13 1.44087 13 1.6V14.4C13 14.5591 12.9368 14.7117 12.8243 14.8243C12.7117 14.9368 12.5591 15 12.4 15H9.6C9.44087 15 9.28826 14.9368 9.17574 14.8243C9.06321 14.7117 9 14.5591 9 14.4Z"
                  fill="white"
                  stroke="white"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="play" // Unique key for Play icon
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={playVariants} // Play icon animation
            >
              <svg
                className={cn("size-4", className)}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.8324 9.66406C15.0735 9.47748 15.2686 9.23818 15.4029 8.9645C15.5371 8.69082 15.6069 8.39004 15.6069 8.0852C15.6069 7.78036 15.5371 7.47957 15.4029 7.20589C15.2686 6.93221 15.0735 6.69291 14.8324 6.50634C11.7106 4.09079 8.22476 2.18684 4.50523 0.86576L3.82515 0.624141C2.5254 0.162771 1.15171 1.04177 0.9757 2.38422C0.484012 6.16897 0.484012 10.0014 0.9757 13.7862C1.15275 15.1286 2.5254 16.0076 3.82515 15.5463L4.50523 15.3046C8.22476 13.9836 11.7106 12.0796 14.8324 9.66406Z"
                  fill="white"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PlayButton;
