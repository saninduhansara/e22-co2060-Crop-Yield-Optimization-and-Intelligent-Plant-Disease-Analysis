import mongoose from "mongoose";

const avgYieldSchema = new mongoose.Schema({
    district: {
        type: String,
        required: true
    },
    crop: {
        type: String,
        required: true
    },
    season: {
        type: String,
        required: true,
        enum: ["Maha", "Yala"]   
    },
    averageYield: {
        type: Number,
        required: true
    }
});


avgYieldSchema.index({ district: 1, season: 1, crop: 1 }, { unique: true });

const AvgYield = mongoose.model("avgYields", avgYieldSchema);
export default AvgYield;
