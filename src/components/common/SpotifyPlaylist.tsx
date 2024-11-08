// import api from "@/lib/api";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../ui/dialog";
// import { FaSpotify } from "react-icons/fa";
// import { useUserContext } from "@/store/userStore";
// import { useCallback } from "react";
// // import { spotifyPlaylist } from "@/lib/types";

// function SpotifyPlaylist() {
//   const { user } = useUserContext();

//   // useEffect(() => {
//   //   if (!user || spotifyPlaylists) return;
//   //   const fetchPlaylist = async () => {
//   //     const response = await api.get(
//   //       "https://api.spotify.com/v1/me/playlists",
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${user?.spotifyData.access_token}`,
//   //         },
//   //       }
//   //     );
//   //     if (response.success) {
//   //       setSpotifyPlaylists((response.data as any).items as spotifyPlaylist[]);
//   //     }
//   //   };
//   //   fetchPlaylist();
//   // }, [user, setSpotifyPlaylists, spotifyPlaylists]);
//   // const handleLoadPlaylist = useCallback(
//   //   async (playlistId: string) => {
//   //     try {
//   //       const response = await api.get(
//   //         `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
//   //         {
//   //           headers: {
//   //             // Authorization: `Bearer ${user?.spotifyData.access_token}`,
//   //           },
//   //         }
//   //       );

//   //       if (response.success) {
//   //         const tracks = (response.data as any).items.map(
//   //           (item: any) => item.track
//   //         );
//   //         console.log(tracks);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching playlist tracks:", error);
//   //     }
//   //   },
//   //   [user]
//   // );
//   return (
//     <Dialog>
//       <DialogTrigger>
//         <div className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-secondary-foreground shadow-sm h-8 rounded-md px-2 text-xs bg-green-500 w-fit hover:bg-green-500">
//           {" "}
//           <FaSpotify className="size-4" />
//         </div>
//       </DialogTrigger>

//       <DialogContent className="flex bg-transparent flex-col w-full overflow-hidden rounded-2xl gap-0 p-0 border-none max-w-3xl max-md:max-w-sm">
//         <DialogHeader>
//           <DialogTitle />
//           <DialogDescription />
//         </DialogHeader>
//         <div className="bg-black rounded-t-xl font-semibold text-lg flex items-center justify-between p-2.5 px-4 text-zinc-200">
//           <p>Add tracks from your spotify playlists</p>
//         </div>
//         {/* {spotifyPlaylists && (
//           <div className="flex border-zinc-500 border-t-0 flex-col overflow-hidden bg-[#49454F]/70 max-h-[50dvh] overflow-y-scroll">
//             {spotifyPlaylists.map((playlist, i) => (
//               <div
//                 key={playlist.id}
//                 onClick={() => handleLoadPlaylist(playlist.id)}
//                 className={`flex gap-2 text-start cursor-pointer hover:bg-zinc-800/20 ${
//                   i != spotifyPlaylists.length - 1 && "border-b"
//                 }  border-[#1D192B] p-2.5 items-center`}
//               >
//                 <Avatar className=" h-14 w-14 rounded-none">
//                   <AvatarImage
//                     loading="lazy"
//                     alt={playlist?.name}
//                     height={500}
//                     width={500}
//                     className=" h-fll w-full"
//                     src={
//                       playlist?.images![playlist?.images?.length - 1]?.url ||
//                       "/cache.jpg"
//                     }
//                   />
//                 </Avatar>
//                 <div className="text-sm font-medium w-full">
//                   <p className="font-semibold truncate w-10/12">
//                     {playlist?.name}
//                   </p>
//                   <p className="font-medium truncate w-10/12 text-zinc-400 text-xs">
//                     {playlist?.owner?.display_name}
//                   </p>
//                   <p
//                     title={parse(playlist?.description).toString()}
//                     className=" text-xs text-[#a176eb] truncate w-10/12"
//                   >
//                     {parse(playlist.description).toString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//             {spotifyPlaylists.length == 0 && (
//               <p className="text-center text-zinc-500 py-4">
//                 No playlist found.
//               </p>
//             )}
//           </div>
//         )} */}
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default SpotifyPlaylist;
