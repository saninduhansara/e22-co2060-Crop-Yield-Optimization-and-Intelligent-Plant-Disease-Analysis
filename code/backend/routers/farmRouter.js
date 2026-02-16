import express from "express";
import {  addHarvestAndPoints, createFarm } from "../controllers/farmController.js";

const farmRouter = express.Router()
farmRouter.post("/", createFarm)
farmRouter.post("/addharvestandpoints", addHarvestAndPoints)



export default farmRouter
