import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import userRouter from "./routers/userRouter.js"
import farmRouter from "./routers/farmRouter.js"
import jwt from "jsonwebtoken"
import avgYieldRouter from "./routers/avgYieldRouter.js"
dotenv.config()


const app = express()

app.use(bodyParser.json())


app.use(
    (req,res,next) => {
        const value = req.header("Authorization")
        if(value != null){
            const token = value.replace("Bearer ","")
            
            jwt.verify(token,process.env.JWT_SECRET,
                (err,decoded) => {
                    if(decoded ==null){
                        res.status(403).json({
                            message : "unauthorized"
                        })
                    }else{
                        req.user = decoded
                        next()
                    }
                    
                }
            )

        }else{
            next()
        }
        
    }
)

const connectionString = process.env.MONGO_URI


mongoose.connect(connectionString).then(
    ()=>{
        console.log("Database Connected")

    }
).catch( 
    ()=>{
        console.log("Database Connection Failed")
    }
)

app.use("/api/users", userRouter)
app.use("/api/farms", farmRouter)
app.use("/api/avgYields", avgYieldRouter)



app.listen(5000, ()=>{
    console.log("server started at port 5000")})