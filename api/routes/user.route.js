import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  signout,
  test,
  updateUser,
} from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Define routes
router.get("/test", test); // Test route
router.put("/update/:userId", verifyToken, updateUser); // Update user
router.delete("/delete/:userId", verifyToken, deleteUser); // Delete user
router.post("/signout", signout); // Sign out user
router.get("/getusers", verifyToken, getUsers); // Get all users (admin only)
router.get("/:userId", getUser);

export default router;
