import { useAudio } from "@/store/AudioContext";
import { Slider } from "../ui/slider";
import { formatElapsedTime } from "@/utils/utils";
import { useUserContext } from "@/store/userStore";
import { toast } from "sonner";
import { socket } from "@/app/socket";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
function ProgressBar({ className }: { className?: string }) {
  const { progress, duration, seek, setProgress } = useAudio();
  const { user } = useUserContext();
  const handleSeek = (e: number[]) => {
    if (e[0]) {
      if (user && user.role !== "admin") {
        return toast.error("Only admin is allowed to seek");
      }
      socket.emit("seek", e[0]);
      seek(e[0]);
    }
  };
  const handleProgress = useCallback(
    (value: number[]) => {
      if (value && value[0] !== undefined) {
        if (user?.role !== "admin") {
          return toast.error("Only admin is allowed to seek");
        }
        setProgress(value[0]);
      }
    },
    [setProgress, user]
  );

  const handleValueChange = useCallback(
    (e: React.MouseEvent) => {
      if (user?.role !== "admin") {
        return toast.error("Only admin is allowed to seek");
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const newProgress = (clickPosition / rect.width) * duration;
      setProgress(newProgress);
      socket.emit("seek", newProgress);
      seek(newProgress);
    },
    [duration, seek, setProgress, user]
  );
  return (
    <div
      className={cn(
        "select-none -my-1 flex items-center gap-4 md:px-4 w-full text-xs",
        className
      )}
    >
      <p className=" progress">{formatElapsedTime(progress)}</p>

      <Slider
        max={duration || 0}
        value={[progress]}
        step={1}
        min={0}
        disabled={user?.role !== "admin"}
        onClick={handleValueChange}
        onValueCommit={handleSeek}
        onValueChange={handleProgress}
      />

      <p className=" duration">{formatElapsedTime(duration)}</p>
    </div>
  );
}

export default ProgressBar;
