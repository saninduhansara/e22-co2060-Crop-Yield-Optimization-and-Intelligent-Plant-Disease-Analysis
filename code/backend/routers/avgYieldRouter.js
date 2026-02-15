import express from "express";
import { createAvgYield } from "../controllers/avgYieldController.js";


const avgYieldRouter = express.Router()
avgYieldRouter.post("/", createAvgYield)



export default avgYieldRouter