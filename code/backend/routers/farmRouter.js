import express from "express";
import { addHarvestAndPoints, createFarm, getAllFarms, getFarmById } from "../controllers/farmController.js";

const farmRouter = express.Router()

// GET endpoints
farmRouter.get("/", getAllFarms)
farmRouter.get("/:farmId", getFarmById)

// POST endpoints
farmRouter.post("/", createFarm)
farmRouter.post("/addharvestandpoints", addHarvestAndPoints)

export default farmRouter
