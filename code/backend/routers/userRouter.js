/**
 * Express Router: User Routes
 * Handles user authentication, profile details, and role checks.
 * Base path: /api/users
 */
import express from "express";
import { createUser, loginUser, fetchUser, getRecentFarmers, updateProfile } from "../controllers/userController.js";

const userRouter = express.Router()

// User Authentication
userRouter.post("/", createUser)
userRouter.post("/login", loginUser)

// Profile and General
userRouter.get("/profile", fetchUser)
userRouter.put("/profile", updateProfile)
userRouter.get("/recent-farmers", getRecentFarmers)

export default userRouter