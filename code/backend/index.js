import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
const app = express()


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


app.listen(5000, ()=>{
    console.log("server started at port 5000")})