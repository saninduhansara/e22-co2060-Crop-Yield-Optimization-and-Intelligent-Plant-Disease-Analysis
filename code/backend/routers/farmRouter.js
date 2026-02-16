import express from "express";
import { addHarvest, addHarvestAndPoints, createFarm } from "../controllers/farmController.js";

const farmRouter = express.Router()
farmRouter.post("/", createFarm)
farmRouter.post("/addharvest", addHarvest)
farmRouter.post("/addharvestandpoints", addHarvestAndPoints)



export default farmRouter
