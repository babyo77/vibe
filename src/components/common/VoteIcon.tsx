import { searchResults } from "@/lib/types";
import React, { useState } from "react";
import TopVotes from "./TopVotes";
import { motion } from "framer-motion";

const VoteIcon = ({
  song,
  triggerUpVote,
}: {
  song: searchResults;
  triggerUpVote: (e: React.MouseEvent, song: searchResults) => void;
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent, song: searchResults) => {
    setIsClicked(true);
    triggerUpVote(e, song);

    // Reset animation after vote
    const t = setTimeout(() => {
      setIsClicked(false);
    }, 600);
    return () => clearTimeout(t);
  };

  return (
    <div className="relative" onClick={(e) => handleClick(e, song)}>
      <svg
        width="45"
        height="45"
        viewBox="0 0 42 42"
        fill="none"
        className=" -mt-2 "
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* heart  */}
        <motion.path
          initial={{ scale: 1, rotate: 0, y: 0, fill: "transparent" }}
          animate={
            isClicked
              ? !song?.isVoted
                ? { scale: 0.9, rotate: -10, y: 5, fill: "#434343" } // Shrink and move down on unvote
                : {
                    scale: 1.2,
                    x: 4,
                    y: -3,
                    rotate: 10.3,
                    fill: "#FAC800",
                  } // Enlarge and tilt on upvote
              : {
                  scale: 1,
                  rotate: 0,
                  y: 0,
                  fill: !song?.isVoted ? "transparent" : "#FAC800",
                }
          }
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="heart"
          d="M21.0475 30.3081L21.189 30.4015L21.3306 30.3081C26.2978 27.0276 29.1634 23.9123 30.5598 21.1589C31.9595 18.399 31.8836 15.9976 30.9567 14.1885C29.1574 10.6768 24.1773 9.49705 21.189 12.3124C18.2007 9.49704 13.2206 10.6771 11.4213 14.189C10.4944 15.9981 10.4185 18.3996 11.8182 21.1594C13.2147 23.9128 16.0802 27.0279 21.0475 30.3081Z"
          stroke="white"
          strokeWidth="0.513732"
        />
        {/* arrow */}
        <motion.path
          initial={{ rotate: 0, scale: 1, x: 0, y: 0, opacity: 1 }} // Initial position
          animate={
            isClicked && !song?.isVoted
              ? { y: 5, scale: 0.9, rotate: 0, opacity: 1 } // Move arrow down with heart shrink
              : song?.isVoted
              ? { rotate: -180, scale: 0, y: -5, opacity: 0 } // Rotate and hide on upvote
              : { rotate: 0, scale: 1, y: 0, opacity: 1 } // Reset on unvote
          }
          transition={{ duration: 0.3, ease: "easeInOut" }}
          width="9"
          height="5"
          viewBox="0 0 9 5"
          className="arrow"
          d="M23.9314 27C23.3256 27 23.0226 27 22.8824 26.8802C22.7607 26.7763 22.6961 26.6203 22.7086 26.4608C22.7231 26.2769 22.9373 26.0627 23.3657 25.6343L26.4343 22.5657C26.6323 22.3677 26.7313 22.2687 26.8455 22.2316C26.9459 22.1989 27.0541 22.1989 27.1545 22.2316C27.2687 22.2687 27.3677 22.3677 27.5657 22.5657L30.6343 25.6343C31.0627 26.0627 31.2769 26.2769 31.2914 26.4608C31.3039 26.6203 31.2393 26.7763 31.1176 26.8802C30.9774 27 30.6744 27 30.0686 27H23.9314Z"
          fill="#FAC800"
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="flex justify-center items-center w-full -mt-2 text-xs"
      >
        <TopVotes song={song} />
      </motion.div>
    </div>
  );
};

export default VoteIcon;
