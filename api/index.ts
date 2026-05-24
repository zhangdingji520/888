import type { IncomingMessage, ServerResponse } from "http";
import app from "../artifacts/api-server/src/app";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
