import prisma from "../config/db.js";

export async function checkOtpService(email, otp) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return { valid: false, message: "User not found." };

  // Check if OTP matches and not expired
  const now = new Date();
  if (user.resetOtp !== otp || now > user.otpExpiresAt) {
    return { valid: false, message: "Invalid or expired OTP." };
  }

  // OTP is valid
  return { valid: true, message: "OTP verified successfully." };
}