import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bodyParser from "body-parser"
dotenv.config()


const app = express()

app.use(bodyParser.json())

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