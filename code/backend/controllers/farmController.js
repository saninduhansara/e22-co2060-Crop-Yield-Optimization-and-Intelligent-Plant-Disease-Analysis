import Farm from "../models/farm.js";
import User from "../models/user.js";
import { isAdmin } from "./userController.js";

export async function createFarm(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only" });
    }

    const { farmerNIC, ...farmData } = req.body;

    // Find the farmer by NIC
    const farmer = await User.findOne({ nic: farmerNIC });
    if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
    }

    const farm = new Farm({
        ...farmData,
        farmer: farmer._id
    });

    try {
        const response = await farm.save();
        res.json({ message: "Farm created successfully", farm: response });
    } catch (error) {
        console.error("Error creating farm", error);
        return res.status(500).json({ message: "Failed", error: error.message });
    }
}

