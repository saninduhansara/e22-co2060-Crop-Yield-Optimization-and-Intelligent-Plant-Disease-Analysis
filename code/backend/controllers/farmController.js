import Farm from "../models/farm.js";
import User from "../models/user.js";
import { isAdmin } from "./userController.js";
import AvgYield from "../models/avgYield.js";

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




export const addHarvestAndPoints = async (req, res) => {
    const { farmId, season, year, harvestQty } = req.body;

    try {
        // Find farm by farmId
        const farm = await Farm.findOne({ farmId });

        if (!farm) {
            return res.status(404).json({ message: "Farm not found" });
        }

        // Add or update harvest
        const existingHarvest = farm.harvests.find(
            h => h.season === season && h.year === year
        );

        if (existingHarvest) {
            existingHarvest.harvestQty = harvestQty;
        } else {
            farm.harvests.push({ season, year, harvestQty });
        }

        await farm.save();

        // Calculate yield per acre
        const farmYield = harvestQty / farm.sizeInAcres;

        // Find average yield
        const avgYield = await AvgYield.findOne({
            district: farm.district,
            crop: farm.crop,
            season,
            year
        });

        if (!avgYield) {
            return res.status(404).json({ message: "Average yield not found" });
        }

        // Calculate points (example: 10 points if yield > average)
        let pointsEarned = 0;
        if (farmYield > avgYield.averageYield) {
            pointsEarned = 10; // You can adjust the scoring system
            await User.findByIdAndUpdate(
                farm.farmer,
                { $inc: { points: pointsEarned } }
            );
        }

        res.json({
            message: "Harvest added and points calculated",
            farmYield,
            averageYield: avgYield.averageYield,
            pointsEarned
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
