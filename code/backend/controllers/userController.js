import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export function createUser(req, res) {

    const password = bcrypt.hashSync(req.body.password, 10)

    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: password,
        phone: req.body.phone,
        isBlocked: req.body.isBlocked,
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
                message: "User Created Successfully"
            })
        }
    ).catch(
        () => {
            res.json({
                message: "Failed to create user"
            })
        }
    )
}


export function loginUser(req, res) {
    const email = req.body.email
    const password = req.body.password
    const intendedRole = req.body.intendedRole // 'farmer' or 'admin'

    User.findOne({
        email: email
    }).then(
        (user) => {
            if (user == null) {
                res.status(404).json({
                    message: "User not found"
                })

            } else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password)
                if (isPasswordCorrect) {

                    // Validate role matches
                    const normalizedDbRole = user.role === 'user' ? 'farmer' : user.role
                    if (intendedRole && normalizedDbRole !== intendedRole) {
                        return res.status(401).json({
                            message: "Invalid role selected. Please check your account type."
                        })
                    }

                    const token = jwt.sign(
                        {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            isBlocked: user.isBlocked,
                            isEmailVerified: user.isEmailVerified,
                            Image: user.image,
                            points: user.points

                        },
                        process.env.JWT_SECRET,
                    )

                    res.json({
                        token: token,
                        message: "Login Successful",
                        user: {
                            _id: user._id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            type: user.role,
                            points: user.points,
                            district: user.district,
                            division: user.division,
                            image: user.image
                        }
                    })
                } else {
                    res.status(401).json({

                        message: "Incorrect Password"
                    })
                }
            }
        }
    )

}

export function isAdmin(req) {
    if (req.user == null) {
        return false
    }
    if (req.user.role == "admin") {
        return true
    } else {
        return false
    }
}

export async function fetchUser(req, res) {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: "Unauthorized. Please log in again." });
        }

        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({
            message: "User retrieved successfully",
            user: user
        });
    } catch (error) {
        console.error("Error fetching user profile", error);
        res.status(500).json({ message: "Failed to fetch profile", error: error.message });
    }
}

// Get recently registered farmers
export async function getRecentFarmers(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 4; // Default to 4 recent farmers

        // Fetch recently registered farmers (role = 'farmer'), sorted by creation date descending
        const recentFarmers = await User.find({ role: 'farmer' })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('firstName lastName division district image nic createdAt');

        const formattedFarmers = recentFarmers.map(farmer => ({
            _id: farmer._id,
            name: `${farmer.firstName} ${farmer.lastName}`,
            firstName: farmer.firstName,
            lastName: farmer.lastName,
            location: farmer.district || farmer.division || 'Unknown',
            district: farmer.district,
            division: farmer.division,
            date: farmer.createdAt,
            image: farmer.image,
            nic: farmer.nic,
            status: 'Active' // Default status; can be extended if needed
        }));

        res.json({
            message: "Recent farmers retrieved successfully",
            count: formattedFarmers.length,
            farmers: formattedFarmers
        });
    } catch (error) {
        console.error("Error retrieving recent farmers:", error);
        res.status(500).json({
            message: "Failed to retrieve recent farmers",
            error: error.message
        });
    }
}
