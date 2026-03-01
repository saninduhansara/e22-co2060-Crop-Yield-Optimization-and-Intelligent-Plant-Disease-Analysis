import express from "express";
import { createUser, loginUser, fetchUser } from "../controllers/userController.js";


const userRouter = express.Router()
userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.get("/profile", fetchUser)

export default userRouter