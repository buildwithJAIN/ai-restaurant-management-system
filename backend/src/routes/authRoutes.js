import express from "express";
import { AuthController } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/check-user", AuthController.checkUser);           // step 1: send OTP
router.post("/reset-password", AuthController.resetPassword); 
router.post("/check-otp", AuthController.checkOtp);

export default router;
