import nodemailer from "nodemailer";

/**
 * Sends an email using Gmail SMTP credentials stored in environment variables.
 * Make sure you have EMAIL_USER and EMAIL_PASS in your .env file.
 */
export async function sendEmail(to, subject, text) {
  try {
    // 1️⃣ Create transporter securely
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ✅ from .env
        pass: process.env.EMAIL_PASS, // ✅ from .env
      },
      tls: {
        rejectUnauthorized: false, // ✅ allows self-signed certificates
      },
    });

    // 2️⃣ Define email details
    const mailOptions = {
      from: `"Restaurant System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    // 3️⃣ Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error("❌ Email sending error:", error);
  }
}
