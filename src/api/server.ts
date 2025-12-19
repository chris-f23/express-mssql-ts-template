import express from "express";
import cors from "cors";
import { Server } from "http";
import { mapErrorResponse } from "../middleware/map-error-response";
import { logRequest } from "../middleware/log-request";
import { mainRouter } from "./resources/routes";

type CreateServerOptions = {
  port: number;
};

export function createServer(options: CreateServerOptions) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(logRequest());
  app.use(mainRouter);
  app.use(mapErrorResponse());

  let server: Server;

  return {
    start: () => {
      server = app.listen(options.port, () => {
        console.log(`Server listening on port ${options.port}`);
      });
    },
    stop: () => {
      return new Promise<void>((resolve, reject) => {
        server.close((err) => {
          // console.debug("Stopping server...");
          if (err) {
            reject(err);
          } else {
            console.debug("Server stopped");
            resolve();
          }
        });
      });
    },
  };
}
