import { SocketProvider } from "./context/SoocketContext";
import { MapaPages } from "./pages/MapaPages";


export function App() {
  return (
    <SocketProvider>
      <MapaPages />
    </SocketProvider>
  );
}
