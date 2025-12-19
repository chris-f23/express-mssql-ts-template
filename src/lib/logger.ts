import { DateTime } from "luxon";

export class Logger {
  private lastMessage: string | undefined = undefined;

  constructor() {}

  private paintText(
    text: string,
    type: "error" | "warn" | "info" | "debug" | "log"
  ) {
    let color = "0";

    switch (type) {
      case "debug":
        color = "47"; // Fondo blanco
        break;
      case "log":
        color = "37"; // Blanco
        break;
      case "info":
        color = "32"; // Verde
        break;
      case "error":
        color = "31"; // Rojo
        break;
      case "warn":
        color = "33"; // Amarillo
        break;

      default:
        break;
    }

    return `\x1b[${color}m${text}\x1b[0m`;
  }

  private _log(
    message: any,
    type: "log" | "error" | "warn" | "info" | "debug"
  ) {
    if (this.lastMessage === message) {
      return;
    }

    const now = DateTime.now().toFormat("yyyyMMdd.HHmmss");
    this.lastMessage = message;

    console[type](this.paintText(`[${now}]  ${message}`, type));
  }

  debug(message: any) {
    this._log(message, "debug");
  }

  log(message: any) {
    this._log(message, "log");
  }

  error(message: any) {
    this._log(message, "error");
  }

  warn(message: any) {
    this._log(message, "warn");
  }

  info(message: any) {
    this._log(message, "info");
  }
}
