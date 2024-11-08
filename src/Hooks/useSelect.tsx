import { searchResults } from "@/lib/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";

function useSelect() {
  const [selectedSongs, setSelectedSongs] = useState<searchResults[]>([]);

  const handleSelect = useCallback(
    async (song: searchResults, limit: boolean) => {
      if (!song) return;

      if (selectedSongs.includes(song)) {
        // If the song is already selected (uncheck), remove it from the list
        setSelectedSongs(selectedSongs.filter((s) => s !== song));
      } else {
        if (selectedSongs.length >= 5 && limit)
          return toast.error("Limit reached only 5 songs at a time");

        // If the song is not selected (check), add it to the list
        setSelectedSongs([song, ...selectedSongs]);
      }
    },
    [selectedSongs]
  );

  return { handleSelect, selectedSongs, setSelectedSongs };
}

export default useSelect;
