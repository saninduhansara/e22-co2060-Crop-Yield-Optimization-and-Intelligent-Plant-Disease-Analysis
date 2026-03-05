/**
 * Express Router: Average Yield Routes
 * Handles bulk and single insertion of average yield data.
 * Base path: /api/avg-yields
 */
import express from "express";
import { createAvgYield } from "../controllers/avgYieldController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const avgYieldRouter = express.Router()

// Apply authentication middleware to all avg yield routes
avgYieldRouter.use(requireAuth);
avgYieldRouter.post("/", createAvgYield)



export default avgYieldRouter