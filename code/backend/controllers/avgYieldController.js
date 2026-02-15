import AvgYield from "../models/avgYield.js";
import { isAdmin } from "./userController.js";


export async function createAvgYield(req, res) {

   if (!isAdmin(req)) {
      return res.status(403).json({
         message: "Access denied. Admins only"
      });
   }

   try {

      const data = req.body;

      // 🔹 If request body is an array → bulk insert
      if (Array.isArray(data)) {

         const response = await AvgYield.insertMany(data, { ordered: false });

         return res.status(201).json({
            message: "Average yields created successfully",
            count: response.length,
            avgYields: response
         });
      }

      // 🔹 If single object → normal save
      const avgYield = new AvgYield(data);
      const response = await avgYield.save();

      return res.status(201).json({
         message: "Average yield created successfully",
         avgYield: response
      });

   } catch (error) {
      console.error("Error creating average yield", error);

      return res.status(500).json({
         message: "Failed to create average yield",
         error: error.message
      });
   }
}
