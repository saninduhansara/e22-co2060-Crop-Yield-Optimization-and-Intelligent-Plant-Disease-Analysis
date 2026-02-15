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


export function loginUser(req,res){
    const email = req.body.email
    const password = req.body.password

    User.findOne({
        email : email
    }).then(
        (user) => {
            if(user == null){
                res.status(404).json({
                    message : "User not found"
                })
            
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password,user.password)
                if(isPasswordCorrect){
                    
                    const token = jwt.sign(
                        {
                            email : user.email,
                            firstName : user.firstName,
                            lastName : user.lastName,
                            role : user.role,
                            isBlocked : user.isBlocked,
                            isEmailVerified : user.isEmailVerified,
                            Image : user.image,
                            points : user.points
                    
                        },
                        process.env.JWT_SECRET,
                    )
                
                    res.json({
                        token : token,
                        message : "Login Successful",
                        role : user.role
                    })
                }else{
                    res.status(403).json({
        
                        message : "Incorrect Password"
                    })
                }
            }
        }
    )
    
}


