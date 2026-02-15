import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv" 
dotenv.config()

export function createUser(req,res){

    const password = bcrypt.hashSync(req.body.password,10)

    const userData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: password,      
    phone: req.body.phone,
    isBlocked: req.body.isBlocked ,
    role: req.body.role,
    image: req.body.image,
    nic: req.body.nic,
    address: req.body.address,
    division: req.body.division,
    district: req.body.district, 
    points: req.body.points 
};


    const user = new User(userData)

    user.save().then(
        () => {
            res.json({
                message : "User Created Successfully"
            })
        }
    ).catch(
        () =>{
            res.json({
                message : "Failed to create user"
            })
        }
    )
}


