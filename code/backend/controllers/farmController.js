import Farm from "../models/farm.js";
import User from "../models/user.js";
import { isAdmin } from "./userController.js";

export async function createFarm(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only" });
    }


    let farmId = "FAM00202"
    const latestid = await Farm.find().sort({ createdDate: -1 }).limit(1);

    if(latestid.length > 0){
        const lastfarmIdString = latestid[0].farmId
        const lastfarmIdWithoutPrefix = lastfarmIdString.replace("FAM","")
        const lastfarmIdInInteger = parseInt(lastfarmIdWithoutPrefix)
        const newfarmIdInInteger = lastfarmIdInInteger + 1
        const newfarmIdWithoutPrefix = newfarmIdInInteger.toString().padStart(5,"0")
        farmId = "FAM" + newfarmIdWithoutPrefix

    }

    const { farmerNIC, ...farmData } = req.body;

    // Find the farmer by NIC
    const farmer = await User.findOne({ nic: farmerNIC });
    if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
    }

    const farm = new Farm({
        ...farmData,
        farmer: farmer._id,
        farmId: farmId
    });

    try {
        const response = await farm.save();
        res.json({ message: "Farm created successfully", farm: response });
    } catch (error) {
        console.error("Error creating farm", error);
        return res.status(500).json({ message: "Failed", error: error.message });
    }
}

