import express from "express";
import { createInquiry, getInquiries, updateInquiryStatus } from "../controllers/inquiryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all inquiry routes
router.use(requireAuth);

router.route("/").post(createInquiry).get(getInquiries);
router.route("/:id/status").put(updateInquiryStatus);

export default router;
