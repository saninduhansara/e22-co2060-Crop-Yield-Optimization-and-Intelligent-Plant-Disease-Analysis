import express from "express";
import { createUser, loginUser, fetchUser, getRecentFarmers } from "../controllers/userController.js";

const userRouter = express.Router()

// User Authentication
userRouter.post("/", createUser)
userRouter.post("/login", loginUser)

// Profile and General
userRouter.get("/profile", fetchUser)
userRouter.get("/recent-farmers", getRecentFarmers)

export default userRouter