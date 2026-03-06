import Inquiry from "../models/inquiryModel.js";
import { isAdmin } from "./userController.js";

// @desc    Submit a new inquiry (Farmer)
// @route   POST /api/inquiries
// @access  Private (Farmer)
export const createInquiry = async (req, res) => {
    try {
        const { subject, message, farmerId } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and message are required" });
        }

        const inquiry = new Inquiry({
            farmer: farmerId || req.user?._id, // Support either explicit passing or from auth middleware
            subject,
            message,
        });

        const createdInquiry = await inquiry.save();
        res.status(201).json(createdInquiry);
    } catch (error) {
        console.error("Error creating inquiry:", error);
        res.status(500).json({ message: "Failed to submit inquiry", error: error.message });
    }
};

// @desc    Get all inquiries (Admin)
// @route   GET /api/inquiries
// @access  Private 
export const getInquiries = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const queryFilter = req.user.role === 'admin' ? {} : { farmer: req.user.id };

        const inquiries = await Inquiry.find(queryFilter)
            .populate("farmer", "firstName lastName email district")
            .sort({ createdAt: -1 });

        res.json({ inquiries });
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        res.status(500).json({ message: "Failed to fetch inquiries", error: error.message });
    }
};

// @desc    Update inquiry status (Admin)
// @route   PUT /api/inquiries/:id/status
// @access  Private (Admin)
export const updateInquiryStatus = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only" });
    }

    try {
        const { status } = req.body;

        if (!["Pending", "Reviewed", "Resolved"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const inquiry = await Inquiry.findById(req.params.id);

        if (inquiry) {
            inquiry.status = status;
            const updatedInquiry = await inquiry.save();

            // Re-fetch with populated farmer info
            const populatedInquiry = await Inquiry.findById(updatedInquiry._id)
                .populate("farmer", "firstName lastName email district");

            res.json(populatedInquiry);
        } else {
            res.status(404).json({ message: "Inquiry not found" });
        }
    } catch (error) {
        console.error("Error updating inquiry status:", error);
        res.status(500).json({ message: "Failed to update inquiry", error: error.message });
    }
};
