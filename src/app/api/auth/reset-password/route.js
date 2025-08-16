import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, otp, newPassword } = await req.json();
  if (!email || !otp || !newPassword)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { db } = await clientPromise;
  const user = await db.collection("users").findOne({ email });

  if (!user || user.resetOtp !== otp) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  if (Date.now() > user.resetOtpExpiry) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.collection("users").updateOne(
    { email },
    { 
      $set: { password: hashedPassword },
      $unset: { resetOtp: "", resetOtpExpiry: "" }
    }
  );

  // ✅ Send success email
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

   await transporter.sendMail({
  from: `"Your App Name" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "✅ Password Reset Successful",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4CAF50; text-align: center;">Password Reset Successful</h2>
      <p>Hi <b>${user.name || "User"}</b>,</p>
      <p>Your password has been <b style="color: #4CAF50;">successfully reset</b>.</p>
      
      <p>If you did not perform this action, please 
        <a href="mailto:ibrahimhabeebolawale@gmail.com" style="color: #e74c3c;">contact our support team</a> immediately.
      </p>
      
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://rock-paper-scissors-sigma-rust.vercel.app/login" 
           style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Login Now
        </a>
      </div>
      
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #777; text-align: center;">
        &copy; ${new Date().getFullYear()} Hallab. All rights reserved.
      </p>
    </div>
  `
});

  } catch (err) {
    console.error("Email sending failed:", err.message);
  }

  return NextResponse.json({ message: "Password reset successful" });
}
