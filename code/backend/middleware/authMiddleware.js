import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * Strict Authentication Middleware
 * Ensures the request contains a valid JWT token that was successfully decoded by the global middleware.
 * Use this to protect routes that require authentication but not necessarily admin privileges.
 */
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required. Please log in."
        });
    }
    next();
};
