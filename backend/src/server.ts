
// server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { Sockets } from "./socket.js";
import { cors } from "hono/cors";

export class Server {
  private io?: SocketIOServer;

  constructor(
    private readonly app: Hono = new Hono(),
    private readonly port: number = 8000,
  ) { }

  private setupMiddlewares() {
    this.app.use("/public/*", serveStatic({ root: "./" }));
    this.app.use("*", cors())
  }

  private setupRoutes() {

  }

  private setupSocketIO(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      path: "/ws",
      serveClient: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });

    this.io.on("error", (err) => {
      console.error("Socket.IO Error:", err);
    });
  }

  private configWebsockets() {
    if (!this.io) throw new Error("Socket.IO no está inicializado");
    const sockets = new Sockets(this.io);
    sockets.init();
  }

  private initiHttpServer() {
    const httpServer = serve(
      {
        fetch: this.app.fetch,
        port: this.port,
      },
      (info) => {
        console.log(`Server corriendo en puerto: ${info.port}`);
      },
    );
    return httpServer;
  }

  public start() {
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupSocketIO(this.initiHttpServer() as HttpServer);
    this.configWebsockets();
  }
}
