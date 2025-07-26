interface Marker {
  id: string,
  lng: number,
  lat: number
}

type MarcadoresType = Record<string, Marker>;

export class Marcadores {
  constructor(
    public activos: MarcadoresType = {}
  ) { }

  public agregarMarcador(marcador: Marker) {
    this.activos[marcador.id] = marcador
    return marcador;
  }

  public removerMarkador(id: string) {
    delete this.activos[id]
  }

  public actualizarMarcador(marcador: Marker) {
    this.activos[marcador.id] = marcador
  }

}
