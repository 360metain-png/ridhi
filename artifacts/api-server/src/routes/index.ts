import { Router, type IRouter } from "express";
import healthRouter from "./health";
import paymentsRouter from "./payments";
import authRouter from "./auth";
import kycRouter from "./kyc";
import accountRouter from "./account";

const router: IRouter = Router();

router.use(healthRouter);
router.use(paymentsRouter);
router.use(authRouter);
router.use(kycRouter);
router.use(accountRouter);

export default router;
