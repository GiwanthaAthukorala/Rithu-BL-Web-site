import { io } from "socket.io-client";

export default function useSocket(userId) {
  const socket = io(process.env.NEXT_PUBLIC_API_URL, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket", "polling"],
    // Additional options for stability
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  useEffect(() => {
    if (!userId) return;

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      socket.emit("register", userId);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socket;
}
