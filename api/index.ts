import type { IncomingMessage, ServerResponse } from "http";
import app from "../artifacts/api-server/src/app";

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  (app as unknown as NodeHandler)(req, res);
}
