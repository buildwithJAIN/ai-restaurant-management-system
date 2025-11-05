import { UserService } from "../services/userServices.js";
import { sendEmail } from "../services/emailService.js";
import { checkOtpService } from "../services/checkOtpService.js";
import prisma from "../config/db.js";

export const AuthController = {
  async register(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  },
  async login(req, res) {
    try {
      const { identifier, password } = req.body;
      const { user, token } = await UserService.validateLogin(identifier, password);
      res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  async checkUser(req, res) {
    const { identifier } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, otpExpiresAt: expiry }
    });

    // send OTP to user via email
    const subject = "Password Reset OTP"
    const text = `Dear User,

      You requested to reset your password for the Restaurant Management System account.

      Your One-Time Password (OTP) is: ${otp}

      This code will expire in 5 minutes. 
      If you did not request this, please ignore this email.

      Best regards,
      Restaurant Management System Team`
    await sendEmail(user.email, subject,text);

    console.log(`🔐 OTP for ${user.email}: ${otp}`); // visible only to you (for dev)
    res.json({ message: "OTP sent to your email" });
  },

  // Step 2: Verify OTP + reset password
  async resetPassword(req, res) {
    const { identifier, otp, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
        resetOtp: otp,
        otpExpiresAt: { gt: new Date() } // not expired
      }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        otpExpiresAt: null
      }
    });

    res.json({ message: "Password updated successfully" });
  },
  async checkOtp(req, res) {
    try{
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ valid: false, message: "Email and OTP required." });
      }

      const result = await checkOtpService(email, otp);

      if (!result.valid) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    }
    catch (error) {
      console.error("❌ checkOtp error:", error);
      res.status(500).json({ valid: false, message: "Server error verifying OTP." });
    }
  }
};
