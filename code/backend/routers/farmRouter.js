import express from "express";
import { createFarm } from "../controllers/farmController.js";

const farmRouter = express.Router()
farmRouter.post("/", createFarm)



export default farmRouter