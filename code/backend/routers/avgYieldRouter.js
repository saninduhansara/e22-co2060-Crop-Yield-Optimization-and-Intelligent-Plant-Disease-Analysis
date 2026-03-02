/**
 * Express Router: Average Yield Routes
 * Handles bulk and single insertion of average yield data.
 * Base path: /api/avg-yields
 */
import express from "express";
import { createAvgYield } from "../controllers/avgYieldController.js";


const avgYieldRouter = express.Router()
avgYieldRouter.post("/", createAvgYield)



export default avgYieldRouter