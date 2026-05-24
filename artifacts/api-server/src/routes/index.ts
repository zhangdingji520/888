import { Router, type IRouter } from "express";
import healthRouter from "./health";
import flightsRouter from "./flights";
import airportsRouter from "./airports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(flightsRouter);
router.use(airportsRouter);

export default router;
