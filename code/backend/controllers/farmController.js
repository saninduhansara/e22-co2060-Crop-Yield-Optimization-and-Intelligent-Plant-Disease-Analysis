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


// add harvest and update points automatically in farmers
// y max = maximum average yield for that season and year across all districts
// points = P max * sqrt( max(0, farm yield - average yield) / (y max - average yield) )

export const addHarvestAndPoints = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only" });
    }
  const { farmId, season, year, harvestQty } = req.body;

  try {
    // Find farm by farmId
    const farm = await Farm.findOne({ farmId });
    if (!farm) return res.status(404).json({ message: "Farm not found" });

    // Add or update harvest
    const existingHarvest = farm.harvests.find(
      (h) => h.season === season && h.year === year
    );
    if (existingHarvest) {
      existingHarvest.harvestQty = harvestQty;
    } else {
      farm.harvests.push({ season, year, harvestQty });
    }
    await farm.save();

    // Farmer yield per acre
    const farmYield = harvestQty / farm.sizeInAcres;

    // Average yield for this farm/district
    const avgYieldRecord = await AvgYield.findOne({
      district: farm.district,
      crop: farm.crop,
      season,
      year,
    });
    if (!avgYieldRecord)
      return res.status(404).json({ message: "Average yield not found" });
    const avgYield = avgYieldRecord.averageYield;

    // Find global maximum averageYield for season + year
    const maxYieldRecord = await AvgYield.find(
      { season, year },
      "averageYield"
    )
      .sort({ averageYield: -1 })
      .limit(1);

    const Y_MAX = maxYieldRecord.length
      ? maxYieldRecord[0].averageYield
      : avgYield; // fallback to local average

    // Points calculation
    const P_MAX = 1000;
    const numerator = Math.max(0, farmYield - avgYield);
    const denominator = (Y_MAX - avgYield);
    let pointsEarned = 0;
    if (denominator > 0) {
      pointsEarned = P_MAX * Math.sqrt(numerator / denominator);
    }

    // Update farmer points
    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(farm.farmer, {
        $inc: { points: pointsEarned },
      });
    }

    res.json({
      message: "Harvest added and points calculated",
      farmYield,
      averageYield: avgYield,
      maxYieldAcrossDistricts: Y_MAX,
      pointsEarned: parseFloat(pointsEarned.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all farms with farmer details
export const getAllFarms = async (req, res) => {
  try {
    // Populate farmer details from users collection
    const farms = await Farm.find()
      .populate('farmer', 'firstName lastName nic phone division district points')
      .select('farmId farmName location district sizeInAcres crop status createdDate harvests farmer')
      .lean();

    // Format the response with all required fields
    const formattedFarms = farms.map(farm => ({
      farmId: farm.farmId,
      farmName: farm.farmName,
      farmerName: farm.farmer ? `${farm.farmer.firstName} ${farm.farmer.lastName}` : 'Unknown',
      farmerNIC: farm.farmer?.nic || 'N/A',
      phone: farm.farmer?.phone || 'N/A',
      division: farm.farmer?.division || farm.division || 'N/A',
      district: farm.district || 'N/A',
      farmSize: farm.sizeInAcres,
      crop: farm.crop,
      status: farm.status,
      points: farm.farmer?.points || 0,
      createdDate: farm.createdDate,
      harvests: farm.harvests || []
    }));

    res.json({
      message: "Farms retrieved successfully",
      count: formattedFarms.length,
      farms: formattedFarms
    });
  } catch (error) {
    console.error("Error retrieving farms", error);
    res.status(500).json({ message: "Failed to retrieve farms", error: error.message });
  }
};

// Get single farm by ID with farmer details
export const getFarmById = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findOne({ farmId: farmId })
      .populate('farmer', 'firstName lastName nic phone division district points address image')
      .lean();

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    const formattedFarm = {
      farmId: farm.farmId,
      farmName: farm.farmName,
      location: farm.location,
      farmerName: farm.farmer ? `${farm.farmer.firstName} ${farm.farmer.lastName}` : 'Unknown',
      farmerNIC: farm.farmer?.nic || 'N/A',
      phone: farm.farmer?.phone || 'N/A',
      division: farm.farmer?.division || farm.location || 'N/A',
      district: farm.district || 'N/A',
      farmSize: farm.sizeInAcres,
      crop: farm.crop,
      status: farm.status,
      points: farm.farmer?.points || 0,
      createdDate: farm.createdDate,
      harvests: farm.harvests || [],
      farmerDetails: farm.farmer
    };

    res.json({
      message: "Farm retrieved successfully",
      farm: formattedFarm
    });
  } catch (error) {
    console.error("Error retrieving farm", error);
    res.status(500).json({ message: "Failed to retrieve farm", error: error.message });
  }
};

// Update farm details
export async function updateFarm(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Access denied. Admins only" });
  }

  try {
    const { farmId } = req.params;
    const { farmName, location, crop, sizeInAcres, district, status } = req.body;

    // Find and update farm
    const farm = await Farm.findOne({ farmId: farmId });
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // Update only provided fields
    if (farmName) farm.farmName = farmName;
    if (location) farm.location = location;
    if (crop) farm.crop = crop;
    if (sizeInAcres !== undefined) farm.sizeInAcres = sizeInAcres;
    if (district) farm.district = district;
    if (status) farm.status = status;

    const updatedFarm = await farm.save();

    res.json({
      message: "Farm updated successfully",
      farm: updatedFarm
    });
  } catch (error) {
    console.error("Error updating farm", error);
    res.status(500).json({ message: "Failed to update farm", error: error.message });
  }
}

// Delete farm
export async function deleteFarm(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Access denied. Admins only" });
  }

  try {
    const { farmId } = req.params;

    const farm = await Farm.findOne({ farmId: farmId });
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    await Farm.deleteOne({ farmId: farmId });

    res.json({
      message: "Farm deleted successfully",
      deletedFarmId: farmId
    });
  } catch (error) {
    console.error("Error deleting farm", error);
    res.status(500).json({ message: "Failed to delete farm", error: error.message });
  }
}

// Get all harvest history with farmer details
export const getHarvestHistory = async (req, res) => {
  try {
    const farms = await Farm.find().populate('farmer', 'firstName lastName nic');
    
    const harvestHistory = [];
    
    farms.forEach(farm => {
      if (farm.harvests && farm.harvests.length > 0) {
        farm.harvests.forEach(harvest => {
          const yieldPerAcre = harvest.harvestQty / farm.sizeInAcres;
          
          harvestHistory.push({
            harvestId: harvest._id,
            farmId: farm.farmId,
            farmName: farm.farmName,
            farmerName: farm.farmer ? `${farm.farmer.firstName} ${farm.farmer.lastName}` : 'Unknown',
            farmerNIC: farm.farmer ? farm.farmer.nic : 'N/A',
            season: harvest.season,
            year: harvest.year,
            crop: farm.crop,
            location: farm.location,
            district: farm.district,
            acres: farm.sizeInAcres,
            harvestQty: harvest.harvestQty,
            yieldPerAcre: parseFloat(yieldPerAcre.toFixed(2)),
            harvestDate: harvest.createdDate
          });
        });
      }
    });
    
    // Sort by harvest date (most recent first)
    harvestHistory.sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate));
    
    res.json({
      harvests: harvestHistory,
      total: harvestHistory.length
    });
  } catch (error) {
    console.error("Error fetching harvest history:", error);
    res.status(500).json({ message: "Failed to fetch harvest history", error: error.message });
  }
};
