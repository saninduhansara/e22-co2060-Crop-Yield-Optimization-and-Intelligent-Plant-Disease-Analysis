import Farm from "../models/farm.js";
import User from "../models/user.js";
import { isAdmin } from "./userController.js";
import AvgYield from "../models/avgYield.js";

/**
 * Creates a new farm profile and associates it with a farmer via their NIC.
 * Automatically generates a sequential Farm ID (FAMXXXXX).
 * 
 * @param {Object} req - Express request object containing farmData and farmerNIC.
 * @param {Object} res - Express response object.
 */
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

  let retryCount = 0;
  let success = false;
  let savedFarm = null;

  // Retry loop up to 5 times for resolving race conditions
  while (retryCount < 5 && !success) {
    try {
      let farmId = "FAM00202";
      // Sort by _id to accurately get the latest inserted document
      const latestid = await Farm.find().sort({ _id: -1 }).limit(1);

      if (latestid.length > 0 && latestid[0].farmId) {
        const lastfarmIdString = latestid[0].farmId;
        const lastfarmIdWithoutPrefix = lastfarmIdString.replace("FAM", "");
        const lastfarmIdInInteger = parseInt(lastfarmIdWithoutPrefix, 10) || 201;
        // Increment by 1 + retryCount to step over conflicting IDs on retries
        const newfarmIdInInteger = lastfarmIdInInteger + 1 + retryCount;
        const newfarmIdWithoutPrefix = newfarmIdInInteger.toString().padStart(5, "0");
        farmId = "FAM" + newfarmIdWithoutPrefix;
      }

      const farm = new Farm({
        ...farmData,
        farmer: farmer._id,
        farmId: farmId
      });

      savedFarm = await farm.save();
      success = true;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.farmId) {
        // Duplicate key error on farmId (concurrency collision)
        retryCount++;
        continue;
      } else {
        console.error("Error creating farm:", error);
        return res.status(500).json({ message: "Failed", error: error.message });
      }
    }
  }

  if (success) {
    return res.json({ message: "Farm created successfully", farm: savedFarm });
  } else {
    return res.status(500).json({ message: "Failed to generate a unique Farm ID due to high traffic. Please try again." });
  }
}


// add harvest and update points automatically in farmers
// y max = maximum average yield for that season and year across all districts
// points = P max * sqrt((farm yield - average yield) / (y max - average yield)) + P max * 0.2* (farm yield / average yield) if farm yield >= average yield
// if farm yield < average yield → points = P max * 0.2 * (farm yield / average yield)

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
    const denominator = Y_MAX - avgYield;
    let pointsEarned = 0;

    if (farmYield >= avgYield && denominator > 0) {
      const numerator = farmYield - avgYield;
      pointsEarned = P_MAX * Math.sqrt(numerator / denominator) + P_MAX * 0.2 * (farmYield / avgYield);
    }
    if (farmYield < avgYield) {
      pointsEarned = P_MAX * 0.2 * (farmYield / avgYield);

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

/**
 * Retrieves a list of all farms in the system, populated with detailed farmer data.
 * Used primarily for the admin dashboard's farm management table.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object returning formatted farm array.
 */
export const getAllFarms = async (req, res) => {
  try {
    // Populate farmer details from users collection
    const farms = await Farm.find()
      .populate('farmer', 'firstName lastName nic phone division district points image')
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
      farmerImage: farm.farmer?.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
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

/**
 * Retrieves a single farm by its custom `farmId` along with the associated farmer profile.
 * 
 * @param {Object} req - Express request object containing farmId param.
 * @param {Object} res - Express response object.
 */
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

/**
 * Updates an existing farm profile.
 * Only administrators are permitted to call this endpoint.
 * 
 * @param {Object} req - Express request object containing the updated fields.
 * @param {Object} res - Express response object.
 */
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

/**
 * Deletes a farm from the system based on its `farmId`.
 * Only administrators are permitted to call this endpoint.
 * 
 * @param {Object} req - Express request object containing farmId param.
 * @param {Object} res - Express response object.
 */
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

/**
 * Flattens all nested harvest objects across all farms into a single timeline array.
 * Calculates yield-per-acre dynamically for table display on the admin UI.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object returning a flat list of harvests.
 */
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

/**
 * Retrieves a distinct, alphabetically sorted list of all unique crops planted.
 * Useful for building active dropdown filters in the UI.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getAllCrops = async (req, res) => {
  try {
    const crops = await Farm.distinct('crop');

    // Sort crops alphabetically
    crops.sort();

    res.json({
      message: "Crops retrieved successfully",
      crops: crops,
      total: crops.length
    });
  } catch (error) {
    console.error("Error fetching crops:", error);
    res.status(500).json({ message: "Failed to fetch crops", error: error.message });
  }
};

/**
 * Aggregates farm statistics for the authenticated farmer (My Reports).
 * Calculates total acres, total points, and grouping crop varieties by size.
 * Also generates a 6-month harvest trend timeline.
 * 
 * @param {Object} req - Express request object (depends on auth middleware).
 * @param {Object} res - Express response object.
 */
export const getFarmerReport = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const farms = await Farm.find({ farmer: user._id });

    let totalAcres = 0;
    const cropMap = {};
    const harvestTrendMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months to 0 to ensure timeline continuity
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      harvestTrendMap[monthNames[d.getMonth()]] = 0;
    }

    farms.forEach(farm => {
      totalAcres += farm.sizeInAcres;
      if (cropMap[farm.crop]) {
        cropMap[farm.crop] += farm.sizeInAcres;
      } else {
        cropMap[farm.crop] = farm.sizeInAcres;
      }

      // Aggregate harvests inside the 6-month window
      if (farm.harvests && farm.harvests.length > 0) {
        farm.harvests.forEach(harvest => {
          if (harvest.createdDate) {
            const harvestDate = new Date(harvest.createdDate);
            const diffMonths = (today.getFullYear() - harvestDate.getFullYear()) * 12 + today.getMonth() - harvestDate.getMonth();
            if (diffMonths >= 0 && diffMonths < 6) {
              const mName = monthNames[harvestDate.getMonth()];
              if (harvestTrendMap[mName] !== undefined) {
                harvestTrendMap[mName] += harvest.harvestQty;
              }
            }
          }
        });
      }
    });

    const cropVarieties = Object.keys(cropMap).map(crop => ({
      name: crop,
      acres: cropMap[crop],
      value: totalAcres > 0 ? parseFloat(((cropMap[crop] / totalAcres) * 100).toFixed(1)) : 0
    }));

    const harvestTrend = Object.keys(harvestTrendMap).map(month => ({
      month,
      qty: harvestTrendMap[month]
    }));

    res.json({
      message: "Report retrieved successfully",
      totalPoints: user.points || 0,
      totalAcres: parseFloat(totalAcres.toFixed(1)),
      cropVarieties: cropVarieties,
      harvestTrend
    });
  } catch (error) {
    console.error("Error retrieving farmer report", error);
    res.status(500).json({ message: "Failed to retrieve report", error: error.message });
  }
};
