import { useEffect, useMemo, useState } from "react";
import { connect } from "socket.io-client";

interface Props {
  serverPath: string;
}

export function useSocket({ serverPath }: Props) {
  const socket = useMemo(
    () =>
      connect(serverPath, {
        path: "/ws",
        transports: ["websocket"],
      }),
    [serverPath],
  );
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const handleConnect = () => setOnline(true);
    const handleDisconnect = () => setOnline(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      // NO hacer socket.disconnect() si el componente no controla toda la app
    };
  }, [socket]);

  return {
    socket,
    online,
  };
}
