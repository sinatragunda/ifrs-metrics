import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ifrsMetricsInterestRouter from "./ifrs-metrics-interest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ifrsMetricsInterestRouter);

export default router;
