import { useAudio } from "@/app/store/AudioContext";
import { Slider } from "../ui/slider";

export const VolumeControl: React.FC = () => {
  const { volume, setVolume } = useAudio();

  return (
    <Slider
      aria-label="volume"
      min={0}
      max={1}
      step={0.05}
      value={[volume]}
      onValueChange={(e) => setVolume(e[0])}
    />
  );
};

export default VolumeControl;
