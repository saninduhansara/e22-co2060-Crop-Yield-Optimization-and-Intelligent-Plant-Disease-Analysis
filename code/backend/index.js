/**
 * Main application entry point for the AgriConnect backend.
 * Configures Express, CORS, MongoDB connection, routing, and global JWT middleware.
 */
import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import cors from "cors"
import userRouter from "./routers/userRouter.js"
import farmRouter from "./routers/farmRouter.js"
import jwt from "jsonwebtoken"
import avgYieldRouter from "./routers/avgYieldRouter.js"
import inquiryRouter from "./routers/inquiryRouter.js"
dotenv.config()


const app = express()

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

// Enable JSON request body parsing
app.use(express.json())

/**
 * Global Authentication Middleware
 * Validates 'Authorization: Bearer <token>' headers on incoming requests.
 * If present and valid, decodes the token and attaches `req.user`.
 * Note: If no token is provided, it currently falls through (open by default).
 */
app.use(
    (req, res, next) => {
        const value = req.header("Authorization")
        if (value != null) {
            const token = value.replace("Bearer ", "")

            jwt.verify(token, process.env.JWT_SECRET,
                (err, decoded) => {
                    if (decoded == null) {
                        res.status(403).json({
                            message: "unauthorized"
                        })
                    } else {
                        req.user = decoded
                        next()
                    }

                }
            )

        } else {
            next()
        }

    }
)

/**
 * Initialize MongoDB Connection and start the server.
 */
const connectionString = process.env.MONGO_URI

mongoose.connect(connectionString).then(
    () => {
        console.log("Database Connected")

    }
).catch(
    () => {
        console.log("Database Connection Failed")
    }
)

app.use("/api/users", userRouter)
app.use("/api/farms", farmRouter)
app.use("/api/avgYields", avgYieldRouter)
app.use("/api/inquiries", inquiryRouter)



app.listen(5000, () => {
    console.log("server started at port 5000")
})

app.get("/health", (req,res)=>{
  res.status(200).json({status:"ok"});
});