import type { IncomingMessage, ServerResponse } from "http";
import app from "../artifacts/api-server/src/app";

// Express v5 的 Express 类型没有调用签名，用 unknown 过渡再强转
type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  (app as unknown as NodeHandler)(req, res);
}
