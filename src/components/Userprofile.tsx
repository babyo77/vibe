import { cookies } from "next/headers";
import Profile from "./common/Profile";
import { getLoggedInUser } from "@/app/actions/getLoggedInUser";

async function Userprofile() {
  const user = await getLoggedInUser();
  const roomId = cookies().get("room")?.value;
  return <Profile user={user} roomId={roomId} />;
}

export default Userprofile;
