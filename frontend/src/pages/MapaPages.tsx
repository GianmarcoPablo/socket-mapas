import { useEffect } from "react";
import { useMapBox } from "../hooks/useMapbox";
import { useSocketContext } from "../context/SoocketContext";

type MarcadoresType = Record<string, Marker>;

interface Marker {
  id: string,
  lng: number,
  lat: number
}

export function MapaPages() {
  const { coords, mapaDiv, nuevoMarcador$, movimientoMarcador$, agregarMarcadorSocket } = useMapBox();
  const { socket } = useSocketContext()

  useEffect(() => {
    socket.on("marcadores-activos", (marcadores: MarcadoresType) => {
      for (const key of Object.keys(marcadores)) {
        agregarMarcadorSocket(marcadores[key], key);
      }
    });
  }, [socket, agregarMarcadorSocket]);

  useEffect(() => {
    nuevoMarcador$.subscribe(marcador => {
      socket.emit("marcador-nuevo", marcador)
    })
  }, [nuevoMarcador$, socket])

  useEffect(() => {
    movimientoMarcador$.subscribe(mvMarcado => {
      console.log({ mvMarcado })
    })
  }, [movimientoMarcador$])

  useEffect(() => {
    socket.on("marcador-nuevo", (marcador) => {
      agregarMarcadorSocket(marcador, marcador.id)
    })
  }, [socket])

  return (
    <>
      <div className="info">
        Lng: {coords.lng} | lat: {coords.lat} | Zoom:  {coords.zoom}
      </div>
      <div className="mapContainer" ref={mapaDiv}></div>
    </>
  );
}
