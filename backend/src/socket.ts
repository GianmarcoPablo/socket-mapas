import { Server as SocketIOServer } from "socket.io";
import { Marcadores } from "./models/marcadores.js";

export class Sockets {
  private isInitialized = false;

  constructor(
    private readonly io: SocketIOServer,
    private readonly marcadoresList = new Marcadores()
  ) { }

  private socketEvents() {
    // On connection
    this.io.on("connection", (socket) => {
      console.log("Cliente conectado:");

      socket.emit("marcadores-activos", this.marcadoresList.activos)
      socket.on("marcador-nuevo", (marcador) => {
        this.marcadoresList.agregarMarcador(marcador)
        socket.broadcast.emit("marcador-nuevo", marcador)
      })
    });
  }

  public init() {
    if (this.isInitialized) return;
    this.socketEvents();
    this.isInitialized = true;
  }
}
