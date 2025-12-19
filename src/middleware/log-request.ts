import { RequestHandler } from "express";
import shortid from "shortid";
import { Logger } from "../lib/logger";

const logger = new Logger();

export function logRequest() {
  const handler: RequestHandler = (req, res, next) => {
    req.headers["x-api-tag"] = shortid.generate();
    res.setHeader("x-api-tag", req.headers["x-api-tag"]);

    res.locals.requestDatetime = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - res.locals.requestDatetime;
      let logType: "debug" | "log" | "info" | "error" | "warn" = "info";

      if (res.statusCode >= 500) logType = "error";
      else if (res.statusCode >= 400) logType = "warn";

      const message = [
        `${req.headers["x-api-tag"]}`,
        `${res.statusCode}`,
        `${duration}ms`,
        `${req.method} ${req.originalUrl}`,
        req.body ? `req-body: ${JSON.stringify(req.body)}` : null,
        `req-headers: ${JSON.stringify({
          "user-agent": req.headers["user-agent"],
          origin: req.headers["origin"],
          referer: req.headers["referer"],
          "x-forwarded-for": req.headers["x-forwarded-for"],
        })}`,
        res.locals.response
          ? `res-body: ${JSON.stringify(res.locals.response)}`
          : null,
      ]
        .filter((item) => item !== null)
        .join(" | ");

      logger[logType](message);
    });
    return next();
  };

  return handler;
}
