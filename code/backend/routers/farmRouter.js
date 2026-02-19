import express from "express";
import { addHarvestAndPoints, createFarm, getAllFarms, getFarmById, updateFarm, deleteFarm } from "../controllers/farmController.js";

const farmRouter = express.Router()

// GET endpoints
farmRouter.get("/", getAllFarms)
farmRouter.get("/:farmId", getFarmById)

// POST endpoints
farmRouter.post("/", createFarm)
farmRouter.post("/addharvestandpoints", addHarvestAndPoints)

// PUT/PATCH endpoints
farmRouter.put("/:farmId", updateFarm)

// DELETE endpoints
farmRouter.delete("/:farmId", deleteFarm)

export default farmRouter
