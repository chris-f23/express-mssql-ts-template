import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const mapErrorResponse = () => {
  const middleware: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: {
          message: "Invalid request",
          details: err.issues.map(
            (issue) =>
              `${issue.path.join(".")}: ${issue.message.replace(":", " -")}`
          ),
        },
      });
    }
    res.status(500).json({
      error: {
        message: "Internal server error",
        details: err.message,
      },
    });
  };
  return middleware;
};
