import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Reviewed", "Resolved"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);
export default Inquiry;
