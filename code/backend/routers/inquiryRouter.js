import express from "express";
import { createInquiry, getInquiries, updateInquiryStatus } from "../controllers/inquiryController.js";

const router = express.Router();

router.route("/").post(createInquiry).get(getInquiries);
router.route("/:id/status").put(updateInquiryStatus);

export default router;
