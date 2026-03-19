/**
 * Express Router: Farm & Harvest Routes
 * Handles farm profiles, harvest tracking, and points logic.
 * Base path: /api/farms
 */
import express from "express";
import { addHarvestAndPoints, recalculateAllPoints, createFarm, getAllFarms, getFarmById, updateFarm, deleteFarm, getHarvestHistory, getFarmerReport, getAllCrops } from "../controllers/farmController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const farmRouter = express.Router()

// Apply authentication middleware to all farm routes
farmRouter.use(requireAuth);

// GET endpoints
farmRouter.get("/", getAllFarms)
farmRouter.get("/crops/list", getAllCrops)
farmRouter.get("/harvests", getHarvestHistory)
farmRouter.get("/my-report", getFarmerReport)
farmRouter.get("/:farmId", getFarmById)

// POST endpoints
// POST endpoints
farmRouter.post("/", createFarm)
farmRouter.post("/addharvestandpoints", addHarvestAndPoints)
farmRouter.post("/recalculate-points", recalculateAllPoints)

// PUT/PATCH endpoints
farmRouter.put("/:farmId", updateFarm)

// DELETE endpoints
farmRouter.delete("/:farmId", deleteFarm)

export default farmRouter
