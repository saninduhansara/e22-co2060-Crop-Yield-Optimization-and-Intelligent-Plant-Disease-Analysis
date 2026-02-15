import mongoose  from "mongoose"

const userSchema = new mongoose.Schema(
    {

    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : String,
    phone : {
        type : String,
        default : "NOT GIVEN"
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    role : {
        type : String,
        default : "farmer" 
    },
    
    image : {
        type : String,
        default : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    },

    nic:{
        type : String,
        default : "NOT GIVEN"
    },
    address:{
        type : String,
        default : "NOT GIVEN"
    },
    division:{
        type : String,
        default : "NOT GIVEN"

    },
    district:{
        type : String,
        default : "NOT GIVEN"
    },
    points:{
        type : Number,
        default : 0
    }
    }
)

export function isAdmin(req){
    if(req.user == null){
        return false
    }
    if(req.user.role == "admin"){
        return true
    }else{
        return false
    }
}

const User = mongoose.model("users", userSchema)
export default User