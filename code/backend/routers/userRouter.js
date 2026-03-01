import express from "express";
import { createUser, loginUser, getRecentFarmers } from "../controllers/userController.js";


const userRouter = express.Router()
userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/recent-farmers", getRecentFarmers)


export default userRouter