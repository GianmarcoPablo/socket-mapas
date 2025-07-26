import { useCallback, useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { v4 as uuid } from "uuid";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";

mapboxgl.accessToken = '';

const puntoInicial = {
  lng: 5,
  lat: 34,
  zoom: 5
};

interface Coords {
  lng: number;
  lat: number;
  zoom: number;
}

interface Marker {
  id: string;
  lng: number;
  lat: number;
}

interface MarkerConId extends mapboxgl.Marker {
  id: string;
}

export const useMapBox = () => {
  const mapaDiv = useRef<HTMLDivElement | null>(null);
  const mapa = useRef<mapboxgl.Map | null>(null);
  const [coords, setCoords] = useState<Coords>(puntoInicial);

  const marcadores = useRef<Record<string, MarkerConId>>({});
  const movimientoMarcador = useRef(new Subject<Marker>());
  const nuevoMarcador = useRef(new Subject<Marker>());

  // Función común para crear el marcador
  const crearMarcador = useCallback((id: string, lng: number, lat: number, emitir: boolean) => {
    const marker = new mapboxgl.Marker() as MarkerConId;
    marker.id = id;
    marker.setLngLat({ lng, lat }).addTo(mapa.current!).setDraggable(true);

    marcadores.current[id] = marker;

    if (emitir) nuevoMarcador.current.next({ id, lng, lat });

    marker.on("drag", (event) => {
      const { lng, lat } = event.target.getLngLat();
      movimientoMarcador.current.next({ id, lng, lat });
    });
  }, []);

  // Cuando el usuario hace clic en el mapa
  const agregarMarcadorClick = useCallback((event: MapMouseEvent) => {
    const { lng, lat } = event.lngLat;
    const id = uuid();
    crearMarcador(id, lng, lat, true);
  }, [crearMarcador]);

  // Cuando recibimos marcador desde el socket
  const agregarMarcadorSocket = useCallback((marcador: Marker, id: string) => {
    crearMarcador(id, marcador.lng, marcador.lat, false);
  }, [crearMarcador]);

  // Inicializar el mapa
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [puntoInicial.lng, puntoInicial.lat],
      zoom: puntoInicial.zoom,
    });
    mapa.current = map;
  }, []);

  // Escuchar movimiento del mapa
  useEffect(() => {
    mapa.current?.on("move", () => {
      const center = mapa.current?.getCenter();
      if (center) {
        const { lat, lng } = center;
        setCoords({
          lng: +lng.toFixed(4),
          lat: +lat.toFixed(4),
          zoom: +mapa.current!.getZoom().toFixed(2)
        });
      }
    });
  }, []);

  // Escuchar clics para agregar marcador
  useEffect(() => {
    mapa.current?.on("click", agregarMarcadorClick);
  }, [agregarMarcadorClick]);


  return {
    coords,
    mapaDiv,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    agregarMarcadorSocket,
    marcadores
  };
};
