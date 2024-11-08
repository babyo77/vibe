import { socket } from "@/app/socket";
import { encrypt } from "@/utils/lock";

export async function emitMessage(emit: string, message: any) {
  socket.emit(emit, encrypt(message));
}
