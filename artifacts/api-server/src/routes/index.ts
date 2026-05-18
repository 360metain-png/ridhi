import { Router, type IRouter } from "express";
import healthRouter from "./health";
import paymentsRouter from "./payments";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(paymentsRouter);
router.use(authRouter);

export default router;
