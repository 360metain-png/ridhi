import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    // Verify DB connectivity with a lightweight query
    await pool.query("SELECT 1");
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unreachable";
    res.status(503).json({ status: "unavailable", error: message });
  }
});

export default router;
